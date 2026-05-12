import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

// ─── Azure Realtime STT ───────────────────────────────────────
// Receives audio blob → sends to Azure Realtime WS → returns transcript
async function azureRealtimeSTT(audioBuffer: Buffer): Promise<string> {
  const { WebSocket } = await import('ws');

  const endpoint   = process.env.AZURE_OPENAI_ENDPOINT!.replace(/\/$/, '');
  const apiKey     = process.env.AZURE_OPENAI_API_KEY!;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION!;
  const wsUrl      = `${endpoint.replace('https://', 'wss://')}/openai/realtime?api-version=${apiVersion}&deployment=${deployment}`;

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl, { headers: { 'api-key': apiKey } });

    const timeout = setTimeout(() => { ws.close(); reject(new Error('STT timeout')); }, 20000);

    let transcript   = '';
    let sessionReady = false;

    ws.on('open', () => {
      // Configure session for audio input + text output only
      ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities:          ['text'],
          input_audio_format:  'pcm16',
          turn_detection:      null,   // manual turn control
        },
      }));
    });

    ws.on('message', (raw: Buffer) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let event: any;
      try { event = JSON.parse(raw.toString()); } catch { return; }

      if (event.type === 'session.updated' && !sessionReady) {
        sessionReady = true;

        // Send audio as base64 PCM16
        const base64Audio = audioBuffer.toString('base64');
        ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: base64Audio }));
        ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
        ws.send(JSON.stringify({ type: 'response.create', response: { modalities: ['text'] } }));
      }

      if (event.type === 'response.text.delta')  transcript += event.delta ?? '';
      if (event.type === 'conversation.item.input_audio_transcription.completed') {
        transcript = event.transcript ?? transcript;
      }

      if (event.type === 'response.done') {
        clearTimeout(timeout);
        ws.close();
        resolve(transcript || '');
      }

      if (event.type === 'error') {
        clearTimeout(timeout);
        ws.close();
        reject(new Error(event.error?.message ?? 'STT error'));
      }
    });

    ws.on('error', (err: Error) => { clearTimeout(timeout); reject(err); });
  });
}

// ─── Handler ──────────────────────────────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const form  = formidable({ maxFileSize: 10 * 1024 * 1024 });
    const [, files] = await form.parse(req);

    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    if (!audioFile) return res.status(400).json({ error: 'No audio file received' });

    const audioBuffer  = fs.readFileSync(audioFile.filepath);
    const transcript   = await azureRealtimeSTT(audioBuffer);

    return res.status(200).json({ transcript });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'STT failed';
    console.error('[widget/stt]', msg);
    return res.status(500).json({ error: msg });
  }
}
