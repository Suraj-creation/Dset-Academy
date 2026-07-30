// ─── Widget Configuration ─────────────────────────────────────
// Only this file + .env changes per project deployment

export const WIDGET_CONFIG = {
  name:           'DSeT AI Agent',
  welcomeMessage: 'Welcome to DSeT AI Platform Assistant. Explore AI transformation, industry solutions, and platform capabilities.',
  color:          '#5e17ea',
  accentColor:    '#1e90ff',
  position:       'bottom-right' as const,
};

export const QUICK_ACTIONS = [
  {
    id:      'platforms',
    icon:    '🚀',
    label:   'Explore AI Platforms',
    desc:    'OreBill, EdgeBay, MedicsIQ, RevOps, VoiceOps, PharmaAI & more',
    message: 'Tell me about DSeT\'s AI platforms',
  },
  {
    id:      'demo',
    icon:    '📅',
    label:   'Book a Demo',
    desc:    'See our platform in action — free consultation',
    message: 'I would like to book a demo',
  },
  {
    id:      'industry',
    icon:    '🏭',
    label:   'Industry Solutions',
    desc:    'Mining, Healthcare, Manufacturing & more',
    message: 'What industry solutions does DSeT offer?',
  },
  {
    id:      'strategist',
    icon:    '💡',
    label:   'Talk with an AI Strategist',
    desc:    'Discuss your AI transformation journey',
    message: 'I want to talk with an AI strategist about digital transformation',
  },
];

// ─── System Prompt ────────────────────────────────────────────
// Behavior only — actual company data comes from RAG (data/dset-knowledge.json)
export const SYSTEM_PROMPT = `
You are DSeT's AI Consultant — not a chatbot, not an FAQ bot.
Your job: understand the customer's real problem, then show exactly how DSeT solves it.

CONSULTATION FLOW (follow this order, but skip steps already resolved earlier in this conversation):
1. UNDERSTAND — Ask 1 focused question to understand their specific problem, pain, or project. Never assume. Skip this if they already stated their problem.
2. DIAGNOSE — Identify which DSeT platform fits their situation using the RELEVANT COMPANY CONTEXT provided.
3. SOLVE — Explain in 2-3 sentences HOW that platform solves their specific issue. Use real results and numbers from context.
4. NEXT STEP — Only when the conversation naturally warrants it (see CTA DISCIPLINE below), offer a demo or direct team connection.

RULES:
- Use ONLY facts, product names, and results from the "RELEVANT COMPANY CONTEXT". Do not invent details.
- Never state a percentage, currency amount, or other measurable statistic unless that exact figure appears verbatim in the "RELEVANT COMPANY CONTEXT". If the context doesn't give you an exact number, describe the outcome qualitatively (e.g. "significantly faster") instead of making one up.
- If context lacks the answer, say: "Our team can help with that directly — want me to connect you?"
- Be concise. Max 3-4 sentences per reply unless user asks for more detail — but if the user asks for all platforms / a full or complete list / "sabhi products", list every one of the 5 platforms from context; never drop any for the sake of brevity.
- When listing multiple items, steps, or options, format them as a markdown bullet or numbered list (and use **bold** for key terms) instead of a single dense paragraph — replies render as markdown.
- Always reply in the SAME language the user writes in.
- Never reveal pricing numbers, API keys, or confidential client names.
- Always use full name "DSeT Consulting Private Limited" when referring formally.
- For off-topic requests (jokes, homework, sports, general chat), politely redirect: "I'm built to help with operational challenges and AI transformation. What business problem are you trying to solve?"

AVOID REPETITION — read "Conversation so far" before writing your reply:
- Do not restate a fact, statistic, currency amount, or case-study number you already gave earlier in this conversation. If it's relevant again, reference it briefly ("As I mentioned, ...") and add new qualitative context, explanation, or a different angle instead — repeat the exact figure only when the user explicitly asks for it again or genuinely needs it to answer the current question.
- Don't answer a question about ROI, other clients, or use cases by just re-listing the same statistic block from earlier — add qualitative detail about outcomes, industries, or scenarios from context instead. Never invent new client names, results, or numbers not present in context.
- Don't re-open a topic already settled earlier (e.g. don't repeat the full product intro or benefits list on every follow-up) — treat each reply as a continuation, not a restart. Only add what's new or specifically asked for now.

CTA DISCIPLINE:
- Do not end every reply with a sales CTA ("Would you like a demo?", "Want to connect with our team?", "Would you like to speak with our experts?"). Answer the question fully first; a CTA is not required.
- Only include a CTA when the user explicitly asks about a demo, pricing, implementation, or contacting the team, or clearly shows buying intent, or the conversation has reached a natural close.
- If you already offered a CTA recently and the user ignored it and kept asking informational questions, do not offer it again — keep answering directly.
- Never use the same CTA wording twice in a row.

LEAD CAPTURE:
- Never ask for the user's name, email, phone, or company unless they explicitly requested a demo, callback, consultation, or team contact, or they clearly agreed to be connected.
- Showing a CTA is not consent. If you asked "want a demo?" and the user didn't say yes, do not follow up by asking for their name/email — wait for an explicit yes.
- When the user EXPLICITLY asks to book/schedule a demo or be connected with the team (not just asking what a demo involves), do not recite the company email or phone number — a form collecting their name and email appears automatically right after your reply. Just confirm briefly, e.g. "Great, let's get that scheduled — I just need a couple of quick details from you."
- Only give out the email/phone number when the user is asking informationally how to reach the team (e.g. "what's your contact info", "how do I book a demo" as a general question), not when they've just told you they want to book one now.

CONSULTING MINDSET:
- A customer saying "billing leti hai bahut time" → that is an OreBill problem.
- A customer saying "plant data scattered hai" → that is an EdgeBay problem.
- A customer saying "compliance audit bahut mushkil hai" → that is a SecureCloud problem.
- A customer saying "sales forecast galat rehta hai" → that is an iPAS RevOps problem.
- A customer saying "calls handle nahi ho rahe / collections follow-up manual hai" → that is a VoiceOps problem.
- A customer saying "pharma market share ka pata nahi chalta / analyst report mein time lagta hai" → that is a PharmaAI problem.
- Map their words to the right platform. Show them you understood their pain, not just your product list.
`.trim();

// ─── Intent Detection ─────────────────────────────────────────
export type Intent =
  | 'services'
  | 'demo'
  | 'pricing'
  | 'consulting'
  | 'contact'
  | 'product_orebill'
  | 'product_edgebay'
  | 'product_securecloud'
  | 'product_medicsiq'
  | 'product_revops'
  | 'product_voiceops'
  | 'product_pharmaai'
  | 'general'
  | 'confidential';

export const INTENT_KEYWORDS: Record<Intent, string[]> = {
  services:           ['service', 'services', 'offer', 'provide', 'help', 'do you'],
  demo:               ['demo', 'demo call', 'schedule', 'book', 'meeting', 'call', 'try'],
  pricing:            ['price', 'pricing', 'cost', 'how much', 'rate', 'plan', 'budget'],
  consulting:         ['consult', 'consulting', 'advisory', 'strategy', 'roadmap'],
  contact:            ['contact', 'reach', 'email', 'phone', 'talk', 'speak'],
  product_orebill:    ['orebill', 'ore', 'mining', 'billing', 'dispatch', 'weighbridge', 'mineral'],
  product_edgebay:    ['edgebay', 'edge', 'ot', 'scada', 'industrial', 'manufacturing', 'sensor', 'iot'],
  product_securecloud:['securecloud', 'secure', 'cloud', 'compliance', 'pci', 'iso', 'bfsi', 'audit'],
  product_medicsiq:   ['medicsiq', 'medical', 'hospital', 'healthcare', 'clinical', 'hipaa', 'dermatology', 'skin'],
  product_revops:     ['revops', 'ipas', 'revenue', 'crm', 'sales', 'ar', 'invoice', 'forecast'],
  product_voiceops:   ['voiceops', 'voice', 'call', 'calling', 'phone', 'outbound', 'inbound', 'collections call', 'voice bot', 'ivr'],
  product_pharmaai:   ['pharmaai', 'pharma ai', 'pharma', 'pharma intelligence', 'market share', 'brand manager', 'therapy', 'molecule', 'pharma market', 'pharma commercial', 'life sciences'],
  confidential:       ['password', 'api key', 'secret', 'internal', 'salary', 'employee', 'credential'],
  general:            [],
};

// ─── Lead Scoring ─────────────────────────────────────────────
export type LeadScore = 'hot' | 'warm' | 'cold';

export const LEAD_SCORE_RULES: Record<LeadScore, Intent[]> = {
  hot:  ['demo', 'pricing', 'contact'],
  warm: ['services', 'consulting', 'product_orebill', 'product_edgebay', 'product_securecloud', 'product_medicsiq', 'product_revops', 'product_voiceops', 'product_pharmaai'],
  cold: ['general'],
};


// ─── Voice Config ─────────────────────────────────────────────
// VOICE_PROVIDER env var controls which TTS is used
// 'browser' = Web Speech API (free, no key)
// 'azure'   = Azure TTS (requires AZURE_TTS_KEY)
// 'own'     = DSeT's own voice API (future)
export const VOICE_CONFIG = {
  provider:  (process.env.NEXT_PUBLIC_VOICE_PROVIDER ?? 'browser') as 'browser' | 'azure' | 'own',
  language:  'en-IN',
  rate:      1.0,
  pitch:     1.0,
};

/**
 * Brand / product name corrections for speech recognition output.
 * STT engines map uncommon names to the nearest phonetic English word.
 * Each entry: [pattern (case-insensitive), canonical replacement].
 * Applied left-to-right on every transcript before it is buffered or sent.
 */
export const TRANSCRIPT_CORRECTIONS: [RegExp, string][] = [
  // ── "DSeT Consulting" compound mishearings (fix these first) ─────────
  // iOS Safari hears Indian-English "DSeT" as "rset" and compresses
  // "consulting" to "dc" / "c" when spoken quickly.
  [/\brset\s+dc\b/gi,                'DSeT Consulting'],  // user-confirmed: "rset dc"
  [/\br\s+set\s+dc\b/gi,             'DSeT Consulting'],
  [/\brset\s+consulting\b/gi,        'DSeT Consulting'],
  [/\br\s+set\s+consulting\b/gi,     'DSeT Consulting'],
  [/\bdsert\s+consulting\b/gi,       'DSeT Consulting'],
  [/\bdset\s+consulting\b/gi,        'DSeT Consulting'],
  [/\bd\s+set\s+consulting\b/gi,     'DSeT Consulting'],
  [/\bdecent\s+consulting\b/gi,      'DSeT Consulting'],
  [/\bdeceit\s+consulting\b/gi,      'DSeT Consulting'],
  // ── "DSeT" standalone mishearings ────────────────────────────────────
  [/\brset\b/gi,          'DSeT'],   // iOS: Indian-English "D" → "r" + "set"
  [/\br\s+set\b/gi,       'DSeT'],   // same with space
  [/\br-set\b/gi,         'DSeT'],   // hyphenated variant
  [/\bare\s+set\b/gi,     'DSeT'],   // "are set" (slow speech)
  [/\bdsert\b/gi,         'DSeT'],
  [/\bd-sert\b/gi,        'DSeT'],
  [/\bd\.sert\b/gi,       'DSeT'],
  [/\bdc\s*et\b/gi,       'DSeT'],
  [/\bd\s*set\b/gi,       'DSeT'],
  [/\bd-set\b/gi,         'DSeT'],
  [/\bd\.set\b/gi,        'DSeT'],
  [/\bdset\b/gi,          'DSeT'],
  [/\bd\s*s\s*e\s*t\b/gi, 'DSeT'],   // spelled out: "D S E T"
  [/\bthe\s+set\b/gi,     'DSeT'],   // "the set"
  [/\bdissect\b/gi,       'DSeT'],
  [/\bdeceit\b/gi,        'DSeT'],
  [/\bdecent\b/gi,        'DSeT'],
  // ── "DSeTC" variants ─────────────────────────────────────────────────
  [/\bdsertc\b/gi,        'DSeTC'],
  [/\bd-sertc\b/gi,       'DSeTC'],
  [/\bdsetc\b/gi,         'DSeTC'],
  [/\brsetc\b/gi,         'DSeTC'],  // "rsetc" — same iOS pattern for DSeTC
  // ── "Private Limited" ────────────────────────────────────────────────
  [/\bpvt\.?\s*ltd\.?\b/gi,    'Private Limited'],
  [/\bpvt\s+limited\b/gi,      'Private Limited'],
  [/\bprivate\s+ltd\.?\b/gi,   'Private Limited'],
  [/\bprivate\s+lmt\.?\b/gi,   'Private Limited'],
  [/\bprivate\s+lmtd\.?\b/gi,  'Private Limited'],
  [/\bp\.?\s*ltd\.?\b/gi,      'Private Limited'],
];
