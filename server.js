import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Helper to convert PCM 16-bit to WAV buffer
function pcm16ToWav(bytes, rate = 24000, ch = 1) {
  const len = bytes.length;
  const buf = Buffer.alloc(44 + len);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + len, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(ch, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * ch * 2, 28);
  buf.writeUInt16LE(ch * 2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(len, 40);
  bytes.copy(buf, 44);
  return buf;
}

// Config check
app.get('/api/config', (req, res) => {
  res.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    status: 'ok',
  });
});

// Gemini JSON prompt route
app.post('/api/ai/json', async (req, res) => {
  const { system, user, model, apiKey } = req.body || {};
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(400).json({ error: 'کلید Gemini نه در سرور و نه در درخواست موجود نیست.' });
  }

  const modelName = model || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system || '' }] },
        contents: [{ role: 'user', parts: [{ text: user || '' }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(geminiRes.status).json({
        error: `Gemini API error (${geminiRes.status}): ${errText.slice(0, 300)}`,
      });
    }

    const data = await geminiRes.json();
    const txt = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
    res.json({ text: txt, candidates: data.candidates });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error: ' + (err?.message || err) });
  }
});

// Gemini TTS route
app.post('/api/ai/tts', async (req, res) => {
  const { text, voiceName, model, apiKey } = req.body || {};
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(400).json({ error: 'کلید Gemini موجود نیست.' });
  }

  const modelName = model || 'gemini-2.5-flash-preview-tts';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: text || '' }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || 'Leda',
              },
            },
          },
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(geminiRes.status).json({
        error: `Gemini TTS API error (${geminiRes.status}): ${errText.slice(0, 300)}`,
      });
    }

    const data = await geminiRes.json();
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part?.inlineData?.data) {
      return res.status(502).json({ error: 'Gemini صدایی برنگرداند' });
    }

    const mime = part.inlineData.mimeType || '';
    const rateMatch = mime.match(/rate=(\d+)/);
    const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
    const rawAudioBuffer = Buffer.from(part.inlineData.data, 'base64');
    const wavBuffer = pcm16ToWav(rawAudioBuffer, sampleRate, 1);

    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': wavBuffer.length,
      'Cache-Control': 'no-cache',
    });
    res.send(wavBuffer);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error: ' + (err?.message || err) });
  }
});

// Static assets
app.use(express.static(ROOT, {
  extensions: ['html'],
  index: 'index.html',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webmanifest')) {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    }
  },
}));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Dadashmode Show Engine running at http://${HOST}:${PORT}`);
});
