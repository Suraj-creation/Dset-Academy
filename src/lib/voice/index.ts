// ─── Voice Provider Factory ───────────────────────────────────
// Single import point — returns correct provider based on .env
// To swap: change VOICE_PROVIDER in .env — zero code change

import type { STTProvider, TTSProvider, VoiceProviderType } from './types';

const PROVIDER = (process.env.NEXT_PUBLIC_VOICE_PROVIDER ?? 'browser') as VoiceProviderType;

export async function getTTSProvider(): Promise<TTSProvider> {
  if (PROVIDER === 'azure') {
    const { AzureTTSProvider } = await import('./azure');
    return new AzureTTSProvider();
  }
  if (PROVIDER === 'own') {
    const { OwnTTSProvider } = await import('./own');
    return new OwnTTSProvider();
  }
  // default: browser
  const { BrowserTTSProvider } = await import('./browser');
  return new BrowserTTSProvider();
}

export async function getSTTProvider(): Promise<STTProvider> {
  if (PROVIDER === 'azure') {
    const { AzureSTTProvider } = await import('./azure');
    return new AzureSTTProvider();
  }
  if (PROVIDER === 'own') {
    const { OwnSTTProvider } = await import('./own');
    return new OwnSTTProvider();
  }
  // default: browser
  const { BrowserSTTProvider } = await import('./browser');
  return new BrowserSTTProvider();
}

export type { STTProvider, TTSProvider, VoiceProviderType };
