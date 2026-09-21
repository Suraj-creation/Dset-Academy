-- Academy: payment detail captured from Razorpay at confirmation time.
-- Additive only — ADD COLUMN IF NOT EXISTS never touches existing data.
--
-- These come from the Razorpay Payments API (or the webhook payload), fetched
-- server-side after the signature check. The signature proves a message is
-- authentic; fetching the payment proves it was actually CAPTURED and for the
-- right amount. Both are required before an enrolment is confirmed.

ALTER TABLE academy_registrations
  -- card | upi | netbanking | wallet | emi …
  ADD COLUMN IF NOT EXISTS payment_method   text,
  -- What Razorpay reports as actually captured, in paise. Kept separate from
  -- total_amount (what we quoted) so a mismatch is visible rather than silently
  -- overwritten.
  ADD COLUMN IF NOT EXISTS amount_captured  integer,
  -- Razorpay's own deductions, in paise — needed to reconcile the bank settlement
  -- against the gross fee collected.
  ADD COLUMN IF NOT EXISTS razorpay_fee     integer,
  ADD COLUMN IF NOT EXISTS razorpay_tax     integer,
  -- Payer contact details as Razorpay recorded them (may differ from the form).
  ADD COLUMN IF NOT EXISTS payer_email      text,
  ADD COLUMN IF NOT EXISTS payer_contact    text,
  -- Set when Razorpay's reported amount differs from what we quoted.
  ADD COLUMN IF NOT EXISTS amount_mismatch  boolean NOT NULL DEFAULT false;
