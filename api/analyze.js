/* global process */
// Vercel Serverless Function (Node.js): proxies requests to Gemini API
// maxDuration: 60 gives 60s on Hobby plan

export const config = { maxDuration: 60 };

const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024;
const GEMINI_TIMEOUT_MS = 55000;

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (origin === 'https://read-my-report.vercel.app') return true;
  if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return true;
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
  return false;
}

function setCors(res, origin) {
  const allowed = isAllowedOrigin(origin);
  res.setHeader('Access-Control-Allow-Origin', allowed ? origin : 'https://read-my-report.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
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

export default async function handler(req, res) {
  const origin = req.headers['origin'] || '';
  setCors(res, origin);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return res.status(413).json({ error: 'Payload too large. Maximum 10MB allowed.' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    console.error('No GEMINI_API_KEY configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const result = await callGemini(body, geminiKey, GEMINI_TIMEOUT_MS);

  if (result.ok) {
    return res.status(200).json({
      candidates: [{ content: { parts: [{ text: result.text }] } }],
      _provider: 'gemini',
    });
  }

  if (result.status === 429) {
    return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
  }

  if (result.error === 'TIMEOUT') {
    return res.status(504).json({ error: 'Analysis timed out. Please try again.' });
  }

  console.error('Gemini error:', result.status, result.error || result.data);
  return res.status(502).json({ error: 'Analysis service unavailable. Please try again.' });
}
