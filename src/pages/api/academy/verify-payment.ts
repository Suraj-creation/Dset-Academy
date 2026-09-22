import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { verifyCheckoutSignature, fetchRazorpayPayment } from '@/lib/razorpay';
import {
  getRegistrationByOrderId,
  markRegistrationPaid,
  logPaymentEvent,
} from '@/lib/academyRegistrations.server';
import { sendRegistrationEmails, sendWelcomeEmailWithBrochure, sendRegistrationWhatsAppReceipt } from '@/lib/academyEmail.server';

/**
 * Step 2 of enrolment: the browser reports a completed Checkout.
 *
 * The signature is what proves the payment is real — the request body itself is
 * attacker-controlled, so a payment id alone means nothing. Confirmation is
 * written only after HMAC verification succeeds.
 *
 * This is the fast path for UI feedback; the webhook is the authoritative one
 * and will settle the same order if the user closes the tab before this fires.
 * Both converge on markRegistrationPaid(), which is idempotent.
 */

const bodySchema = z.object({
  razorpay_order_id:   z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature:  z.string().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let data: z.infer<typeof bodySchema>;
  try {
    data = bodySchema.parse(req.body);
  } catch {
    return res.status(400).json({ error: 'Invalid payment confirmation' });
  }

  const orderId = data.razorpay_order_id;
  const paymentId = data.razorpay_payment_id;

  const valid = verifyCheckoutSignature({
    orderId,
    paymentId,
    signature: data.razorpay_signature,
  });

  if (!valid) {
    await logPaymentEvent({
      eventType: 'checkout_signature_invalid',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      status: 'rejected',
      payload: { reason: 'signature mismatch' },
    });
    console.warn(`[academy/verify-payment] rejected forged signature for order ${orderId}`);
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  const existing = await getRegistrationByOrderId(orderId);
  if (!existing) {
    // Signature was valid but we have no such order — log it, do not invent a registration.
    await logPaymentEvent({
      eventType: 'checkout_verified_unknown_order',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      status: 'orphan',
    });
    return res.status(404).json({ error: 'Registration not found for this order' });
  }

  // A valid signature only proves the message is authentic. Ask Razorpay whether
  // the money was actually captured, for the right order, at the right amount —
  // a seat is never confirmed on the browser's word alone.
  let payment;
  try {
    payment = await fetchRazorpayPayment(paymentId);
  } catch (err) {
    console.error('[academy/verify-payment] could not confirm with Razorpay:', (err as Error).message);
    // Do not confirm, but do not alarm the payer either — the webhook will settle it.
    return res.status(202).json({
      pending: true,
      registrationId: existing.id,
      message: 'Payment received and being confirmed. You will get an email shortly.',
    });
  }

  if (payment.order_id !== orderId) {
    await logPaymentEvent({
      registrationId: existing.id,
      eventType: 'payment_order_mismatch',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      status: 'rejected',
      payload: { claimedOrder: orderId, actualOrder: payment.order_id },
    });
    return res.status(400).json({ error: 'Payment does not belong to this order' });
  }

  if (payment.status !== 'captured' && payment.status !== 'authorized') {
    await logPaymentEvent({
      registrationId: existing.id,
      eventType: 'payment_not_captured',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      status: payment.status,
      amount: payment.amount,
      payload: payment,
    });
    return res.status(400).json({ error: `Payment is not complete (status: ${payment.status})` });
  }

  const amountMismatch = payment.amount !== existing.totalAmount;
  if (amountMismatch) {
    console.error(
      `[academy/verify-payment] AMOUNT MISMATCH order=${orderId} charged=${payment.amount} expected=${existing.totalAmount}`,
    );
    await logPaymentEvent({
      registrationId: existing.id,
      eventType: 'amount_mismatch',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      amount: payment.amount,
      payload: { expected: existing.totalAmount, charged: payment.amount },
    });
  }

  const { updated, row } = await markRegistrationPaid({
    orderId,
    paymentId,
    signature: data.razorpay_signature,
    detail: {
      method: payment.method ?? null,
      amountCaptured: payment.amount,
      fee: payment.fee ?? null,
      tax: payment.tax ?? null,
      payerEmail: payment.email ?? null,
      payerContact: payment.contact ?? null,
      amountMismatch,
    },
  });

  await logPaymentEvent({
    registrationId: existing.id,
    eventType: 'checkout_verified',
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    status: updated ? 'paid' : 'already_paid',
    amount: existing.totalAmount,
    payload: { source: 'checkout_callback' },
  });

  // Only send on the transition, so a webhook/callback race cannot double-email.
  if (updated && row) {
    await logPaymentEvent({
      registrationId: row.id,
      eventType: 'enrolment_confirmed',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      status: 'paid',
      amount: row.totalAmount,
      payload: { source: 'checkout_callback', method: payment.method ?? null },
    });
    sendRegistrationEmails(row).catch(e =>
      console.error('[academy] confirmation email failed:', e.message));
    sendWelcomeEmailWithBrochure(row).catch(e =>
      console.error('[academy] welcome email failed:', e.message));
    sendRegistrationWhatsAppReceipt(row).catch(e =>
      console.error('[academy] WhatsApp receipt failed:', e.message));
  }

  return res.status(200).json({
    success: true,
    registrationId: existing.id,
    programmeTitle: existing.programmeTitle,
    amount: existing.totalAmount,
    paymentStatus: row?.paymentStatus ?? 'paid',
  });
}
