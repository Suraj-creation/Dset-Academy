import pg from 'pg';
const { Pool } = pg;

const NEON_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_kmPt7sEgLS8D@ep-fragrant-wildflower-b3sk3elb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString: NEON_URL, ssl: { rejectUnauthorized: false } });

async function createViews() {
  const client = await pool.connect();
  try {
    console.log('Connecting to Neon to create/update export views...');

    // 1. Academy Registrations Export View
    await client.query(`
      CREATE OR REPLACE VIEW view_export_registrations AS
      SELECT 
        r.id AS "Registration ID",
        r.programme_slug AS "Programme Slug",
        r.programme_title AS "Programme Title",
        r.full_name AS "Full Name",
        r.email AS "Email",
        r.mobile AS "Mobile",
        r.role AS "Role",
        COALESCE(r.institution, '') AS "Institution",
        COALESCE(r.location, '') AS "Location",
        COALESCE(r.country, '') AS "Country",
        COALESCE(r.batch, '') AS "Batch",
        COALESCE(r.department, '') AS "Department",
        COALESCE(r.course_name, '') AS "Course Name",
        COALESCE(r.current_year, '') AS "Current Year",
        COALESCE(r.subject_specialization, '') AS "Specialization",
        COALESCE(r.company_name, '') AS "Company Name",
        COALESCE(r.company_type, '') AS "Company Type",
        COALESCE(r.other_profession_detail, '') AS "Other Profession Detail",
        ROUND((r.base_amount / 100.0)::numeric, 2) AS "Base Amount (INR)",
        ROUND((r.gst_amount / 100.0)::numeric, 2) AS "GST Amount (INR)",
        ROUND((r.total_amount / 100.0)::numeric, 2) AS "Total Amount (INR)",
        r.currency AS "Currency",
        r.payment_status AS "Payment Status",
        r.enrollment_status AS "Enrollment Status",
        COALESCE(r.razorpay_order_id, '') AS "Razorpay Order ID",
        COALESCE(r.razorpay_payment_id, '') AS "Razorpay Payment ID",
        COALESCE(r.payment_method, '') AS "Payment Method",
        COALESCE(r.failure_reason, '') AS "Failure Reason",
        r.paid_at AS "Paid At",
        r.created_at AS "Created At"
      FROM academy_registrations r
      ORDER BY r.created_at DESC;
    `);
    console.log('✅ view_export_registrations created.');

    // 2. Academy Payments & Settlement Export View
    await client.query(`
      CREATE OR REPLACE VIEW view_export_payments AS
      SELECT 
        r.id AS "Registration ID",
        r.full_name AS "Full Name",
        r.email AS "Email",
        r.mobile AS "Mobile",
        r.programme_title AS "Programme",
        COALESCE(r.razorpay_order_id, '') AS "Razorpay Order ID",
        COALESCE(r.razorpay_payment_id, '') AS "Razorpay Payment ID",
        r.payment_status AS "Payment Status",
        ROUND((r.total_amount / 100.0)::numeric, 2) AS "Order Amount (INR)",
        ROUND((COALESCE(r.amount_captured, CASE WHEN r.payment_status = 'paid' THEN r.total_amount ELSE 0 END) / 100.0)::numeric, 2) AS "Amount Captured (INR)",
        ROUND((COALESCE(r.razorpay_fee, 0) / 100.0)::numeric, 2) AS "Razorpay Fee (INR)",
        ROUND((COALESCE(r.razorpay_tax, 0) / 100.0)::numeric, 2) AS "Razorpay GST on Fee (INR)",
        ROUND(((COALESCE(r.amount_captured, CASE WHEN r.payment_status = 'paid' THEN r.total_amount ELSE 0 END) - COALESCE(r.razorpay_fee, 0) - COALESCE(r.razorpay_tax, 0)) / 100.0)::numeric, 2) AS "Net Settlement (INR)",
        COALESCE(r.payment_method, '') AS "Payment Method",
        COALESCE(r.payer_email, r.email) AS "Payer Email",
        COALESCE(r.payer_contact, r.mobile) AS "Payer Contact",
        r.amount_mismatch AS "Amount Mismatch",
        r.paid_at AS "Paid At",
        r.created_at AS "Created At"
      FROM academy_registrations r
      WHERE r.razorpay_payment_id IS NOT NULL OR r.payment_status = 'paid'
      ORDER BY r.paid_at DESC NULLS LAST, r.created_at DESC;
    `);
    console.log('✅ view_export_payments created.');

    // 3. Life Sciences Enquiries Export View
    await client.query(`
      CREATE OR REPLACE VIEW view_export_lifesciences AS
      SELECT 
        pe.id AS "Enquiry ID",
        pe."programId" AS "Program ID",
        pe.name AS "Name",
        pe.email AS "Email",
        COALESCE(pe.phone, '') AS "Phone",
        COALESCE(pe.organization, '') AS "Organization",
        pe.message AS "Message",
        pe.status::text AS "Status",
        COALESCE(pe.source, 'DIRECT') AS "Source",
        COALESCE(pe.external_system, '') AS "External System",
        COALESCE(pe.external_reference, '') AS "External Reference",
        COALESCE(pe.location, '') AS "Location",
        COALESCE(pe.country, '') AS "Country",
        COALESCE(pe.role, '') AS "Role",
        COALESCE(pe.department, '') AS "Department",
        COALESCE(pe.course_name, '') AS "Course Name",
        COALESCE(pe.current_year, '') AS "Current Year",
        COALESCE(pe.subject_specialization, '') AS "Specialization",
        COALESCE(pe.company_name, '') AS "Company Name",
        COALESCE(pe.company_type, '') AS "Company Type",
        pe."createdAt" AS "Created At"
      FROM program_enquiry pe
      ORDER BY pe."createdAt" DESC;
    `);
    console.log('✅ view_export_lifesciences created.');

    // 4. Unified Enquiries and Registrations Export View
    await client.query(`
      CREATE OR REPLACE VIEW view_export_unified AS
      SELECT 
        'DSET_PAID_REGISTRATION' AS "Record Type",
        r.id AS "Reference ID",
        'DSeT Academy' AS "Source Portal",
        r.full_name AS "Name",
        r.email AS "Email",
        r.mobile AS "Contact Number",
        r.programme_title AS "Program / Interest",
        r.role AS "Role",
        COALESCE(r.institution, r.company_name, '') AS "Institution or Organization",
        COALESCE(r.location, '') AS "Location",
        r.payment_status AS "Lifecycle Status",
        ROUND((r.total_amount / 100.0)::numeric, 2) AS "Amount (INR)",
        COALESCE(r.razorpay_payment_id, r.razorpay_order_id, '') AS "Transaction / Order ID",
        r.created_at AS "Created At"
      FROM academy_registrations r
      
      UNION ALL
      
      SELECT 
        'DSET_INTEREST' AS "Record Type",
        ir.id AS "Reference ID",
        'DSeT Academy Interest' AS "Source Portal",
        ir.full_name AS "Name",
        ir.email AS "Email",
        ir.mobile AS "Contact Number",
        ir.programme_title AS "Program / Interest",
        ir.role AS "Role",
        COALESCE(ir.institution, ir.company_name, '') AS "Institution or Organization",
        COALESCE(ir.location, '') AS "Location",
        CASE WHEN ir.contacted THEN 'CONTACTED' ELSE 'NEW' END AS "Lifecycle Status",
        0.00 AS "Amount (INR)",
        '' AS "Transaction / Order ID",
        ir.created_at AS "Created At"
      FROM academy_interest_registrations ir
      
      UNION ALL
      
      SELECT 
        'LIFESCIENCES_ENQUIRY' AS "Record Type",
        pe.id AS "Reference ID",
        CASE 
          WHEN pe.external_system = 'DSET_ACADEMY' THEN 'Life Sciences (via DSeT)' 
          ELSE 'Life Sciences SLSSDTR' 
        END AS "Source Portal",
        pe.name AS "Name",
        pe.email AS "Email",
        COALESCE(pe.phone, '') AS "Contact Number",
        pe."programId" AS "Program / Interest",
        COALESCE(pe.role, '') AS "Role",
        COALESCE(pe.organization, pe.company_name, '') AS "Institution or Organization",
        COALESCE(pe.location, '') AS "Location",
        pe.status::text AS "Lifecycle Status",
        0.00 AS "Amount (INR)",
        COALESCE(pe.external_reference, '') AS "Transaction / Order ID",
        pe."createdAt" AS "Created At"
      FROM program_enquiry pe
      
      ORDER BY "Created At" DESC;
    `);
    console.log('✅ view_export_unified created.');

    console.log('All views created successfully in Neon PostgreSQL!');
  } finally {
    client.release();
    await pool.end();
  }
}

createViews().catch(err => {
  console.error('Error creating export views:', err);
  process.exit(1);
});
