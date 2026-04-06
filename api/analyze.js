// Vercel serverless function: proxies requests to Gemini API with Groq fallback
// Hardened with validation, CORS, and security headers

const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10MB
// Gemini 2.0 Flash responds in 3-8s. We set 9s to fit within Vercel Hobby's 10s hard limit.
const TIMEOUT_MS = 9000;

// Vercel Hobby plan max is 10s. Pro plan could set this higher.
export const config = {
  maxDuration: 10,
};

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (origin === 'https://read-my-report.vercel.app') return true;
  if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return true;
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
  return false;
}

/**
 * Convert Gemini-format contents to OpenAI/Groq-format messages.
 * Gemini: { role, parts: [{ text } | { inlineData: { mimeType, data } }] }
 * OpenAI: { role, content: [{ type: 'text', text } | { type: 'image_url', image_url: { url } }] }
 */
function geminiContentsToGroqMessages(contents) {
  return contents.map(msg => {
    const parts = msg.parts || [];
    const content = parts.map(part => {
      if (part.text !== undefined) {
        return { type: 'text', text: part.text };
      }
      if (part.inlineData) {
        return {
          type: 'image_url',
          image_url: {
            url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          },
        };
      }
      return null;
    }).filter(Boolean);

    // If only one text part, use string form (Groq accepts both)
    if (content.length === 1 && content[0].type === 'text') {
      return { role: msg.role, content: content[0].text };
    }

    return { role: msg.role, content };
  });
}

async function callGemini(body, apiKey, signal) {
  // Gemini 2.5 Flash with thinking disabled — faster than thinking mode, better than 2.0 Flash
  const geminiBody = {
    ...body,
    generationConfig: {
      ...(body.generationConfig || {}),
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
      signal,
    }
  );

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

  // Extract text from Gemini response and normalize to { text }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { ok: true, text };
}

async function callGroq(body, apiKey, signal) {
  const messages = geminiContentsToGroqMessages(body.contents || []);

  // Determine if this is a vision request
  const hasImages = messages.some(m =>
    Array.isArray(m.content) && m.content.some(p => p.type === 'image_url')
  );

  // Use vision-capable model when images are present, text model otherwise
  const model = hasImages
    ? 'meta-llama/llama-4-scout-17b-16e-instruct'
    : 'llama-3.3-70b-versatile';

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
    signal,
  });

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
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    console.error('No API keys configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // --- Try Gemini first ---
    if (geminiKey) {
      const geminiResult = await callGemini(req.body, geminiKey, controller.signal);

      if (geminiResult.ok) {
        clearTimeout(timeout);
        // Wrap text in the Gemini candidates format the frontend expects
        return res.status(200).json({
          candidates: [{ content: { parts: [{ text: geminiResult.text }] } }],
          _provider: 'gemini',
        });
      }

      // 429 = quota exceeded → fall through to Groq
      // Any other error → fall through to Groq as well
      if (geminiResult.status !== 429) {
        console.warn(`Gemini returned ${geminiResult.status}, trying Groq fallback`);
      } else {
        console.warn('Gemini quota exceeded (429), falling back to Groq');
      }
    }

    // --- Groq fallback ---
    if (!groqKey) {
      clearTimeout(timeout);
      return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
    }

    const groqResult = await callGroq(req.body, groqKey, controller.signal);

    clearTimeout(timeout);

    if (groqResult.ok) {
      return res.status(200).json({
        candidates: [{ content: { parts: [{ text: groqResult.text }] } }],
        _provider: 'groq',
      });
    }

    console.error('Groq error:', groqResult.status, JSON.stringify(groqResult.data).substring(0, 200));
    return res.status(502).json({ error: 'Analysis service unavailable. Please try again.' });

  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Analysis timed out. Please try again with a clearer or smaller image.' });
    }
    console.error('Proxy error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
