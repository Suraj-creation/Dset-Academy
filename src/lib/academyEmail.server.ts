import fs from 'fs';
import path from 'path';
import { sendMail } from './email';
import { formatPaise, getProgram } from './academyPrograms';
import type { RegistrationRow } from './academyRegistrations.server';
import type { InterestRow } from './academyInterest.server';

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function istDate(iso: string | null): string {
  return new Date(iso ?? Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' IST';
}

function resolveBrochureAttachment(slug: string): { filename: string; path: string } | null {
  const program = getProgram(slug);
  if (!program || !program.brochurePath) return null;
  const fullPath = path.join(process.cwd(), 'public', program.brochurePath);
  if (fs.existsSync(fullPath)) {
    return {
      filename: path.basename(program.brochurePath),
      path: fullPath,
    };
  }
  return null;
}

/**
 * Primary transactional email sent when an enrolment payment is successfully verified.
 * Includes executive GST tax invoice and attaches the selected programme brochure PDF.
 */
export async function sendRegistrationEmails(reg: RegistrationRow): Promise<void> {
  const invoiceNo = `DSET-INV-${reg.id.replace(/^aint_/, '').toUpperCase()}`;
  const formattedDate = istDate(reg.paidAt);
  const paymentId = reg.razorpayPaymentId ?? 'Verified via Razorpay';
  const halfGst = Math.round(reg.gstAmount / 2);

  const brochureAttachment = resolveBrochureAttachment(reg.programmeSlug);
  const attachments = brochureAttachment ? [brochureAttachment] : [];

  // Executive HTML Tax Invoice for the Applicant
  const applicantHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice & Enrolment Confirmation — DSeT Academy</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f6fa;padding:32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #071224 0%, #0d2140 100%);padding:36px 40px;border-bottom:3px solid #0d7d6f;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display:inline-block;padding:4px 10px;background:rgba(32,196,173,0.15);color:#20c4ad;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">
                      DSeT Academy · Capability Platform
                    </span>
                    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:14px 0 6px;letter-spacing:-0.02em;line-height:1.2;">
                      Enrolment Confirmation &amp; Tax Invoice
                    </h1>
                    <p style="color:rgba(255,255,255,0.7);font-size:13.5px;margin:0;line-height:1.5;">
                      Payment verified successfully. Your seat for the upcoming cohort is officially confirmed.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Invoice Summary Strip -->
          <tr>
            <td style="padding:28px 40px 10px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;">
                <tr>
                  <td width="50%" style="vertical-align:top;padding:4px 8px 4px 0;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;font-weight:600;margin-bottom:3px;">Invoice Number</div>
                    <div style="font-size:13.5px;font-weight:700;color:#0f1b2d;font-family:monospace;">${esc(invoiceNo)}</div>
                  </td>
                  <td width="50%" style="vertical-align:top;padding:4px 0 4px 8px;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;font-weight:600;margin-bottom:3px;">Date of Issue</div>
                    <div style="font-size:13.5px;font-weight:600;color:#0f1b2d;">${esc(formattedDate)}</div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="vertical-align:top;padding:12px 8px 4px 0;border-top:1px solid #e2e8f0;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;font-weight:600;margin-bottom:3px;">Razorpay Payment ID</div>
                    <div style="font-size:13px;font-weight:600;color:#0f1b2d;font-family:monospace;">${esc(paymentId)}</div>
                  </td>
                  <td width="50%" style="vertical-align:top;padding:12px 0 4px 8px;border-top:1px solid #e2e8f0;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;font-weight:600;margin-bottom:3px;">Payment Status</div>
                    <div style="font-size:13px;font-weight:700;color:#0d7d6f;">● Verified &amp; Captured</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Student & Programme Meta -->
          <tr>
            <td style="padding:15px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr>
                  <td width="50%" style="vertical-align:top;padding-right:15px;">
                    <div style="font-size:11.5px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;font-weight:700;margin-bottom:6px;">Billed To (Learner)</div>
                    <div style="font-size:15px;font-weight:700;color:#0f1b2d;">${esc(reg.fullName)}</div>
                    <div style="font-size:13px;color:#475569;margin-top:2px;">${esc(reg.email)}</div>
                    <div style="font-size:13px;color:#475569;margin-top:1px;">${esc(reg.mobile)}</div>
                    ${reg.role ? `<div style="font-size:12.5px;color:#64748b;margin-top:3px;">Role: ${esc(reg.role)}</div>` : ''}
                    ${reg.institution ? `<div style="font-size:12.5px;color:#64748b;">${esc(reg.institution)}</div>` : ''}
                    ${reg.companyName ? `<div style="font-size:12.5px;color:#64748b;">${esc(reg.companyName)}</div>` : ''}
                  </td>
                  <td width="50%" style="vertical-align:top;padding-left:15px;">
                    <div style="font-size:11.5px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;font-weight:700;margin-bottom:6px;">Enrolment Details</div>
                    <div style="font-size:15px;font-weight:700;color:#0d7d6f;">${esc(reg.programmeTitle)}</div>
                    <div style="font-size:13px;color:#475569;margin-top:3px;">Batch: <strong>${esc(reg.batch ?? 'Standard Cohort')}</strong></div>
                    <div style="font-size:12.5px;color:#64748b;margin-top:2px;">Registration ID: <span style="font-family:monospace;font-size:12px;">${esc(reg.id)}</span></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tax Invoice Itemized Table -->
          <tr>
            <td style="padding:15px 40px 25px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;border-collapse:collapse;">
                <thead>
                  <tr style="background:#0a1830;color:#ffffff;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">
                    <th style="padding:12px 16px;font-weight:600;">Description</th>
                    <th style="padding:12px 14px;font-weight:600;text-align:center;">SAC</th>
                    <th style="padding:12px 16px;font-weight:600;text-align:right;">Tuition Fee</th>
                    <th style="padding:12px 16px;font-weight:600;text-align:right;">GST @ 18%</th>
                    <th style="padding:12px 16px;font-weight:600;text-align:right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="background:#ffffff;border-bottom:1px solid #e2e8f0;font-size:13px;color:#1e293b;">
                    <td style="padding:14px 16px;vertical-align:top;">
                      <div style="font-weight:600;color:#0f1b2d;">${esc(reg.programmeTitle)}</div>
                      <div style="font-size:11.5px;color:#64748b;margin-top:3px;">Practitioner Cohort Training &amp; Assessment Certification</div>
                    </td>
                    <td style="padding:14px 14px;text-align:center;font-family:monospace;color:#64748b;vertical-align:top;">999293</td>
                    <td style="padding:14px 16px;text-align:right;font-weight:500;vertical-align:top;">${formatPaise(reg.baseAmount)}</td>
                    <td style="padding:14px 16px;text-align:right;font-weight:500;vertical-align:top;">${formatPaise(reg.gstAmount)}</td>
                    <td style="padding:14px 16px;text-align:right;font-weight:700;color:#0d7d6f;vertical-align:top;">${formatPaise(reg.totalAmount)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style="background:#f8fafc;font-size:12.5px;color:#475569;">
                    <td colspan="3" style="padding:10px 16px;border-top:1px solid #e2e8f0;">Subtotal (Base Tuition)</td>
                    <td colspan="2" style="padding:10px 16px;text-align:right;font-weight:600;border-top:1px solid #e2e8f0;color:#0f1b2d;">${formatPaise(reg.baseAmount)}</td>
                  </tr>
                  <tr style="background:#f8fafc;font-size:12px;color:#64748b;">
                    <td colspan="3" style="padding:4px 16px;">Central GST (CGST @ 9%)</td>
                    <td colspan="2" style="padding:4px 16px;text-align:right;font-weight:500;">${formatPaise(halfGst)}</td>
                  </tr>
                  <tr style="background:#f8fafc;font-size:12px;color:#64748b;">
                    <td colspan="3" style="padding:4px 16px 10px;">State GST / UT GST (SGST @ 9%)</td>
                    <td colspan="2" style="padding:4px 16px 10px;text-align:right;font-weight:500;">${formatPaise(halfGst)}</td>
                  </tr>
                  <tr style="background:#0a1830;color:#ffffff;font-size:14px;">
                    <td colspan="3" style="padding:14px 16px;font-weight:700;">Total Amount Paid (INR)</td>
                    <td colspan="2" style="padding:14px 16px;text-align:right;font-weight:800;color:#20c4ad;font-size:16px;">${formatPaise(reg.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>

          <!-- Brochure & Next Steps Highlight Box -->
          <tr>
            <td style="padding:0 40px 25px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:18px 22px;">
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-size:15px;color:#0f766e;font-weight:700;">📎 Official Programme Brochure Attached</span>
                    </div>
                    <p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:#134e4a;">
                      We have attached the comprehensive curriculum syllabus for <strong>${esc(reg.programmeTitle)}</strong> as a PDF to this email. It includes session-by-session schedules, hands-on lab modules, and applied AI tools covered during your cohort.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Onboarding Steps -->
          <tr>
            <td style="padding:0 40px 30px;">
              <h3 style="font-size:15px;font-weight:700;color:#0f1b2d;margin:0 0 12px;">What happens next?</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="28" style="vertical-align:top;padding-right:12px;">
                    <div style="width:24px;height:24px;background:#0d7d6f;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;">1</div>
                  </td>
                  <td style="vertical-align:top;padding-bottom:14px;">
                    <div style="font-size:13.5px;font-weight:600;color:#0f1b2d;">Cohort Calendar Invitation</div>
                    <div style="font-size:12.5px;color:#475569;margin-top:2px;">Our Academy team will email your calendar invitations with private workshop meeting links before the cohort commencement.</div>
                  </td>
                </tr>
                <tr>
                  <td width="28" style="vertical-align:top;padding-right:12px;">
                    <div style="width:24px;height:24px;background:#0d7d6f;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;">2</div>
                  </td>
                  <td style="vertical-align:top;padding-bottom:14px;">
                    <div style="font-size:13.5px;font-weight:600;color:#0f1b2d;">Lab &amp; Tooling Setup</div>
                    <div style="font-size:12.5px;color:#475569;margin-top:2px;">You will receive pre-workshop instructions for hands-on labs and access to the dedicated learning resources.</div>
                  </td>
                </tr>
                <tr>
                  <td width="28" style="vertical-align:top;padding-right:12px;">
                    <div style="width:24px;height:24px;background:#0d7d6f;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;">3</div>
                  </td>
                  <td style="vertical-align:top;">
                    <div style="font-size:13.5px;font-weight:600;color:#0f1b2d;">Dedicated Support &amp; Coordination</div>
                    <div style="font-size:12.5px;color:#475569;margin-top:2px;">For any schedule adjustments or queries, reach our executive academy coordinators at <a href="mailto:contact@dsetconsulting.com" style="color:#0d7d6f;font-weight:600;text-decoration:none;">contact@dsetconsulting.com</a>.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Legal -->
          <tr>
            <td style="background:#071224;padding:26px 40px;color:#94a3b8;font-size:11.5px;line-height:1.6;border-top:1px solid #1e293b;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="color:#ffffff;font-weight:700;font-size:13px;margin-bottom:4px;">DSeT Consulting Private Limited</div>
                    <div>Yuvaka Sangha, Yuvapatha 4, 31st Cross, 11th Main Rd, 4th Block, Jayanagar, Bengaluru, Karnataka 560011</div>
                    <div style="margin-top:6px;color:#64748b;">
                      This is a computer-generated tax invoice issued in accordance with Section 31 of the CGST Act, 2017. No physical signature is required.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // 1) Applicant Invoice & Confirmation Email
  await sendMail({
    to: reg.email,
    subject: `Tax Invoice & Enrolment Confirmed — ${reg.programmeTitle} | DSeT Academy`,
    html: applicantHtml,
    attachments,
  });

  // 2) Internal Notification Email for DSeT Operations
  // `||` on purpose, not `??` — an env var left blank ("") in .env.local must still
  // fall through, since `??` only catches null/undefined and would leave `to: ""`.
  const notifyTo = process.env.ACADEMY_NOTIFY_EMAIL
    || process.env.CONTACT_EMAIL
    || 'contact@dsetconsulting.com';

  const internalHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<div style="max-width:640px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0a1830 0%,#071224 100%);padding:28px 32px;border-radius:12px 12px 0 0;">
    <span style="color:#20c4ad;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">DSeT Academy · Enrolment Alert</span>
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:14px 0 4px;">New Paid Enrolment</h1>
    <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;">${esc(reg.fullName)} · ${formatPaise(reg.totalAmount)}</p>
  </div>
  <div style="background:#ffffff;border:1px solid #e6e9f0;border-top:none;padding:24px 28px;border-radius:0 0 12px 12px;">
    <table style="width:100%;border-collapse:collapse;font-size:13.5px;">
      <tr><td style="padding:6px 0;color:#64748b;width:150px;">Programme</td><td style="padding:6px 0;font-weight:700;color:#0d7d6f;">${esc(reg.programmeTitle)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Batch</td><td style="padding:6px 0;font-weight:600;">${esc(reg.batch ?? '—')}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Name</td><td style="padding:6px 0;font-weight:600;">${esc(reg.fullName)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;"><a href="mailto:${esc(reg.email)}" style="color:#0d7d6f;">${esc(reg.email)}</a></td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Mobile</td><td style="padding:6px 0;font-weight:600;">${esc(reg.mobile)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Role</td><td style="padding:6px 0;">${esc(reg.role)}</td></tr>
      ${reg.institution ? `<tr><td style="padding:6px 0;color:#64748b;">Institution</td><td style="padding:6px 0;">${esc(reg.institution)}</td></tr>` : ''}
      ${reg.companyName ? `<tr><td style="padding:6px 0;color:#64748b;">Company</td><td style="padding:6px 0;">${esc(reg.companyName)}</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:#64748b;">Total Paid</td><td style="padding:6px 0;font-weight:700;color:#0d7d6f;">${formatPaise(reg.totalAmount)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Invoice ID</td><td style="padding:6px 0;font-family:monospace;">${esc(invoiceNo)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Razorpay Payment ID</td><td style="padding:6px 0;font-family:monospace;">${esc(paymentId)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Timestamp</td><td style="padding:6px 0;">${esc(formattedDate)}</td></tr>
    </table>
    <div style="height:1px;background:#e6e9f0;margin:18px 0;"></div>
    <p style="font-size:12.5px;color:#64748b;margin:0;">
      View full registration records in the admin dashboard at <strong>/admin/academy-registrations</strong>.
    </p>
  </div>
</div></body></html>`;

  await sendMail({
    to: notifyTo,
    replyTo: reg.email,
    subject: `[Paid Enrolment] ${reg.fullName} — ${reg.programmeTitle} (${formatPaise(reg.totalAmount)})`,
    html: internalHtml,
  });
}

/**
 * Secondary welcome note sent to ensure brochure delivery and cohort setup instructions.
 */
export async function sendWelcomeEmailWithBrochure(reg: RegistrationRow): Promise<void> {
  const brochureAttachment = resolveBrochureAttachment(reg.programmeSlug);
  const attachments = brochureAttachment ? [brochureAttachment] : [];

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<div style="max-width:640px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0a1830 0%,#071224 100%);padding:28px 32px;border-radius:12px 12px 0 0;">
    <span style="color:#20c4ad;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">DSeT Academy</span>
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:16px 0 6px;">Welcome aboard, ${esc(reg.fullName)}</h1>
    <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;">${esc(reg.programmeTitle)}${reg.batch ? ` · ${esc(reg.batch)}` : ''}</p>
  </div>
  <div style="background:#ffffff;border:1px solid #e6e9f0;border-top:none;padding:26px 30px;border-radius:0 0 12px 12px;">
    <p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 16px;">
      You are officially enrolled in DSeT Academy. We have attached the full official curriculum brochure to this email — it outlines the tool stack, schedule, hands-on lab modules, and evaluation criteria.
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;margin-bottom:18px;">
      <div style="font-size:12px;font-weight:700;color:#0f1b2d;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Enrolment Summary</div>
      <div style="font-size:13px;color:#475569;"><strong>Learner:</strong> ${esc(reg.fullName)}</div>
      <div style="font-size:13px;color:#475569;"><strong>Cohort:</strong> ${esc(reg.programmeTitle)} (${esc(reg.batch ?? 'Standard Batch')})</div>
      <div style="font-size:13px;color:#475569;"><strong>Registration ID:</strong> <span style="font-family:monospace;">${esc(reg.id)}</span></div>
    </div>
    <p style="font-size:14px;color:#334155;line-height:1.7;margin:0;">
      Our Academy coordinators will follow up with your private meeting credentials and joining link.
    </p>
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin:18px 0 0;">
    DSeT Consulting Private Limited · Bengaluru, India
  </p>
</div></body></html>`;

  await sendMail({
    to: reg.email,
    subject: `Welcome to DSeT Academy — ${reg.programmeTitle}`,
    html,
    attachments,
  });
}

/**
 * Best-effort WhatsApp payment receipt.
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
    `Your seat is confirmed. Your GST Tax Invoice and welcome brochure have been sent to your email.`;
  await sendWhatsAppText(to, body);
}

/**
 * Internal-only notification for a general interest signup.
 */
export async function sendInterestNotification(row_: InterestRow): Promise<void> {
  const notifyTo = process.env.ACADEMY_NOTIFY_EMAIL
    || process.env.CONTACT_EMAIL
    || 'contact@dsetconsulting.com';

  await sendMail({
    to: notifyTo,
    replyTo: row_.email,
    subject: `New Academy interest — ${row_.fullName} · ${row_.programmeTitle}`,
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<div style="max-width:640px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0a1830 0%,#071224 100%);padding:28px 32px;border-radius:12px 12px 0 0;">
    <span style="color:#20c4ad;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">DSeT Academy</span>
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:14px 0 4px;">New Interest Signup</h1>
    <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;">${esc(row_.programmeTitle)}</p>
  </div>
  <div style="background:#ffffff;border:1px solid #e6e9f0;border-top:none;padding:24px 28px;border-radius:0 0 12px 12px;">
    <table style="width:100%;border-collapse:collapse;font-size:13.5px;">
      <tr><td style="padding:6px 0;color:#64748b;width:140px;">Name</td><td style="padding:6px 0;font-weight:600;">${esc(row_.fullName)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;"><a href="mailto:${esc(row_.email)}" style="color:#0d7d6f;">${esc(row_.email)}</a></td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Mobile</td><td style="padding:6px 0;font-weight:600;">${esc(row_.mobile)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Role</td><td style="padding:6px 0;">${esc(row_.role)}</td></tr>
      ${row_.institution ? `<tr><td style="padding:6px 0;color:#64748b;">Institution</td><td style="padding:6px 0;">${esc(row_.institution)}</td></tr>` : ''}
      ${row_.department ? `<tr><td style="padding:6px 0;color:#64748b;">Department</td><td style="padding:6px 0;">${esc(row_.department)}</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:#64748b;">Submitted</td><td style="padding:6px 0;">${istDate(row_.createdAt)}</td></tr>
    </table>
    <div style="height:1px;background:#e6e9f0;margin:18px 0;"></div>
    <p style="font-size:12.5px;color:#64748b;margin:0;">
      No payment involved — general enquiry from /academy.
    </p>
  </div>
</div></body></html>`,
  });
}
