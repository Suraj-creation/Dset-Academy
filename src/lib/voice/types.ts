// ─── Voice Provider Interfaces ───────────────────────────────
// All voice providers must implement these contracts.
// Swap provider by changing VOICE_PROVIDER in .env — zero code change.

export interface TTSProvider {
  /** Convert text to audio and play it */
  speak(text: string): Promise<void>;
  /** Stop current speech */
  stop(): void;
  /** Is currently speaking */
  isSpeaking: boolean;
}

export interface STTProvider {
  /** Start listening for speech, calls onResult with transcript or onError with error name */
  startListening(onResult: (transcript: string) => void, onError?: (errorName: string) => void): void;
  /** Stop listening */
  stopListening(): void;
  /** Is currently listening */
  isListening: boolean;
  /** Is this provider supported in current environment */
  isSupported(): boolean;
}

export type VoiceProviderType = 'browser' | 'azure' | 'own';
