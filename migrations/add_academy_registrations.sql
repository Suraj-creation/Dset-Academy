-- DSeT Academy — registration + Razorpay payment tables
-- Additive only: creates two new tables, touches no existing table.
-- Safe to re-run (IF NOT EXISTS everywhere).
--
-- MONEY: every amount column is an INTEGER in PAISE (₹1 = 100 paise), never a
-- float and never rupees. Razorpay's API is denominated in paise, so storing
-- paise keeps the DB, the API call and the reconciliation report on one unit
-- with no rounding step anywhere between them.

CREATE TABLE IF NOT EXISTS academy_registrations (
  id                   text PRIMARY KEY,

  -- Programme snapshot. The slug resolves against the server-side catalogue in
  -- src/lib/academyPrograms.ts; title/amounts are copied in at registration time
  -- so a later price or name change never rewrites what someone already paid.
  programme_slug       text NOT NULL,
  programme_title      text NOT NULL,

  -- Applicant
  full_name            text NOT NULL,
  email                text NOT NULL,
  mobile               text NOT NULL,
  role                 text NOT NULL,
  institution          text,
  consent              boolean NOT NULL DEFAULT false,

  -- Money, in paise. total_amount = base_amount + gst_amount and is the only
  -- figure ever sent to Razorpay.
  base_amount          integer NOT NULL,
  gst_amount           integer NOT NULL,
  total_amount         integer NOT NULL,
  currency             text NOT NULL DEFAULT 'INR',

  -- Razorpay handles. order_id is UNIQUE so a duplicate webhook or a double
  -- submit can never create a second registration for the same order.
  razorpay_order_id    text UNIQUE,
  razorpay_payment_id  text,
  razorpay_signature   text,

  -- created -> paid | failed ; refunded is terminal and set manually/by webhook
  payment_status       text NOT NULL DEFAULT 'created',
  -- pending -> confirmed (only ever set after a verified payment) | cancelled
  enrollment_status    text NOT NULL DEFAULT 'pending',

  failure_reason       text,
  paid_at              timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS academy_registrations_email_idx
  ON academy_registrations (email);
CREATE INDEX IF NOT EXISTS academy_registrations_created_at_idx
  ON academy_registrations (created_at DESC);
CREATE INDEX IF NOT EXISTS academy_registrations_payment_status_idx
  ON academy_registrations (payment_status);

-- Append-only audit trail. Every order creation, checkout verification and
-- webhook delivery lands here with its raw payload, so a payment can always be
-- reconciled against Razorpay even if the registration row was later edited.
CREATE TABLE IF NOT EXISTS academy_payment_events (
  id                   text PRIMARY KEY,
  registration_id      text,
  event_type           text NOT NULL,
  -- Razorpay's own event id (x-razorpay-event-id header). UNIQUE so a webhook
  -- redelivery is recorded once and processed once.
  razorpay_event_id    text UNIQUE,
  razorpay_order_id    text,
  razorpay_payment_id  text,
  status               text,
  amount               integer,
  payload              jsonb,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS academy_payment_events_registration_idx
  ON academy_payment_events (registration_id);
CREATE INDEX IF NOT EXISTS academy_payment_events_created_at_idx
  ON academy_payment_events (created_at DESC);
