import pg from 'pg';
const { Pool } = pg;

const connStr = 'postgresql://neondb_owner:npg_kmPt7sEgLS8D@ep-fragrant-wildflower-b3sk3elb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({ connectionString: connStr, ssl: { rejectUnauthorized: false } });

async function main() {
  const client = await pool.connect();
  try {
    console.log('Connected to Neon PostgreSQL successfully.');

    // 1. List user tables
    const tablesRes = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name;
    `);
    console.log('\n--- TABLES ---');
    console.log(tablesRes.rows);

    // 2. For each table, get columns, constraints, and row count
    for (const t of tablesRes.rows) {
      const { table_schema, table_name } = t;
      const countRes = await client.query(`SELECT count(*)::int as c FROM "${table_schema}"."${table_name}"`);
      console.log(`\n========================================`);
      console.log(`Table: ${table_schema}.${table_name} (${countRes.rows[0].c} rows)`);
      console.log(`========================================`);

      const colsRes = await client.query(`
        SELECT column_name, data_type, udt_name, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position;
      `, [table_schema, table_name]);

      console.log('Columns:');
      for (const col of colsRes.rows) {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.udt_name}) | nullable: ${col.is_nullable} | default: ${col.column_default}`);
      }

      // Constraints & Foreign keys
      const constraintsRes = await client.query(`
        SELECT conname, contype, pg_get_constraintdef(c.oid) as def
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        JOIN pg_class cl ON cl.oid = c.conrelid
        WHERE n.nspname = $1 AND cl.relname = $2;
      `, [table_schema, table_name]);

      if (constraintsRes.rows.length > 0) {
        console.log('Constraints:');
        for (const con of constraintsRes.rows) {
          console.log(`  - ${con.conname} (${con.contype}): ${con.def}`);
        }
      }

      // Indexes
      const indexesRes = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = $1 AND tablename = $2;
      `, [table_schema, table_name]);

      if (indexesRes.rows.length > 0) {
        console.log('Indexes:');
        for (const idx of indexesRes.rows) {
          console.log(`  - ${idx.indexname}: ${idx.indexdef}`);
        }
      }
    }

    // 3. Custom enum types
    const enumsRes = await client.query(`
      SELECT t.typname, array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      GROUP BY t.typname;
    `);
    console.log('\n--- CUSTOM ENUMS ---');
    console.log(enumsRes.rows);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Error auditing Neon DB:', err);
  process.exit(1);
});
