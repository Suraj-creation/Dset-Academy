import nodemailer from 'nodemailer';

export async function sendMail({ to, subject, html, replyTo, attachments }: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; path: string }[];
}) {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();

  if (emailUser && emailPass) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    return await transporter.sendMail({
      from: `DSeT Consulting <${emailUser}>`,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
      ...(attachments ? { attachments } : {}),
    });
  }

  // Dev / Test fallback when Gmail credentials are not configured in local environment
  console.warn(`[email] EMAIL_USER / EMAIL_PASS not set. Dispatching test email for ${to}...`);
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `DSeT Consulting <academy@dsetconsulting.com>`,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
      ...(attachments ? { attachments } : {}),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[email] Test email dispatched successfully! Preview URL: ${previewUrl}`);
    return info;
  } catch (err) {
    console.warn('[email] Ethereal fallback failed or offline:', (err as Error).message);
    return { messageId: `mock_${Date.now()}` };
  }
}
