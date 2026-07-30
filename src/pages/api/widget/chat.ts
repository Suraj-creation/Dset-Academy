import { NextApiRequest, NextApiResponse } from 'next';
import { Intent, LeadScore } from '@/lib/widgetConfig';
import { saveLead, buildLeadSummary, LeadData } from '@/lib/leads.server';
import { sendMail } from '@/lib/email';
import { extractIntent, scoreLeadFromIntents, buildAgentContext, streamAgentReply, type AgentMessage } from '@/lib/aiAgent';
import { syncChatLeadToZoho } from '@/lib/zoho/sync';

// ─── Types ────────────────────────────────────────────────────
type Message = AgentMessage;

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
    replyTo: lead.email,
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
      ${lead.phone   ? `<tr><td style="padding:7px 0;color:#64748b;vertical-align:top;">Phone</td><td style="padding:7px 0;"><a href="tel:${esc(lead.phone)}" style="color:#1d4ed8;font-weight:600;text-decoration:none;">${esc(lead.phone)}</a></td></tr>` : ''}
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

// ─── Main Handler ─────────────────────────────────────────────
export const config = {
  api: { responseLimit: false },
};

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

  const intent   = extractIntent(message);
  const allIntents: Intent[] = [...(leadData?.intent ? [leadData.intent] : []), intent];
  const score    = scoreLeadFromIntents(allIntents);

  let fullContext: string;
  try {
    fullContext = await buildAgentContext(message);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[widget/chat]', msg);
    return res.status(500).json({ error: msg });
  }

  const azureMessages: Message[] = [
    ...history.slice(-10),
    { role: 'user', content: message },
  ];

  // ── Switch to streaming mode: everything below writes chunks, not a single JSON body ──
  res.writeHead(200, {
    'Content-Type':      'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked',
    'Cache-Control':     'no-cache, no-transform',
    'Connection':        'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  try {
    const reply = await streamAgentReply(azureMessages, fullContext, (delta) => {
      res.write(JSON.stringify({ type: 'delta', text: delta }) + '\n');
    });

    if (sessionId) {
      // The lead-capture submission's own message ("My name is X, email is Y...") is a
      // synthetic confirmation, not a real expression of interest -- its freshly-extracted
      // intent (almost always "contact", since it contains the word "email") must never
      // overwrite the actual topical intent already tracked from the real conversation
      // (e.g. "demo" from an earlier "I want to book a demo for EdgeBay" turn), and must
      // never be added to the running topics list either.
      const leadIntent = isContactCapture && leadData?.intent ? leadData.intent : intent;
      const priorTopics = leadData?.topics ?? [];
      const topics = isContactCapture
        ? priorTopics
        : Array.from(new Set([...priorTopics, intent]));

      const lead: LeadData = {
        id:        sessionId,
        name:      leadData?.name,
        email:     leadData?.email,
        phone:     leadData?.phone,
        company:   leadData?.company,
        intent:    leadIntent,
        topics,
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

        // Fire-and-forget — a Zoho outage or missing credentials must never affect the
        // reply the visitor is streaming right now. syncChatLeadToZoho() is also a no-op
        // entirely while ZOHO_SYNC_ENABLED=false, and separately skips sync if lead.email
        // isn't captured yet, even if this gate is ever loosened.
        syncChatLeadToZoho(lead).catch(() => {});
      }
    }

    res.write(JSON.stringify({ type: 'done', intent, score, sessionId }) + '\n');
    res.end();

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[widget/chat]', msg);
    res.write(JSON.stringify({ type: 'error', message: msg }) + '\n');
    res.end();
  }
}
