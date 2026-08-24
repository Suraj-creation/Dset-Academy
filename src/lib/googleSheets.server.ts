import { createSign } from 'crypto';

// ── Google Sheets sync for Career Applications ────────────────────────────
// Every application submitted on the site is appended as a new row in a
// company Google Sheet, in addition to the existing DB save + email alert.
// Controlled by a kill switch (GOOGLE_SHEETS_SYNC_ENABLED) so this stays a
// silent no-op until the one-time Google Cloud / service-account setup is
// done and the credentials are filled into .env.local. See .env.example
// for the full setup checklist.
//
// Implementation uses Node.js built-in crypto + fetch (no googleapis package)
// to avoid the ~90 MB bundle that googleapis adds to the build.

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

// Cached token so we don't re-sign a JWT on every request.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) return cachedToken.value;

  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL!;
  // Private keys pasted into .env come with literal "\n" sequences — turn
  // them back into real newlines or the JWT signer rejects the key.
  const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');

  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss:   clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  })).toString('base64url');

  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(privateKey, 'base64url');

  const jwt = `${header}.${payload}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await res.json() as { access_token?: string; error?: string };
  if (!data.access_token) throw new Error(`[googleSheets] Token error: ${data.error ?? JSON.stringify(data)}`);

  cachedToken = { value: data.access_token, expiresAt: now + 3600 };
  return data.access_token;
}

let headerEnsured = false;

async function ensureHeaderRow(token: string, spreadsheetId: string): Promise<void> {
  if (headerEnsured) return;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${TAB_NAME}!A1:L1`)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json() as { values?: string[][] };

  const firstRow = data.values?.[0];
  if (!firstRow || firstRow.length === 0) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${TAB_NAME}!A1`)}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [SHEET_HEADERS] }),
      },
    );
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
    console.warn('[googleSheets] Skipped — sync not configured (check GOOGLE_SHEETS_SYNC_ENABLED / credentials in .env.local, and restart the dev server if they were just added).');
    return;
  }

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
  const token = await getAccessToken();

  await ensureHeaderRow(token, spreadsheetId);

  const submittedAt = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${TAB_NAME}!A:L`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

  const res = await fetch(appendUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    // RAW (not USER_ENTERED) — keeps every value as plain text. USER_ENTERED
    // parses cells the way a human typing them would, so a phone number like
    // "+91 98765 43210" gets read as a formula (leading "+") and shows #ERROR!.
    body: JSON.stringify({
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
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[googleSheets] Sheets API error ${res.status}: ${err}`);
  }
}
