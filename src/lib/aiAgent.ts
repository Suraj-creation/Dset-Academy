// ─── Shared AI Agent ────────────────────────────────────────────
// The single "brain" behind both the website chat widget
// (src/pages/api/widget/chat.ts) and the WhatsApp webhook
// (src/pages/api/whatsapp/webhook.ts). Extracted so both surfaces
// share identical prompt/RAG/context/generation logic instead of
// duplicating it.

import { SYSTEM_PROMPT, INTENT_KEYWORDS, Intent, LeadScore, LEAD_SCORE_RULES } from '@/lib/widgetConfig';
import { searchKnowledge } from '@/lib/rag';
import { getActiveJobs } from '@/lib/jobs.server';
import { getGalleryEvents } from '@/lib/events.server';

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentReplyResult {
  reply:  string;
  intent: Intent;
  score:  LeadScore;
}

// ─── Intent Extractor ─────────────────────────────────────────
export function extractIntent(text: string): Intent {
  const lower = text.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (intent === 'general') continue;
    if (keywords.some((kw) => lower.includes(kw))) return intent as Intent;
  }
  return 'general';
}

// ─── Lead Scorer ──────────────────────────────────────────────
export function scoreLeadFromIntents(intents: Intent[]): LeadScore {
  if (intents.some((i) => LEAD_SCORE_RULES.hot.includes(i)))  return 'hot';
  if (intents.some((i) => LEAD_SCORE_RULES.warm.includes(i))) return 'warm';
  return 'cold';
}

// ─── Dynamic Data Fetchers ────────────────────────────────────
async function fetchDynamicContext(message: string): Promise<string> {
  const lower = message.toLowerCase();
  const parts: string[] = [];

  const isJobQuery = ['job', 'opening', 'career', 'hiring', 'vacancy', 'vacancies', 'position', 'role', 'work with', 'join'].some(k => lower.includes(k));
  const isEventQuery = ['event', 'webinar', 'workshop', 'meetup', 'conference', 'upcoming'].some(k => lower.includes(k));
  const isCaseQuery = ['case study', 'case studies', 'client', 'result', 'success', 'proof', 'example', 'achievement', 'use case', 'use cases', 'industry', 'industries', 'sector', 'vertical'].some(k => lower.includes(k));

  if (isJobQuery) {
    try {
      const jobs = await getActiveJobs();
      if (jobs.length === 0) {
        parts.push('CURRENT JOB OPENINGS: No openings available at the moment.');
      } else {
        const list = jobs.map(j => `  • ${j.title} (${j.department}) — ${j.location}, ${j.type}, ${j.level}`).join('\n');
        parts.push(`CURRENT JOB OPENINGS:\n${list}`);
      }
    } catch { parts.push('CURRENT JOB OPENINGS: Could not fetch at this time.'); }
  }

  if (isEventQuery) {
    try {
      const events = await getGalleryEvents();
      if (events.length === 0) {
        parts.push('UPCOMING EVENTS: No published events at the moment.');
      } else {
        const list = events.slice(0, 5).map(e => `  • ${e.title} — ${e.date}${e.description ? ` (${e.description})` : ''}`).join('\n');
        parts.push(`UPCOMING EVENTS:\n${list}`);
      }
    } catch { parts.push('UPCOMING EVENTS: Could not fetch at this time.'); }
  }

  if (isCaseQuery) {
    parts.push(`CASE STUDIES & RESULTS:
  • IT-OT Intelligence Platform (built for a specialty industrial manufacturer in India): Real-time IT-OT bridge with voice AI — eliminated manual data reconciliation, AI flags production bottlenecks instantly, floor managers use conversational interface.
  • OreBill AI™ (Mining): 60% faster billing reconciliation, ₹1.2Cr annual leakage recovered, weighbridge discrepancy from 12% to 1.5%.
  • SecureCloud™ (BFSI): 70% faster audit prep, 84% fewer critical misconfigurations, PCI-DSS Level 1 readiness in one quarter.
  • iPaS-RevOps™ (B2B SaaS): AR overdue from 23% to 8%, 340+ hours/month recovered, forecast accuracy from ±31% to ±9%.
  • PharmaAI (Pharma Commercial Intelligence): Natural-language, audit-grade market intelligence over licensed pharma commercial datasets — zero-hallucination deterministic retrieval.
  • Digital Operations for Sports/Universities: AI platform for athlete analytics and institutional workflows (upcoming).
  • Learning Management System: AI-driven personalised learning paths and future-skill recommendations (upcoming).`);
  }

  return parts.join('\n\n');
}

// Builds the full RAG + dynamic context block for a message. Can throw
// (keyword RAG lookup / dynamic fetchers) — callers that need a clean
// error response before committing to a response format (e.g. the widget's
// streaming headers) should call this before switching modes.
export async function buildAgentContext(message: string): Promise<string> {
  const ragContext     = searchKnowledge(message);
  const dynamicContext = await fetchDynamicContext(message);
  return [ragContext, dynamicContext].filter(Boolean).join('\n\n');
}

// ─── Azure OpenAI Realtime (WebSocket) ───────────────────────
export async function streamAgentReply(
  messages: AgentMessage[],
  fullContext: string,
  onDelta: (text: string) => void,
  extraInstructions?: string,
): Promise<string> {
  const { WebSocket } = await import('ws');

  const endpoint   = process.env.AZURE_OPENAI_ENDPOINT!.replace(/\/$/, '');
  const apiKey     = process.env.AZURE_OPENAI_API_KEY!;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? '2024-10-01-preview';

  const wsUrl = `${endpoint.replace('https://', 'wss://')}/openai/realtime?api-version=${apiVersion}&deployment=${deployment}`;

  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
  const contextText = messages
    .filter(m => m.role !== 'system')
    .slice(-6)
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const instructions = [
    SYSTEM_PROMPT,
    extraInstructions ? `\n${extraInstructions}` : '',
    fullContext ? `\nAPPROVED PUBLIC INFORMATION:\n${fullContext}` : '',
    `\nConversation so far:\n${contextText}`,
    `\nReply in ${/[ऀ-ॿ]/.test(lastUserMsg) ? 'Hindi' : 'English'}.`,
  ].join('');

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl, { headers: { 'api-key': apiKey } });
    let fullText = '';
    let sessionSet = false;

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Azure response timed out. Please try again.'));
    }, 45000);

    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities:  ['text'],
          instructions,
          temperature: 0.7,
          // High enough that a full "explain all 7 platforms" style answer doesn't get cut off mid-sentence.
          max_response_output_tokens: 1200,
        },
      }));
    });

    ws.on('message', (raw: Buffer) => {
      let event: { type: string; delta?: string; response?: { output?: Array<{ content?: Array<{ text?: string }> }> }; error?: { message?: string } };
      try { event = JSON.parse(raw.toString()); } catch { return; }

      if (event.type === 'session.updated' && !sessionSet) {
        sessionSet = true;
        ws.send(JSON.stringify({
          type: 'conversation.item.create',
          item: { type: 'message', role: 'user', content: [{ type: 'input_text', text: lastUserMsg }] },
        }));
        ws.send(JSON.stringify({ type: 'response.create' }));
      }

      if (event.type === 'response.text.delta' && event.delta) {
        fullText += event.delta;
        onDelta(event.delta);
      }

      if (event.type === 'response.done') {
        if (!fullText && event.response?.output) {
          for (const item of event.response.output) {
            for (const part of item.content ?? []) {
              if (part.text) fullText += part.text;
            }
          }
        }
        clearTimeout(timeout);
        ws.close();
        resolve(fullText || 'Sorry, I could not process that.');
      }

      if (event.type === 'error') {
        clearTimeout(timeout);
        ws.close();
        reject(new Error(event.error?.message ?? 'Realtime API error'));
      }
    });

    ws.on('error', (err: Error) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// ─── Convenience: one-shot reply (used by the WhatsApp webhook) ──
// Combines context-building + generation in a single call/catch — fine for
// callers that don't need the widget's two-phase (clean-JSON-error-before-
// streaming-headers) split.
export async function generateAgentReply(
  message: string,
  history: AgentMessage[],
  priorIntent?: Intent,
  onDelta?: (text: string) => void,
  extraInstructions?: string,
): Promise<AgentReplyResult> {
  const intent = extractIntent(message);
  const allIntents: Intent[] = [...(priorIntent ? [priorIntent] : []), intent];
  const score = scoreLeadFromIntents(allIntents);

  const fullContext = await buildAgentContext(message);
  const messages: AgentMessage[] = [...history.slice(-10), { role: 'user', content: message }];
  const reply = await streamAgentReply(messages, fullContext, onDelta ?? (() => {}), extraInstructions);

  return { reply, intent, score };
}
