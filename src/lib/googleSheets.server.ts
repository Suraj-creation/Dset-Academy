import { google } from '@googleapis/sheets';

// ── Google Sheets sync for Career Applications ────────────────────────────
// Every application submitted on the site is appended as a new row in a
// company Google Sheet, in addition to the existing DB save + email alert.
// Controlled by a kill switch (GOOGLE_SHEETS_SYNC_ENABLED) so this stays a
// silent no-op until the one-time Google Cloud / service-account setup is
// done and the credentials are filled into .env.local. See .env.example
// for the full setup checklist.

export interface ApplicationSheetRow {
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  portfolio?: string;
  experience: string;
  noticePeriod: string;
  source: string;
  resumeLink: string;
  coverNote: string;
}

const SHEET_HEADERS = [
  'Submitted At', 'Job Title', 'Name', 'Email', 'Phone',
  'LinkedIn', 'Portfolio', 'Experience', 'Notice Period',
  'Source', 'Resume Link', 'Cover Note',
];

const TAB_NAME = process.env.GOOGLE_SHEETS_TAB_NAME || 'Sheet1';

function isConfigured(): boolean {
  return (
    process.env.GOOGLE_SHEETS_SYNC_ENABLED === 'true' &&
    !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL &&
    !!process.env.GOOGLE_SHEETS_PRIVATE_KEY &&
    !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  );
}

function getSheetsClient() {
  // Private keys pasted into .env come with literal "\n" sequences — turn
  // them back into real newlines or the JWT signer rejects the key.
  const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

let headerEnsured = false;

async function ensureHeaderRow(sheets: ReturnType<typeof getSheetsClient>, spreadsheetId: string) {
  if (headerEnsured) return;
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${TAB_NAME}!A1:L1`,
  });
  const firstRow = existing.data.values?.[0];
  if (!firstRow || firstRow.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${TAB_NAME}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [SHEET_HEADERS] },
    });
  }
  headerEnsured = true;
}

/**
 * Appends one applicant as a new row in the company Google Sheet.
 * No-ops silently if the integration isn't configured yet (kill switch off
 * or credentials missing) — callers should treat this as best-effort, the
 * same way the notification email failure doesn't block a submission.
 */
export async function appendApplicationToSheet(data: ApplicationSheetRow): Promise<void> {
  if (!isConfigured()) {
    // Was silent before — made this loud on purpose. A misconfigured/stale env
    // (e.g. a dev server started before credentials were added) looked
    // identical to "everything worked" from the outside, which cost real
    // debugging time. Better to say clearly why the sheet wasn't touched.
    console.warn('[googleSheets] Skipped — sync not configured (check GOOGLE_SHEETS_SYNC_ENABLED / credentials in .env.local, and restart the dev server if they were just added).');
    return;
  }

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
  const sheets = getSheetsClient();

  await ensureHeaderRow(sheets, spreadsheetId);

  const submittedAt = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${TAB_NAME}!A:L`,
    // RAW (not USER_ENTERED) — keeps every value as plain text. USER_ENTERED
    // parses cells the way a human typing them would, so a phone number like
    // "+91 98765 43210" gets read as a formula (leading "+") and shows #ERROR!.
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[
        submittedAt,
        data.jobTitle,
        data.name,
        data.email,
        data.phone,
        data.linkedin ?? '',
        data.portfolio ?? '',
        data.experience,
        data.noticePeriod,
        data.source,
        data.resumeLink,
        data.coverNote,
      ]],
    },
  });
}
