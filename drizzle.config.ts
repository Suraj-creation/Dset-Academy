import { defineConfig } from 'drizzle-kit';
import fs from 'fs';

// Load .env.local (Next.js dev env file)
if (fs.existsSync('.env.local')) {
  const lines = fs.readFileSync('.env.local', 'utf-8').split('\n');
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

export default defineConfig({
  schema:  './src/lib/schema.ts',
  out:     './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
