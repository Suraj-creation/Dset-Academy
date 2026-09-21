import crypto from 'crypto';

/**
 * Minimal Razorpay client. Order creation is one authenticated POST and both
 * signature checks are plain HMAC-SHA256, so this deliberately uses fetch +
 * node:crypto instead of pulling in the `razorpay` SDK for two calls.
 *
 * SERVER ONLY — this module reads RAZORPAY_KEY_SECRET. Never import it into a
 * component or anything that ships to the browser.
 */

const API_BASE = 'https://api.razorpay.com/v1';

export function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID ?? '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? '';
  return { keyId, keySecret, configured: Boolean(keyId && keySecret) };
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
}

/** Create a Razorpay order. `amount` is in paise and comes from the server-side catalogue. */
export async function createRazorpayOrder(params: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const { keyId, keySecret, configured } = getRazorpayConfig();
  if (!configured) {
    throw new Error('Razorpay is not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
  }

  if (!Number.isInteger(params.amount) || params.amount <= 0) {
    throw new Error(`Refusing to create an order for a non-integer/non-positive amount: ${params.amount}`);
  }

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes ?? {},
      payment_capture: 1,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.description ?? `Razorpay order creation failed (HTTP ${res.status})`;
    throw new Error(msg);
  }
  return body as RazorpayOrder;
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  /** created | authorized | captured | refunded | failed */
  status: string;
  method?: string;
  fee?: number;
  tax?: number;
  email?: string;
  contact?: string;
  error_description?: string;
}

/**
 * Fetch a payment straight from Razorpay.
 *
 * The signature check proves a callback is authentic; it does NOT prove the
 * payment succeeded. Only Razorpay can say whether money was actually captured
 * and how much, so an enrolment is confirmed against this, not against the
 * browser's word.
 */
export async function fetchRazorpayPayment(paymentId: string): Promise<RazorpayPayment> {
  const { keyId, keySecret, configured } = getRazorpayConfig();
  if (!configured) throw new Error('Razorpay is not configured');

  const res = await fetch(`${API_BASE}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64') },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error?.description ?? `Could not fetch payment (HTTP ${res.status})`);
  }
  return body as RazorpayPayment;
}

/** Constant-time compare that tolerates unequal lengths (timingSafeEqual throws on those). */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify the signature Razorpay Checkout hands back to the browser.
 * Spec: HMAC_SHA256(order_id + "|" + payment_id, KEY_SECRET).
 */
export function verifyCheckoutSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret, configured } = getRazorpayConfig();
  if (!configured) return false;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex');
  return safeEqual(expected, params.signature);
}

/**
 * Verify a webhook delivery.
 * Spec: HMAC_SHA256(RAW request body, RAZORPAY_WEBHOOK_SECRET) === X-Razorpay-Signature.
 * The body must be the exact bytes received — re-serialising parsed JSON changes
 * key order/whitespace and the signature will never match.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeEqual(expected, signature);
}
