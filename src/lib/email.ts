import nodemailer from 'nodemailer';

export async function sendMail({ to, subject, html, replyTo, attachments }: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; path: string }[];
}) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const fromEmail = process.env.CONTACT_EMAIL || 'contact@dsetconsulting.com';

  await transporter.sendMail({
    from: `DSeT Consulting <${fromEmail}>`,
    replyTo: replyTo || fromEmail,
    to,
    subject,
    html,
    ...(attachments ? { attachments } : {}),
  });
}
