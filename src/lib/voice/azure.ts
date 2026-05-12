// ─── Azure Realtime Voice Provider ───────────────────────────
// Uses gpt-realtime deployment for both TTS and STT
// Same credentials as chat — no extra keys needed
// STT: audio input → Azure Realtime WS → transcript
// TTS: text input  → Azure Realtime WS → audio output → play

import type { STTProvider, TTSProvider } from './types';

const WS_URL = () => {
  const endpoint   = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT ?? '';
  const deployment = process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT ?? 'gpt-realtime';
  const apiVersion = process.env.NEXT_PUBLIC_AZURE_OPENAI_API_VERSION ?? '2025-04-01-preview';
  return `${endpoint.replace('https://', 'wss://').replace(/\/$/, '')}/openai/realtime?api-version=${apiVersion}&deployment=${deployment}`;
};

// ── Azure TTS (via Realtime API) ─────────────────────────────
// Sends text → gets audio chunks back → plays via AudioContext
export class AzureTTSProvider implements TTSProvider {
  isSpeaking = false;
  private audioCtx: AudioContext | null = null;
  private source:   AudioBufferSourceNode | null = null;

  async speak(text: string): Promise<void> {
    // Delegate to server-side TTS endpoint
    // (avoids exposing API key to client)
    try {
      const res = await fetch('/api/widget/tts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text, provider: 'azure' }),
      });

      if (!res.ok) throw new Error('Azure TTS failed');

      const blob       = await res.blob();
      const arrayBuf   = await blob.arrayBuffer();

      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }

      const audioBuf   = await this.audioCtx.decodeAudioData(arrayBuf);
      this.source      = this.audioCtx.createBufferSource();
      this.source.buffer = audioBuf;
      this.source.connect(this.audioCtx.destination);

      this.isSpeaking  = true;
      this.source.start();
      return new Promise((resolve) => {
        this.source!.onended = () => { this.isSpeaking = false; resolve(); };
      });
    } catch (err) {
      console.warn('[AzureTTS] failed, falling back to browser:', err);
      // Fallback to browser TTS
      const { BrowserTTSProvider } = await import('./browser');
      return new BrowserTTSProvider().speak(text);
    }
  }

  stop(): void {
    this.source?.stop();
    this.isSpeaking = false;
  }
}

// ── Azure STT (via Realtime API) ─────────────────────────────
// Records audio via MediaRecorder → sends to server → gets transcript
export class AzureSTTProvider implements STTProvider {
  isListening = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks:   Blob[] = [];

  isSupported(): boolean {
    return typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  }

  startListening(onResult: (transcript: string) => void): void {
    if (!this.isSupported() || this.isListening) return;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.audioChunks  = [];
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = async () => {
        this.isListening = false;
        stream.getTracks().forEach((t) => t.stop());

        const blob     = new Blob(this.audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
          const res        = await fetch('/api/widget/stt', { method: 'POST', body: formData });
          const { transcript } = await res.json();
          if (transcript?.trim()) onResult(transcript.trim());
        } catch (err) {
          console.error('[AzureSTT] transcription failed:', err);
        }
      };

      this.isListening = true;
      this.mediaRecorder.start();

      // Auto-stop after 8 seconds
      setTimeout(() => this.stopListening(), 8000);
    }).catch((err) => {
      console.error('[AzureSTT] mic access denied:', err);
      this.isListening = false;
    });
  }

  stopListening(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.isListening = false;
  }
}
