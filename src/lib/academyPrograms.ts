/**
 * DSeT Academy programme catalogue — the ONLY source of truth for what a cohort costs.
 *
 * SECURITY: the browser never sends an amount. It sends a `slug`, and the server
 * resolves the price from this table before creating the Razorpay order. If the
 * client were trusted with the amount, anyone could pay ₹1 for a ₹60,180 cohort by
 * editing the request in devtools.
 *
 * MONEY: all amounts are integers in PAISE (₹1 = 100 paise). Razorpay's API is
 * denominated in paise, so there is no float and no rounding step anywhere between
 * this table, the charge, and the row written to Postgres.
 *
 * Figures verified against the official programme brochure:
 *   Entrepreneur Mastery — fee ₹51,000 + GST @18% ₹9,180 = ₹60,180 payable.
 */

export interface AcademyProgram {
  slug: string;
  title: string;
  baseAmount: number;  // paise, excluding GST
  gstAmount: number;   // paise, 18% GST
  totalAmount: number; // paise, what Razorpay actually charges
  currency: 'INR';
}

const RUPEE = 100; // paise per rupee

export const ACADEMY_PROGRAMS: Record<string, AcademyProgram> = {
  'ai-educator-mastery': {
    slug: 'ai-educator-mastery',
    title: 'AI Educator Mastery Program',
    baseAmount:  37_000 * RUPEE,
    gstAmount:    6_660 * RUPEE,
    totalAmount: 43_660 * RUPEE,
    currency: 'INR',
  },
  'entrepreneur-mastery': {
    slug: 'entrepreneur-mastery',
    title: 'Entrepreneur Mastery Program',
    baseAmount:  51_000 * RUPEE,
    gstAmount:    9_180 * RUPEE,
    totalAmount: 60_180 * RUPEE,
    currency: 'INR',
  },
};

// A typo in the table above would silently charge the wrong amount, so the
// arithmetic is checked once at module load rather than trusted.
for (const p of Object.values(ACADEMY_PROGRAMS)) {
  if (p.baseAmount + p.gstAmount !== p.totalAmount) {
    throw new Error(
      `[academyPrograms] ${p.slug}: base (${p.baseAmount}) + gst (${p.gstAmount}) ` +
      `!= total (${p.totalAmount})`,
    );
  }
}

/** Resolve a slug to its programme, or null if it is not a payable cohort. */
export function getProgram(slug: string): AcademyProgram | null {
  return ACADEMY_PROGRAMS[slug] ?? null;
}

/** paise -> "₹60,180" for display and email. */
export function formatPaise(paise: number): string {
  return '₹' + (paise / RUPEE).toLocaleString('en-IN');
}
