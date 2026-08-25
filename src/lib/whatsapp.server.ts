import crypto from 'crypto';

const GRAPH_BASE = 'https://graph.facebook.com';

function apiVersion(): string {
  return process.env.WHATSAPP_API_VERSION ?? 'v22.0';
}

function phoneNumberId(): string {
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!id) throw new Error('WHATSAPP_PHONE_NUMBER_ID is not set');
  return id;
}

function accessToken(): string {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) throw new Error('WHATSAPP_ACCESS_TOKEN is not set');
  return token;
}

async function graphPost(path: string, body: unknown): Promise<any> {
  const res = await fetch(`${GRAPH_BASE}/${apiVersion()}/${path}`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${accessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`WhatsApp API error ${res.status}: ${data?.error?.message ?? 'unknown'}`);
  }
  return data;
}

// ─── Signature Verification ───────────────────────────────────
// Every inbound webhook POST must carry a valid X-Hub-Signature-256, computed
// by Meta over the raw request body using the App Secret. Requests that fail
// this check must be rejected before any further processing.
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | string[] | undefined): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  const header = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
  if (!secret || !header) return false;

  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  const expectedBuf = Buffer.from(expected);
  const headerBuf   = Buffer.from(header);
  if (expectedBuf.length !== headerBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, headerBuf);
}

// ─── Send ──────────────────────────────────────────────────────
export async function sendWhatsAppText(to: string, body: string): Promise<string | undefined> {
  const data = await graphPost(`${phoneNumberId()}/messages`, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body, preview_url: false },
  });
  return data?.messages?.[0]?.id;
}

export async function markMessageRead(messageId: string): Promise<void> {
  await graphPost(`${phoneNumberId()}/messages`, {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  });
}

// ─── Media ─────────────────────────────────────────────────────
// Meta's media URLs are transient and auth-gated — resolve + download once,
// the caller is responsible for persisting the bytes elsewhere (Azure Blob).
export async function downloadWhatsAppMedia(mediaId: string): Promise<{ buffer: Buffer; contentType: string }> {
  const metaRes = await fetch(`${GRAPH_BASE}/${apiVersion()}/${mediaId}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
  });
  const meta = await metaRes.json().catch(() => null);
  if (!metaRes.ok || !meta?.url) {
    throw new Error(`Failed to resolve WhatsApp media URL: ${meta?.error?.message ?? metaRes.status}`);
  }

  const fileRes = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${accessToken()}` },
  });
  if (!fileRes.ok) throw new Error(`Failed to download WhatsApp media: ${fileRes.status}`);

  const arrayBuffer = await fileRes.arrayBuffer();
  return {
    buffer:      Buffer.from(arrayBuffer),
    contentType: meta.mime_type ?? fileRes.headers.get('content-type') ?? 'application/octet-stream',
  };
}
