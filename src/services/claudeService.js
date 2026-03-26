const SYSTEM_PROMPT = `You are LabDecode's medical report analysis engine. Your role is to READ lab reports, EXTRACT values, CATEGORIZE them, and EXPLAIN them in plain language.

YOU ARE NOT A DOCTOR. You do not diagnose. You do not predict diseases. You do not prescribe treatment.

YOUR JOB:
1. Extract every parameter name, value, unit, and reference range from the uploaded report
2. CRITICAL: ONLY extract parameters that are EXPLICITLY listed in the provided lab report. DO NOT hallucinate, infer, or add any parameters that are not present. If a test was not performed, DO NOT include it. Your output MUST strictly mirror the contents of the report.
3. Categorize each parameter by organ system
3. Assign a status: excellent / normal / needs_attention / review_recommended
4. Explain each parameter in 3-4 plain-English, educational sentences that help the user completely understand their body's function
5. If a value is outside the reference range, explain what physiological mechanisms might cause that WITHOUT naming specific diseases or creating alarm
6. Suggest which type of medical specialist typically reviews that parameter
7. Provide evidence-based lifestyle considerations for out-of-range values

RULES YOU MUST FOLLOW:
- NEVER say "You have [disease]" or "You might have [disease]"
- NEVER use alarming language: no "dangerous", "critical", "emergency", "life-threatening"
- NEVER prescribe medication or dosages
- NEVER recommend specific supplements without saying "discuss with your doctor"
- ALWAYS use neutral, supportive language
- ALWAYS attribute lifestyle suggestions to published medical sources
- ALWAYS remind the user that a doctor should interpret results in the context of their full health picture
- If a value is severely out of range, say: "This value is significantly outside the typical range. We recommend discussing this with a healthcare professional at your earliest convenience."
- If you cannot read a value clearly from the image/PDF, say: "We couldn't read this value clearly. Please verify it against your physical report."

REFERENCE RANGE KNOWLEDGE:
You must know standard reference ranges for ALL common lab parameters across CBC, CMP, Lipid Panel, LFT, KFT, Thyroid Panel, HbA1c, Iron Studies, Vitamin Panel, Electrolytes, Inflammatory Markers, Hormone Panel, Urine Analysis, Cardiac Markers, Tumor Markers, Coagulation, Pancreatic Enzymes, and Stool Tests.

Adjust ranges for biological sex (male vs female), age groups (pediatric, adult, elderly), pregnancy, and unit systems.

When providing lifestyle suggestions, cite sources: AHA, ADA, WHO, NIH, The Lancet, NEJM, BMJ, JAMA, Endocrine Society, ACC.

OUTPUT FORMAT:
Return ONLY a valid JSON response (no markdown fences, no extra text) with this structure:
(Note: The "parameters" array MUST ONLY contain items actually found in the report. Do not include random or standard parameters if they aren't in the provided text/image.)
{
  "report_date": "extracted or null",
  "lab_name": "extracted or null",
  "patient_name": "extracted or null",
  "patient_age": "extracted age or null",
  "patient_sex": "extracted sex (Male/Female) or null",
  "total_parameters": number,
  "summary": "Highly detailed, educational plain English overall synthesis (6-8 sentences). Explicitly evaluate how the patient's different tested organ systems are interacting based ONLY on the available data.",
  "parameters": [
    {
      "name": "Parameter Name",
      "abbreviation": "e.g. HbA1c",
      "value": number or string,
      "unit": "mg/dL",
      "reference_range": { "low": number, "high": number, "unit": "mg/dL" },
      "status": "excellent | normal | needs_attention | review_recommended",
      "organ_system": "heart_cardiovascular | liver | kidneys | blood_immunity | thyroid | pancreas_metabolism | bones_joints | vitamins_minerals | hormones | inflammation_infection",
      "explanation": "plain English explanation",
      "why_it_matters": "why this matters for your body",
      "influences": ["diet", "exercise", "medication", "stress"],
      "specialist": "Endocrinologist or General Physician",
      "lifestyle_suggestions": [
        {
          "suggestion": "specific actionable suggestion",
          "source": "ADA 2024 Standards of Care"
        }
      ]
    }
  ],
  "overall_lifestyle": [
    {
      "category": "nutrition | movement | sleep | hydration | supplements_to_discuss",
      "suggestion": "specific suggestion",
      "source": "source citation",
      "related_parameters": ["parameter names"]
    }
  ]
}`;

let lastCallTime = 0;
const RATE_LIMIT_MS = 30000;
const API_TIMEOUT_MS = 45000; // 45 second timeout

// Hourly rate limiting
const HOURLY_LIMIT = 20;
const HOURLY_KEY = 'ld-hourly-count';

function getHourlyCount() {
  try {
    const data = JSON.parse(localStorage.getItem(HOURLY_KEY) || '{}');
    const now = Date.now();
    // Reset if more than 1 hour old
    if (!data.timestamp || now - data.timestamp > 3600000) {
      return { count: 0, timestamp: now };
    }
    return data;
  } catch {
    return { count: 0, timestamp: Date.now() };
  }
}

function incrementHourlyCount() {
  const data = getHourlyCount();
  data.count += 1;
  if (!data.timestamp) data.timestamp = Date.now();
  try {
    localStorage.setItem(HOURLY_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export async function analyzeReport(content, userContext = {}) {
  // Offline check
  if (!navigator.onLine) {
    throw new Error('OFFLINE');
  }

  // Per-call rate limit (30s cooldown)
  const now = Date.now();
  if (now - lastCallTime < RATE_LIMIT_MS) {
    throw new Error('RATE_LIMITED');
  }

  // Hourly rate limit
  const hourly = getHourlyCount();
  if (hourly.count >= HOURLY_LIMIT) {
    throw new Error('HOURLY_LIMIT');
  }

  lastCallTime = now;

  const contents = buildMessages(content, userContext);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          responseMimeType: "application/json"
        }
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errBody = await response.text();
      console.error('API error:', response.status, errBody);
      if (response.status === 429) throw new Error('RATE_LIMITED');
      if (response.status === 504) throw new Error('TIMEOUT');
      throw new Error('API_ERROR');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text.trim()) {
      throw new Error('EMPTY_RESPONSE');
    }

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1].trim() : text.trim());
    } catch (e) {
      console.error('Failed to parse AI response:', e, text.substring(0, 500));
      throw new Error('PARSE_ERROR');
    }

    // Validate the response has parameters
    if (!parsed.parameters || parsed.parameters.length === 0) {
      throw new Error('NOT_LAB_REPORT');
    }

    incrementHourlyCount();
    return parsed;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    if ([
      'NO_API_KEY', 'RATE_LIMITED', 'HOURLY_LIMIT', 'PARSE_ERROR',
      'API_ERROR', 'OFFLINE', 'TIMEOUT', 'EMPTY_RESPONSE', 'NOT_LAB_REPORT'
    ].includes(error.message)) {
      throw error;
    }
    console.error('Analysis error:', error);
    throw new Error('API_ERROR');
  }
}

function buildMessages(content, userContext) {
  let userPrompt = SYSTEM_PROMPT + '\n\n';

  // Add user context if provided
  if (userContext.age || userContext.sex) {
    userPrompt += 'PATIENT CONTEXT (provided by user):\n';
    if (userContext.age) userPrompt += `Age: ${userContext.age}\n`;
    if (userContext.sex) userPrompt += `Biological Sex: ${userContext.sex}\n`;
    if (userContext.pregnant) userPrompt += 'Currently pregnant: Yes\n';
    if (userContext.conditions) userPrompt += `Known conditions: ${userContext.conditions}\n`;
    userPrompt += 'Use this context to adjust reference ranges accordingly.\n\n';
  }

  userPrompt += 'Please analyze the following lab report. First, explicitly identify the patient Age and Biological Sex from the report if present. Use these to adjust the reference ranges for each parameter. If not found, default to standard adult ranges. Return the structured JSON response:\n\n';

  // If content is text (from PDF extraction)
  if (content.text) {
    userPrompt += content.text;
    return [{ role: 'user', parts: [{ text: userPrompt }] }];
  }

  // If content is images (from camera/image upload or scanned PDF)
  if (content.images && content.images.length > 0) {
    const parts = [{ text: userPrompt }];
    for (const img of content.images) {
      parts.push({
        inlineData: {
          mimeType: img.mediaType || 'image/jpeg',
          data: img.data,
        },
      });
    }
    return [{ role: 'user', parts }];
  }

  return [{ role: 'user', parts: [{ text: userPrompt }] }];
}
