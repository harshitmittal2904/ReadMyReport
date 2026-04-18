/* global process */
// Vercel Edge Function: proxies requests to Gemini API with Groq text-only fallback
// Edge runtime gives ~25s on Hobby plan (vs 10s for Serverless)

export const config = { runtime: 'edge' };

const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const FIRST_ATTEMPT_TIMEOUT_MS = 14000;
const RETRY_TIMEOUT_MS = 6000;
const GROQ_TIMEOUT_MS = 5000;

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (origin === 'https://read-my-report.vercel.app') return true;
  if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return true;
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
  return false;
}

function corsHeaders(origin) {
  const allowed = isAllowedOrigin(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://read-my-report.vercel.app',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

/**
 * Convert Gemini-format contents to OpenAI/Groq-format messages.
 */
function geminiContentsToGroqMessages(contents) {
  return contents.map(msg => {
    const parts = msg.parts || [];
    const content = parts.map(part => {
      if (part.text !== undefined) {
        return { type: 'text', text: part.text };
      }
      // Skip image parts — Groq is text-only fallback now
      return null;
    }).filter(Boolean);

    if (content.length === 1 && content[0].type === 'text') {
      return { role: msg.role, content: content[0].text };
    }
    return { role: msg.role, content };
  });
}

function requestHasImages(body) {
  const contents = body.contents || [];
  return contents.some(msg =>
    (msg.parts || []).some(part => part.inlineData)
  );
}

async function callGemini(body, apiKey, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const geminiBody = {
      ...body,
      generationConfig: {
        ...(body.generationConfig || {}),
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Gemini returned non-JSON:', response.status, text.substring(0, 200));
      return { ok: false, status: response.status, error: 'NON_JSON' };
    }

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, status: response.status, data };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { ok: true, text };
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return { ok: false, status: 408, error: 'TIMEOUT' };
    }
    return { ok: false, status: 500, error: err.message };
  }
}

async function callGroq(body, apiKey, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const messages = geminiContentsToGroqMessages(body.contents || []);
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Groq returned non-JSON:', response.status, text.substring(0, 200));
      return { ok: false, status: response.status, error: 'NON_JSON' };
    }

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, status: response.status, data };
    }

    const text = data.choices?.[0]?.message?.content || '';
    return { ok: true, text };
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return { ok: false, status: 408, error: 'TIMEOUT' };
    }
    return { ok: false, status: 500, error: err.message };
  }
}

export default async function handler(request) {
  const origin = request.headers.get('origin') || '';

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, origin);
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return jsonResponse({ error: 'Content-Type must be application/json' }, 400, origin);
  }

  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return jsonResponse({ error: 'Payload too large. Maximum 10MB allowed.' }, 413, origin);
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    console.error('No API keys configured');
    return jsonResponse({ error: 'Server configuration error' }, 500, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, origin);
  }

  const hasImages = requestHasImages(body);
  let retried = false;

  // --- Try Gemini (first attempt) ---
  if (geminiKey) {
    const result1 = await callGemini(body, geminiKey, FIRST_ATTEMPT_TIMEOUT_MS);

    if (result1.ok) {
      return jsonResponse({
        candidates: [{ content: { parts: [{ text: result1.text }] } }],
        _provider: 'gemini',
        _retried: false,
      }, 200, origin);
    }

    // 429 = quota → skip retry, go to fallback
    if (result1.status !== 429) {
      // Retry once
      console.warn(`Gemini attempt 1 failed (${result1.status}), retrying...`);
      retried = true;
      const result2 = await callGemini(body, geminiKey, RETRY_TIMEOUT_MS);

      if (result2.ok) {
        return jsonResponse({
          candidates: [{ content: { parts: [{ text: result2.text }] } }],
          _provider: 'gemini',
          _retried: true,
        }, 200, origin);
      }
      console.warn(`Gemini attempt 2 failed (${result2.status})`);
    } else {
      console.warn('Gemini quota exceeded (429)');
    }
  }

  // --- Groq fallback (text-only) ---
  if (hasImages) {
    // Cannot send images to Groq — return clear error
    return jsonResponse({
      error: 'Vision analysis temporarily unavailable. Please retry in a moment.',
    }, 503, origin);
  }

  if (!groqKey) {
    return jsonResponse({ error: 'API quota exceeded. Please try again later.' }, 429, origin);
  }

  const groqResult = await callGroq(body, groqKey, GROQ_TIMEOUT_MS);

  if (groqResult.ok) {
    return jsonResponse({
      candidates: [{ content: { parts: [{ text: groqResult.text }] } }],
      _provider: 'groq',
      _retried: retried,
    }, 200, origin);
  }

  console.error('Groq error:', groqResult.status);
  return jsonResponse({ error: 'Analysis service unavailable. Please try again.' }, 502, origin);
}
