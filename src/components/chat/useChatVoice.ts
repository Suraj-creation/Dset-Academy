import { useState, useRef, useCallback, useEffect } from "react";
import type { STTProvider, TTSProvider } from "@/lib/voice/types";
import { TRANSCRIPT_CORRECTIONS } from "@/lib/widgetConfig";

function applyCorrections(text: string): string {
  return TRANSCRIPT_CORRECTIONS.reduce(
    (t, [pattern, replacement]) => t.replace(pattern, replacement),
    text,
  );
}

interface UseChatVoiceReturn {
  isListening:       boolean;
  isSpeaking:        boolean;
  micError:          string | null;
  pendingTranscript: string;
  clearMicError:     () => void;
  startListening:    () => void;   // barge-in safe: stops TTS first if needed
  confirmTranscript: () => void;   // stop STT + send buffered text
  cancelListening:   () => void;   // stop STT + discard
  speak:             (text: string) => Promise<void>;
  stopSpeaking:      () => void;   // immediate stop, clears queue
  supported:         boolean;
}

export function useChatVoice(
  onTranscript: (text: string) => void,
): UseChatVoiceReturn {
  const [isListening,       setIsListening]       = useState(false);
  const [isSpeaking,        setIsSpeaking]        = useState(false);
  const [micError,          setMicError]          = useState<string | null>(null);
  const [pendingTranscript, setPendingTranscript] = useState('');

  const sttRef     = useRef<STTProvider | null>(null);
  const ttsRef     = useRef<TTSProvider | null>(null);
  const pendingRef = useRef('');   // mirrors state without stale-closure risk

  const supported = typeof window !== "undefined";

  // ── Load providers lazily ────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    (async () => {
      const { getTTSProvider, getSTTProvider } = await import("@/lib/voice/index");
      ttsRef.current = await getTTSProvider();
      sttRef.current = await getSTTProvider();
    })();
  }, []);

  // ── STT helpers ──────────────────────────────────────────
  const resetPending = useCallback(() => {
    pendingRef.current = '';
    setPendingTranscript('');
  }, []);

  // Stops any ongoing TTS immediately (browser + audio-element paths)
  const stopSpeaking = useCallback(() => {
    ttsRef.current?.stop();
    // Belt-and-suspenders: also cancel browser speech synthesis directly
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(() => {
    // ── Barge-in: stop AI speech before starting mic ──────
    // ttsRef.current?.isSpeaking is the provider-level flag; checking it
    // avoids relying on React state which may not yet have flushed.
    if (ttsRef.current?.isSpeaking) {
      ttsRef.current.stop();
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }

    if (!sttRef.current) return;

    setMicError(null);

    const isSecure =
      typeof window !== "undefined" &&
      (window.location.protocol === "https:" || window.location.hostname === "localhost");

    if (!isSecure) {
      setMicError("Voice chat requires a secure connection (HTTPS).");
      return;
    }

    resetPending();

    sttRef.current.startListening(
      (transcript) => {
        // Correct brand-name mishearings before buffering
        const corrected = applyCorrections(transcript);
        pendingRef.current = corrected;
        setPendingTranscript(corrected);
      },
      (errorName) => {
        setIsListening(false);
        resetPending();
        if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
          setMicError("Microphone access denied. Please allow it when your browser asks.");
        } else if (errorName === "NotFoundError") {
          setMicError("No microphone found. Please connect one and try again.");
        } else {
          setMicError("Voice unavailable. You can continue by typing below.");
        }
      },
    );

    setIsListening(true);

    // Safety-net: sync state if provider stops on its own (e.g. Azure 8-sec limit)
    const check = setInterval(() => {
      if (!sttRef.current?.isListening) {
        setIsListening(false);
        clearInterval(check);
      }
    }, 500);
  }, [resetPending]);

  // ✓ Stop recording and send whatever was transcribed
  const confirmTranscript = useCallback(() => {
    sttRef.current?.stopListening();
    setIsListening(false);
    const text = pendingRef.current.trim();
    resetPending();
    if (text) onTranscript(text);
  }, [onTranscript, resetPending]);

  // ✗ Stop recording and discard — nothing is sent
  const cancelListening = useCallback(() => {
    sttRef.current?.stopListening();
    setIsListening(false);
    resetPending();
  }, [resetPending]);

  const clearMicError = useCallback(() => setMicError(null), []);

  // ── TTS ──────────────────────────────────────────────────
  const speak = useCallback(async (text: string) => {
    if (!ttsRef.current) return;
    setIsSpeaking(true);
    try {
      await ttsRef.current.speak(text);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    micError,
    pendingTranscript,
    clearMicError,
    startListening,
    confirmTranscript,
    cancelListening,
    speak,
    stopSpeaking,
    supported,
  };
}
