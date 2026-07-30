import { useState, useCallback } from 'react';
import { Intent, LeadScore } from '@/lib/widgetConfig';
import { hasExplicitLeadIntent } from '@/lib/leadIntent';

// ─── Types ────────────────────────────────────────────────────
export interface LeadInfo {
  name?:    string;
  email?:   string;
  phone?:   string;
  company?: string;
}

export interface LeadState {
  sessionId:          string;
  info:               LeadInfo;
  intent:             Intent;
  topics:             Intent[];  // every distinct intent raised this session — feeds the CRM/email summary
  score:              LeadScore;
  messageCount:       number;
  captured:           boolean;   // true once name+email collected (or the prompt was dismissed)
  explicitLeadIntent: boolean;   // true once the USER has explicitly shown intent to be contacted
  createdAt:          string;
}

interface UseLeadCaptureReturn {
  lead:             LeadState;
  shouldAskDetails: boolean;
  updateFromResponse: (intent: Intent, score: LeadScore, userMessage: string, lastAssistantMessage?: string) => void;
  saveLeadInfo:     (info: Partial<LeadInfo>) => void;
  markCaptured:     () => void;
  incrementMessages: () => void;
}

// ─── Session ID generator ─────────────────────────────────────
function generateSessionId(): string {
  return `dset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Explicit lead-intent detection ────────────────────────────
// IMPORTANT: lead SCORE (hot/warm/cold) measures topic interest — it answers
// "is this a valuable conversation for sales to know about". It must NOT
// gate the contact form, because plenty of hot/warm turns are just informational
// (product questions, stress tests, even confidentiality probes that got a
// warm/hot score earlier in the session and never downgrade). The form is
// gated on a separate, much narrower signal: did the USER, in their own words,
// ask for a demo / to be connected with the team / a consultation or callback /
// clearly express buying intent — or did they just say yes to a CTA the
// assistant offered a moment ago. See @/lib/leadIntent for the shared check
// (also used by the WhatsApp webhook so both channels agree).

// ─── Hook ─────────────────────────────────────────────────────
export function useLeadCapture(): UseLeadCaptureReturn {

  const [lead, setLead] = useState<LeadState>({
    sessionId:          generateSessionId(),
    info:               {},
    intent:             'general',
    topics:             [],
    score:              'cold',
    messageCount:       0,
    captured:           false,
    explicitLeadIntent: false,
    createdAt:          new Date().toISOString(),
  });

  // Show the lead form only once the user has explicitly shown lead intent,
  // and only if we haven't already asked/captured this session.
  const shouldAskDetails = lead.explicitLeadIntent && !lead.captured;

  // ── Update intent + score from API response, and check for explicit lead intent ──
  const updateFromResponse = useCallback((intent: Intent, score: LeadScore, userMessage: string, lastAssistantMessage?: string) => {
    setLead((prev) => ({
      ...prev,
      intent,
      topics: prev.topics.includes(intent) ? prev.topics : [...prev.topics, intent],
      // Score only upgrades, never downgrades (warm → hot ok, hot → warm no)
      score: upgradeScore(prev.score, score),
      explicitLeadIntent: prev.explicitLeadIntent || hasExplicitLeadIntent(intent, userMessage, lastAssistantMessage),
    }));
  }, []);

  // ── Save name / email / company ──
  const saveLeadInfo = useCallback((info: Partial<LeadInfo>) => {
    setLead((prev) => ({
      ...prev,
      info: { ...prev.info, ...info },
    }));
  }, []);

  // ── Mark lead as captured (stop asking) ──
  const markCaptured = useCallback(() => {
    setLead((prev) => ({ ...prev, captured: true }));
  }, []);

  // ── Increment message count (kept for analytics/server lead record only — no longer gates the form) ──
  const incrementMessages = useCallback(() => {
    setLead((prev) => ({ ...prev, messageCount: prev.messageCount + 1 }));
  }, []);

  return {
    lead,
    shouldAskDetails,
    updateFromResponse,
    saveLeadInfo,
    markCaptured,
    incrementMessages,
  };
}

// ─── Score upgrade logic ──────────────────────────────────────
// Score priority: hot > warm > cold
const SCORE_RANK: Record<LeadScore, number> = { hot: 2, warm: 1, cold: 0 };

function upgradeScore(current: LeadScore, incoming: LeadScore): LeadScore {
  return SCORE_RANK[incoming] > SCORE_RANK[current] ? incoming : current;
}
