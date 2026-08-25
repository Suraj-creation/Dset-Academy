import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { verifyWebhookSignature, sendWhatsAppText, markMessageRead, downloadWhatsAppMedia } from '@/lib/whatsapp.server';
import {
  getOrCreateConversation, saveMessage, setConversationStatus, getRecentHistory, updateMessageStatus,
} from '@/lib/whatsappConversations.server';
import { generateAgentReply, extractIntent } from '@/lib/aiAgent';
import { hasExplicitLeadIntent } from '@/lib/leadIntent';
import { uploadBlob } from '@/lib/azure-blob';
import { sendMail } from '@/lib/email';

// Raw body access is required to verify Meta's X-Hub-Signature-256 header.
export const config = {
  api: { bodyParser: false },
};

// ─── Types (only the subset of Meta's webhook payload we use) ──
interface InboundMessage {
  from:      string;
  id:        string;
  timestamp: string;
  type:      string;
  text?:     { body: string };
  image?:    { id: string; mime_type: string; caption?: string };
  audio?:    { id: string; mime_type: string };
  document?: { id: string; mime_type: string; filename?: string };
}

interface WebhookValue {
  metadata?:  { display_phone_number: string; phone_number_id: string };
  contacts?:  Array<{ profile: { name?: string }; wa_id: string }>;
  messages?:  InboundMessage[];
  statuses?:  Array<{ id: string; status: string; recipient_id: string }>;

  // ─── Coexistence-specific fields (only arrive once Embedded Signup /
  // Coexistence onboarding is live and these fields are subscribed at
  // App Dashboard → WhatsApp → Configuration). Shapes below are best-effort
  // from Meta's documentation — verify against real payloads once test-number
  // Coexistence onboarding is running, and refine as needed. ──
  message_echoes?: InboundMessage[];
  state_sync?: Array<{
    wa_id?:   string;
    contact?: { wa_id?: string; full_name?: string; first_name?: string };
    type?:    string;
  }>;
  history?: Array<{
    metadata?: { phase?: string; chunk_order?: number; progress?: number };
    threads?:  Array<{ id?: string; messages?: InboundMessage[] }>;
  }>;
}

interface WebhookPayload {
  object:  string;
  entry?:  Array<{ id: string; changes: Array<{ value: WebhookValue; field: string }> }>;
}

// ─── Handover Detection ─────────────────────────────────────────
const HANDOVER_MARKER = '[[HANDOVER]]';

// Told to the AI only for this channel — the website widget's prompt is untouched.
const WHATSAPP_HANDOVER_INSTRUCTION = `
WHATSAPP CHANNEL RULE: If, and only if, the APPROVED PUBLIC INFORMATION above does not answer the customer's question, or the customer explicitly asks to speak with a person/agent/representative, reply with EXACTLY this token and nothing else: ${HANDOVER_MARKER}
`.trim();

// Deterministic fallback — checked before the AI is even called, bilingual to match the widget's language-mirroring behavior.
const HANDOVER_KEYWORDS = [
  'human', 'agent', 'representative', 'real person', 'talk to someone',
  'talk to a person', 'speak to someone', 'speak to a person', 'customer care',
  'baat karni hai', 'insaan se baat', 'kisi se baat karni',
];

function isExplicitHandoverRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return HANDOVER_KEYWORDS.some((kw) => lower.includes(kw));
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function readRawBody(req: NextApiRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

// ─── Inbound Message Helpers ────────────────────────────────────
async function extractMessageContent(msg: InboundMessage): Promise<{ content: string; messageType: string; mediaUrl?: string }> {
  if (msg.type === 'text') {
    return { content: msg.text?.body ?? '', messageType: 'text' };
  }

  const media = msg.image ?? msg.audio ?? msg.document;
  if (!media?.id) {
    return { content: '', messageType: msg.type };
  }

  try {
    const { buffer, contentType } = await downloadWhatsAppMedia(media.id);
    const ext = contentType.split('/')[1]?.split(';')[0] ?? 'bin';
    const mediaUrl = await uploadBlob(buffer, `whatsapp/${media.id}.${ext}`, contentType);
    return {
      content:     msg.image?.caption ?? msg.document?.filename ?? '',
      messageType: msg.type,
      mediaUrl,
    };
  } catch (err) {
    console.error('[whatsapp/webhook] media download failed', err instanceof Error ? err.message : err);
    return { content: '', messageType: msg.type };
  }
}

async function replyAndSave(waId: string, text: string): Promise<void> {
  try {
    const wamid = await sendWhatsAppText(waId, text);
    await saveMessage({
      id:             wamid ?? randomUUID(),
      conversationId: waId,
      direction:      'outbound',
      messageType:    'text',
      content:        text,
      status:         'sent',
      aiHandled:      true,
    });
  } catch (err) {
    console.error('[whatsapp/webhook] send failed', err instanceof Error ? err.message : err);
  }
}

async function notifyTeamOfHandover(waId: string, customerName: string | undefined, lastMessage?: string): Promise<void> {
  const to = process.env.WHATSAPP_HANDOVER_NOTIFY_EMAIL || process.env.CONTACT_EMAIL || 'contact@dsetconsulting.com';
  await sendMail({
    to,
    subject: `WhatsApp: Human handover requested${customerName ? ` — ${customerName}` : ''}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1e293b;">
        <h2 style="color:#001f3f;margin:0 0 12px;">WhatsApp Handover Requested</h2>
        <p style="margin:4px 0;"><strong>Customer:</strong> ${esc(customerName ?? 'Unknown')} (+${esc(waId)})</p>
        ${lastMessage ? `<p style="margin:4px 0;"><strong>Last message:</strong> ${esc(lastMessage)}</p>` : ''}
        <p style="margin:16px 0 0;">Please continue this conversation directly in the WhatsApp Business App.</p>
      </div>
    `,
  });
}

async function triggerHandover(waId: string, customerName: string | undefined, lastMessage?: string, replyText?: string): Promise<void> {
  await setConversationStatus(waId, 'human', new Date().toISOString());
  await replyAndSave(waId, replyText ?? 'Connecting you with our DSeT team — someone will be with you shortly! 🙌');
  notifyTeamOfHandover(waId, customerName, lastMessage).catch((err) => {
    console.error('[whatsapp/webhook] handover email failed', err instanceof Error ? err.message : err);
  });
}

async function handleInboundMessage(msg: InboundMessage, contactName: string | undefined): Promise<void> {
  const waId = msg.from;
  const conversation = await getOrCreateConversation(waId, contactName);
  const resolvedName = conversation.customerName ?? contactName;

  const { content, messageType, mediaUrl } = await extractMessageContent(msg);

  await saveMessage({
    id:             msg.id,
    conversationId: waId,
    direction:      'inbound',
    messageType,
    content,
    mediaUrl,
    status:         'received',
  });

  markMessageRead(msg.id).catch(() => {});

  // Human already owns this thread (visible live in the WhatsApp Business App via Coexistence) — log only.
  if (conversation.status === 'human' || conversation.status === 'closed') return;

  if (!content.trim()) {
    await replyAndSave(waId, "Thanks for sending that — could you also describe what you need in a text message so I can help?");
    return;
  }

  if (isExplicitHandoverRequest(content)) {
    await triggerHandover(waId, resolvedName, content);
    return;
  }

  const history = await getRecentHistory(waId, 10);

  // Customer explicitly asked to book a demo / get contacted / discuss pricing.
  // Unlike the website widget, WhatsApp has no in-chat form to fall back on —
  // and the customer is already talking to us directly, so pointing them at a
  // separate email/phone number is worse than just connecting them here.
  const lastAssistantMessage = [...history].reverse().find((m) => m.role === 'assistant')?.content;
  if (hasExplicitLeadIntent(extractIntent(content), content, lastAssistantMessage)) {
    await triggerHandover(
      waId, resolvedName, content,
      "Great — let's get that sorted for you! Connecting you with our DSeT team now, they'll reach out shortly to help. 🙌",
    );
    return;
  }

  let result;
  try {
    result = await generateAgentReply(content, history, undefined, undefined, WHATSAPP_HANDOVER_INSTRUCTION);
  } catch (err) {
    console.error('[whatsapp/webhook] AI generation failed', err instanceof Error ? err.message : err);
    await replyAndSave(waId, "Sorry, I'm having trouble responding right now — connecting you with our team.");
    await triggerHandover(waId, resolvedName);
    return;
  }

  if (result.reply.includes(HANDOVER_MARKER)) {
    await triggerHandover(waId, resolvedName, content);
  } else {
    await replyAndSave(waId, result.reply.trim());
  }
}

// ─── Coexistence Sync Handlers ──────────────────────────────────
// A human agent replying from the WhatsApp Business App produces a
// "message echo" here — log it and pause the bot for that conversation,
// since a human is actively handling it live in the app right now.
async function handleMessageEchoes(value: WebhookValue): Promise<void> {
  const echoes = value.message_echoes ?? [];
  if (echoes.length === 0) {
    console.log('[whatsapp/webhook] smb_message_echoes: unexpected shape', JSON.stringify(value).slice(0, 500));
    return;
  }

  for (const msg of echoes) {
    const waId = msg.from;
    try {
      const { content, messageType, mediaUrl } = await extractMessageContent(msg);
      await getOrCreateConversation(waId);
      await saveMessage({
        id:             msg.id || randomUUID(),
        conversationId: waId,
        direction:      'outbound',
        messageType,
        content,
        mediaUrl,
        status:         'sent',
        aiHandled:      false, // sent by a human via the WhatsApp Business App, not by us
      });
      await setConversationStatus(waId, 'human', new Date().toISOString());
    } catch (err) {
      console.error('[whatsapp/webhook] failed to save message echo', err instanceof Error ? err.message : err);
    }
  }
}

// Contact info synced from the WhatsApp Business App's address book —
// just keeps our conversation records' customer names up to date.
async function handleAppStateSync(value: WebhookValue): Promise<void> {
  const updates = value.state_sync ?? [];
  if (updates.length === 0) {
    console.log('[whatsapp/webhook] smb_app_state_sync: unexpected shape', JSON.stringify(value).slice(0, 500));
    return;
  }

  for (const item of updates) {
    const waId = item.wa_id ?? item.contact?.wa_id;
    const name = item.contact?.full_name ?? item.contact?.first_name;
    if (!waId) continue;
    try {
      await getOrCreateConversation(waId, name);
    } catch (err) {
      console.error('[whatsapp/webhook] failed to sync contact', err instanceof Error ? err.message : err);
    }
  }
}

// One-time bulk sync of up to 180 days of prior chat history on onboarding.
// Direction is defaulted to 'inbound' here — refine once real payloads
// during test-number Coexistence onboarding confirm how to tell the two
// directions apart (this is exactly the kind of thing to check in testing).
async function handleHistorySync(value: WebhookValue): Promise<void> {
  const batches = value.history ?? [];
  if (batches.length === 0) {
    console.log('[whatsapp/webhook] history: unexpected shape', JSON.stringify(value).slice(0, 500));
    return;
  }

  for (const batch of batches) {
    for (const thread of batch.threads ?? []) {
      for (const msg of thread.messages ?? []) {
        try {
          const waId = msg.from;
          const { content, messageType, mediaUrl } = await extractMessageContent(msg);
          await getOrCreateConversation(waId);
          await saveMessage({
            id:             msg.id || randomUUID(),
            conversationId: waId,
            direction:      'inbound', // TODO verify against real history payloads
            messageType,
            content,
            mediaUrl,
            status:         'received',
            aiHandled:      false,
          });
        } catch (err) {
          console.error('[whatsapp/webhook] failed to save history message', err instanceof Error ? err.message : err);
        }
      }
    }
  }
}

async function processWebhookPayload(payload: WebhookPayload): Promise<void> {
  if (payload.object !== 'whatsapp_business_account') return;

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;

      // ─── Coexistence-specific fields — only present once Embedded Signup
      // subscribes them. Handled separately from the standard path below. ──
      if (change.field === 'smb_message_echoes') {
        await handleMessageEchoes(value).catch((err) => {
          console.error('[whatsapp/webhook] smb_message_echoes failed', err instanceof Error ? err.message : err);
        });
        continue;
      }
      if (change.field === 'smb_app_state_sync') {
        await handleAppStateSync(value).catch((err) => {
          console.error('[whatsapp/webhook] smb_app_state_sync failed', err instanceof Error ? err.message : err);
        });
        continue;
      }
      if (change.field === 'history') {
        await handleHistorySync(value).catch((err) => {
          console.error('[whatsapp/webhook] history sync failed', err instanceof Error ? err.message : err);
        });
        continue;
      }

      // ─── Standard messages/statuses — unchanged, already proven working ──
      for (const status of value.statuses ?? []) {
        updateMessageStatus(status.id, status.status).catch(() => {});
      }

      for (const msg of value.messages ?? []) {
        const name = value.contacts?.find((c) => c.wa_id === msg.from)?.profile?.name;
        await handleInboundMessage(msg, name).catch((err) => {
          console.error('[whatsapp/webhook] handleInboundMessage failed', err instanceof Error ? err.message : err);
        });
      }
    }
  }
}

// ─── Main Handler ─────────────────────────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Meta's one-time webhook verification handshake.
  if (req.method === 'GET') {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && typeof challenge === 'string' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const rawBody = await readRawBody(req);

  if (!verifyWebhookSignature(rawBody, req.headers['x-hub-signature-256'])) {
    console.error('[whatsapp/webhook] signature verification failed');
    return res.status(401).end();
  }

  // Ack immediately — Meta retries aggressively on slow/non-200 responses.
  // This server runs persistently (Azure App Service via `next start`), so
  // work started after res.end() below completes normally.
  res.status(200).end();

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error('[whatsapp/webhook] invalid JSON payload');
    return;
  }

  try {
    await processWebhookPayload(payload);
  } catch (err) {
    console.error('[whatsapp/webhook]', err instanceof Error ? err.message : err);
  }
}
