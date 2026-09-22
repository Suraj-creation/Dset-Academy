import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

// Load .env.local
const envFile = path.join(ROOT, '.env.local');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not found in environment or .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('Connecting to PostgreSQL database...');
  const client = await pool.connect();

  try {
    // 1. Check existing row counts before migration
    const beforeReg = (await client.query('SELECT COUNT(*)::int as count FROM academy_registrations')).rows[0].count;
    const beforeInt = (await client.query('SELECT COUNT(*)::int as count FROM academy_interest_registrations')).rows[0].count;
    console.log(`Pre-migration row counts: academy_registrations=${beforeReg}, academy_interest_registrations=${beforeInt}`);

    // 2. Apply migrations/add_academy_interest_department.sql
    const mig1Path = path.join(ROOT, 'migrations', 'add_academy_interest_department.sql');
    console.log(`\nApplying ${mig1Path}...`);
    const sql1 = fs.readFileSync(mig1Path, 'utf-8');
    await client.query(sql1);
    console.log('✅ Applied add_academy_interest_department.sql successfully.');

    // 3. Apply migrations/add_academy_registration_form_fields.sql
    const mig2Path = path.join(ROOT, 'migrations', 'add_academy_registration_form_fields.sql');
    console.log(`\nApplying ${mig2Path}...`);
    const sql2 = fs.readFileSync(mig2Path, 'utf-8');
    await client.query(sql2);
    console.log('✅ Applied add_academy_registration_form_fields.sql successfully.');

    // 4. Verify columns in academy_registrations
    const regCols = (await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'academy_registrations'
      ORDER BY ordinal_position;
    `)).rows.map(r => r.column_name);

    console.log('\nUpdated academy_registrations columns:');
    console.log(regCols.join(', '));

    // 5. Verify columns in academy_interest_registrations
    const intCols = (await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'academy_interest_registrations'
      ORDER BY ordinal_position;
    `)).rows.map(r => r.column_name);

    console.log('\nUpdated academy_interest_registrations columns:');
    console.log(intCols.join(', '));

    // 6. Check row counts after migration
    const afterReg = (await client.query('SELECT COUNT(*)::int as count FROM academy_registrations')).rows[0].count;
    const afterInt = (await client.query('SELECT COUNT(*)::int as count FROM academy_interest_registrations')).rows[0].count;
    console.log(`\nPost-migration row counts: academy_registrations=${afterReg}, academy_interest_registrations=${afterInt}`);

    if (beforeReg === afterReg && beforeInt === afterInt) {
      console.log('✅ All existing data preserved intact!');
    } else {
      console.warn('⚠️ Row count mismatch detected!');
    }

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
