import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdminRequest } from '@/lib/auth';
import { generateExcelBuffer, generateCsvData, ExportType } from '@/lib/export.server';

const VALID_TYPES: ExportType[] = ['registrations', 'payments', 'lifesciences', 'unified'];

/**
 * Admin-only Data Export API
 * Route: /api/admin/export/[type]?format=xlsx|csv
 * Valid types: 'registrations', 'payments', 'lifesciences', 'unified'
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminRequest(req.cookies)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, format = 'xlsx' } = req.query;

  if (typeof type !== 'string' || !VALID_TYPES.includes(type as ExportType)) {
    return res.status(400).json({ error: `Invalid export type. Allowed: ${VALID_TYPES.join(', ')}` });
  }

  const exportType = type as ExportType;
  const exportFormat = String(format).toLowerCase();

  try {
    if (exportFormat === 'csv') {
      if (exportType === 'unified') {
        // Unified report is multi-entity, so default to unified overview CSV or XLSX recommendation
        const { csv, filename } = await generateCsvData('unified');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csv);
      }
      const { csv, filename } = await generateCsvData(exportType);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csv);
    }

    // Default to XLSX
    const { buffer, filename } = await generateExcelBuffer(exportType);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);

  } catch (err) {
    console.error(`[admin/export/${exportType}]`, (err as Error).message);
    return res.status(500).json({ error: 'Failed to generate export file' });
  }
}
