import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { academyBrochureEvents } from '@/lib/schema';
import { getProgram } from '@/lib/academyPrograms';
import { getAcademyUser } from '@/lib/academyAuth.server';

/**
 * The only way to read a brochure.
 *   GET /api/academy/brochure/<slug>             -> inline (the in-page viewer), open to everyone
 *   GET /api/academy/brochure/<slug>?download=1  -> attachment, Google sign-in required
 * Every download, and every view by a signed-in visitor, is recorded against their account.
 * The slug is looked up in the programme catalogue, so a request can never name a path.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'private, no-store');

  const program = getProgram(String(req.query.slug ?? ''));
  if (!program) return res.status(404).json({ error: 'Brochure not found' });

  const download = req.query.download === '1';
  const user = await getAcademyUser(req.cookies);
  if (download && !user) return res.status(401).json({ error: 'Sign in with Google to download this brochure.' });

  const filePath = path.join(process.cwd(), program.brochurePath);
  if (!fs.existsSync(filePath)) {
    console.error('[academy/brochure] missing file', filePath);
    return res.status(404).json({ error: 'Brochure not found' });
  }

  // Logged before streaming, and awaited: a download that was served is a download that was recorded.
  // Anonymous views have no identity to record, so they are served without a row.
  if (user) await db.insert(academyBrochureEvents).values({
    id: `abev_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    userId: user.id,
    programmeSlug: program.slug,
    programmeTitle: program.title,
    action: download ? 'download' : 'view',
    ip: String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '').split(',')[0].trim() || null,
    userAgent: req.headers['user-agent']?.slice(0, 500) ?? null,
    referrer: req.headers.referer?.slice(0, 500) ?? null,
  });

  const filename = path.basename(program.brochurePath);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', fs.statSync(filePath).size);
  res.setHeader('Content-Disposition', `${download ? 'attachment' : 'inline'}; filename="${filename}"`);
  fs.createReadStream(filePath).pipe(res);
}
