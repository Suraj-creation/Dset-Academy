import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { sendMail } from '@/lib/email';
import { addContact, readContacts, markContactRead, deleteContact } from '@/lib/contacts.server';
import { isAdminRequest } from '@/lib/auth';
import { validateLead, LeadStatus } from '@/lib/leadValidation';
import { syncContactToZoho } from '@/lib/zoho/sync';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function detectIntent(message: string, service?: string): string {
  if (service) return service;
  const m = message.toLowerCase();
  if (m.includes('demo') || m.includes('trial'))                                          return 'Demo Request';
  if (m.includes('price') || m.includes('pricing') || m.includes('cost') || m.includes('quote')) return 'Pricing Enquiry';
  if (m.includes('partner') || m.includes('collaborat'))                                  return 'Partnership';
  if (m.includes('job') || m.includes('career') || m.includes('hiring'))                  return 'Career';
  if (m.includes('support') || m.includes('issue') || m.includes('problem'))              return 'Support';
  return 'General Enquiry';
}

function recommendedAction(intent: string): string {
  const map: Record<string, string> = {
    'Demo Request':      'Schedule a personalized product demo at the earliest convenience.',
    'Pricing Enquiry':   'Share detailed pricing information and schedule a commercial discussion.',
    'Partnership':       'Connect the contact with the business development team.',
    'Career':            'Forward to the HR / talent acquisition team for a follow-up.',
    'Support':           'Connect with the technical support team to address the issue.',
    'General Enquiry':   'Respond with relevant product information and offer a discovery call.',
  };
  return map[intent] ?? 'Follow up with the contact within 24 hours.';
}

function leadQualityHtml(status: LeadStatus, score: number, reasons: string[]): string {
  const cfg: Record<LeadStatus, { bg: string; border: string; badge: string; label: string; text: string }> = {
    valid:      { bg: '#f0fdf4', border: '#16a34a', badge: '#16a34a', label: 'VALID',      text: '#15803d' },
    suspicious: { bg: '#fffbeb', border: '#f59e0b', badge: '#f59e0b', label: 'SUSPICIOUS', text: '#92400e' },
    rejected:   { bg: '#fef2f2', border: '#dc2626', badge: '#dc2626', label: 'REJECTED',   text: '#991b1b' },
  };
  const c = cfg[status];
  const reasonsHtml = reasons.length > 0
    ? `<ul style="margin:8px 0 0;padding-left:18px;">${reasons.map(r => `<li style="font-size:12px;color:${c.text};margin:2px 0;">${esc(r)}</li>`).join('')}</ul>`
    : '';
  return `
  <div style="background:${c.bg};border-left:4px solid ${c.border};border-right:1px solid #e2e8f0;padding:18px 28px;">
    <p style="font-size:10px;font-weight:800;color:${c.text};text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">&#x1F4CA; Lead Quality</p>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:6px;">
      <span style="background:${c.badge};color:#fff;font-size:11px;font-weight:800;padding:4px 14px;border-radius:20px;letter-spacing:0.06em;">${c.label}</span>
      <span style="font-size:13px;color:${c.text};font-weight:600;">Score: ${score}</span>
    </div>
    ${reasonsHtml}
  </div>`;
}

declare global {
  var lastSubmissions: Map<string, number> | undefined;
}

const contactSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  email:   z.email('Invalid email address'),
  phone:   z.string().optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  _honeypot: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ── GET (admin: list all contacts) ──────────────────────────
  if (req.method === 'GET') {
    if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
    const contacts = await readContacts();
    return res.status(200).json({ contacts });
  }

  // ── PATCH (admin: mark as read) ──────────────────────────────
  if (req.method === 'PATCH') {
    if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });
    const updated = await markContactRead(id as string);
    if (!updated) return res.status(404).json({ error: 'Contact not found' });
    return res.status(200).json(updated);
  }

  // ── DELETE (admin: remove contact) ──────────────────────────
  if (req.method === 'DELETE') {
    if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });
    const deleted = await deleteContact(id as string);
    if (!deleted) return res.status(404).json({ error: 'Contact not found' });
    return res.status(200).json({ success: true });
  }

  // ── POST (public: submit contact form) ──────────────────────
  if (req.method === 'POST') {
    try {
      // Layer 1: honeypot — bots fill this hidden field
      if (req.body._honeypot) return res.status(200).json({ success: true });

      const data = contactSchema.parse(req.body);

      // Layer 2: rate limiting — 1 per IP per 60 s
      const clientIp = (req.headers['x-forwarded-for'] ?? req.socket.remoteAddress) as string;
      const now = Date.now();
      global.lastSubmissions = global.lastSubmissions ?? new Map();
      const last = global.lastSubmissions.get(clientIp);
      if (last && now - last < 60000) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }
      global.lastSubmissions.set(clientIp, now);

      // Layer 3: multi-signal lead validation
      const formStartTime = typeof req.body._formStartTime === 'number' ? req.body._formStartTime as number : undefined;
      const recaptchaToken = typeof req.body.recaptchaToken === 'string' ? req.body.recaptchaToken as string : undefined;

      const validation = await validateLead({
        email:          data.email,
        name:           data.name,
        message:        data.message,
        phone:          data.phone,
        company:        data.company,
        recaptchaToken,
        formStartTime,
      });

      // Always save to DB (rejected leads kept as audit log)
      const savedContact = await addContact({
        name:        data.name,
        email:       data.email,
        phone:       data.phone,
        company:     data.company,
        service:     data.service,
        message:     data.message,
        leadScore:   validation.score,
        leadStatus:  validation.status,
      });

      // Sync valid + suspicious leads to Zoho; only hard-rejected (spam/disposable) are excluded
      if (validation.status !== 'rejected') {
        const intent = detectIntent(data.message, data.service);

        // Fire-and-forget — a Zoho outage or missing credentials must never affect this
        // request; syncContactToZoho() is a no-op entirely while ZOHO_SYNC_ENABLED=false.
        syncContactToZoho(savedContact, { intent }).catch(() => {});

        try {
          const action  = recommendedAction(intent);
          const dateStr = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short',
            year: 'numeric', hour: '2-digit', minute: '2-digit',
          }) + ' IST';
          const preview = data.message.length > 160
            ? data.message.substring(0, 160) + '…'
            : data.message;
          const summary = `${esc(data.name)} reached out via the website contact form with a ${intent.toLowerCase()}. Their message: "${esc(preview)}"`;

          await sendMail({
            to: process.env.CONTACT_EMAIL ?? 'contact@dsetconsulting.com',
            subject: `New Contact Received - ${data.name} Enquired About ${intent}`,
            replyTo: data.email,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;-webkit-text-size-adjust:100%;">
<div style="max-width:640px;width:100%;margin:0 auto;padding:20px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#001f3f 0%,#0d3b6e 100%);padding:28px 32px;border-radius:12px 12px 0 0;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td><span style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">DSeT Consulting</span></td>
        <td style="text-align:right;"><span style="background:#1d4ed8;color:#ffffff;font-size:11px;font-weight:800;padding:5px 14px;border-radius:20px;letter-spacing:0.08em;">Contact Form</span></td>
      </tr>
    </table>
    <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:18px 0 8px;">New Contact</p>
    <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 6px;line-height:1.2;">${esc(data.name)}</h1>
    <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0;">${dateStr}</p>
  </div>

  <!-- Contact Information -->
  <div style="background:#ffffff;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;padding:22px 28px;">
    <p style="font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 14px;">Contact Information</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr>
        <td style="padding:7px 0;color:#64748b;width:130px;vertical-align:top;">Source</td>
        <td style="padding:7px 0;color:#1e293b;font-weight:600;">Website Contact Form</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#64748b;vertical-align:top;">Date &amp; Time</td>
        <td style="padding:7px 0;color:#1e293b;">${dateStr}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#64748b;vertical-align:top;">Intent</td>
        <td style="padding:7px 0;"><span style="background:#eff6ff;color:#1d4ed8;font-weight:700;font-size:12px;padding:3px 10px;border-radius:20px;">${esc(intent)}</span></td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#64748b;vertical-align:top;">Name</td>
        <td style="padding:7px 0;color:#1e293b;font-weight:600;">${esc(data.name)}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#64748b;vertical-align:top;">Email</td>
        <td style="padding:7px 0;"><a href="mailto:${esc(data.email)}" style="color:#1d4ed8;font-weight:600;text-decoration:none;">${esc(data.email)}</a></td>
      </tr>
      ${data.phone   ? `<tr><td style="padding:7px 0;color:#64748b;vertical-align:top;">Phone</td><td style="padding:7px 0;"><a href="tel:${esc(data.phone)}" style="color:#1d4ed8;font-weight:600;text-decoration:none;">${esc(data.phone)}</a></td></tr>` : ''}
      ${data.company ? `<tr><td style="padding:7px 0;color:#64748b;vertical-align:top;">Company</td><td style="padding:7px 0;color:#1e293b;">${esc(data.company)}</td></tr>` : ''}
      ${data.service ? `<tr><td style="padding:7px 0;color:#64748b;vertical-align:top;">Service</td><td style="padding:7px 0;color:#1e293b;">${esc(data.service)}</td></tr>` : ''}
    </table>
  </div>

  <!-- Lead Quality -->
  ${leadQualityHtml(validation.status, validation.score, validation.reasons)}

  <!-- Lead Summary -->
  <div style="background:#ffffff;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-top:1px solid #f1f5f9;padding:20px 28px;">
    <p style="font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">Lead Summary</p>
    <p style="font-size:14px;color:#334155;line-height:1.7;margin:0;">${summary}</p>
  </div>

  <!-- Recommended Action -->
  <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-right:1px solid #e2e8f0;padding:18px 28px;">
    <p style="font-size:10px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px;">&#x1F4A1; Recommended Action</p>
    <p style="font-size:14px;color:#78350f;line-height:1.65;margin:0;font-weight:500;">${esc(action)}</p>
  </div>

  <!-- Full Message -->
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:1px solid #f1f5f9;padding:22px 28px;border-radius:0 0 12px 12px;">
    <p style="font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 14px;">Full Message</p>
    <div style="padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #94a3b8;border-radius:0 8px 8px 0;font-size:14px;color:#1e293b;line-height:1.75;">
      ${esc(data.message).replace(/\n/g, '<br>')}
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:18px 0 4px;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">DSeT Consulting &nbsp;·&nbsp; <a href="#" style="color:#94a3b8;text-decoration:none;">View all contacts → /admin/contacts</a></p>
  </div>

</div>
</body>
</html>`,
          });
          console.log('✅ Email sent successfully!');
        } catch (emailError: any) {
          console.error('❌ Email Send Error:', emailError.message);
        }
      } else {
        console.log(`[contact] Rejected lead from ${data.email} (score: ${validation.score}) — reasons: ${validation.reasons.join(', ')}`);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', message: error.issues.map((i) => i.message).join(', ') });
      }
      console.error('[api/contact] 500 error:', error);
      return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
