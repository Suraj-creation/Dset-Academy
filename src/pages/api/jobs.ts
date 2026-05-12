import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdminRequest } from '@/lib/auth';
import { readJobs, getActiveJobs, getNextJobId, createJob, updateJob, deleteJob, JobWithStatus } from '@/lib/jobs.server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ── GET ─────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const includeAll = req.query.admin === 'true';
    const jobs = includeAll ? await readJobs() : await getActiveJobs();
    return res.status(200).json({ jobs });
  }

  // ── POST (admin: create job) ─────────────────────────────────
  if (req.method === 'POST') {
    if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
    const { title, department, location, type, level, color, description } = req.body;
    if (!title || !department || !location || !type || !level) {
      return res.status(400).json({ error: 'title, department, location, type, and level are required' });
    }
    const newJob: JobWithStatus = {
      id: await getNextJobId(),
      title,
      department,
      location,
      type,
      level,
      color: color || '#1e90ff',
      description: description || '',
      isActive: true,
    };
    const created = await createJob(newJob);
    return res.status(201).json(created);
  }

  // ── PUT (admin: update job) ──────────────────────────────────
  if (req.method === 'PUT') {
    if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id required' });
    const updated = await updateJob(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Job not found' });
    return res.status(200).json(updated);
  }

  // ── DELETE (admin: remove job) ───────────────────────────────
  if (req.method === 'DELETE') {
    if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id required' });
    const deleted = await deleteJob(id);
    if (!deleted) return res.status(404).json({ error: 'Job not found' });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
