import pg from 'pg';
import crypto from 'crypto';

const NEON_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_kmPt7sEgLS8D@ep-fragrant-wildflower-b3sk3elb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const pool = new pg.Pool({ connectionString: NEON_URL, ssl: { rejectUnauthorized: false } });

async function createCommerceTables() {
  const client = await pool.connect();
  try {
    console.log('Connecting to Neon PostgreSQL to initialize normalized commerce schema...');

    // 1. Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id text PRIMARY KEY,
        registration_id text REFERENCES academy_registrations(id) ON DELETE SET NULL,
        user_id text REFERENCES "user"(id) ON DELETE SET NULL,
        programme_slug text NOT NULL,
        programme_title text NOT NULL,
        provider text NOT NULL DEFAULT 'RAZORPAY',
        provider_account text NOT NULL DEFAULT 'DSET',
        provider_order_id text UNIQUE,
        amount integer NOT NULL,
        currency text NOT NULL DEFAULT 'INR',
        receipt text,
        status text NOT NULL DEFAULT 'created',
        attempts integer NOT NULL DEFAULT 0,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_orders_reg_id ON orders(registration_id);
      CREATE INDEX IF NOT EXISTS idx_orders_provider_order ON orders(provider, provider_order_id);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    `);
    console.log('✅ orders table created with indexes.');

    // 2. Payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id text PRIMARY KEY,
        order_id text REFERENCES orders(id) ON DELETE CASCADE,
        registration_id text REFERENCES academy_registrations(id) ON DELETE SET NULL,
        provider text NOT NULL DEFAULT 'RAZORPAY',
        provider_account text NOT NULL DEFAULT 'DSET',
        provider_payment_id text UNIQUE,
        amount integer NOT NULL,
        currency text NOT NULL DEFAULT 'INR',
        status text NOT NULL,
        method text,
        captured boolean NOT NULL DEFAULT false,
        fee integer,
        tax integer,
        net_settlement integer,
        payer_email text,
        payer_contact text,
        error_code text,
        error_description text,
        amount_mismatch boolean NOT NULL DEFAULT false,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
      CREATE INDEX IF NOT EXISTS idx_payments_reg_id ON payments(registration_id);
      CREATE INDEX IF NOT EXISTS idx_payments_provider_pay_id ON payments(provider, provider_payment_id);
    `);
    console.log('✅ payments table created with indexes.');

    // 3. Backfill from existing academy_registrations
    console.log('Backfilling historical records from academy_registrations...');
    const regRows = (await client.query(`
      SELECT * FROM academy_registrations WHERE razorpay_order_id IS NOT NULL;
    `)).rows;

    console.log(`Found ${regRows.length} registrations with Razorpay order IDs.`);

    let ordersInserted = 0;
    let paymentsInserted = 0;

    for (const r of regRows) {
      const orderId = 'order_' + r.id;
      
      // Upsert order
      const orderRes = await client.query(`
        INSERT INTO orders (
          id, registration_id, programme_slug, programme_title, provider, provider_account,
          provider_order_id, amount, currency, status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, 'RAZORPAY', 'DSET', $5, $6, $7, $8, $9, $10
        )
        ON CONFLICT (provider_order_id) DO UPDATE SET
          registration_id = EXCLUDED.registration_id,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at
        RETURNING id;
      `, [
        orderId,
        r.id,
        r.programme_slug,
        r.programme_title,
        r.razorpay_order_id,
        r.total_amount,
        r.currency || 'INR',
        r.payment_status === 'paid' ? 'paid' : r.payment_status,
        r.created_at,
        r.updated_at,
      ]);
      ordersInserted++;

      // If there's a payment ID or paid status, insert payment record
      if (r.razorpay_payment_id || r.payment_status === 'paid') {
        const paymentId = 'pay_' + (r.razorpay_payment_id || r.id);
        const fee = r.razorpay_fee || 0;
        const tax = r.razorpay_tax || 0;
        const capturedAmount = r.amount_captured || (r.payment_status === 'paid' ? r.total_amount : 0);
        const netSettlement = capturedAmount > 0 ? (capturedAmount - fee - tax) : 0;

        await client.query(`
          INSERT INTO payments (
            id, order_id, registration_id, provider, provider_account, provider_payment_id,
            amount, currency, status, method, captured, fee, tax, net_settlement,
            payer_email, payer_contact, amount_mismatch, created_at, updated_at
          ) VALUES (
            $1, $2, $3, 'RAZORPAY', 'DSET', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
          )
          ON CONFLICT (provider_payment_id) DO UPDATE SET
            status = EXCLUDED.status,
            captured = EXCLUDED.captured,
            fee = EXCLUDED.fee,
            tax = EXCLUDED.tax,
            net_settlement = EXCLUDED.net_settlement,
            updated_at = EXCLUDED.updated_at;
        `, [
          paymentId,
          orderId,
          r.id,
          r.razorpay_payment_id || ('manual_' + r.id),
          r.total_amount,
          r.currency || 'INR',
          r.payment_status,
          r.payment_method,
          r.payment_status === 'paid',
          fee,
          tax,
          netSettlement,
          r.payer_email || r.email,
          r.payer_contact || r.mobile,
          r.amount_mismatch || false,
          r.paid_at || r.created_at,
          r.updated_at,
        ]);
        paymentsInserted++;
      }
    }

    console.log(`✅ Backfilled ${ordersInserted} orders and ${paymentsInserted} payments.`);

    // 4. Update view_export_payments to take advantage of normalized payments table if available
    await client.query(`DROP VIEW IF EXISTS view_export_payments;`);
    await client.query(`
      CREATE VIEW view_export_payments AS
      SELECT 
        r.id AS "Registration ID",
        r.full_name AS "Full Name",
        r.email AS "Email",
        r.mobile AS "Mobile",
        r.programme_title AS "Programme",
        COALESCE(o.provider_account, 'DSET') AS "Provider Account",
        COALESCE(r.razorpay_order_id, o.provider_order_id, '') AS "Razorpay Order ID",
        COALESCE(r.razorpay_payment_id, p.provider_payment_id, '') AS "Razorpay Payment ID",
        r.payment_status AS "Payment Status",
        ROUND((r.total_amount / 100.0)::numeric, 2) AS "Order Amount (INR)",
        ROUND((COALESCE(p.amount, r.amount_captured, CASE WHEN r.payment_status = 'paid' THEN r.total_amount ELSE 0 END) / 100.0)::numeric, 2) AS "Amount Captured (INR)",
        ROUND((COALESCE(p.fee, r.razorpay_fee, 0) / 100.0)::numeric, 2) AS "Razorpay Fee (INR)",
        ROUND((COALESCE(p.tax, r.razorpay_tax, 0) / 100.0)::numeric, 2) AS "Razorpay GST on Fee (INR)",
        ROUND(((COALESCE(p.amount, r.amount_captured, CASE WHEN r.payment_status = 'paid' THEN r.total_amount ELSE 0 END) - COALESCE(p.fee, r.razorpay_fee, 0) - COALESCE(p.tax, r.razorpay_tax, 0)) / 100.0)::numeric, 2) AS "Net Settlement (INR)",
        COALESCE(p.method, r.payment_method, '') AS "Payment Method",
        COALESCE(p.payer_email, r.payer_email, r.email) AS "Payer Email",
        COALESCE(p.payer_contact, r.payer_contact, r.mobile) AS "Payer Contact",
        COALESCE(p.amount_mismatch, r.amount_mismatch, false) AS "Amount Mismatch",
        r.paid_at AS "Paid At",
        r.created_at AS "Created At"
      FROM academy_registrations r
      LEFT JOIN orders o ON o.registration_id = r.id
      LEFT JOIN payments p ON p.order_id = o.id
      WHERE r.razorpay_payment_id IS NOT NULL OR r.payment_status = 'paid' OR p.id IS NOT NULL
      ORDER BY r.paid_at DESC NULLS LAST, r.created_at DESC;
    `);
    console.log('✅ view_export_payments updated with normalized order/payment join.');

  } finally {
    client.release();
    await pool.end();
  }
}

createCommerceTables().catch(err => {
  console.error('Failed to initialize commerce schema:', err);
  process.exit(1);
});
