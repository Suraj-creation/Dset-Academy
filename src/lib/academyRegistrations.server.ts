import { and, desc, eq, ne } from 'drizzle-orm';
import { db } from './db';
import { academyRegistrations, academyPaymentEvents } from './schema';

export type PaymentStatus = 'created' | 'paid' | 'failed' | 'refunded';
export type EnrollmentStatus = 'pending' | 'confirmed' | 'cancelled';

export type RegistrationRow = typeof academyRegistrations.$inferSelect;

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Id is generated up front so it can be used as the Razorpay order receipt. */
export function newRegistrationId(): string {
  return newId('areg');
}

export async function createRegistration(data: {
  id: string;
  programmeSlug: string;
  programmeTitle: string;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  institution?: string | null;
  consent: boolean;
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  currency: string;
  razorpayOrderId: string;
}): Promise<RegistrationRow> {
  const [row] = await db.insert(academyRegistrations).values({
    ...data,
    institution: data.institution ?? null,
    paymentStatus: 'created',
    enrollmentStatus: 'pending',
  }).returning();
  return row;
}

export async function getRegistrationByOrderId(orderId: string): Promise<RegistrationRow | null> {
  const [row] = await db.select().from(academyRegistrations)
    .where(eq(academyRegistrations.razorpayOrderId, orderId));
  return row ?? null;
}

export async function getRegistrationById(id: string): Promise<RegistrationRow | null> {
  const [row] = await db.select().from(academyRegistrations)
    .where(eq(academyRegistrations.id, id));
  return row ?? null;
}

/**
 * Confirm a paid registration. Idempotent by construction: the WHERE clause
 * excludes rows already marked paid, so a Checkout callback and a webhook for
 * the same payment (or a webhook redelivery) settle the row exactly once and
 * the second caller gets `false`.
 */
export async function markRegistrationPaid(params: {
  orderId: string;
  paymentId: string;
  signature?: string | null;
  /** Detail straight from Razorpay — what was actually captured, and at what cost. */
  detail?: {
    method?: string | null;
    amountCaptured?: number | null;
    fee?: number | null;
    tax?: number | null;
    payerEmail?: string | null;
    payerContact?: string | null;
    amountMismatch?: boolean;
  };
}): Promise<{ updated: boolean; row: RegistrationRow | null }> {
  const d = params.detail ?? {};
  const [row] = await db.update(academyRegistrations)
    .set({
      razorpayPaymentId: params.paymentId,
      razorpaySignature: params.signature ?? null,
      paymentStatus: 'paid',
      enrollmentStatus: 'confirmed',
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      failureReason: null,
      paymentMethod: d.method ?? null,
      amountCaptured: d.amountCaptured ?? null,
      razorpayFee: d.fee ?? null,
      razorpayTax: d.tax ?? null,
      payerEmail: d.payerEmail ?? null,
      payerContact: d.payerContact ?? null,
      amountMismatch: d.amountMismatch ?? false,
    })
    .where(and(
      eq(academyRegistrations.razorpayOrderId, params.orderId),
      ne(academyRegistrations.paymentStatus, 'paid'),
    ))
    .returning();

  if (row) return { updated: true, row };
  // Already paid (or unknown order) — return the current row so callers can
  // respond with the real state instead of treating a duplicate as an error.
  return { updated: false, row: await getRegistrationByOrderId(params.orderId) };
}

/** A failed payment never cancels the enrolment — the applicant can retry the same order. */
export async function markRegistrationFailed(params: {
  orderId: string;
  paymentId?: string | null;
  reason: string;
}): Promise<RegistrationRow | null> {
  const [row] = await db.update(academyRegistrations)
    .set({
      paymentStatus: 'failed',
      failureReason: params.reason,
      razorpayPaymentId: params.paymentId ?? null,
      updatedAt: new Date().toISOString(),
    })
    .where(and(
      eq(academyRegistrations.razorpayOrderId, params.orderId),
      ne(academyRegistrations.paymentStatus, 'paid'),
    ))
    .returning();
  return row ?? null;
}

export async function readRegistrations(): Promise<RegistrationRow[]> {
  return db.select().from(academyRegistrations)
    .orderBy(desc(academyRegistrations.createdAt));
}

/**
 * Append to the payment audit trail. Never throws into the caller: losing an
 * audit line must not fail a payment that Razorpay has already captured.
 * The unique index on razorpay_event_id makes webhook redelivery a no-op.
 */
export async function logPaymentEvent(data: {
  registrationId?: string | null;
  eventType: string;
  razorpayEventId?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  status?: string | null;
  amount?: number | null;
  payload?: unknown;
}): Promise<void> {
  try {
    await db.insert(academyPaymentEvents).values({
      id: newId('apev'),
      registrationId: data.registrationId ?? null,
      eventType: data.eventType,
      razorpayEventId: data.razorpayEventId ?? null,
      razorpayOrderId: data.razorpayOrderId ?? null,
      razorpayPaymentId: data.razorpayPaymentId ?? null,
      status: data.status ?? null,
      amount: data.amount ?? null,
      payload: data.payload ?? null,
    });
  } catch (err) {
    console.error('[academy] failed to write payment event:', (err as Error).message);
  }
}
