const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const envFile = path.join(__dirname, '..', '.env.local');
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

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'migrations', 'add_blog_approval_workflow.sql'), 'utf-8');
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('Migration applied successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}
run().catch(err => { console.error('Migration failed:', err.message); process.exit(1); });
