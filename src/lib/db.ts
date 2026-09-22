import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

declare global {
  var _pgPool: Pool | undefined;
}

const pool = globalThis._pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

if (process.env.NODE_ENV !== 'production') {
  globalThis._pgPool = pool;
}

export const db = drizzle(pool, { schema });
// Exported for call sites that need a dedicated connection (e.g. session-level advisory
// locks in src/lib/zoho/queue.server.ts) rather than a query through the shared drizzle instance.
export { pool };
