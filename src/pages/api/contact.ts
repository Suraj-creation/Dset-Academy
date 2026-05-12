import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { addContact, readContacts, markContactRead, deleteContact } from '@/lib/contacts.server';
import { isAdminRequest } from '@/lib/auth';

declare global {
  var lastSubmissions: Map<string, number> | undefined;
}

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  _honeypot: z.string().optional(),
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

transporter.verify(function (error) {
  if (error) {
    console.error('❌ SMTP Connection Failed:', error.message);
  } else {
    console.log('✅ SMTP Connected Successfully!');
  }
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
      if (req.body._honeypot) return res.status(200).json({ success: true });

      const data = contactSchema.parse(req.body);

      // Rate limiting: 1 min per IP
      const clientIp = (req.headers['x-forwarded-for'] ?? req.socket.remoteAddress) as string;
      const now = Date.now();
      global.lastSubmissions = global.lastSubmissions ?? new Map();
      const last = global.lastSubmissions.get(clientIp);
      if (last && now - last < 60000) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }
      global.lastSubmissions.set(clientIp, now);

      await addContact({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        service: data.service,
        message: data.message,
      });

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.CONTACT_EMAIL ?? process.env.EMAIL_USER,
          subject: `[DSeT] New Contact — ${data.name}${data.company ? ` · ${data.company}` : ''}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:12px;">
              <div style="background:linear-gradient(135deg,#001f3f,#0a3060);padding:28px 24px;border-radius:10px;margin-bottom:20px;">
                <p style="color:rgba(255,255,255,0.55);font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 6px;">DSeT — New Contact</p>
                <h1 style="color:#ffffff;margin:0 0 6px;font-size:22px;">${data.name}</h1>
                <p style="color:rgba(255,255,255,0.6);margin:0;font-size:14px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} IST</p>
              </div>
              <div style="background:#ffffff;border-radius:10px;padding:24px;margin-bottom:14px;border:1px solid #e2e8f0;">
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                  <tr><td style="padding:5px 0;color:#6b7a90;width:120px;">Name</td><td style="padding:5px 0;color:#001f3f;font-weight:600;">${data.name}</td></tr>
                  <tr><td style="padding:5px 0;color:#6b7a90;">Email</td><td style="padding:5px 0;"><a href="mailto:${data.email}" style="color:#1e90ff;">${data.email}</a></td></tr>
                  ${data.phone ? `<tr><td style="padding:5px 0;color:#6b7a90;">Phone</td><td style="padding:5px 0;color:#001f3f;">${data.phone}</td></tr>` : ''}
                  ${data.company ? `<tr><td style="padding:5px 0;color:#6b7a90;">Company</td><td style="padding:5px 0;color:#001f3f;">${data.company}</td></tr>` : ''}
                  ${data.service ? `<tr><td style="padding:5px 0;color:#6b7a90;">Service</td><td style="padding:5px 0;color:#001f3f;">${data.service}</td></tr>` : ''}
                </table>
              </div>
              <div style="background:#ffffff;border-radius:10px;padding:24px;border:1px solid #e2e8f0;">
                <h2 style="color:#001f3f;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;padding-bottom:10px;border-bottom:1px solid #f0f5fc;">Message</h2>
                <p style="line-height:1.75;color:#334155;font-size:14px;margin:0;">${data.message.replace(/\n/g, '<br>')}</p>
              </div>
              <p style="color:#94a3b8;font-size:11px;margin-top:16px;text-align:center;">View all contacts at /admin/contacts</p>
            </div>
          `,
        });
        console.log('✅ Email sent successfully!');
      } catch (emailError: any) {
        console.error('❌ SMTP Send Error:', emailError.message);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', message: error.issues.map((i) => i.message).join(', ') });
      }
      return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
