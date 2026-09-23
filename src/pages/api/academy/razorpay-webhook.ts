import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyWebhookSignature } from '@/lib/razorpay';
import {
  getRegistrationByOrderId,
  markRegistrationPaid,
  markRegistrationFailed,
  logPaymentEvent,
} from '@/lib/academyRegistrations.server';
import { sendRegistrationEmails, sendWelcomeEmailWithBrochure, sendRegistrationWhatsAppReceipt } from '@/lib/academyEmail.server';
import { recordLifeSciencesEnquiry, isLifeSciencesAffiliated } from '@/lib/lifeSciences.server';

/**
 * Authoritative payment confirmation from Razorpay.
 *
 * This is the path that must be trusted: the browser callback can be lost (user
 * closes the tab, network drops, phone dies) but the webhook still arrives, so a
 * captured payment always ends up confirmed in the DB.
 *
 * bodyParser is disabled because the signature is an HMAC over the EXACT bytes
 * Razorpay sent. Re-serialising parsed JSON changes key order and whitespace and
 * the signature would never match.
 */
export const config = { api: { bodyParser: false } };

async function readRawBody(req: NextApiRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const signature = String(req.headers['x-razorpay-signature'] ?? '');
  const eventId = String(req.headers['x-razorpay-event-id'] ?? '') || null;

  const rawBody = await readRawBody(req);

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('[academy/webhook] rejected delivery with bad signature');
    // 400, not 500 — Razorpay should not retry something that will never verify.
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Malformed payload' });
  }

  const eventType: string = event?.event ?? 'unknown';
  const payment = event?.payload?.payment?.entity;
  const orderId: string | undefined = payment?.order_id ?? event?.payload?.order?.entity?.id;
  const paymentId: string | undefined = payment?.id;

  // Resolve the registration first so the audit row is linked to it — a webhook
  // payload that cannot be traced back to an enrolment is useless for
  // reconciliation. An unknown order still gets logged, just with a null link.
  const registration = orderId ? await getRegistrationByOrderId(orderId) : null;

  // Record every verified delivery. The UNIQUE index on razorpay_event_id means
  // a Razorpay redelivery writes nothing the second time.
  await logPaymentEvent({
    registrationId: registration?.id ?? null,
    eventType: `webhook:${eventType}`,
    razorpayEventId: eventId,
    razorpayOrderId: orderId ?? null,
    razorpayPaymentId: paymentId ?? null,
    status: payment?.status ?? null,
    amount: typeof payment?.amount === 'number' ? payment.amount : null,
    payload: event,
  });

  // Always ack a verified webhook. Razorpay retries on non-2xx, and retrying
  // will not fix an event for an order we do not have.
  if (!orderId) return res.status(200).json({ received: true });
  if (!registration) return res.status(200).json({ received: true, note: 'unknown order' });

  try {
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      // Money actually moved — reconcile what was charged against what we quoted.
      if (typeof payment?.amount === 'number' && payment.amount !== registration.totalAmount) {
        console.error(
          `[academy/webhook] AMOUNT MISMATCH order=${orderId} ` +
          `charged=${payment.amount} expected=${registration.totalAmount}`,
        );
        await logPaymentEvent({
          registrationId: registration.id,
          eventType: 'amount_mismatch',
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId ?? null,
          amount: payment.amount,
          payload: { expected: registration.totalAmount, charged: payment.amount },
        });
      }

      const { updated, row } = await markRegistrationPaid({
        orderId,
        paymentId: paymentId ?? '',
        signature: null,
        detail: {
          method: payment?.method ?? null,
          amountCaptured: typeof payment?.amount === 'number' ? payment.amount : null,
          fee: typeof payment?.fee === 'number' ? payment.fee : null,
          tax: typeof payment?.tax === 'number' ? payment.tax : null,
          payerEmail: payment?.email ?? null,
          payerContact: payment?.contact ?? null,
          amountMismatch: typeof payment?.amount === 'number' && payment.amount !== registration.totalAmount,
        },
      });
      if (updated && row) {
        // The one auditable moment a seat becomes confirmed. Logged only on the
        // created -> paid transition, so its count is exactly the number of
        // confirmation emails sent, however many times Razorpay redelivers.
        await logPaymentEvent({
          registrationId: row.id,
          eventType: 'enrolment_confirmed',
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId ?? null,
          status: 'paid',
          amount: row.totalAmount,
          payload: { source: 'webhook', event: eventType },
        });
        sendRegistrationEmails(row).catch(e =>
          console.error('[academy] confirmation email failed:', e.message));
        sendWelcomeEmailWithBrochure(row).catch(e =>
          console.error('[academy] welcome email failed:', e.message));
        sendRegistrationWhatsAppReceipt(row).catch(e =>
          console.error('[academy] WhatsApp receipt failed:', e.message));

        if (isLifeSciencesAffiliated(row.programmeSlug) || isLifeSciencesAffiliated(row.programmeTitle)) {
          recordLifeSciencesEnquiry({
            programId: row.programmeSlug,
            name: row.fullName,
            email: row.email,
            phone: row.mobile,
            organization: row.institution || row.companyName,
            message: `Enrolled & Paid in DSeT Academy (via Webhook): ${row.programmeTitle}`,
            source: 'DSET_ACADEMY',
            externalSystem: 'DSET_ACADEMY',
            externalReference: row.id,
            location: row.location,
            country: row.country,
            role: row.role,
            department: row.department,
            courseName: row.courseName,
            currentYear: row.currentYear,
            subjectSpecialization: row.subjectSpecialization,
            companyName: row.companyName,
            companyType: row.companyType,
            metadata: {
              razorpayOrderId: row.razorpayOrderId,
              razorpayPaymentId: row.razorpayPaymentId,
              totalAmount: row.totalAmount,
              paymentStatus: row.paymentStatus,
              webhookEvent: eventType,
            },
          }).catch(e => console.error('[academy/webhook] Life Sciences sync failed:', e.message));
        }
      }
    } else if (eventType === 'payment.failed') {
      const reason: string =
        payment?.error_description ?? payment?.error_reason ?? 'Payment failed at Razorpay';
      await markRegistrationFailed({ orderId, paymentId: paymentId ?? null, reason });
    }
  } catch (err) {
    console.error('[academy/webhook] processing error:', (err as Error).message);
    // 500 so Razorpay retries — the signature was valid, our side failed.
    return res.status(500).json({ error: 'Processing failed' });
  }

  return res.status(200).json({ received: true });
}
