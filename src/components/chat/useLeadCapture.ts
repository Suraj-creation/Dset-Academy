import { useState, useCallback } from 'react';
import { LEAD_CAPTURE_AFTER_MESSAGES, Intent, LeadScore } from '@/lib/widgetConfig';

// ─── Types ────────────────────────────────────────────────────
export interface LeadInfo {
  name?:    string;
  email?:   string;
  company?: string;
}

export interface LeadState {
  sessionId:    string;
  info:         LeadInfo;
  intent:       Intent;
  score:        LeadScore;
  messageCount: number;
  captured:     boolean;   // true once name+email collected
  createdAt:    string;
}

interface UseLeadCaptureReturn {
  lead:             LeadState;
  shouldAskDetails: boolean;
  updateFromResponse: (intent: Intent, score: LeadScore) => void;
  saveLeadInfo:     (info: Partial<LeadInfo>) => void;
  markCaptured:     () => void;
  incrementMessages: () => void;
}

// ─── Session ID generator ─────────────────────────────────────
function generateSessionId(): string {
  return `dset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Hook ─────────────────────────────────────────────────────
export function useLeadCapture(): UseLeadCaptureReturn {

  const [lead, setLead] = useState<LeadState>({
    sessionId:    generateSessionId(),
    info:         {},
    intent:       'general',
    score:        'cold',
    messageCount: 0,
    captured:     false,
    createdAt:    new Date().toISOString(),
  });

  // Show lead form when:
  // 1. User has sent enough messages AND
  // 2. Intent is warm or hot AND
  // 3. Details not yet captured
  const shouldAskDetails =
    lead.messageCount >= LEAD_CAPTURE_AFTER_MESSAGES &&
    (lead.score === 'hot' || lead.score === 'warm') &&
    !lead.captured;

  // ── Update intent + score from API response ──
  const updateFromResponse = useCallback((intent: Intent, score: LeadScore) => {
    setLead((prev) => ({
      ...prev,
      intent,
      // Score only upgrades, never downgrades (warm → hot ok, hot → warm no)
      score: upgradeScore(prev.score, score),
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

  // ── Increment message count ──
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
