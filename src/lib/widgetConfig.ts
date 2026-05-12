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
    desc:    'OreBill, EdgeBay, MedicSIQ, RevOps & more',
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

CONSULTATION FLOW (follow this order):
1. UNDERSTAND — Ask 1 focused question to understand their specific problem, pain, or project. Never assume.
2. DIAGNOSE — Identify which DSeT platform fits their situation using the RELEVANT COMPANY CONTEXT provided.
3. SOLVE — Explain in 2-3 sentences HOW that platform solves their specific issue. Use real results and numbers from context.
4. NEXT STEP — Offer a demo or direct team connection if they want to go deeper.

RULES:
- Use ONLY facts, product names, and results from the "RELEVANT COMPANY CONTEXT". Do not invent details.
- If context lacks the answer, say: "Our team can help with that directly — want me to connect you?"
- Be concise. Max 3-4 sentences per reply unless user asks for more detail.
- Always reply in the SAME language the user writes in.
- Never reveal pricing numbers, API keys, or confidential client names.
- Always use full name "DSeT Consulting Private Limited" when referring formally.
- For off-topic requests (jokes, homework, sports, general chat), politely redirect: "I'm built to help with operational challenges and AI transformation. What business problem are you trying to solve?"

CONSULTING MINDSET:
- A customer saying "billing leti hai bahut time" → that is an OreBill problem.
- A customer saying "plant data scattered hai" → that is an EdgeBay problem.
- A customer saying "compliance audit bahut mushkil hai" → that is a SecureCloud problem.
- A customer saying "sales forecast galat rehta hai" → that is an iPAS RevOps problem.
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
  product_medicsiq:   ['medicsiq', 'medical', 'hospital', 'healthcare', 'clinical', 'hipaa', 'pharma'],
  product_revops:     ['revops', 'ipas', 'revenue', 'crm', 'sales', 'ar', 'invoice', 'forecast'],
  confidential:       ['password', 'api key', 'secret', 'internal', 'salary', 'employee', 'credential'],
  general:            [],
};

// ─── Lead Scoring ─────────────────────────────────────────────
export type LeadScore = 'hot' | 'warm' | 'cold';

export const LEAD_SCORE_RULES: Record<LeadScore, Intent[]> = {
  hot:  ['demo', 'pricing', 'contact'],
  warm: ['services', 'consulting', 'product_orebill', 'product_edgebay', 'product_securecloud', 'product_medicsiq', 'product_revops'],
  cold: ['general'],
};

// ─── Lead Capture Trigger ─────────────────────────────────────
// After this many warm/hot messages → ask for details
export const LEAD_CAPTURE_AFTER_MESSAGES = 2;

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
  // "DSeT" mishearings  ─────────────────────────────────────────────────
  [/\bdsert\b/gi,         'DSeT'],   // most common: "Dsert"
  [/\bd-sert\b/gi,        'DSeT'],
  [/\bd\.sert\b/gi,       'DSeT'],
  [/\bdc\s*et\b/gi,       'DSeT'],
  [/\bd\s*set\b/gi,       'DSeT'],   // "D set"
  [/\bd-set\b/gi,         'DSeT'],
  [/\bd\.set\b/gi,        'DSeT'],
  [/\bdset\b/gi,          'DSeT'],   // lowercase run-together
  [/\bd\s*s\s*e\s*t\b/gi, 'DSeT'],   // spelled out slowly: "D S E T"
  [/\bthe\s+set\b/gi,     'DSeT'],   // "the set" (common article mishear)
  [/\bdissect\b/gi,       'DSeT'],   // phonetic stretch
  [/\bdeceit\b/gi,        'DSeT'],
  [/\bdecent\b/gi,        'DSeT'],   // very common mishearing
  // "DSeTC" variants ───────────────────────────────────────────────────
  [/\bdsertc\b/gi,        'DSeTC'],
  [/\bd-sertc\b/gi,       'DSeTC'],
  [/\bdsetc\b/gi,         'DSeTC'],
  // "Private Limited" — STT always abbreviates when the user says it ───
  [/\bpvt\.?\s*ltd\.?\b/gi,    'Private Limited'],
  [/\bpvt\s+limited\b/gi,      'Private Limited'],
  [/\bprivate\s+ltd\.?\b/gi,   'Private Limited'],
  [/\bprivate\s+lmt\.?\b/gi,   'Private Limited'],
  [/\bprivate\s+lmtd\.?\b/gi,  'Private Limited'],
  [/\bp\.?\s*ltd\.?\b/gi,      'Private Limited'],
];
