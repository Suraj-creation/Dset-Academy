import { NextApiRequest, NextApiResponse } from 'next';
import { saveLead } from '@/lib/leads.server';
import { sendMail } from '@/lib/email';
import { randomUUID } from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { name, email, slug } = req.body as { name?: string; email?: string; slug?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name?.trim() || '';
  const displayName = cleanName || 'there';

  try {
    await saveLead({
      id: randomUUID(),
      name: cleanName || undefined,
      email: cleanEmail,
      company: undefined,
      intent: 'general',
      score: 'warm',
      messages: 0,
      createdAt: new Date().toISOString(),
      source: slug ? `blog:${slug}` : 'blog',
    });

    const contactEmail = process.env.CONTACT_EMAIL ?? 'contact@dsetconsulting.com';

    // Welcome email to subscriber
    sendMail({
      to: cleanEmail,
      replyTo: contactEmail,
      subject: 'Thanks for subscribing to DSeT Insights',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
          <div style="background:linear-gradient(135deg,#001f3f,#002b57);padding:32px 32px 24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:#fff;font-size:22px;margin:0;font-weight:700">DSeT Insights</h1>
            <p style="color:#93c5fd;font-size:13px;margin:6px 0 0">Strategy · AI · Digital Transformation</p>
          </div>
          <div style="background:#f8faff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
            <p style="font-size:16px;margin:0 0 16px">Hi ${displayName},</p>
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px">
              Thanks for subscribing to DSeT Insights. You'll receive our latest thinking on AI, digital transformation, and enterprise strategy — delivered straight to your inbox.
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px">
              In the meantime, explore our latest articles on the blog.
            </p>
            <div style="text-align:center;margin-bottom:28px">
              <a href="https://dsetconsulting.com/blog" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#5e17ea,#1e90ff);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px">
                Explore Insights →
              </a>
            </div>
            <p style="font-size:13px;color:#9ca3af;margin:0">
              — Team DSeT Consulting<br/>
              <a href="https://dsetconsulting.com" style="color:#5e17ea;text-decoration:none">dsetconsulting.com</a>
            </p>
          </div>
        </div>
      `,
    }).catch(() => {});

    // Admin notification
    sendMail({
      to: contactEmail,
      subject: `New Blog Subscriber — ${cleanName || cleanEmail}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a2e">
          <div style="background:#001f3f;padding:20px 24px;border-radius:10px 10px 0 0">
            <h2 style="color:#fff;font-size:16px;margin:0">New Blog Subscriber</h2>
          </div>
          <div style="background:#f8faff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:8px 0;color:#6b7280;width:90px">Name</td><td style="padding:8px 0;font-weight:600">${cleanName || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0;font-weight:600">${cleanEmail}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Source</td><td style="padding:8px 0;font-weight:600">${slug ? `Blog: ${slug}` : 'Blog'}</td></tr>
            </table>
            <div style="margin-top:16px">
              <a href="https://dsetconsulting.com/admin/leads" style="font-size:13px;color:#5e17ea;text-decoration:none">View in Admin →</a>
            </div>
          </div>
        </div>
      `,
    }).catch(() => {});

    return res.status(200).json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
}
