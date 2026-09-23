import pg from 'pg';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

const NEON_URL = 'postgresql://neondb_owner:npg_kmPt7sEgLS8D@ep-fragrant-wildflower-b3sk3elb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const pool = new pg.Pool({ connectionString: NEON_URL, ssl: { rejectUnauthorized: false } });

async function runTests() {
  console.log('=== STARTING END-TO-END INTEGRATION TEST ===\n');

  // 1. Verify SQL Views in Neon
  console.log('--- 1. Testing SQL Views in Neon ---');
  const views = [
    'view_export_registrations',
    'view_export_payments',
    'view_export_lifesciences',
    'view_export_unified',
  ];

  for (const v of views) {
    const res = await pool.query(`SELECT count(*)::int as c FROM ${v}`);
    console.log(`✅ View ${v} is queryable. Rows: ${res.rows[0].c}`);
  }

  // 2. Test Referral Insertion into program_enquiry
  console.log('\n--- 2. Testing Life Sciences Referral Insertion ---');
  const testId = 'test-referral-' + Date.now();
  const testInsert = await pool.query(`
    INSERT INTO program_enquiry (
      id,
      "programId",
      name,
      email,
      phone,
      organization,
      message,
      status,
      "createdAt",
      "updatedAt",
      source,
      external_system,
      external_reference,
      location,
      country,
      role,
      department
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, 'NEW', now(), now(), $8, $9, $10, $11, $12, $13, $14
    )
    RETURNING *;
  `, [
    testId,
    'ai-mastery-life-science-healthcare',
    'Dr. Test Applicant',
    'test.applicant@example.com',
    '+919876543210',
    'BioTech Innovations Ltd',
    'Referral via DSeT Academy test script',
    'DSET_ACADEMY',
    'DSET_ACADEMY',
    'reg-test-12345',
    'Bhubaneswar',
    'India',
    'Professional',
    'Clinical Research',
  ]);
  console.log('✅ Inserted test referral into program_enquiry:', testInsert.rows[0].id);

  // 3. Verify the referral appears in view_export_lifesciences and view_export_unified
  console.log('\n--- 3. Verifying Referral in Export Views ---');
  const lifeCheck = await pool.query(`SELECT * FROM view_export_lifesciences WHERE "Enquiry ID" = $1`, [testId]);
  if (lifeCheck.rows.length === 1) {
    console.log('✅ view_export_lifesciences captured the new referral with source:', lifeCheck.rows[0]['Source']);
  } else {
    throw new Error('Referral missing from view_export_lifesciences');
  }

  const unifiedCheck = await pool.query(`SELECT * FROM view_export_unified WHERE "Reference ID" = $1`, [testId]);
  if (unifiedCheck.rows.length === 1) {
    console.log('✅ view_export_unified captured the referral under Portal:', unifiedCheck.rows[0]['Source Portal']);
  } else {
    throw new Error('Referral missing from view_export_unified');
  }

  // 4. Test Excel Workbook generation with ExcelJS
  console.log('\n--- 4. Testing Excel Workbook (.xlsx) Generation ---');
  const wb = new ExcelJS.Workbook();
  const [unifiedRes, regRes, payRes, lifeRes] = await Promise.all([
    pool.query('SELECT * FROM view_export_unified;'),
    pool.query('SELECT * FROM view_export_registrations;'),
    pool.query('SELECT * FROM view_export_payments;'),
    pool.query('SELECT * FROM view_export_lifesciences;'),
  ]);

  const s1 = wb.addWorksheet('Unified Overview');
  s1.addRow(Object.keys(unifiedRes.rows[0] || { empty: 1 }));
  unifiedRes.rows.forEach(r => s1.addRow(Object.values(r)));

  const s2 = wb.addWorksheet('Registrations');
  s2.addRow(Object.keys(regRes.rows[0] || { empty: 1 }));
  regRes.rows.forEach(r => s2.addRow(Object.values(r)));

  const s3 = wb.addWorksheet('Payments');
  s3.addRow(Object.keys(payRes.rows[0] || { empty: 1 }));
  payRes.rows.forEach(r => s3.addRow(Object.values(r)));

  const s4 = wb.addWorksheet('Life Sciences');
  s4.addRow(Object.keys(lifeRes.rows[0] || { empty: 1 }));
  lifeRes.rows.forEach(r => s4.addRow(Object.values(r)));

  const buffer = await wb.xlsx.writeBuffer();
  console.log(`✅ Multi-sheet Excel workbook created successfully (${buffer.byteLength} bytes).`);

  // 5. Clean up test record from Neon
  console.log('\n--- 5. Cleaning up Test Data ---');
  await pool.query(`DELETE FROM program_enquiry WHERE id = $1`, [testId]);
  console.log('✅ Test record safely cleaned up.');

  await pool.end();
  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
