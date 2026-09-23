import { pool } from './db';
import ExcelJS from 'exceljs';

export type ExportType = 'registrations' | 'payments' | 'lifesciences' | 'brochures' | 'unified';
export type ExportFormat = 'xlsx' | 'csv';

export interface Dataset {
  name: string;
  query: string;
}

const DATASETS: Record<ExportType, { filename: string; sheetName: string; query: string }> = {
  registrations: {
    filename: 'dset_academic_registrations',
    sheetName: 'Academic Registrations',
    query: 'SELECT * FROM view_export_registrations;',
  },
  payments: {
    filename: 'dset_razorpay_payments',
    sheetName: 'Razorpay Payments',
    query: 'SELECT * FROM view_export_payments;',
  },
  lifesciences: {
    filename: 'lifesciences_program_inquiries',
    sheetName: 'Life Sciences Inquiries',
    query: 'SELECT * FROM view_export_lifesciences;',
  },
  brochures: {
    filename: 'academy_brochure_downloads',
    sheetName: 'Brochure Downloads',
    query: 'SELECT * FROM view_export_brochure_downloads;',
  },
  unified: {
    filename: 'dset_unified_admissions_report',
    sheetName: 'Unified Overview',
    query: 'SELECT * FROM view_export_unified;',
  },
};

/** Convert 2D rows into RFC-4180 CSV string with UTF-8 BOM */
export function generateCsv(rows: Record<string, any>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  
  const escapeCell = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map(escapeCell).join(',');
  const dataRows = rows.map(r => headers.map(h => escapeCell(r[h])).join(','));
  
  // Include UTF-8 BOM so Microsoft Excel automatically recognizes UTF-8 encoding
  return '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
}

/** Professional styling for ExcelJS worksheets */
function formatWorksheet(worksheet: ExcelJS.Worksheet, rows: Record<string, any>[]) {
  if (rows.length === 0) {
    worksheet.addRow(['No records found']);
    return;
  }

  const headers = Object.keys(rows[0]);
  worksheet.columns = headers.map(header => {
    // Calculate max width based on header and row contents
    let maxLength = header.length;
    for (const row of rows.slice(0, 100)) {
      const val = row[header];
      if (val !== null && val !== undefined) {
        const len = String(val).length;
        if (len > maxLength) maxLength = Math.min(len, 60); // Cap at 60 chars
      }
    }
    return {
      header,
      key: header,
      width: Math.max(maxLength + 4, 12),
    };
  });

  // Add rows
  for (const row of rows) {
    const formattedRow: Record<string, any> = {};
    for (const h of headers) {
      let val = row[h];
      if (val instanceof Date) {
        val = val.toISOString().replace('T', ' ').slice(0, 19);
      }
      formattedRow[h] = val;
    }
    worksheet.addRow(formattedRow);
  }

  // Header row style (Navy background, bold white text)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell(cell => {
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E1B4B' }, // Dark navy
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  // Freeze top row
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Data rows styling
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.height = 22;
    const isEven = rowNumber % 2 === 0;

    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1] || '';
      const isAmount = header.toLowerCase().includes('amount') || 
                       header.toLowerCase().includes('(inr)') || 
                       header.toLowerCase().includes('fee') ||
                       header.toLowerCase().includes('tax') ||
                       header.toLowerCase().includes('settlement');

      cell.font = { name: 'Segoe UI', size: 10 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFF8FAFC' : 'FFFFFFFF' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      if (isAmount && typeof cell.value === 'number') {
        cell.numFmt = '₹#,##0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });
}

/** Generate Excel (.xlsx) file buffer */
export async function generateExcelBuffer(type: ExportType): Promise<{ buffer: Buffer; filename: string }> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DSeT Academy';
  workbook.created = new Date();

  const timestamp = new Date().toISOString().slice(0, 10);

  if (type === 'unified') {
    // Multi-tab comprehensive workbook
    const [unifiedRes, regRes, payRes, lifeRes, brochureRes] = await Promise.all([
      pool.query('SELECT * FROM view_export_unified;'),
      pool.query('SELECT * FROM view_export_registrations;'),
      pool.query('SELECT * FROM view_export_payments;'),
      pool.query('SELECT * FROM view_export_lifesciences;'),
      pool.query('SELECT * FROM view_export_brochure_downloads;'),
    ]);

    const sUnified = workbook.addWorksheet('Unified Overview');
    formatWorksheet(sUnified, unifiedRes.rows);

    const sReg = workbook.addWorksheet('Academic Registrations');
    formatWorksheet(sReg, regRes.rows);

    const sPay = workbook.addWorksheet('Razorpay Payments');
    formatWorksheet(sPay, payRes.rows);

    const sLife = workbook.addWorksheet('Life Sciences Inquiries');
    formatWorksheet(sLife, lifeRes.rows);

    const sBrochures = workbook.addWorksheet('Brochure Downloads');
    formatWorksheet(sBrochures, brochureRes.rows);

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      filename: `dset_unified_executive_report_${timestamp}.xlsx`,
    };
  }

  // Single sheet workbook
  const meta = DATASETS[type];
  const res = await pool.query(meta.query);
  const worksheet = workbook.addWorksheet(meta.sheetName);
  formatWorksheet(worksheet, res.rows);

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    filename: `${meta.filename}_${timestamp}.xlsx`,
  };
}

/** Generate CSV string and filename */
export async function generateCsvData(type: ExportType): Promise<{ csv: string; filename: string }> {
  const meta = DATASETS[type];
  const res = await pool.query(meta.query);
  const csv = generateCsv(res.rows);
  const timestamp = new Date().toISOString().slice(0, 10);
  return {
    csv,
    filename: `${meta.filename}_${timestamp}.csv`,
  };
}
