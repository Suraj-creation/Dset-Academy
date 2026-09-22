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
  /** Public path under /public used to attach the brochure to the welcome email. */
  brochurePath: string;
  /** Open batches an applicant can pick at checkout. Confirmed with the Academy team. */
  batches: string[];
}

const RUPEE = 100; // paise per rupee

const STANDARD_BATCHES = ['Batch 1: November 2026', 'Batch 2: December 2026', 'Batch 3: January 2027'];

export const ACADEMY_PROGRAMS: Record<string, AcademyProgram> = {
  // Title kept as-is on request — not renamed to "Train the Trainer".
  'ai-educator-mastery': {
    slug: 'ai-educator-mastery',
    title: 'AI Educator Mastery Program',
    baseAmount:  37_000 * RUPEE,
    gstAmount:    6_660 * RUPEE,
    totalAmount: 43_660 * RUPEE,
    currency: 'INR',
    brochurePath: 'brochures/AI_Educator_Mastery_Program_Brochure.pdf',
    batches: STANDARD_BATCHES,
  },
  'entrepreneur-mastery': {
    slug: 'entrepreneur-mastery',
    title: 'Entrepreneur Mastery',
    baseAmount:  51_000 * RUPEE,
    gstAmount:    9_180 * RUPEE,
    totalAmount: 60_180 * RUPEE,
    currency: 'INR',
    brochurePath: 'brochures/Entrepreneur_Mastery_Program_Brochure.pdf',
    batches: STANDARD_BATCHES,
  },
  'ai-faculty-mastery': {
    slug: 'ai-faculty-mastery',
    title: 'Faculty AI Mastery',
    baseAmount:  3_002 * RUPEE,
    gstAmount:     540 * RUPEE,
    totalAmount: 3_542 * RUPEE,
    currency: 'INR',
    brochurePath: 'brochures/AI_Faculty_Mastery_Brochure.pdf',
    batches: STANDARD_BATCHES,
  },
  'ai-mastery-life-science-healthcare': {
    slug: 'ai-mastery-life-science-healthcare',
    title: 'Professional AI Mastery',
    baseAmount:  25_000 * RUPEE,
    gstAmount:    4_500 * RUPEE,
    totalAmount: 29_500 * RUPEE,
    currency: 'INR',
    brochurePath: 'brochures/AI_Mastery_Life_Science_Healthcare_Brochure.pdf',
    batches: STANDARD_BATCHES,
  },
  'pharmaai-student': {
    slug: 'pharmaai-student',
    title: 'Student AI Mastery',
    baseAmount:  2_008 * RUPEE,
    gstAmount:     361 * RUPEE,
    totalAmount: 2_369 * RUPEE,
    currency: 'INR',
    brochurePath: 'brochures/PharmaAI_Student_Brochure.pdf',
    batches: STANDARD_BATCHES,
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
