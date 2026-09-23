import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const AZURE_URL = 'postgresql://dsetadmin:DSeTC%40Liza2002@dsetconsulting-db.postgres.database.azure.com/dset_db?sslmode=require';
const NEON_URL = 'postgresql://neondb_owner:npg_kmPt7sEgLS8D@ep-fragrant-wildflower-b3sk3elb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const azurePool = new Pool({ connectionString: AZURE_URL, ssl: { rejectUnauthorized: false } });
const neonPool = new Pool({ connectionString: NEON_URL, ssl: { rejectUnauthorized: false } });

async function createTableLike(tableName, azureClient, neonClient) {
  const check = await neonClient.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  );
  if (check.rows.length > 0) {
    console.log(`Table ${tableName} already exists in Neon.`);
    return;
  }

  console.log(`Creating table ${tableName} on Neon from Azure schema...`);
  const colsRes = await azureClient.query(`
    SELECT column_name, data_type, udt_name, is_nullable, column_default, character_maximum_length
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position;
  `, [tableName]);

  if (colsRes.rows.length === 0) return;

  const pkRes = await azureClient.query(`
    SELECT kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = $1;
  `, [tableName]);

  const pkCols = pkRes.rows.map(r => `"${r.column_name}"`);

  const colDefs = colsRes.rows.map(c => {
    let type = c.data_type.toUpperCase();
    if (type === 'USER-DEFINED') type = c.udt_name;
    if (type === 'CHARACTER VARYING') {
      type = c.character_maximum_length ? `VARCHAR(${c.character_maximum_length})` : 'VARCHAR';
    }
    const nullable = c.is_nullable === 'NO' ? 'NOT NULL' : '';
    const def = c.column_default ? `DEFAULT ${c.column_default}` : '';
    return `"${c.column_name}" ${type} ${nullable} ${def}`.trim();
  });

  if (pkCols.length > 0) {
    colDefs.push(`PRIMARY KEY (${pkCols.join(', ')})`);
  }

  const ddl = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${colDefs.join(',\n  ')}\n);`;
  await neonClient.query(ddl);
  console.log(`✅ Created table ${tableName} on Neon.`);
}

async function main() {
  console.log('Connecting to Azure and Neon databases...');
  const azureClient = await azurePool.connect();
  const neonClient = await neonPool.connect();

  try {
    const azureTables = (await azureClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `)).rows.map(r => r.table_name);

    console.log(`Found ${azureTables.length} tables in Azure.`);

    // 1. Ensure all Azure tables exist on Neon
    console.log('\n--- 1. Ensuring all Azure tables exist on Neon ---');
    for (const t of azureTables) {
      await createTableLike(t, azureClient, neonClient);
    }

    // 2. Apply all migration scripts to ensure all columns exist
    console.log('\n--- 2. Applying all migrations to Neon ---');
    const migrations = [
      'add_lead_phone.sql',
      'add_lead_validation_columns.sql',
      'add_author_profiles.sql',
      'add_blog_contributors.sql',
      'add_ai_generated_declaration.sql',
      'add_blog_approval_workflow.sql',
      'add_zoho_integration.sql',
      'add_academy_registrations.sql',
      'add_academy_payment_detail.sql',
      'add_academy_interest.sql',
      'add_academy_interest_department.sql',
      'add_academy_registration_form_fields.sql',
    ];

    for (const m of migrations) {
      const mPath = path.join(ROOT, 'migrations', m);
      if (fs.existsSync(mPath)) {
        try {
          const sql = fs.readFileSync(mPath, 'utf-8');
          await neonClient.query(sql);
          console.log(`✅ ${m} applied.`);
        } catch (err) {
          console.warn(`Warning on ${m}: ${err.message}`);
        }
      }
    }

    // 3. Enhance program_enquiry on Neon with referral & professional fields
    console.log('\n--- 3. Enhancing program_enquiry in Neon ---');
    await neonClient.query(`
      ALTER TABLE program_enquiry
        ADD COLUMN IF NOT EXISTS source text DEFAULT 'DIRECT',
        ADD COLUMN IF NOT EXISTS external_system text,
        ADD COLUMN IF NOT EXISTS external_reference text,
        ADD COLUMN IF NOT EXISTS location text,
        ADD COLUMN IF NOT EXISTS country text,
        ADD COLUMN IF NOT EXISTS role text,
        ADD COLUMN IF NOT EXISTS department text,
        ADD COLUMN IF NOT EXISTS course_name text,
        ADD COLUMN IF NOT EXISTS current_year text,
        ADD COLUMN IF NOT EXISTS subject_specialization text,
        ADD COLUMN IF NOT EXISTS company_name text,
        ADD COLUMN IF NOT EXISTS company_type text,
        ADD COLUMN IF NOT EXISTS metadata jsonb;

      CREATE INDEX IF NOT EXISTS program_enquiry_external_ref_idx
        ON program_enquiry (external_system, external_reference);
    `);
    console.log('✅ program_enquiry enhanced with attribution and profile columns.');

    // 4. Data Migration: Copy data from Azure to Neon table by table
    console.log('\n--- 4. Migrating data from Azure to Neon ---');
    const orderedTables = [
      'contacts',
      'leads',
      'jobs',
      'authors',
      'blog_posts',
      'applications',
      'gallery_events',
      'app_settings',
      'whitepapers',
      'whitepaper_leads',
      'whatsapp_conversations',
      'whatsapp_messages',
      'zoho_oauth_tokens',
      'zoho_sync_queue',
      'zoho_sync_log',
      'academy_registrations',
      'academy_payment_events',
      'academy_interest_registrations',
    ];

    for (const table of orderedTables) {
      if (!azureTables.includes(table)) continue;

      const rows = (await azureClient.query(`SELECT * FROM "${table}"`)).rows;
      console.log(`Table ${table}: found ${rows.length} rows in Azure.`);
      if (rows.length === 0) continue;

      // Get columns in Neon table to intersect safely
      const neonColsRes = await neonClient.query(`
        SELECT column_name, data_type FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [table]);
      const neonColsMap = new Map(neonColsRes.rows.map(r => [r.column_name, r.data_type]));

      const sharedCols = Object.keys(rows[0]).filter(c => neonColsMap.has(c));
      const colList = sharedCols.map(c => `"${c}"`).join(', ');

      const pkRes = await neonClient.query(`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = $1;
      `, [table]);

      const pkCols = pkRes.rows.map(r => `"${r.column_name}"`);
      const onConflict = pkCols.length > 0 ? `ON CONFLICT (${pkCols.join(', ')}) DO NOTHING` : '';

      let migratedCount = 0;
      for (const row of rows) {
        const values = sharedCols.map(c => {
          const v = row[c];
          const dataType = neonColsMap.get(c);
          if (v !== null && (dataType === 'json' || dataType === 'jsonb' || typeof v === 'object') && !(v instanceof Date) && !Buffer.isBuffer(v)) {
            return JSON.stringify(v);
          }
          return v;
        });
        const placeholders = sharedCols.map((_, i) => `$${i + 1}`).join(', ');

        const insertSql = `
          INSERT INTO "${table}" (${colList})
          VALUES (${placeholders})
          ${onConflict}
        `;
        await neonClient.query(insertSql, values);
        migratedCount++;
      }
      console.log(`✅ Migrated ${migratedCount} rows into Neon for ${table}.`);
    }

    // 5. Final Row Count Verification on Neon
    console.log('\n--- 5. Neon Database Verification ---');
    const neonTables = (await neonClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `)).rows;

    for (const { table_name } of neonTables) {
      const count = (await neonClient.query(`SELECT count(*)::int as c FROM "${table_name}"`)).rows[0].c;
      console.log(`  - ${table_name}: ${count} rows`);
    }

  } finally {
    azureClient.release();
    neonClient.release();
    await azurePool.end();
    await neonPool.end();
  }
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
