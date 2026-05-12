import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { addApplication, readApplications, updateApplicationStatus, deleteApplication, ApplicationStatus } from '@/lib/applications.server';
import { isAdminRequest } from '@/lib/auth';
import path from 'path';
import fs from 'fs';

declare global {
  var lastApplications: Map<string, number> | undefined;
}

const submitSchema = z.object({
  jobId: z.number(),
  jobTitle: z.string().min(2),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Phone number required'),
  linkedin: z.string().optional().or(z.literal('')),
  portfolio: z.string().optional().or(z.literal('')),
  experience: z.string().min(1, 'Please select your experience level'),
  noticePeriod: z.string().min(1, 'Please select your notice period'),
  source: z.string().min(1, 'Please tell us how you found this role'),
  coverNote: z.string().min(30, 'Cover note must be at least 30 characters'),
  resumeLink: z.string().min(5, 'Please provide a link to your resume'),
  _honeypot: z.string().optional(),
});

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ── GET (admin: list all applications) ──────────────────────
  if (req.method === 'GET') {
    if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
    const apps = await readApplications();
    return res.status(200).json({ applications: apps });
  }

  // ── POST (public: submit application) ───────────────────────
  if (req.method === 'POST') {
    try {
      if (req.body._honeypot) return res.status(200).json({ success: true });

      const data = submitSchema.parse(req.body);

      const clientIp = (req.headers['x-forwarded-for'] ?? req.socket.remoteAddress) as string;
      const now = Date.now();
      global.lastApplications = global.lastApplications ?? new Map();
      const last = global.lastApplications.get(clientIp);
      if (last && now - last < 120000) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }
      global.lastApplications.set(clientIp, now);

      await addApplication({
        jobId: data.jobId,
        jobTitle: data.jobTitle,
        name: data.name,
        email: data.email,
        phone: data.phone,
        linkedin: data.linkedin,
        portfolio: data.portfolio,
        experience: data.experience,
        noticePeriod: data.noticePeriod,
        source: data.source,
        coverNote: data.coverNote,
        resumeLink: data.resumeLink,
      });

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.CONTACT_EMAIL ?? process.env.EMAIL_USER,
          subject: `[DSeT Careers] New Application — ${data.jobTitle} — ${data.name}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:12px;">
              <div style="background:linear-gradient(135deg,#001f3f,#0a3060);padding:28px 24px;border-radius:10px;margin-bottom:20px;">
                <p style="color:rgba(255,255,255,0.55);font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 6px;">DSeT Careers — New Application</p>
                <h1 style="color:#ffffff;margin:0 0 6px;font-size:22px;">${data.jobTitle}</h1>
                <p style="color:rgba(255,255,255,0.6);margin:0;font-size:14px;">From ${data.name} · ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} IST</p>
              </div>
              <div style="background:#ffffff;border-radius:10px;padding:24px;margin-bottom:14px;border:1px solid #e2e8f0;">
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                  <tr><td style="padding:5px 0;color:#6b7a90;width:130px;">Name</td><td style="padding:5px 0;color:#001f3f;font-weight:600;">${data.name}</td></tr>
                  <tr><td style="padding:5px 0;color:#6b7a90;">Email</td><td style="padding:5px 0;"><a href="mailto:${data.email}" style="color:#1e90ff;">${data.email}</a></td></tr>
                  <tr><td style="padding:5px 0;color:#6b7a90;">Phone</td><td style="padding:5px 0;color:#001f3f;">${data.phone}</td></tr>
                  ${data.linkedin ? `<tr><td style="padding:5px 0;color:#6b7a90;">LinkedIn</td><td style="padding:5px 0;"><a href="${data.linkedin}" style="color:#1e90ff;">${data.linkedin}</a></td></tr>` : ''}
                  ${data.portfolio ? `<tr><td style="padding:5px 0;color:#6b7a90;">Portfolio</td><td style="padding:5px 0;"><a href="${data.portfolio}" style="color:#1e90ff;">${data.portfolio}</a></td></tr>` : ''}
                  <tr><td style="padding:5px 0;color:#6b7a90;">Experience</td><td style="padding:5px 0;color:#001f3f;">${data.experience}</td></tr>
                  <tr><td style="padding:5px 0;color:#6b7a90;">Notice Period</td><td style="padding:5px 0;color:#001f3f;">${data.noticePeriod}</td></tr>
                  <tr><td style="padding:5px 0;color:#6b7a90;">Found via</td><td style="padding:5px 0;color:#001f3f;">${data.source}</td></tr>
                  <tr><td style="padding:5px 0;color:#6b7a90;">Resume</td><td style="padding:5px 0;"><a href="${data.resumeLink}" style="color:#1e90ff;">View Resume →</a></td></tr>
                </table>
              </div>
              <div style="background:#ffffff;border-radius:10px;padding:24px;border:1px solid #e2e8f0;">
                <h2 style="color:#001f3f;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;padding-bottom:10px;border-bottom:1px solid #f0f5fc;">Cover Note</h2>
                <p style="line-height:1.75;color:#334155;font-size:14px;margin:0;">${data.coverNote.replace(/\n/g, '<br>')}</p>
              </div>
              <p style="color:#94a3b8;font-size:11px;margin-top:16px;text-align:center;">Review this in your admin panel at /admin/careers</p>
            </div>
          `,
        });
      } catch {
        // Email failure should not block the submission
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', message: error.issues.map((i) => i.message).join(', ') });
      }
      return res.status(500).json({ error: 'Failed to submit application. Please try again later.' });
    }
  }

  // ── PATCH (admin: update status) ────────────────────────────
  if (req.method === 'PATCH') {
    if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.query;
    const { status } = req.body;
    if (!id || !status) return res.status(400).json({ error: 'id and status required' });
    const validStatuses = ['new', 'reviewed', 'shortlisted', 'rejected'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const updated = await updateApplicationStatus(id as string, status as ApplicationStatus);
    if (!updated) return res.status(404).json({ error: 'Application not found' });
    return res.status(200).json(updated);
  }

  // ── DELETE (admin: remove application) ──────────────────────
  if (req.method === 'DELETE') {
    if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });
    const result = await deleteApplication(id as string);
    if (!result.deleted) return res.status(404).json({ error: 'Application not found' });
    if (result.resumeLink?.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', result.resumeLink);
      try { fs.unlinkSync(filePath); } catch {}
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
