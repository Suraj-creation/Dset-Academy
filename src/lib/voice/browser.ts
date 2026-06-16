// ─── Browser Voice Provider ───────────────────────────────────
// Uses Web Speech API — free, no key needed
// STT: SpeechRecognition API
// TTS: SpeechSynthesis API

import type { STTProvider, TTSProvider } from './types';

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/i.test(navigator.userAgent);
}

function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

// ── Browser TTS ──────────────────────────────────────────────
export class BrowserTTSProvider implements TTSProvider {
  isSpeaking = false;
  private static _unlocked = false;

  constructor() {
    // iOS + Android: speechSynthesis.speak() from async context is silently blocked
    // unless the audio session was activated from a direct user gesture first.
    // Register a one-time touchstart listener to warm up the TTS engine early.
    if (typeof window !== 'undefined' && (isIOS() || isAndroid()) && !BrowserTTSProvider._unlocked) {
      const unlock = () => {
        if (!window.speechSynthesis || BrowserTTSProvider._unlocked) return;
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        u.rate   = 10; // play as fast as possible — effectively silent
        // IMPORTANT: do NOT call cancel() here.
        // Cancelling immediately prevents mobile browsers from activating the audio session.
        u.onend   = () => { BrowserTTSProvider._unlocked = true; };
        u.onerror = () => { BrowserTTSProvider._unlocked = true; };
        window.speechSynthesis.speak(u);
      };
      // touchstart fires before touchend — activates audio session sooner
      document.addEventListener('touchstart', unlock, { once: true, passive: true });
      document.addEventListener('click',      unlock, { once: true });
    }
  }

  // Call from any confirmed user-gesture handler (e.g. mic button click)
  // to guarantee the iOS audio session is active before an async speak() call.
  prime(): void {
    if (typeof window === 'undefined' || !window.speechSynthesis || BrowserTTSProvider._unlocked) return;
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    u.rate   = 10;
    u.onend   = () => { BrowserTTSProvider._unlocked = true; };
    u.onerror = () => { BrowserTTSProvider._unlocked = true; };
    window.speechSynthesis.speak(u);
  }

  async speak(text: string): Promise<void> {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // iOS Safari can leave synthesis in a paused state; resume before cancelling.
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    window.speechSynthesis.cancel();

    return new Promise((resolve) => {
      // Phonetic substitution for speech only — "DSeT" is read as "D S e T" by Safari TTS.
      text = text.replace(/DSeT/g, 'Dee Set');
      const utterance = new SpeechSynthesisUtterance(text);
      // Use 'en-US' as the safe default; pickVoice() may upgrade to en-IN if available.
      // Android and iOS devices often lack an en-IN TTS engine, causing silent failure.
      utterance.lang  = 'en-US';
      utterance.rate  = 1.0;
      utterance.pitch = 1.0;

      const pickVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) return;
        const chosen =
          voices.find((v) => v.lang === 'en-IN' || v.name.toLowerCase().includes('india')) ??
          voices.find((v) => v.lang.startsWith('en')) ??
          null;
        if (chosen) {
          utterance.voice = chosen;
          utterance.lang  = chosen.lang; // must match voice, or iOS silently skips it
        }
      };

      let stallTimer: ReturnType<typeof setInterval> | null = null;
      let startWatch: ReturnType<typeof setTimeout> | null = null;
      let hasStarted = false;
      let hasFinished = false;
      let startAttempts = 0;

      const done = () => {
        if (hasFinished) return;
        hasFinished = true;
        this.isSpeaking = false;
        if (stallTimer) { clearInterval(stallTimer); stallTimer = null; }
        if (startWatch) { clearTimeout(startWatch); startWatch = null; }
        resolve();
      };

      utterance.onstart = () => {
        hasStarted = true;
        this.isSpeaking = true;
        if (startWatch) { clearTimeout(startWatch); startWatch = null; }
        if (isIOS() || isAndroid()) {
          stallTimer = setInterval(() => {
            if (!window.speechSynthesis.speaking) {
              clearInterval(stallTimer!); stallTimer = null; return;
            }
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }, 10_000);
        }
      };
      utterance.onend   = done;
      utterance.onerror = done;

      const queueSpeech = () => {
        if (hasFinished) return;
        startAttempts++;
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);

        if (isAndroid()) {
          startWatch = setTimeout(() => {
            if (hasStarted || hasFinished) return;
            if (startAttempts >= 2) { done(); return; }
            window.speechSynthesis.cancel();
            setTimeout(queueSpeech, 400);
          }, 1200);
        }
      };

      if (isAndroid()) {
        // Android Chrome: voices must be loaded BEFORE speak() or the utterance is
        // silently dropped. getVoices() returns [] on first call — wait for voiceschanged.
        const androidSpeak = () => { pickVoice(); setTimeout(queueSpeech, 400); };
        const voices = window.speechSynthesis.getVoices();
        if (voices.length) {
          androidSpeak();
        } else {
          window.speechSynthesis.addEventListener('voiceschanged', androidSpeak, { once: true });
          // Fallback: if voiceschanged never fires within 1.5 s, attempt anyway
          setTimeout(() => { if (!hasStarted && !hasFinished) androidSpeak(); }, 1500);
        }
      } else {
        // iOS + Desktop: existing behaviour — speak immediately, set voice async if needed
        if (window.speechSynthesis.getVoices().length) {
          pickVoice();
        } else {
          window.speechSynthesis.addEventListener('voiceschanged', pickVoice, { once: true });
        }
        queueSpeech();
      }
    });
  }

  stop(): void {
    if (typeof window === 'undefined') return;
    // Must resume before cancel() on iOS or the cancel is silently ignored.
    if (window.speechSynthesis?.paused) window.speechSynthesis.resume();
    window.speechSynthesis?.cancel();
    this.isSpeaking = false;
  }
}

// ── Browser STT ──────────────────────────────────────────────
export class BrowserSTTProvider implements STTProvider {
  isListening = false;
  private recognition: any = null;
  private stopping = false;

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const w = window as any;
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
  }

  startListening(onResult: (transcript: string) => void, onError?: (errorName: string) => void): void {
    if (!this.isSupported() || this.isListening) return;

    this.stopping = false;

    let finalAccumulated = '';
    let hadFatalError    = false;
    let restartCount     = 0;
    let noSpeechCount    = 0;      // independent counter — not reset by onstart
    const MAX_RESTARTS   = 5;
    const MAX_NO_SPEECH  = 3;      // after 3 silent rounds, surface an error
    // Android and iOS do not reliably support en-IN for STT. Use en-US directly.
    let currentLang      = (isAndroid() || isIOS()) ? 'en-US' : 'en-IN';
    // continuous:true is unreliable on mobile — we restart manually in onend.
    const useContinuous  = !isIOS() && !isAndroid();

    // Always build a fresh instance — reusing a post-error object causes
    // InvalidStateError on Android Chrome.
    const buildRecognition = () => {
      const w  = window as any;
      const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
      const rec = new SR();
      rec.lang            = currentLang;
      rec.interimResults  = true;
      rec.maxAlternatives = 1;
      rec.continuous      = useContinuous;
      return rec;
    };

    const scheduleRestart = () => {
      if (this.stopping || hadFatalError) { this.isListening = false; return; }
      // iOS Safari blocks recognition.start() from setTimeout (requires direct user gesture).
      // Stop here; the caller's safety-net in useChatVoice will send whatever was captured.
      if (isIOS()) { this.isListening = false; return; }
      if (restartCount >= MAX_RESTARTS)   { this.isListening = false; onError?.('aborted'); return; }
      restartCount++;
      // 350 ms gap on Android prevents "already started" InvalidStateError.
      setTimeout(() => {
        if (this.stopping || hadFatalError) { this.isListening = false; return; }
        startOnce();
      }, isAndroid() ? 350 : 200);
    };

    const startOnce = () => {
      this.recognition = buildRecognition();

      this.recognition.onstart = () => {
        this.isListening = true;
        restartCount = 0; // successful start resets crash-loop guard
      };

      // Mobile browsers fire onend after every phrase; restart unless user stopped.
      this.recognition.onend = () => {
        if (!this.stopping && !hadFatalError) { scheduleRestart(); return; }
        this.isListening = false;
      };

      this.recognition.onerror = (e: { error: string }) => {
        if (e.error === 'aborted') return; // our own stop() — ignore

        if (e.error === 'no-speech') {
          noSpeechCount++;
          if (noSpeechCount >= MAX_NO_SPEECH) {
            hadFatalError    = true;
            this.isListening = false;
            onError?.('no-speech');
          }
          return;
        }

        if (e.error === 'language-not-supported') {
          currentLang   = 'en-US';
          hadFatalError = false; // allow one retry with en-US
          return;
        }

        hadFatalError    = true;
        this.isListening = false;

        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          onError?.('NotAllowedError');
        } else if (e.error === 'audio-capture') {
          onError?.('NotFoundError');
        } else if (e.error === 'network') {
          onError?.('NetworkError');
        } else {
          onError?.(e.error);
        }
      };

      this.recognition.onresult = (e: any) => {
        noSpeechCount = 0; // real audio received — reset silent-round counter
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            finalAccumulated += e.results[i][0].transcript;
          } else {
            interim = e.results[i][0].transcript;
          }
        }
        const combined = (finalAccumulated + (interim ? ' ' + interim : '')).trim();
        if (combined) onResult(combined);
      };

      try {
        this.recognition.start();
      } catch (err) {
        this.isListening = false;
        onError?.(err instanceof Error ? err.name : 'SpeechRecognitionStartError');
      }
    };

    startOnce();
  }

  stopListening(): void {
    this.stopping = true;
    try { this.recognition?.stop(); } catch { /* ignore InvalidStateError on stop */ }
    this.isListening = false;
  }
}
