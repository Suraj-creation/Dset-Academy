import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { isAdminRequest } from '@/lib/auth';
import { uploadBlob } from '@/lib/azure-blob';

export const config = { api: { bodyParser: false } };

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg':       'jpeg',
  'image/png':        'png',
  'image/webp':       'webp',
  'application/pdf':  'pdf',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });

  const type = (req.query.type as string) ?? 'image'; // 'pdf' | 'image'

  const tmpDir = path.join(process.cwd(), 'tmp');
  await fs.mkdir(tmpDir, { recursive: true });

  const form = formidable({
    uploadDir:   tmpDir,
    keepExtensions: true,
    maxFileSize:    20 * 1024 * 1024, // 20 MB for PDFs
    filter: (part) => {
      const mime = part.mimetype ?? '';
      return type === 'pdf' ? mime === 'application/pdf' : mime.startsWith('image/');
    },
  });

  try {
    const [, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file?.filepath) return res.status(400).json({ error: 'No file uploaded' });

    const mime     = file.mimetype ?? '';
    const ext      = ALLOWED_MIME[mime] ? `.${ALLOWED_MIME[mime]}` : path.extname(file.originalFilename ?? '.bin');
    const folder   = type === 'pdf' ? 'whitepapers/pdfs' : 'whitepapers/thumbnails';
    const blobName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
    const buffer   = await fs.readFile(file.filepath);

    const url = await uploadBlob(buffer, blobName, mime || 'application/octet-stream');
    await fs.unlink(file.filepath).catch(() => {});

    return res.status(200).json({ url });
  } catch (err) {
    console.error('[upload-whitepaper]', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
