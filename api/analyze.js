/* global process */
// Vercel Edge Function: proxies requests to Gemini API
// Edge runtime gives ~25s on Hobby plan

export const config = { runtime: 'edge', maxDuration: 60 };

const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const GEMINI_TIMEOUT_MS = 55000;

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

async function callGemini(body, apiKey, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  if (!geminiKey) {
    console.error('No GEMINI_API_KEY configured');
    return jsonResponse({ error: 'Server configuration error' }, 500, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, origin);
  }

  // Single attempt with generous timeout
  const result = await callGemini(body, geminiKey, GEMINI_TIMEOUT_MS);

  if (result.ok) {
    return jsonResponse({
      candidates: [{ content: { parts: [{ text: result.text }] } }],
      _provider: 'gemini',
    }, 200, origin);
  }

  // Clear error messages
  if (result.status === 429) {
    return jsonResponse({ error: 'API quota exceeded. Please try again later.' }, 429, origin);
  }

  if (result.error === 'TIMEOUT') {
    return jsonResponse({ error: 'Analysis timed out. Please try again.' }, 504, origin);
  }

  console.error('Gemini error:', result.status, result.error || result.data);
  return jsonResponse({ error: 'Analysis service unavailable. Please try again.' }, 502, origin);
}
