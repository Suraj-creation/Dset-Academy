import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { uploadBlob } from '@/lib/azure-blob';

export const config = { api: { bodyParser: false } };

const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

function isPdf(filepath: string): boolean {
  try {
    const buf = Buffer.alloc(4);
    const fd  = fs.openSync(filepath, 'r');
    fs.readSync(fd, buf, 0, 4, 0);
    fs.closeSync(fd);
    return buf.equals(PDF_MAGIC);
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const tmpDir = path.join(process.cwd(), 'tmp');
  fs.mkdirSync(tmpDir, { recursive: true });

  const form = formidable({
    uploadDir: tmpDir,
    keepExtensions: false,
    maxFileSize: 5 * 1024 * 1024,
    filter: (part) => !!(part.mimetype && part.mimetype.includes('pdf')),
  });

  try {
    const [, files] = await form.parse(req);
    const file = Array.isArray(files.resume) ? files.resume[0] : files.resume;
    if (!file) return res.status(400).json({ error: 'No file received.' });

    if (!isPdf(file.filepath)) {
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ error: 'Invalid file. PDF only.' });
    }

    const blobName = `resumes/${crypto.randomBytes(12).toString('hex')}.pdf`;
    const buffer   = await fsPromises.readFile(file.filepath);
    const url      = await uploadBlob(buffer, blobName, 'application/pdf');
    await fsPromises.unlink(file.filepath).catch(() => {});
    return res.status(200).json({ url });
  } catch {
    return res.status(400).json({ error: 'Upload failed. PDF only, max 5 MB.' });
  }
}
