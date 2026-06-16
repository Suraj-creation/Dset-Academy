import { NextApiRequest, NextApiResponse } from 'next';
import { SYSTEM_PROMPT, INTENT_KEYWORDS, LEAD_SCORE_RULES, Intent, LeadScore } from '@/lib/widgetConfig';
import { searchKnowledge } from '@/lib/rag';
import { getActiveJobs } from '@/lib/jobs.server';
import { getGalleryEvents } from '@/lib/events.server';
import { saveLead, LeadData } from '@/lib/leads.server';
import { sendMail } from '@/lib/email';

// ─── Types ────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ─── Intent Extractor ─────────────────────────────────────────
function extractIntent(text: string): Intent {
  const lower = text.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (intent === 'general') continue;
    if (keywords.some((kw) => lower.includes(kw))) return intent as Intent;
  }
  return 'general';
}

// ─── Lead Scorer ──────────────────────────────────────────────
function scoreLeadFromIntents(intents: Intent[]): LeadScore {
  if (intents.some((i) => LEAD_SCORE_RULES.hot.includes(i)))  return 'hot';
  if (intents.some((i) => LEAD_SCORE_RULES.warm.includes(i))) return 'warm';
  return 'cold';
}

// ─── Helpers ──────────────────────────────────────────────────
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const INTENT_LABELS: Record<string, string> = {
  pricing:  'Pricing',
  demo:     'Product Demo',
  support:  'Technical Support',
  careers:  'Career Opportunities',
  contact:  'Getting in Touch',
  general:  'Company Information',
};

function intentLabel(intent: string): string {
  return INTENT_LABELS[intent] ?? (intent.charAt(0).toUpperCase() + intent.slice(1));
}

function buildLeadSummary(lead: LeadData): string {
  const intentTopics: Record<string, string> = {
    pricing:  'pricing and commercial terms',
    demo:     'scheduling a product demo',
    support:  'technical support',
    careers:  'career opportunities at DSeT',
    contact:  'connecting with the DSeT team',
    general:  "DSeT's products and services",
  };
  const topic = intentTopics[lead.intent] ?? lead.intent;
  const name  = lead.name ?? 'An anonymous visitor';
  const n     = lead.messages;
  const withContact = lead.email ? ' and shared their contact details' : '';
  return `${name} reached out via the website chat widget showing interest in ${topic}. They exchanged ${n} message${n !== 1 ? 's' : ''} with the DSeT Bot${withContact}.`;
}

function buildRecommendedAction(intent: string): string {
  const actions: Record<string, string> = {
    pricing:  'Share detailed pricing information and schedule a commercial discussion or proposal call.',
    demo:     'Schedule a personalized product demo at the earliest convenience.',
    support:  'Reach out to address the support query and connect with the technical team.',
    careers:  'Forward to the HR / talent acquisition team for a follow-up.',
    contact:  'Follow up with a personalized introduction call within 24 hours.',
    general:  'Send relevant product information and offer to schedule a discovery call.',
  };
  return actions[intent] ?? 'Follow up with the lead and offer a discovery call.';
}

// ─── Lead Email Notification ──────────────────────────────────
async function sendLeadEmail(lead: LeadData, transcript: Message[]): Promise<void> {
  const score      = lead.score;
  const scoreBadge = score === 'hot' ? '🔥 HOT' : score === 'warm' ? '🌡 WARM' : '❄ COLD';
  const scoreColor = score === 'hot' ? '#dc2626' : score === 'warm' ? '#d97706' : '#64748b';
  const scoreBg    = score === 'hot' ? '#fef2f2' : score === 'warm' ? '#fffbeb' : '#f8fafc';

  const to      = process.env.CONTACT_EMAIL ?? 'contact@dsetconsulting.com';
  const label   = intentLabel(lead.intent);
  const dateStr = new Date(lead.createdAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) + ' IST';

  const summary = buildLeadSummary(lead);
  const action  = buildRecommendedAction(lead.intent);

  const chatRows = transcript
    .filter(m => m.role !== 'system')
    .map(m => {
      const isUser = m.role === 'user';
      const sender = isUser ? esc(lead.name ?? 'Visitor') : 'DSeT Bot';
      return `
        <div style="margin-bottom:18px;">
          <div style="font-size:10px;font-weight:800;letter-spacing:0.12em;color:${isUser ? '#475569' : '#166534'};text-transform:uppercase;margin-bottom:6px;">${sender}</div>
          <div style="padding:12px 16px;background:${isUser ? '#f8fafc' : '#f0fdf4'};border:1px solid ${isUser ? '#e2e8f0' : '#bbf7d0'};border-left:4px solid ${isUser ? '#94a3b8' : '#22c55e'};border-radius:0 8px 8px 0;font-size:14px;color:#1e293b;line-height:1.65;">${esc(m.content)}</div>
        </div>`;
    }).join('');

  await sendMail({
    to,
    subject: `New Lead Received - ${lead.name ?? 'Anonymous Visitor'} Interested in ${label}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;-webkit-text-size-adjust:100%;">
<div style="max-width:640px;width:100%;margin:0 auto;padding:20px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">

  <!-- ── Header ───────────────────────────────────────── -->
  <div style="background:linear-gradient(135deg,#001f3f 0%,#0d3b6e 100%);padding:28px 32px;border-radius:12px 12px 0 0;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td><span style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">DSeT Consulting</span></td>
        <td style="text-align:right;"><span style="background:${scoreColor};color:#ffffff;font-size:11px;font-weight:800;padding:5px 14px;border-radius:20px;letter-spacing:0.08em;">${scoreBadge}</span></td>
      </tr>
    </table>
    <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:18px 0 8px;">New Chat Lead</p>
    <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 6px;line-height:1.2;">${esc(lead.name ?? 'Anonymous Visitor')}</h1>
    <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0;">${dateStr}</p>
  </div>

  <!-- ── Lead Information ──────────────────────────────── -->
  <div style="background:#ffffff;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;padding:22px 28px;">
    <p style="font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 14px;">Lead Information</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr>
        <td style="padding:7px 0;color:#64748b;width:130px;vertical-align:top;">Lead Source</td>
        <td style="padding:7px 0;color:#1e293b;font-weight:600;">Website Chat Widget</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#64748b;vertical-align:top;">Date &amp; Time</td>
        <td style="padding:7px 0;color:#1e293b;">${dateStr}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#64748b;vertical-align:top;">Intent</td>
        <td style="padding:7px 0;"><span style="background:#eff6ff;color:#1d4ed8;font-weight:700;font-size:12px;padding:3px 10px;border-radius:20px;">${esc(label)}</span></td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#64748b;vertical-align:top;">Lead Score</td>
        <td style="padding:7px 0;"><span style="background:${scoreBg};color:${scoreColor};font-weight:800;font-size:12px;padding:3px 10px;border-radius:20px;">${scoreBadge}</span></td>
      </tr>
      ${lead.name    ? `<tr><td style="padding:7px 0;color:#64748b;vertical-align:top;">Name</td><td style="padding:7px 0;color:#1e293b;font-weight:600;">${esc(lead.name)}</td></tr>` : ''}
      ${lead.email   ? `<tr><td style="padding:7px 0;color:#64748b;vertical-align:top;">Email</td><td style="padding:7px 0;"><a href="mailto:${esc(lead.email)}" style="color:#1d4ed8;font-weight:600;text-decoration:none;">${esc(lead.email)}</a></td></tr>` : ''}
      ${lead.company ? `<tr><td style="padding:7px 0;color:#64748b;vertical-align:top;">Company</td><td style="padding:7px 0;color:#1e293b;">${esc(lead.company)}</td></tr>` : ''}
      <tr>
        <td style="padding:7px 0;color:#64748b;vertical-align:top;">Messages</td>
        <td style="padding:7px 0;color:#1e293b;">${lead.messages} message${lead.messages !== 1 ? 's' : ''} exchanged</td>
      </tr>
    </table>
  </div>

  <!-- ── Lead Summary ──────────────────────────────────── -->
  <div style="background:#ffffff;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-top:1px solid #f1f5f9;padding:20px 28px;">
    <p style="font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">Lead Summary</p>
    <p style="font-size:14px;color:#334155;line-height:1.7;margin:0;">${esc(summary)}</p>
  </div>

  <!-- ── Recommended Action ────────────────────────────── -->
  <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-right:1px solid #e2e8f0;border-top:none;padding:18px 28px;">
    <p style="font-size:10px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px;">&#x1F4A1; Recommended Action</p>
    <p style="font-size:14px;color:#78350f;line-height:1.65;margin:0;font-weight:500;">${esc(action)}</p>
  </div>

  <!-- ── Chat Transcript ───────────────────────────────── -->
  ${chatRows ? `
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:1px solid #f1f5f9;padding:22px 28px;border-radius:0 0 12px 12px;">
    <p style="font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 18px;">Chat Transcript</p>
    ${chatRows}
  </div>` : `<div style="height:12px;background:#ffffff;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;border-radius:0 0 12px 12px;"></div>`}

  <!-- ── Footer ────────────────────────────────────────── -->
  <div style="text-align:center;padding:18px 0 4px;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">DSeT Consulting &nbsp;·&nbsp; <a href="#" style="color:#94a3b8;text-decoration:none;">View all leads → /admin/leads</a></p>
  </div>

</div>
</body>
</html>`,
  });
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
  • KOPL Intelligence (Manufacturing): Real-time IT-OT bridge with voice AI — eliminated manual data reconciliation, AI flags production bottlenecks instantly, floor managers use conversational interface.
  • OreBill AI (Mining): 60% faster billing reconciliation, ₹1.2Cr annual leakage recovered, weighbridge discrepancy from 12% to 1.5%.
  • SecureCloud (BFSI): 70% faster audit prep, 84% fewer critical misconfigurations, PCI-DSS Level 1 readiness in one quarter.
  • iPaS-RevOps (B2B SaaS): AR overdue from 23% to 8%, 340+ hours/month recovered, forecast accuracy from ±31% to ±9%.
  • Pharma Intelligence (MedicsIQ): RAG-based pharma market intelligence unifying audit data and insider data.
  • Digital Operations for Sports/Universities: AI platform for athlete analytics and institutional workflows (upcoming).
  • Learning Management System: AI-driven personalised learning paths and future-skill recommendations (upcoming).`);
  }

  return parts.join('\n\n');
}

// ─── Azure OpenAI Realtime (WebSocket) ───────────────────────
async function callAzureRealtime(messages: Message[], fullContext: string): Promise<string> {
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
    fullContext ? `\nRELEVANT COMPANY CONTEXT:\n${fullContext}` : '',
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
    }, 30000);

    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities:  ['text'],
          instructions,
          temperature: 0.7,
          max_response_output_tokens: 500,
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

// ─── Main Handler ─────────────────────────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    message, history = [], sessionId, leadData, isContactCapture = false,
  }: {
    message: string; history: Message[]; sessionId: string; leadData?: Partial<LeadData>; isContactCapture?: boolean;
  } = req.body;

  if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

  if (!process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_API_KEY) {
    return res.status(500).json({ error: 'AI provider not configured' });
  }

  try {
    const intent   = extractIntent(message);
    const allIntents: Intent[] = [...(leadData?.intent ? [leadData.intent] : []), intent];
    const score    = scoreLeadFromIntents(allIntents);

    const ragContext     = searchKnowledge(message);
    const dynamicContext = await fetchDynamicContext(message);
    const fullContext    = [ragContext, dynamicContext].filter(Boolean).join('\n\n');

    const azureMessages: Message[] = [
      ...history.slice(-10),
      { role: 'user', content: message },
    ];

    const reply = await callAzureRealtime(azureMessages, fullContext);

    if (sessionId) {
      const lead: LeadData = {
        id:        sessionId,
        name:      leadData?.name,
        email:     leadData?.email,
        company:   leadData?.company,
        intent,
        score,
        messages:  (leadData?.messages ?? 0) + 1,
        createdAt: leadData?.createdAt ?? new Date().toISOString(),
        source:    'chat-widget',
      };
      saveLead(lead).catch(() => {});

      const fullTranscript: Message[] = [
        ...history.slice(-20),
        { role: 'user', content: message },
        { role: 'assistant', content: reply },
      ];

      if (score !== 'cold' || isContactCapture) {
        sendLeadEmail(lead, fullTranscript).catch(() => {});
      }
    }

    return res.status(200).json({ reply, intent, score, sessionId });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[widget/chat]', msg);
    return res.status(500).json({ error: msg });
  }
}
