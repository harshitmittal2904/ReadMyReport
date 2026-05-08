const SYSTEM_PROMPT = `You are LabDecode's medical report analysis engine. You READ lab reports, EXTRACT values, CATEGORIZE them, and EXPLAIN them in plain language.

You are NOT a doctor. You do not diagnose, predict diseases, or prescribe treatment.

YOUR JOB:
1. Extract every parameter name, value, unit, and reference range from the uploaded report
2. ONLY extract parameters EXPLICITLY listed in the report. DO NOT hallucinate or add parameters not present.
3. Categorize each parameter by organ system
4. Assign a status: excellent / normal / needs_attention / review_recommended
5. Explain each parameter in 3-4 plain-English educational sentences
6. For out-of-range values, explain physiological mechanisms WITHOUT naming specific diseases
7. Suggest which specialist typically reviews that parameter
8. Provide evidence-based lifestyle suggestions for out-of-range values

RULES:
- NEVER say "You have [disease]" or "You might have [disease]"
- NEVER use alarming language (dangerous, critical, emergency, life-threatening)
- NEVER prescribe medication or dosages
- Use neutral, supportive language
- Attribute lifestyle suggestions to published sources (AHA, ADA, WHO, NIH, etc.)
- Remind users that a doctor should interpret results in full health context
- If a value is severely out of range: "This value is significantly outside the typical range. We recommend discussing this with a healthcare professional at your earliest convenience."
- If you cannot read a value clearly: "We couldn't read this value clearly. Please verify it against your physical report."
- Adjust reference ranges for biological sex, age, and pregnancy when information is available.
- If this is NOT a lab report, set is_lab_report to false and return an empty parameters array.`;

const VISION_PROMPT = `You are analyzing images of a lab report. First, carefully transcribe every parameter name, numeric value, unit, and reference range visible in the image(s). Then classify and explain each parameter. If any value is unclear or partially obscured, note it in the explanation.

Please analyze the following lab report images and return the structured JSON response.`;

const TEXT_PROMPT = `The following is machine-extracted text from a lab report PDF. Trust the text exactly as provided — do not infer or guess values. Extract every parameter name, value, unit, and reference range present. Then classify and explain each parameter.

Please analyze the following lab report text and return the structured JSON response:

`;

const RESPONSE_SCHEMA = {
  type: 'object',
  required: ['is_lab_report', 'parameters'],
  properties: {
    is_lab_report: { type: 'boolean' },
    report_date: { type: 'string', nullable: true },
    lab_name: { type: 'string', nullable: true },
    patient_name: { type: 'string', nullable: true },
    patient_age: { type: 'string', nullable: true },
    patient_sex: { type: 'string', nullable: true },
    total_parameters: { type: 'integer' },
    summary: { type: 'string' },
    parameters: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'value', 'unit', 'status', 'organ_system'],
        properties: {
          name: { type: 'string' },
          abbreviation: { type: 'string' },
          value: { type: 'string' },
          unit: { type: 'string' },
          reference_range: {
            type: 'object',
            properties: {
              low: { type: 'number' },
              high: { type: 'number' },
              unit: { type: 'string' },
            },
          },
          status: {
            type: 'string',
            enum: ['excellent', 'normal', 'needs_attention', 'review_recommended'],
          },
          organ_system: {
            type: 'string',
            enum: [
              'heart_cardiovascular', 'liver', 'kidneys', 'blood_immunity',
              'thyroid', 'pancreas_metabolism', 'bones_joints',
              'vitamins_minerals', 'hormones', 'inflammation_infection',
            ],
          },
          explanation: { type: 'string' },
          why_it_matters: { type: 'string' },
          influences: { type: 'array', items: { type: 'string' } },
          specialist: { type: 'string' },
          lifestyle_suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                suggestion: { type: 'string' },
                source: { type: 'string' },
              },
            },
          },
        },
      },
    },
    overall_lifestyle: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          suggestion: { type: 'string' },
          source: { type: 'string' },
          related_parameters: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

const API_TIMEOUT_MS = 60000; // 60s — matches Edge function limit

export async function analyzeReport(content, userContext = {}) {
  if (!navigator.onLine) {
    throw new Error('OFFLINE');
  }

  const requestBody = buildRequestBody(content, userContext);

  return await callAPI(requestBody);
}

async function callAPI(requestBody) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errBody = await response.text();
      console.error('API error:', response.status, errBody);
      if (response.status === 429) throw new Error('RATE_LIMITED');
      if (response.status === 503) throw new Error('VISION_UNAVAILABLE');
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
      parsed = JSON.parse(text.trim());
    } catch {
      try {
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1].trim());
        } else {
          throw new Error('No JSON found');
        }
      } catch (e) {
        console.error('Failed to parse AI response:', e, text.substring(0, 500));
        throw new Error('PARSE_ERROR');
      }
    }

    if (parsed.is_lab_report === false) {
      throw new Error('NOT_LAB_REPORT');
    }

    if (!parsed.parameters || parsed.parameters.length === 0) {
      throw new Error('NO_PARAMETERS');
    }

    parsed._provider = data._provider || 'unknown';
    return parsed;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network/CORS error:', error.message);
      throw new Error('NETWORK_ERROR');
    }
    if ([
      'RATE_LIMITED', 'PARSE_ERROR', 'API_ERROR',
      'OFFLINE', 'TIMEOUT', 'EMPTY_RESPONSE', 'NOT_LAB_REPORT',
      'NO_PARAMETERS', 'NETWORK_ERROR', 'VISION_UNAVAILABLE',
    ].includes(error.message)) {
      throw error;
    }
    console.error('Analysis error:', error);
    throw new Error('API_ERROR');
  }
}

function buildRequestBody(content, userContext) {
  let userPrompt = '';

  if (userContext.age || userContext.sex) {
    userPrompt += 'PATIENT CONTEXT (provided by user):\n';
    if (userContext.age) userPrompt += `Age: ${userContext.age}\n`;
    if (userContext.sex) userPrompt += `Biological Sex: ${userContext.sex}\n`;
    if (userContext.pregnant) userPrompt += 'Currently pregnant: Yes\n';
    if (userContext.conditions) userPrompt += `Known conditions: ${userContext.conditions}\n`;
    userPrompt += 'Use this context to adjust reference ranges accordingly.\n\n';
  }

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  // Text mode (from PDF text extraction)
  if (content.text) {
    body.contents = [{ role: 'user', parts: [{ text: TEXT_PROMPT + userPrompt + content.text }] }];
    return body;
  }

  // Vision mode (images from camera/upload/scanned PDF)
  if (content.images && content.images.length > 0) {
    const parts = [{ text: VISION_PROMPT + (userPrompt ? '\n\n' + userPrompt : '') }];
    for (const img of content.images) {
      parts.push({
        inlineData: {
          mimeType: img.mediaType || 'image/jpeg',
          data: img.data,
        },
      });
    }
    body.contents = [{ role: 'user', parts }];
    return body;
  }

  // Fallback (no content)
  body.contents = [{ role: 'user', parts: [{ text: TEXT_PROMPT + userPrompt }] }];
  return body;
}
