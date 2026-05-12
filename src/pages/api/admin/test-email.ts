import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { isAdminRequest } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });

  const user    = process.env.EMAIL_USER;
  const pass    = process.env.EMAIL_PASS;
  const to      = process.env.CONTACT_EMAIL ?? user;

  if (!user || !pass) {
    return res.status(200).json({
      ok: false,
      error: 'EMAIL_USER or EMAIL_PASS is not set in environment variables.',
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: user,
      to,
      subject: '[DSeT] Test Email — SMTP Working',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
          <div style="background:linear-gradient(135deg,#001f3f,#0a3060);padding:24px;border-radius:10px;margin-bottom:16px;">
            <h1 style="color:#ffffff;margin:0;font-size:20px;">SMTP Test Successful</h1>
            <p style="color:rgba(255,255,255,0.6);margin:8px 0 0;font-size:13px;">Sent from DSeT Admin Panel</p>
          </div>
          <p style="color:#334155;font-size:14px;line-height:1.6;">
            This is a test email sent at <strong>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</strong>.
            If you received this, your email notifications are working correctly.
          </p>
          <p style="color:#94a3b8;font-size:11px;margin-top:16px;">Sent from: ${user} → ${to}</p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true, sentTo: to });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(200).json({ ok: false, error: message });
  }
}
