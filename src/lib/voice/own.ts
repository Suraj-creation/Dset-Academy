// ─── DSeT Own VoiceOPS Provider ──────────────────────────────
// To activate: VOICE_PROVIDER=own in .env

import type { STTProvider, TTSProvider } from './types';

// ── Own TTS ──────────────────────────────────────────────────
export class OwnTTSProvider implements TTSProvider {
  isSpeaking = false;

  async speak(text: string): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_OWN_VOICE_API_URL;
    if (!apiUrl) {
      console.warn('[OwnTTS] OWN_VOICE_API_URL not configured, falling back to browser');
      const { BrowserTTSProvider } = await import('./browser');
      return new BrowserTTSProvider().speak(text);
    }

    console.warn('[OwnTTS] Not yet implemented');
  }

  stop(): void {
    this.isSpeaking = false;
  }
}

// ── Own STT ──────────────────────────────────────────────────
export class OwnSTTProvider implements STTProvider {
  isListening = false;

  isSupported(): boolean {
    return !!process.env.NEXT_PUBLIC_OWN_VOICE_API_URL;
  }

  startListening(_onResult: (transcript: string) => void): void {
    console.warn('[OwnSTT] Not yet implemented');
  }

  stopListening(): void {
    this.isListening = false;
  }
}
