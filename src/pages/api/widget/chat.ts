import { NextApiRequest, NextApiResponse } from 'next';
import { SYSTEM_PROMPT, INTENT_KEYWORDS, LEAD_SCORE_RULES, Intent, LeadScore } from '@/lib/widgetConfig';
import { searchKnowledge } from '@/lib/rag';
import { getActiveJobs } from '@/lib/jobs.server';
import { getGalleryEvents } from '@/lib/events.server';
import { saveLead, LeadData } from '@/lib/leads.server';
import nodemailer from 'nodemailer';

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

// ─── Lead Email Notification ──────────────────────────────────
async function sendLeadEmail(lead: LeadData): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const scoreBadge = lead.score === 'hot' ? '🔥 HOT' : lead.score === 'warm' ? '🟡 WARM' : '🔵 COLD';
  const to = process.env.CONTACT_EMAIL ?? process.env.EMAIL_USER;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `[DSeT Lead] ${scoreBadge} — ${lead.name ?? 'Anonymous'} via Chat Widget`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#001f3f,#0a3060);padding:24px;border-radius:10px;margin-bottom:16px;">
          <p style="color:rgba(255,255,255,0.55);font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 6px;">DSeT — New Chat Lead</p>
          <h1 style="color:#ffffff;margin:0 0 4px;font-size:20px;">${lead.name ?? 'Anonymous Visitor'}</h1>
          <p style="color:rgba(255,255,255,0.6);margin:0;font-size:13px;">${new Date(lead.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} IST</p>
        </div>
        <div style="background:#ffffff;border-radius:10px;padding:20px;margin-bottom:12px;border:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:5px 0;color:#6b7a90;width:110px;">Lead Score</td><td style="padding:5px 0;font-weight:700;font-size:15px;">${scoreBadge}</td></tr>
            <tr><td style="padding:5px 0;color:#6b7a90;">Intent</td><td style="padding:5px 0;color:#001f3f;font-weight:600;text-transform:capitalize;">${lead.intent}</td></tr>
            ${lead.email ? `<tr><td style="padding:5px 0;color:#6b7a90;">Email</td><td style="padding:5px 0;"><a href="mailto:${lead.email}" style="color:#1e90ff;">${lead.email}</a></td></tr>` : ''}
            ${lead.company ? `<tr><td style="padding:5px 0;color:#6b7a90;">Company</td><td style="padding:5px 0;color:#001f3f;">${lead.company}</td></tr>` : ''}
            <tr><td style="padding:5px 0;color:#6b7a90;">Messages</td><td style="padding:5px 0;color:#001f3f;">${lead.messages} message(s) exchanged</td></tr>
          </table>
        </div>
        <p style="color:#94a3b8;font-size:11px;margin-top:12px;text-align:center;">View all leads at /admin/leads</p>
      </div>
    `,
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
    message, history = [], sessionId, leadData,
  }: {
    message: string; history: Message[]; sessionId: string; leadData?: Partial<LeadData>;
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

      if (score !== 'cold') {
        sendLeadEmail(lead).catch(() => {});
      }
    }

    return res.status(200).json({ reply, intent, score, sessionId });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[widget/chat]', msg);
    return res.status(500).json({ error: msg });
  }
}
