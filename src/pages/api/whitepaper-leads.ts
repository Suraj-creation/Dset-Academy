import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdminRequest } from '@/lib/auth';
import { createLead, getAllLeads, getWhitepaperById, incrementDownloadCount } from '@/lib/whitepapers.server';
import { sendMail } from '@/lib/email';
import { validateLead, LeadStatus } from '@/lib/leadValidation';

function leadBadgeHtml(status: LeadStatus, score: number, reasons: string[]): string {
  const cfg: Record<LeadStatus, { bg: string; border: string; badge: string; label: string; text: string }> = {
    valid:      { bg: '#f0fdf4', border: '#16a34a', badge: '#16a34a', label: 'VALID',      text: '#15803d' },
    suspicious: { bg: '#fffbeb', border: '#f59e0b', badge: '#f59e0b', label: 'SUSPICIOUS', text: '#92400e' },
    rejected:   { bg: '#fef2f2', border: '#dc2626', badge: '#dc2626', label: 'REJECTED',   text: '#991b1b' },
  };
  const c = cfg[status];
  const reasonsList = reasons.length > 0
    ? `<ul style="margin:6px 0 0;padding-left:18px;">${reasons.map(r => `<li style="font-size:12px;color:${c.text};margin:2px 0;">${r}</li>`).join('')}</ul>`
    : '';
  return `
    <tr>
      <td style="padding:8px 0;color:#6b7280;vertical-align:top;">Lead Quality</td>
      <td style="padding:8px 0;">
        <span style="background:${c.badge};color:#fff;font-size:11px;font-weight:800;padding:3px 12px;border-radius:20px;">${c.label}</span>
        <span style="font-size:12px;color:${c.text};margin-left:8px;font-weight:600;">Score: ${score}</span>
        ${reasonsList}
      </td>
    </tr>`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
      const leads = await getAllLeads();
      return res.status(200).json(leads);
    }

    if (req.method === 'POST') {
      const { whitepaperID, whitepaperTitle, fullName, email, company, country, designation, purpose } = req.body;

      if (!whitepaperID || !fullName || !email || !company || !country || !purpose) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email' });
      }

      // Honeypot check
      if (req.body._honeypot) {
        const wp = await getWhitepaperById(whitepaperID);
        return res.status(201).json({ success: true, pdfUrl: wp?.pdfUrl ?? '' });
      }

      const wp = await getWhitepaperById(whitepaperID);
      if (!wp) return res.status(404).json({ error: 'Whitepaper not found' });

      // Multi-signal lead validation
      const formStartTime = typeof req.body._formStartTime === 'number' ? req.body._formStartTime as number : undefined;
      const recaptchaToken = typeof req.body.recaptchaToken === 'string' ? req.body.recaptchaToken as string : undefined;

      const validation = await validateLead({
        email,
        name:          fullName,
        company,
        recaptchaToken,
        formStartTime,
      });

      // Save lead (all statuses — rejected leads are audit data)
      const lead = await createLead({
        whitepaperID,
        whitepaperTitle: whitepaperTitle || wp.title,
        fullName,
        email,
        company,
        country,
        designation: designation || '',
        purpose,
        leadScore:   validation.score,
        leadStatus:  validation.status,
      });

      incrementDownloadCount(whitepaperID).catch(() => {});

      // Email admin only for valid leads
      if (validation.status === 'valid') {
        try {
          const ist = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
          await sendMail({
            to:      process.env.CONTACT_EMAIL ?? 'contact@dsetconsulting.com',
            subject: `📄 New Whitepaper Lead: ${wp.title}`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
                <div style="background:linear-gradient(135deg,#5e17ea,#1e90ff);padding:24px 28px;border-radius:10px 10px 0 0">
                  <h2 style="color:#fff;margin:0;font-size:18px">New Whitepaper Lead</h2>
                  <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px">${ist} IST</p>
                </div>
                <div style="background:#f9fafb;padding:24px 28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px">
                  <table style="width:100%;border-collapse:collapse;font-size:14px">
                    <tr><td style="padding:8px 0;color:#6b7280;width:130px">Whitepaper</td><td style="padding:8px 0;color:#111;font-weight:600">${wp.title}</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280">Name</td><td style="padding:8px 0;color:#111">${fullName}</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0;color:#111">${email}</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280">Company</td><td style="padding:8px 0;color:#111">${company}</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280">Designation</td><td style="padding:8px 0;color:#111">${designation || '—'}</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280">Country</td><td style="padding:8px 0;color:#111">${country}</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280">Purpose</td><td style="padding:8px 0;color:#111">${purpose}</td></tr>
                    ${leadBadgeHtml(validation.status, validation.score, validation.reasons)}
                  </table>
                  <p style="margin-top:20px;font-size:12px;color:#9ca3af">View all leads in the <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/whitepapers" style="color:#5e17ea">admin dashboard</a>.</p>
                </div>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error('[whitepaper-leads] email error:', emailErr);
        }
      } else {
        console.log(`[whitepaper-leads] ${validation.status} lead (no email): ${email} (score: ${validation.score})`);
      }

      return res.status(201).json({ success: true, lead, pdfUrl: wp.pdfUrl });
    }

    if (req.method === 'DELETE') {
      if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.query;
      if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id is required' });
      const { deleteLead } = await import('@/lib/whitepapers.server');
      const ok = await deleteLead(id);
      if (!ok) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/whitepaper-leads]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
