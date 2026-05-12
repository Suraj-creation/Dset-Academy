// ─── Browser Voice Provider ───────────────────────────────────
// Uses Web Speech API — free, no key needed
// STT: SpeechRecognition API
// TTS: SpeechSynthesis API

import type { STTProvider, TTSProvider } from './types';

// ── Browser TTS ──────────────────────────────────────────────
export class BrowserTTSProvider implements TTSProvider {
  isSpeaking = false;

  async speak(text: string): Promise<void> {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    return new Promise((resolve) => {
      const utterance   = new SpeechSynthesisUtterance(text);
      utterance.lang    = 'en-IN';
      utterance.rate    = 1.0;
      utterance.pitch   = 1.0;

      // Prefer Indian English voice
      const voices     = window.speechSynthesis.getVoices();
      const indiaVoice = voices.find(
        (v) => v.lang === 'en-IN' || v.name.toLowerCase().includes('india')
      );
      if (indiaVoice) utterance.voice = indiaVoice;

      utterance.onstart = () => { this.isSpeaking = true; };
      utterance.onend   = () => { this.isSpeaking = false; resolve(); };
      utterance.onerror = () => { this.isSpeaking = false; resolve(); };

      window.speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    window.speechSynthesis?.cancel();
    this.isSpeaking = false;
  }
}

// ── Browser STT ──────────────────────────────────────────────
export class BrowserSTTProvider implements STTProvider {
  isListening = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  private stopping = false;   // true only when the user explicitly calls stopListening()

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
  }

  startListening(onResult: (transcript: string) => void, onError?: (errorName: string) => void): void {
    if (!this.isSupported() || this.isListening) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w  = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;

    this.stopping = false;

    this.recognition                  = new SR();
    this.recognition.lang             = 'en-IN';
    this.recognition.interimResults   = true;
    this.recognition.maxAlternatives  = 1;
    this.recognition.continuous       = true;   // keep listening until manually stopped

    let finalAccumulated = '';
    let noSpeechPending  = false;   // tracks whether last error was no-speech

    this.recognition.onstart = () => { this.isListening = true; };

    // onend fires after every stop (including after no-speech error).
    // If the user didn't explicitly stop, restart to keep listening.
    this.recognition.onend = () => {
      if (!this.stopping && noSpeechPending) {
        noSpeechPending = false;
        try { this.recognition.start(); } catch { this.isListening = false; }
        return;
      }
      noSpeechPending = false;
      this.isListening = false;
    };

    this.recognition.onerror = (e: { error: string }) => {
      if (e.error === 'no-speech') {
        // Silence pause — not a real error in continuous mode; onend will restart
        noSpeechPending = true;
        return;
      }
      this.isListening = false;
      if (e.error === 'not-allowed') {
        onError?.('NotAllowedError');
      } else if (e.error === 'service-not-allowed') {
        onError?.('ServiceNotAllowedError');
      } else if (e.error === 'audio-capture') {
        onError?.('NotFoundError');
      } else {
        onError?.(e.error);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalAccumulated += e.results[i][0].transcript;
        } else {
          interim = e.results[i][0].transcript;
        }
      }
      // Report accumulated finals + current interim so the caller can show a live preview
      const combined = (finalAccumulated + (interim ? ' ' + interim : '')).trim();
      if (combined) onResult(combined);
    };

    this.recognition.start();
  }

  stopListening(): void {
    this.stopping = true;
    this.recognition?.stop();
    this.isListening = false;
  }
}
