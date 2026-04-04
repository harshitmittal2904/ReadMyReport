// Vercel serverless function: proxies requests to the Gemini API
// Hardened with validation, CORS, rate limiting, and security headers

const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10MB
// Gemini 2.0 Flash responds in 3-8s. We set 9s to fit within Vercel Hobby's 10s hard limit.
const TIMEOUT_MS = 9000;

// Vercel Hobby plan max is 10s. Pro plan could set this higher.
export const config = {
  maxDuration: 10,
};

function isAllowedOrigin(origin) {
  if (!origin) return false;
  // Production domain
  if (origin === 'https://read-my-report.vercel.app') return true;
  // Vercel preview deployments (*.vercel.app)
  if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return true;
  // Local development
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
  return false;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = isAllowedOrigin(origin);

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', allowed ? origin : 'https://read-my-report.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate Content-Type
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  // Check payload size
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return res.status(413).json({ error: 'Payload too large. Maximum 10MB allowed.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY environment variable');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    // Validate Gemini responded with JSON before forwarding
    const responseContentType = response.headers.get('content-type') || '';
    if (responseContentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      // Gemini returned non-JSON (HTML error page, etc.) — don't forward raw content
      const text = await response.text();
      console.error('Gemini returned non-JSON:', response.status, text.substring(0, 200));
      res.status(502).json({ error: 'Unexpected response from analysis service' });
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Analysis timed out. Please try again with a clearer or smaller image.' });
    }
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}
