/**
 * Adds UNIQUE constraint on academy_payment_events.razorpay_event_id
 * so webhook redeliveries are silently ignored at the DB level (matching
 * the comment in razorpay-webhook.ts).
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8')
    .split('\n').filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const pool = new pg.Pool({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

console.log('Adding UNIQUE index on academy_payment_events.razorpay_event_id ...');

// Only add the index if it doesn't already exist
const { rows: existing } = await pool.query(`
  SELECT indexname FROM pg_indexes
  WHERE tablename = 'academy_payment_events'
  AND indexname = 'academy_payment_events_event_id_idx'
`);

if (existing.length > 0) {
  console.log('✅ Index already exists — nothing to do.');
} else {
  // Some rows may have NULL razorpay_event_id (events without a Razorpay event ID).
  // A partial UNIQUE index on non-null values ensures real event IDs are de-duped
  // while NULLs (internal events, logPaymentEvent calls) are allowed to repeat.
  await pool.query(`
    CREATE UNIQUE INDEX academy_payment_events_event_id_idx
    ON academy_payment_events (razorpay_event_id)
    WHERE razorpay_event_id IS NOT NULL
  `);
  console.log('✅ UNIQUE partial index created on razorpay_event_id (WHERE NOT NULL).');
}

// Verify
const { rows: indexes } = await pool.query(
  "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'academy_payment_events'"
);
console.log('\nAll indexes on academy_payment_events:');
for (const idx of indexes) {
  console.log(' •', idx.indexname);
  console.log('   ', idx.indexdef);
}

await pool.end();
console.log('\nDone.');
