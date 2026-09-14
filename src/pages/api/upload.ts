import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { uploadBlob } from '@/lib/azure-blob';
import { isAdminRequest } from '@/lib/auth';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });

  const tmpDir = path.join(process.cwd(), 'tmp');
  await fs.mkdir(tmpDir, { recursive: true });

  const form = formidable({
    uploadDir: tmpDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
    filter: (part) => !!(part.mimetype && part.mimetype.startsWith('image/')),
  });

  try {
    const [_fields, files] = await form.parse(req);
    void _fields;
    const file = Array.isArray(files.image) ? files.image[0] : files.image;
    if (!file?.filepath) return res.status(400).json({ error: 'No file uploaded' });

    const buffer   = await fs.readFile(file.filepath);
    const ext      = path.extname(file.originalFilename ?? '.jpg');
    const blobName = `blog/${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
    const mimeType = file.mimetype ?? 'image/jpeg';

    const url = await uploadBlob(buffer, blobName, mimeType);
    await fs.unlink(file.filepath).catch(() => {});
    return res.status(200).json({ url });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Error uploading file' });
  }
}
