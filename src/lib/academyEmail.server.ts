import path from 'path';
import { sendMail } from './email';
import { formatPaise, getProgram } from './academyPrograms';
import type { RegistrationRow } from './academyRegistrations.server';
import type { InterestRow } from './academyInterest.server';

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function istDate(iso: string | null): string {
  return new Date(iso ?? Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) + ' IST';
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:7px 0;color:#64748b;width:170px;vertical-align:top;font-size:14px;">${esc(label)}</td>
    <td style="padding:7px 0;color:#0f1b2d;font-weight:600;font-size:14px;">${value}</td>
  </tr>`;
}

/**
 * Sent only on the created -> paid transition, so a webhook/callback race cannot
 * double-send. Failures are logged by the caller and never fail the payment —
 * the money is already captured and the DB row is already correct.
 */
export async function sendRegistrationEmails(reg: RegistrationRow): Promise<void> {
  const receipt = `
    <table style="width:100%;border-collapse:collapse;">
      ${row('Programme', esc(reg.programmeTitle))}
      ${row('Registration ID', esc(reg.id))}
      ${row('Payment ID', esc(reg.razorpayPaymentId ?? '—'))}
      ${row('Programme fee', formatPaise(reg.baseAmount))}
      ${row('GST @ 18%', formatPaise(reg.gstAmount))}
      ${row('Total paid', `<span style="color:#0d7d6f;">${formatPaise(reg.totalAmount)}</span>`)}
      ${row('Paid on', istDate(reg.paidAt))}
    </table>`;

  const shell = (heading: string, intro: string, body: string) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;">
<div style="max-width:640px;margin:0 auto;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="background:linear-gradient(135deg,#0a1830 0%,#071224 100%);padding:28px 32px;border-radius:12px 12px 0 0;">
    <span style="color:#20c4ad;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">DSeT Academy</span>
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:16px 0 6px;line-height:1.25;">${esc(heading)}</h1>
    <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">${esc(intro)}</p>
  </div>
  <div style="background:#ffffff;border:1px solid #e6e9f0;border-top:none;padding:24px 28px;border-radius:0 0 12px 12px;">
    ${body}
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin:18px 0 0;">
    DSeT Consulting · This is an automated confirmation.
  </p>
</div></body></html>`;

  // 1) Applicant receipt
  await sendMail({
    to: reg.email,
    subject: `Enrolment confirmed — ${reg.programmeTitle} | DSeT Academy`,
    html: shell(
      'Your seat is confirmed',
      `Welcome aboard, ${reg.fullName}`,
      `<p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 18px;">
         Your payment has been received and verified. Here is your receipt — please keep
         the registration ID for any correspondence about this cohort.
       </p>
       ${receipt}
       <p style="font-size:14px;color:#334155;line-height:1.7;margin:20px 0 0;">
         The Academy team will be in touch with your cohort schedule and joining details.
       </p>`,
    ),
  });

  // 2) Internal notification
  const notifyTo = process.env.ACADEMY_NOTIFY_EMAIL
    ?? process.env.CONTACT_EMAIL
    ?? 'contact@dsetconsulting.com';

  await sendMail({
    to: notifyTo,
    replyTo: reg.email,
    subject: `New Academy enrolment — ${reg.fullName} · ${reg.programmeTitle}`,
    html: shell(
      'New paid enrolment',
      `${reg.fullName} · ${formatPaise(reg.totalAmount)}`,
      `<table style="width:100%;border-collapse:collapse;">
         ${row('Name', esc(reg.fullName))}
         ${row('Email', `<a href="mailto:${esc(reg.email)}" style="color:#0d7d6f;">${esc(reg.email)}</a>`)}
         ${row('Mobile', esc(reg.mobile))}
         ${row('Role', esc(reg.role))}
         ${row('Institution', esc(reg.institution ?? '—'))}
       </table>
       <div style="height:1px;background:#e6e9f0;margin:18px 0;"></div>
       ${receipt}
       <p style="font-size:13px;color:#64748b;margin:20px 0 0;">
         View all enrolments → /admin/academy-registrations
       </p>`,
    ),
  });
}

/**
 * Second, separate email after a confirmed paid enrolment — a welcome note with the
 * programme brochure attached. Kept apart from the receipt email above so the receipt
 * (transactional, must never be delayed by a large attachment) always lands first.
 */
export async function sendWelcomeEmailWithBrochure(reg: RegistrationRow): Promise<void> {
  const program = getProgram(reg.programmeSlug);
  if (!program) return; // no catalogue entry (e.g. slug retired) — nothing to attach

  const brochurePath = path.join(process.cwd(), 'public', program.brochurePath);

  await sendMail({
    to: reg.email,
    subject: `Welcome to DSeT Academy — ${reg.programmeTitle}`,
    html: `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;">
<div style="max-width:640px;margin:0 auto;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="background:linear-gradient(135deg,#0a1830 0%,#071224 100%);padding:28px 32px;border-radius:12px 12px 0 0;">
    <span style="color:#20c4ad;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">DSeT Academy</span>
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:16px 0 6px;line-height:1.25;">Welcome aboard, ${esc(reg.fullName)}</h1>
    <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">${esc(reg.programmeTitle)}${reg.batch ? ` · ${esc(reg.batch)}` : ''}</p>
  </div>
  <div style="background:#ffffff;border:1px solid #e6e9f0;border-top:none;padding:24px 28px;border-radius:0 0 12px 12px;">
    <p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 16px;">
      You're officially part of DSeT Academy. We've attached the full programme brochure to this
      email — it has the curriculum, session-by-session plan and everything else you'll need
      before your first session.
    </p>
    <p style="font-size:14px;color:#334155;line-height:1.7;margin:0;">
      The Academy team will follow up separately with your batch schedule and joining link.
    </p>
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin:18px 0 0;">
    DSeT Consulting · This is an automated welcome email.
  </p>
</div></body></html>`,
    attachments: [{ filename: path.basename(program.brochurePath), path: brochurePath }],
  });
}

/**
 * Best-effort WhatsApp payment receipt, sent alongside the email one. WhatsApp's
 * Cloud API only allows a free-form message like this within the 24-hour customer
 * service window (i.e. the applicant messaged this number recently) or via an
 * approved message template outside it — so this can silently fail to deliver for
 * a brand-new number, which is why the caller treats it as fire-and-forget.
 */
export async function sendRegistrationWhatsAppReceipt(reg: RegistrationRow): Promise<void> {
  const { sendWhatsAppText } = await import('./whatsapp.server');
  const to = reg.mobile.replace(/[^\d]/g, '');
  const body =
    `DSeT Academy — payment confirmed!\n\n` +
    `Programme: ${reg.programmeTitle}\n` +
    (reg.batch ? `Batch: ${reg.batch}\n` : '') +
    `Registration ID: ${reg.id}\n` +
    `Amount paid: ${formatPaise(reg.totalAmount)}\n\n` +
    `Your seat is confirmed. Check your email for the full receipt and the welcome brochure.`;
  await sendWhatsAppText(to, body);
}

/**
 * Internal-only notification for a general interest signup (no payment involved —
 * institutional cohorts, interest-list, custom cohort, "coming next"). The applicant
 * gets their "welcome aboard" moment in the modal itself; this just makes sure the
 * Academy team actually sees the submission instead of it sitting invisibly in the DB.
 */
export async function sendInterestNotification(row_: InterestRow): Promise<void> {
  const notifyTo = process.env.ACADEMY_NOTIFY_EMAIL
    ?? process.env.CONTACT_EMAIL
    ?? 'contact@dsetconsulting.com';

  await sendMail({
    to: notifyTo,
    replyTo: row_.email,
    subject: `New Academy interest — ${row_.fullName} · ${row_.programmeTitle}`,
    html: `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;">
<div style="max-width:640px;margin:0 auto;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="background:linear-gradient(135deg,#0a1830 0%,#071224 100%);padding:28px 32px;border-radius:12px 12px 0 0;">
    <span style="color:#20c4ad;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">DSeT Academy</span>
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:16px 0 6px;line-height:1.25;">New interest signup</h1>
    <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">${esc(row_.programmeTitle)}</p>
  </div>
  <div style="background:#ffffff;border:1px solid #e6e9f0;border-top:none;padding:24px 28px;border-radius:0 0 12px 12px;">
    <table style="width:100%;border-collapse:collapse;">
      ${row('Name', esc(row_.fullName))}
      ${row('Email', `<a href="mailto:${esc(row_.email)}" style="color:#0d7d6f;">${esc(row_.email)}</a>`)}
      ${row('Mobile', esc(row_.mobile))}
      ${row('Role', esc(row_.role))}
      ${row('Institution', esc(row_.institution ?? '—'))}
      ${row('Submitted', istDate(row_.createdAt))}
    </table>
    <p style="font-size:13px;color:#64748b;margin:20px 0 0;">
      No payment involved — this is a general enquiry. Reach out to move it forward.
    </p>
  </div>
</div></body></html>`,
  });
}
