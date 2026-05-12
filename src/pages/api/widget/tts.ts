import { NextApiRequest, NextApiResponse } from 'next';

// ─── Provider router ──────────────────────────────────────────
// VOICE_PROVIDER in .env controls which TTS is used:
//   'browser' → no server call needed (client handles it)
//   'azure'   → Azure Cognitive Services TTS
//   'own'     → DSeT's own voice API (future)

type VoiceProvider = 'browser' | 'azure' | 'own';

const PROVIDER = (process.env.VOICE_PROVIDER ?? 'browser') as VoiceProvider;

// ─── Azure TTS ────────────────────────────────────────────────
async function azureTTS(text: string): Promise<Buffer> {
  const key    = process.env.AZURE_TTS_KEY!;
  const region = process.env.AZURE_TTS_REGION ?? 'eastus';

  // Step 1 — get token
  const tokenRes = await fetch(
    `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
    { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': key } }
  );
  const token = await tokenRes.text();

  // Step 2 — synthesise speech
  const ssml = `
    <speak version='1.0' xml:lang='en-IN'>
      <voice xml:lang='en-IN' xml:gender='Female' name='en-IN-NeerjaNeural'>
        ${text.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] ?? c))}
      </voice>
    </speak>`.trim();

  const synthRes = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method:  'POST',
      headers: {
        'Authorization':  `Bearer ${token}`,
        'Content-Type':   'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      },
      body: ssml,
    }
  );

  if (!synthRes.ok) throw new Error(`Azure TTS error: ${synthRes.status}`);
  return Buffer.from(await synthRes.arrayBuffer());
}

// ─── Own Voice API ─────────────────────────────────────────────
async function ownTTS(_text: string): Promise<Buffer> {
  throw new Error('Own voice API not yet configured');
}

// ─── Main Handler ─────────────────────────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text }: { text: string } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Browser TTS is handled client-side — no server call needed
  if (PROVIDER === 'browser') {
    return res.status(200).json({ provider: 'browser', text });
  }

  try {
    let audioBuffer: Buffer;

    if (PROVIDER === 'azure') {
      if (!process.env.AZURE_TTS_KEY) {
        return res.status(500).json({ error: 'AZURE_TTS_KEY not configured' });
      }
      audioBuffer = await azureTTS(text);
    } else {
      audioBuffer = await ownTTS(text);
    }

    res.setHeader('Content-Type',   'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    return res.send(audioBuffer);

  } catch (err) {
    console.error('[widget/tts]', err);
    return res.status(500).json({ error: 'TTS failed. Falling back to browser.' });
  }
}
