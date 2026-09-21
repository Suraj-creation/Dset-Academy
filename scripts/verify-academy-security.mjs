/**
 * Safety net for the Academy payment path.
 *
 *   node scripts/verify-academy-security.mjs [baseUrl]     (default http://localhost:3000)
 *
 * Only exercises REJECTION paths — forged cookies, forged signatures, bad input.
 * It never completes a payment and never writes a row, so it is safe to run
 * against any environment including production.
 *
 * Every check here corresponds to a way real money or real personal data could
 * leak if the code regressed:
 *   - a forged admin cookie would expose every enrolment, email and phone number
 *   - a forged payment signature would hand out free cohort seats
 *   - a client-supplied amount would let someone pay ₹1 for a ₹60,180 programme
 */

const BASE = process.argv[2] ?? 'http://localhost:3000';

let pass = 0, fail = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
  ok ? pass++ : fail++;
};

const post = (path, body, headers = {}) => fetch(`${BASE}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

const ADMIN_ENDPOINTS = [
  '/api/admin/academy-registrations',
  '/api/contact',
  '/api/leads',
];

try {
  console.log(`\nChecking ${BASE}\n\n=== admin endpoints reject unauthenticated + forged sessions ===`);
  for (const path of ADMIN_ENDPOINTS) {
    let r = await fetch(`${BASE}${path}`);
    check(`${path} rejects anonymous`, r.status === 401, `got ${r.status}`);

    // The pre-hardening cookie. If this ever returns 200 again, every admin
    // endpoint is world-readable.
    r = await fetch(`${BASE}${path}`, { headers: { Cookie: 'dset_admin=1' } });
    check(`${path} rejects forged dset_admin=1`, r.status === 401, `got ${r.status}`);

    r = await fetch(`${BASE}${path}`, { headers: { Cookie: 'dset_session=abc.forged' } });
    check(`${path} rejects forged session signature`, r.status === 401, `got ${r.status}`);
  }

  console.log('\n=== payment signature verification ===');
  let r = await post('/api/academy/verify-payment', {
    razorpay_order_id: 'order_probe',
    razorpay_payment_id: 'pay_probe',
    razorpay_signature: 'forged',
  });
  check('checkout rejects a forged signature', r.status === 400, `got ${r.status}`);

  r = await fetch(`${BASE}/api/academy/razorpay-webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': 'forged' },
    body: JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'x', order_id: 'y' } } } }),
  });
  check('webhook rejects a forged signature', r.status === 400, `got ${r.status}`);

  r = await fetch(`${BASE}/api/academy/razorpay-webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'payment.captured' }),
  });
  check('webhook rejects a missing signature', r.status === 400, `got ${r.status}`);

  console.log('\n=== order input validation ===');
  const form = {
    programmeSlug: 'entrepreneur-mastery', fullName: 'Probe User',
    email: 'probe@example.com', mobile: '+919000000000',
    role: 'Entrepreneur / founder', consent: true,
  };
  // 429 is also a pass: this script burns through the per-IP rate limit on
  // purpose, and being rate limited is still a rejection. Only a 200 is a bug.
  for (const [name, body] of [
    ['unknown programme slug', { ...form, programmeSlug: 'free-seat' }],
    ['missing consent',        { ...form, consent: false }],
    ['invalid email',          { ...form, email: 'nope' }],
    ['blank name',             { ...form, fullName: '' }],
  ]) {
    const rr = await post('/api/academy/create-order', body);
    check(`create-order rejects ${name}`, rr.status === 400 || rr.status === 429,
      `got ${rr.status}${rr.status === 429 ? ' (rate limited)' : ''}`);
  }

  // A smuggled amount must not rescue an otherwise-invalid request. The positive case
  // (a valid request priced from the server catalogue, ignoring the client's amount) is
  // deliberately not tested here: it would create a real Razorpay order and a real DB row,
  // which would break this script's guarantee of being safe to run against production.
  const rr = await post('/api/academy/create-order', {
    ...form, programmeSlug: 'free-seat', amount: 100, totalAmount: 100,
  });
  check('a smuggled amount cannot buy an unlisted programme',
    rr.status === 400 || rr.status === 429, `got ${rr.status}`);

} catch (e) {
  console.error('\nHARNESS ERROR:', e.message);
  fail++;
}

console.log(`\n────────────\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
