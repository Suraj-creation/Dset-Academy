// ─── Explicit Lead-Intent Detection ───────────────────────────
// Shared by the website widget (src/components/chat/useLeadCapture.ts) and
// the WhatsApp webhook (src/pages/api/whatsapp/webhook.ts) so both channels
// agree on what counts as "the user explicitly asked for a next step" —
// a demo, pricing, or to be connected/contacted — as opposed to intent
// SCORE (hot/warm/cold), which just measures topic interest.

import { Intent } from '@/lib/widgetConfig';

const EXPLICIT_LEAD_INTENTS: Intent[] = ['demo', 'contact', 'pricing'];

// Phrase-level backstop: extractIntent() picks ONE winning category per message
// (e.g. "connect me with your sales team" loses to the product_revops category
// because of the word "sales"), so intent alone misses real asks.
const EXPLICIT_LEAD_PATTERN = new RegExp(
  [
    'book(?:ing)? a (?:demo|call|meeting|consultation)',
    'schedule (?:a )?(?:demo|call|meeting|consultation)',
    '(?:can|could|may) (?:i|we) (?:get|book|schedule) a demo',
    'connect (?:me|us) with',
    '(?:talk|speak) (?:to|with) (?:your |the )?(?:sales|team|experts?)',
    'contact (?:your|the) team',
    'get in touch',
    'reach out to me',
    'call me back',
    'request a call ?back',
    'book a call ?back',
    'how (?:do|can) i (?:sign up|get started|purchase|buy|implement)',
    'want to (?:sign up|buy|purchase|implement|proceed|move forward|get started)',
    'ready to (?:buy|purchase|proceed|get started)',
  ].join('|'),
  'i',
);

// Agreement-after-offer: the assistant just offered a CTA and the user's very
// next message is a short, clear "yes" to it. Both halves must match — an
// unrelated "yes" elsewhere in a sentence, or a CTA the user never responded
// to, do not qualify.
const CTA_OFFER_PATTERN = /\b(demo|connect (?:you|with)|speak (?:with|to) (?:our|the) (?:team|experts?)|book a (?:demo|call|consultation)|reach out to you)\b/i;
const AFFIRMATIVE_PATTERN = /^\s*(?:yes|yeah|yep|yup|sure|ok(?:ay)?|please do|go ahead|sounds good|let'?s do (?:it|that)|do it|connect me|i'?d like that|works for me)\b/i;

export function hasExplicitLeadIntent(intent: Intent, userMessage: string, lastAssistantMessage?: string): boolean {
  if (EXPLICIT_LEAD_INTENTS.includes(intent)) return true;
  if (EXPLICIT_LEAD_PATTERN.test(userMessage)) return true;
  return !!lastAssistantMessage
    && CTA_OFFER_PATTERN.test(lastAssistantMessage)
    && AFFIRMATIVE_PATTERN.test(userMessage.trim());
}
