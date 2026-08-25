import { execFileSync } from 'child_process';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const get = (key) => {
  const m = env.match(new RegExp(`^${key}=(.*)$`, 'm'));
  if (!m) return '';
  let v = m[1].replace(/\r$/, '');
  v = v.replace(/^"|"$/g, ''); // strip only the outer quote chars, keep internal \n literal
  return v;
};

const settings = [
  `GOOGLE_SHEETS_SYNC_ENABLED=${get('GOOGLE_SHEETS_SYNC_ENABLED')}`,
  `GOOGLE_SHEETS_CLIENT_EMAIL=${get('GOOGLE_SHEETS_CLIENT_EMAIL')}`,
  `GOOGLE_SHEETS_PRIVATE_KEY=${get('GOOGLE_SHEETS_PRIVATE_KEY')}`,
  `GOOGLE_SHEETS_SPREADSHEET_ID=${get('GOOGLE_SHEETS_SPREADSHEET_ID')}`,
  `GOOGLE_SHEETS_TAB_NAME=${get('GOOGLE_SHEETS_TAB_NAME')}`,
];

const azCmd = process.platform === 'win32' ? 'az.cmd' : 'az';

const out = execFileSync(azCmd, [
  'webapp', 'config', 'appsettings', 'set',
  '-n', 'dsetconsulting',
  '-g', 'dsetconsulting_group',
  '--settings', ...settings,
  '--query', "[?starts_with(name, 'GOOGLE_SHEETS')].name",
  '-o', 'tsv',
], { encoding: 'utf8' });

console.log('Applied. Confirmed settings now present:');
console.log(out);
