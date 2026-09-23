import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { productPageFont } from '@/lib/productPageTypography';
import { ArrowRight, ArrowUpRight, ChevronDown, X } from 'lucide-react';

const IconLinkedin = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className="inline-block flex-shrink-0">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const IconInstagram = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className="inline-block flex-shrink-0">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const IconFacebook = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className="inline-block flex-shrink-0">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

/* ─── Brand tokens ─────────────────────────────────────────── */
const NAVY      = '#0a1830';
const NAVY_DEEP = '#071224';
const TEAL      = '#20c4ad';
const TEAL_DARK = '#0d7d6f';
const TEAL_TINT = '#e6fbf7';
const INK       = '#0f1b2d';
const MUTED     = '#64748b';
const LIGHT_BG  = '#f6f7fb';
const BORDER    = '#e6e9f0';
const ACADEMY_LINKEDIN_URL  = 'https://www.linkedin.com/company/103688936/';
const ACADEMY_INSTAGRAM_URL = 'https://www.instagram.com/dsetconsulting/';
const ACADEMY_FACEBOOK_URL  = 'https://www.facebook.com/DSeTConsulting/';

/**
 * Type scale. Sizes are explicit px because globals.css sets `html { font-size: 17px }`,
 * which inflates every rem-based Tailwind step by 6% and made the old scale read oversized.
 * Five tiers replace the two the page used to have (every section heading was identical),
 * so hierarchy now comes from real size and weight steps rather than repetition.
 */
const T = {
  display:   'text-[34px] sm:text-[44px] lg:text-[52px] font-semibold tracking-[-0.035em] leading-[1.08]',
  h2:        'text-[28px] sm:text-[34px] font-semibold tracking-[-0.03em] leading-[1.12]',
  h2Support: 'text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] leading-[1.18]',
  cardTitle: 'text-[17px] font-semibold leading-snug tracking-[-0.01em]',
  body:      'text-[13.5px] sm:text-sm leading-[1.65]',
  meta:      'text-[11px] font-semibold uppercase tracking-[0.28em]',
};

/**
 * Card hover. The framer-motion import is aliased to a shim (src/lib/motion.tsx) that
 * silently discards whileHover/whileTap, so every interactive state on this page has to be
 * CSS. Tailwind v4 already scopes `hover:` behind `@media (hover: hover)`.
 */
const HOVER_LIFT =
  'transition-[transform,box-shadow,border-color] duration-200 ease-out ' +
  'hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.10)]';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/**
 * Per-item entrance delay. The shim never reads `staggerChildren` (it is declared in its
 * types but never applied), so the page's old stagger parents did nothing. It does honour
 * `transition.delay`, so sequencing is done explicitly per child.
 */
const step = (i: number, base = 0) => ({ duration: 0.5, delay: base + i * 0.05 });

/* ═══════ Data ═══════ */
const STAT_STRIP = [
  { title: 'Industry → classroom', desc: 'Live DSeT platform and consulting use cases' },
  { title: 'Domain × AI',          desc: 'Built for vertical expertise, not generic prompting' },
  { title: 'Research → practice',  desc: 'Applied research translated into usable capability' },
  { title: 'Skill → scale',        desc: 'Trainer multipliers and institution partnerships' },
];

const PATHWAYS = [
  { n: '01', title: 'Train the Trainer', desc: 'Prepare a growing ecosystem of certified facilitators who can teach applied AI with domain context, practical labs and responsible-use guardrails.', link: 'Build teaching capacity' },
  { n: '02', title: 'Entrepreneurship & Ikigai', desc: 'Help founders convert passion, experience and lived problems into a validated venture, a minimum viable offer and a responsible AI-enabled operating model.', link: 'Move from purpose to pilot' },
  { n: '03', title: 'Faculty Development', desc: 'Enable life-sciences, engineering and management faculty to integrate AI into teaching, assessment, research and student projects without losing disciplinary rigour.', link: 'Make curriculum practice-ready' },
  { n: '04', title: 'Student Skill Development', desc: 'Give learners hands-on exposure to industry problems, data literacy, AI tools, capstone work and the communication skills needed to move from campus to career.', link: 'Learn by solving' },
];

const LEARNING_MODEL = [
  { tag: 'ASSESS',                title: 'Start with the learner and the domain', desc: 'Baseline skill, context, constraints and measurable outcomes before choosing a tool.', pills: ['Readiness diagnostic', 'Role-based goals'] },
  { tag: 'ANALYSE',                title: 'Frame a real problem worth solving',    desc: 'Use cases, data, stakeholders, risk and value are studied together — not as separate classroom topics.', pills: ['Industry cases', 'Data & ethics'] },
  { tag: 'REIMAGINE & RECREATE',   title: 'Build through guided labs',             desc: 'Learners prototype workflows, evaluate outputs and redesign how work can be done with human oversight.', pills: ['Hands-on labs', 'Capstone', 'Peer critique'] },
  { tag: 'COLLABORATE & CAPITALISE', title: 'Demonstrate, transfer and scale',     desc: 'Translate learning into a teaching plan, institutional intervention, venture experiment or career portfolio.', pills: ['Implementation plan', 'Mentor review'] },
];

const LIFE_SCIENCE_DOMAINS = [
  { tag: 'Rx',  title: 'Pharmacy & Pharma',          desc: 'Commercial intelligence, field-force use cases, evidence synthesis, pharmacovigilance awareness and responsible AI workflows.' },
  { tag: 'N+',  title: 'Nursing & Allied Health',     desc: 'AI literacy, documentation support, care-process improvement, data privacy and educator enablement.' },
  { tag: 'Bio', title: 'Research & Innovation',       desc: 'Research design, literature intelligence, data readiness, model evaluation and translation from hypothesis to usable solution.' },
  { tag: '360', title: 'Health & Wellness Enterprise',desc: 'From purpose-led product ideas to validated offerings, ethical claims, go-to-market and measurable customer outcomes.' },
];

const FILTERS = ['All', 'Faculty', 'Trainers', 'Students', 'Entrepreneurs'];

const PROGRAMS = [
  {
    eyebrow: 'LIFE SCIENCES', badge: 'Enrolment open', badgeLive: true,
    title: 'AI Educator Mastery Program', tags: ['Faculty', 'Trainers'],
    desc: 'Become a certified AI faculty-cum-trainer for Life Science & Healthcare — hand-held through 60+ AI tools mapped to 18 departments, then paid assignments to teach what you have mastered.',
    format: '32-hour workshop cohort', outcome: 'Certificate + paid-assignment eligibility', forWhom: 'Faculty, trainers, academic leaders',
    fee: '₹43,660', cta: 'Register for this cohort', href: '/academy/programs/ai-educator-mastery',
    // slug resolves against the server-side price catalogue (src/lib/academyPrograms.ts).
    // The displayed fee is presentational only — the charged amount comes from the server.
    slug: 'ai-educator-mastery',
    brochure: '/brochures/AI_Educator_Mastery_Program_Brochure.pdf',
  },
  {
    eyebrow: 'VENTURE PATHWAY', badge: 'Enrolment open', badgeLive: true,
    title: 'Entrepreneur Mastery', tags: ['Entrepreneurs'],
    desc: 'Lead AI adoption across your organisation — or build your own AI-transformation practice — for Life Science & Healthcare, through 60+ AI tools mapped to 18 business departments.',
    format: '32-hour workshop cohort', outcome: 'Detailed certificate + paid assignments', forWhom: 'Founders and aspiring entrepreneurs',
    fee: '₹60,180', cta: 'Register for this cohort', href: '/academy/programs/entrepreneur-mastery',
    slug: 'entrepreneur-mastery',
    brochure: '/brochures/Entrepreneur_Mastery_Program_Brochure.pdf',
  },
  {
    eyebrow: 'LIFE SCIENCES', badge: 'Enrolment open', badgeLive: true,
    title: 'Professional AI Mastery', tags: ['Entrepreneurs', 'Trainers'],
    desc: 'Put AI to work in your role — master 40+ AI tools, hands-on, across 24 hours of live weekend workshops mapped to the 18 departments that run Life Science and Healthcare organisations.',
    format: '24-hour workshop · 12 weekend sessions', outcome: 'Detailed certificate listing every tool completed', forWhom: 'Regulatory, R&D, Medical Affairs, Sales, Ops and other professionals',
    fee: '₹29,500', cta: 'Register for this cohort', href: '/academy/programs/ai-mastery-life-science-healthcare',
    slug: 'ai-mastery-life-science-healthcare',
    brochure: '/brochures/AI_Mastery_Life_Science_Healthcare_Brochure.pdf',
  },
  {
    eyebrow: 'PHARMACEUTICAL & LIFE SCIENCE FACULTY', badge: 'Enrolment open', badgeLive: true,
    title: 'Faculty AI Mastery', tags: ['Faculty'],
    desc: 'A 3-weekend hands-on faculty development program — build practical AI skills for the classroom and the lab in just 6 hours, from AI-powered teaching to your own research assistant.',
    format: '6-hour workshop · 3 weekends', outcome: 'Certificate + faculty capstone solution', forWhom: 'Faculty teaching Pharmacy, Pharmaceutical Sciences & Life Science',
    fee: '₹3,542', cta: 'Register for this cohort', href: '/academy/programs/ai-faculty-mastery',
    slug: 'ai-faculty-mastery',
    brochure: '/brochures/AI_Faculty_Mastery_Brochure.pdf',
  },
  {
    eyebrow: 'CAMPUS TO CAREER', badge: 'Enrolment open', badgeLive: true,
    title: 'Student AI Mastery', tags: ['Students'],
    desc: 'A 3-weekend certification workshop — learn AI, apply it to real pharma problems, and build an AI-ready CV, LinkedIn profile and capstone solution.',
    format: '6-hour workshop · 3 weekends', outcome: 'Certificate + capstone challenge portfolio', forWhom: 'Pharmacy, Pharmaceutical Sciences & Life Science students',
    fee: '₹2,369', cta: 'Register for this cohort', href: '/academy/programs/pharmaai-student',
    slug: 'pharmaai-student',
    brochure: '/brochures/PharmaAI_Student_Brochure.pdf',
  },
  {
    eyebrow: 'CUSTOM COHORT', badge: 'Institutional', badgeLive: false,
    title: 'Customized Department Training', tags: ['Faculty', 'Trainers', 'Students', 'Entrepreneurs'],
    desc: 'Not every team needs the same AI training. Tell us your department’s day-to-day work — we scope and build a module around it.',
    format: 'Custom scope & duration', outcome: 'Department-specific AI training plan', forWhom: 'Organisations and institutions',
    fee: null, cta: 'Talk to our experts', href: '#enquiry',
  },
];

// Departments DSeT can build a customised module around — organisations pick the ones
// relevant to them rather than taking a one-size-fits-all course.
const CUSTOM_DEPARTMENTS = [
  'HR', 'Admin', 'Operations', 'Production', 'R&D', 'Marketing & Strategy',
  'Business Development & Sales', 'Supply Chain', 'Regulatory',
  'Market Research, BA, BI & Competitive Intelligence', 'SFE', 'Training',
  'Medical Affairs', 'Digital Transformation', 'Consulting', 'Finance',
  'Legal & Compliance', 'Project Management & Corporate Strategy',
];

const VERTICAL_SCHOOLS = [
  { name: 'School of Life Science - Skill Development Training & Research (SLSSDTR)', desc: 'Pharma, healthcare, nursing, wellness and life-sciences research.', status: 'NOW LAUNCHING', live: true },
  { name: 'School of Industrial & Edge AI',      desc: 'Manufacturing, OT/IT, predictive maintenance, safety and edge deployment.', status: 'PLANNED', live: false },
  { name: 'School of Mining & Resources',        desc: 'Mineral operations, logistics, revenue intelligence and responsible resources.', status: 'PLANNED', live: false },
  { name: 'School of Enterprise & Management AI',desc: 'Decision intelligence, RevOps, procurement, finance and AI-led transformation.', status: 'PLANNED', live: false },
  { name: 'School of Sports & Human Performance',desc: 'Athlete intelligence, performance systems and inclusive sports innovation.', status: 'PLANNED', live: false },
  { name: 'School of Secure & Responsible AI',   desc: 'Cloud, cybersecurity, governance, privacy, human oversight and sovereign AI.', status: 'PLANNED', live: false },
];

const RESEARCH_PILLARS = [
  { title: 'Applied research', desc: 'Domain questions shaped with institutions and industry partners.' },
  { title: 'Faculty network',  desc: 'Cross-disciplinary mentors, reviewers and programme contributors.' },
  { title: 'Responsible AI',   desc: 'Privacy, evidence, bias, human oversight and accountable use.' },
  { title: 'Translation',      desc: 'Capstones, pilots, publications and practice-facing knowledge assets.' },
];

const GOVERNANCE_ROLES = [
  { tag: 'EC', title: 'Executive Chair',           desc: 'Vision, standards, ecosystem and strategic direction.' },
  { tag: 'CO', title: 'Chief Operating Officer',    desc: 'Academy operations, cohort delivery and partner coordination.' },
  { tag: 'CC', title: 'Chief Convener',             desc: 'School leadership, domain network and programme priorities.' },
  { tag: 'AC', title: 'Assistant Chief Convener',   desc: 'Faculty mobilisation, cohort coordination and delivery support.' },
  { tag: 'AD', title: 'Academic Director',          desc: 'Curriculum quality, faculty development and institutional partnerships.' },
];

const FAQS = [
  { q: 'Is DSeT Academy a university or degree-awarding institution?', a: 'No. DSeT Academy is a practitioner-led skill-development and training platform under DSeT Consulting — not a degree-awarding university. Certificates recognise completed training and hands-on capability, not an academic degree.' },
  { q: 'How does secure payment work?', a: 'Enrolment is completed through a secure Razorpay checkout. Your payment is verified server-side before a registration is confirmed, and no card or bank details are ever stored on DSeT servers.' },
  { q: 'Can a college or university run a private cohort?', a: 'Yes. Institutional cohorts can be customised for a department, campus or university — including curriculum mapping and faculty enablement. Reach out to the Academy team to plan one.' },
  { q: 'What makes the programmes "verticalised"?', a: 'Every programme is built around a specific industry — starting with Life Sciences — using real DSeT platform use cases and department workflows, instead of generic, one-size-fits-all AI training content.' },
];

// Every programme is offered in the dropdown. The modal branches on whether the selected
// title resolves to a payable slug (PAYABLE_SLUG_BY_TITLE): payable ones go through
// Razorpay, everything else submits as a general interest signup with no payment involved.
const PROGRAMME_OPTIONS = PROGRAMS.map((p) => p.title);

// Replaces the old free-text "role" list — per the Academy team's registration-form
// spec, every applicant now picks one of these, which drives which extra fields show.
const PROFESSION_OPTIONS = [
  'Student',
  'Faculty',
  'Professional',
  'Entrepreneur',
  'Self Employed',
  'Experienced but currently no regular engagement',
  'Other',
] as const;

const COMPANY_TYPE_OPTIONS = [
  'Pharmaceutical', 'Medical Device', 'Medical Equipment', 'Surgical Consumables',
  'Hospital', 'Distributor', 'Consulting', 'Laboratory', 'Market Research', 'Training', 'Other',
];

// Every payable cohort opens with the same three batches until the Academy team
// schedules otherwise — kept as one list rather than per-programme for now.
const BATCH_OPTIONS = ['Batch 1: November 2026', 'Batch 2: December 2026', 'Batch 3: January 2027'];

/* ═══════ Small UI pieces ═══════ */
/**
 * Kept for the three sections that still earn one (hero, founding programmes, DAARC).
 * It used to open seven of nine sections, which is what made every section look alike.
 */
function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="w-5 h-px" style={{ backgroundColor: TEAL }} />
      <span className={T.meta} style={{ color: dark ? TEAL : TEAL_DARK }}>
        {children}
      </span>
    </div>
  );
}

/** Small tracked ordinal. Replaces the 30px numerals that outweighed their own card titles. */
function Ordinal({ n, dark }: { n: string | number; dark?: boolean }) {
  return (
    <span className={T.meta} style={{ color: dark ? 'rgba(255,255,255,0.35)' : '#aab3c2' }}>
      {typeof n === 'number' ? String(n).padStart(2, '0') : n}
    </span>
  );
}

/** Section heading block. Vertical stack, no floating right-hand explainer paragraph. */
function SectionHead({
  eyebrow, title, lead, anchor = true, dark = false, className = '',
}: {
  eyebrow?: string; title: React.ReactNode; lead?: React.ReactNode;
  anchor?: boolean; dark?: boolean; className?: string;
}) {
  return (
    <motion.div
      initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
      className={`max-w-2xl ${className}`}
    >
      {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
      <h2 className={anchor ? T.h2 : T.h2Support} style={{ color: dark ? '#fff' : INK }}>
        {title}
      </h2>
      {lead && (
        <p className={`${T.body} mt-4 max-w-xl`} style={{ color: dark ? 'rgba(255,255,255,0.6)' : MUTED }}>
          {lead}
        </p>
      )}
    </motion.div>
  );
}

// Sized so the six-field form clears a 700px viewport without scrolling.
const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-colors ' +
  'focus:ring-2 focus:ring-offset-0';

/** Title -> payable slug, derived from PROGRAMS so the catalogue stays the single source. */
const PAYABLE_SLUG_BY_TITLE: Record<string, string> = Object.fromEntries(
  PROGRAMS.flatMap((p) => ('slug' in p && p.slug ? [[p.title, p.slug as string]] : [])),
);

declare global {
  interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void } }
}

/** Inject Razorpay Checkout once, on demand. Resolves false if it cannot load. */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function ApplicationModal({ open, onClose, presetProgramme }: { open: boolean; onClose: () => void; presetProgramme?: string }) {
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [form, setForm] = useState({
    programme: '', fullName: '', email: '', mobile: '', location: '', country: '',
    role: '', institution: '', department: '',
    courseName: '', currentYear: '', subjectSpecialization: '',
    companyName: '', companyType: '', otherProfessionDetail: '',
    batch: '', consent: false,
  });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  // `paid` distinguishes the Razorpay success screen from the general-interest one —
  // same shape, different copy, since neither involves money for the interest path.
  const [receipt, setReceipt] = useState<{ registrationId: string; programmeTitle: string; paid: boolean } | null>(null);

  // No early return: Headless UI's Dialog owns mount/unmount and needs to stay rendered
  // for its closing transition to play.

  const programme = form.programme || presetProgramme || '';
  const payableSlug = PAYABLE_SLUG_BY_TITLE[programme];
  const isValid = Boolean(
    form.fullName.trim() && form.email.trim() && form.mobile.trim() && form.location.trim() &&
    form.country.trim() && form.role && form.consent && (!payableSlug || form.batch),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setPayError(null);
    if (!isValid) return;

    // Shared applicant fields for both the interest and paid-order endpoints —
    // profession-conditional fields are sent as undefined when not applicable, so
    // the server never persists stale data from a different profession's fields.
    const applicant = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      location: form.location.trim(),
      country: form.country.trim(),
      role: form.role,
      institution: form.institution.trim() || undefined,
      department: form.role === 'Professional' ? (form.department || undefined) : undefined,
      courseName: form.role === 'Student' ? (form.courseName.trim() || undefined) : undefined,
      currentYear: form.role === 'Student' ? (form.currentYear.trim() || undefined) : undefined,
      subjectSpecialization: form.role === 'Faculty' ? (form.subjectSpecialization.trim() || undefined) : undefined,
      companyName: ['Professional', 'Entrepreneur', 'Self Employed'].includes(form.role)
        ? (form.companyName.trim() || undefined) : undefined,
      companyType: ['Professional', 'Entrepreneur', 'Self Employed'].includes(form.role)
        ? (form.companyType || undefined) : undefined,
      otherProfessionDetail: form.role === 'Other' ? (form.otherProfessionDetail.trim() || undefined) : undefined,
      consent: form.consent,
    };

    // No fee published for this programme yet — general interest, no Razorpay at all.
    if (!payableSlug) {
      setBusy(true);
      try {
        const res = await fetch('/api/academy/interest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ programmeTitle: programme, ...applicant }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Could not submit your details.');
        setReceipt({ registrationId: data.registrationId, programmeTitle: data.programmeTitle, paid: false });
        setStep('done');
      } catch (err) {
        setPayError((err as Error).message);
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) throw new Error('Could not load the secure checkout. Check your connection and try again.');

      // The server prices this from the slug — no amount is sent from the browser.
      const orderRes = await fetch('/api/academy/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programmeSlug: payableSlug, batch: form.batch, ...applicant }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error ?? 'Could not start the payment.');

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'DSeT Academy',
        description: order.programmeTitle,
        prefill: { name: form.fullName, email: form.email, contact: form.mobile },
        theme: { color: TEAL },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // Payment is only "done" once the server verifies the signature.
          try {
            const vr = await fetch('/api/academy/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            const v = await vr.json();
            if (!vr.ok) throw new Error(v.error ?? 'Payment verification failed.');
            setReceipt({ registrationId: v.registrationId, programmeTitle: v.programmeTitle, paid: true });
            setStep('done');
          } catch (err) {
            // Money may well have been captured — the webhook will still confirm it,
            // so never tell the applicant the payment failed here.
            setPayError(
              `${(err as Error).message} Your payment reference is ${response.razorpay_payment_id}. ` +
              `If the amount was debited, your enrolment will still be confirmed — please contact the Academy team with this reference.`,
            );
          } finally {
            setBusy(false);
          }
        },
      } as Record<string, unknown>);

      rzp.on('payment.failed', (resp: unknown) => {
        const r = resp as { error?: { description?: string } };
        setPayError(r?.error?.description ?? 'The payment did not go through. Please try again.');
        setBusy(false);
      });

      rzp.open();
    } catch (err) {
      setPayError((err as Error).message);
      setBusy(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('form');
      setTouched(false);
      setBusy(false);
      setPayError(null);
      setReceipt(null);
      setForm({
        programme: '', fullName: '', email: '', mobile: '', location: '', country: '',
        role: '', institution: '', department: '',
        courseName: '', currentYear: '', subjectSpecialization: '',
        companyName: '', companyType: '', otherProfessionDetail: '',
        batch: '', consent: false,
      });
    }, 250);
  };

  const labelClass = 'block text-[13px] font-semibold mb-1.5';

  return (
    // Headless UI gives focus trap, Escape, scroll lock, role="dialog" and aria-modal,
    // none of which the previous hand-rolled overlay had. Its `transition` prop drives
    // real CSS transitions, so the panel can animate out — the motion shim discards `exit`.
    <Dialog open={open} onClose={handleClose} className="relative z-[100]" transition>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition duration-200 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
        <DialogPanel
          transition
          className="relative bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-2xl
                     max-h-[94vh] sm:max-h-[88vh] overflow-y-auto
                     transition duration-200 ease-out
                     data-[closed]:opacity-0 data-[closed]:translate-y-2 data-[closed]:scale-[0.97]"
        >
          <div className="flex items-start justify-between gap-4 px-5 sm:px-7 pt-5 pb-4 border-b" style={{ borderColor: BORDER }}>
            <div>
              <DialogTitle className="text-[19px] font-semibold tracking-[-0.02em]" style={{ color: INK }}>
                {step === 'done'
                  ? (receipt?.paid ? 'Enrolment confirmed' : 'Welcome aboard')
                  : (payableSlug ? 'Reserve your place' : 'Tell us about you')}
              </DialogTitle>
            </div>
            <button onClick={handleClose} aria-label="Close"
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 active:scale-95">
              <X size={17} style={{ color: MUTED }} />
            </button>
          </div>

          <div className="px-5 sm:px-7 py-5">
            {step === 'form' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Field order follows the Academy team's spec exactly: Name, Location,
                    Country, Mobile, Email, Profession — then profession-conditional
                    fields, then programme + batch right before consent/payment. */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} style={{ color: INK }}>Name</label>
                    <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Your name" className={inputClass} style={{ borderColor: touched && !form.fullName ? '#e11d48' : BORDER, color: INK }} />
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: INK }}>Location</label>
                    <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="City" className={inputClass} style={{ borderColor: touched && !form.location ? '#e11d48' : BORDER, color: INK }} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} style={{ color: INK }}>Country</label>
                    <input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                      placeholder="Country" className={inputClass} style={{ borderColor: touched && !form.country ? '#e11d48' : BORDER, color: INK }} />
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: INK }}>Mobile no. <span className="font-normal" style={{ color: MUTED }}>(with country code)</span></label>
                    <input required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      placeholder="+91 …" className={inputClass} style={{ borderColor: touched && !form.mobile ? '#e11d48' : BORDER, color: INK }} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} style={{ color: INK }}>Email ID</label>
                    <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@institution.org" className={inputClass} style={{ borderColor: touched && !form.email ? '#e11d48' : BORDER, color: INK }} />
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: INK }}>Profession</label>
                    <div className="relative">
                      <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className={`${inputClass} appearance-none pr-9 truncate`}
                        style={{ borderColor: touched && !form.role ? '#e11d48' : (form.role ? TEAL : BORDER), color: INK }}>
                        <option value="">Select profession</option>
                        {PROFESSION_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MUTED }} />
                    </div>
                  </div>
                </div>

                {/* Profession-conditional fields — what's asked next depends on what
                    the applicant just selected above, per the Academy team's form spec. */}
                {form.role === 'Student' && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass} style={{ color: INK }}>Course pursuing</label>
                        <input value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                          placeholder="e.g. BSc Microbiology / B.Pharm / MBA" className={inputClass} style={{ borderColor: BORDER, color: INK }} />
                      </div>
                      <div>
                        <label className={labelClass} style={{ color: INK }}>Name of institution</label>
                        <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })}
                          placeholder="Your institution" className={inputClass} style={{ borderColor: BORDER, color: INK }} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: INK }}>Current year of the course</label>
                      <input value={form.currentYear} onChange={(e) => setForm({ ...form, currentYear: e.target.value })}
                        placeholder="e.g. 1st Year" className={inputClass} style={{ borderColor: BORDER, color: INK }} />
                    </div>
                  </>
                )}
                {form.role === 'Faculty' && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} style={{ color: INK }}>Name of institution</label>
                      <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })}
                        placeholder="Your institution" className={inputClass} style={{ borderColor: BORDER, color: INK }} />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: INK }}>Subject specialization</label>
                      <input value={form.subjectSpecialization} onChange={(e) => setForm({ ...form, subjectSpecialization: e.target.value })}
                        placeholder="Your subject area" className={inputClass} style={{ borderColor: BORDER, color: INK }} />
                    </div>
                  </div>
                )}
                {(form.role === 'Professional' || form.role === 'Entrepreneur' || form.role === 'Self Employed') && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} style={{ color: INK }}>Name of company</label>
                      <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                        placeholder="Company name" className={inputClass} style={{ borderColor: BORDER, color: INK }} />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: INK }}>Type of company</label>
                      <div className="relative">
                        <select value={form.companyType} onChange={(e) => setForm({ ...form, companyType: e.target.value })}
                          className={`${inputClass} appearance-none pr-9 truncate`} style={{ borderColor: BORDER, color: INK }}>
                          <option value="">Select type</option>
                          {COMPANY_TYPE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MUTED }} />
                      </div>
                    </div>
                  </div>
                )}
                {form.role === 'Professional' && (
                  <div>
                    <label className={labelClass} style={{ color: INK }}>
                      Department <span className="font-normal" style={{ color: MUTED }}>(which team is this for)</span>
                    </label>
                    <div className="relative">
                      <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                        className={`${inputClass} appearance-none pr-9 truncate`} style={{ borderColor: BORDER, color: INK }}>
                        <option value="">Select department</option>
                        {CUSTOM_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MUTED }} />
                    </div>
                  </div>
                )}
                {form.role === 'Other' && (
                  <div>
                    <label className={labelClass} style={{ color: INK }}>Please specify</label>
                    <input value={form.otherProfessionDetail} onChange={(e) => setForm({ ...form, otherProfessionDetail: e.target.value })}
                      placeholder="Tell us a bit about your background" className={inputClass} style={{ borderColor: BORDER, color: INK }} />
                  </div>
                )}

                {/* Course selection — shown last, right before payment, since the
                    applicant needs to know their own details before picking a batch. */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} style={{ color: INK }}>Programme</label>
                    <div className="relative">
                      <select value={form.programme || presetProgramme || ''} onChange={(e) => setForm({ ...form, programme: e.target.value })}
                        className={`${inputClass} appearance-none pr-9 truncate`} style={{ borderColor: TEAL, color: INK }}>
                        <option value="">Choose one</option>
                        {PROGRAMME_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MUTED }} />
                    </div>
                  </div>
                  {/* Batch is only meaningful once fee/scheduling exists — general
                      enquiries (institutional, custom department) skip it entirely. */}
                  {payableSlug && (
                    <div>
                      <label className={labelClass} style={{ color: INK }}>Batch</label>
                      <div className="relative">
                        <select required value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}
                          className={`${inputClass} appearance-none pr-9 truncate`}
                          style={{ borderColor: touched && !form.batch ? '#e11d48' : (form.batch ? TEAL : BORDER), color: INK }}>
                          <option value="">Choose a batch</option>
                          {BATCH_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MUTED }} />
                      </div>
                    </div>
                  )}
                </div>

                {payableSlug && (
                  <div className="rounded-xl p-3.5 flex items-center justify-between border" style={{ backgroundColor: LIGHT_BG, borderColor: BORDER }}>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold block" style={{ color: MUTED }}>Total Fee (incl. 18% GST)</span>
                      <span className="text-[18px] font-bold" style={{ color: INK }}>
                        {PROGRAMS.find((p) => p.title === programme)?.fee ?? '—'}
                      </span>
                    </div>
                    {form.batch && (
                      <span className="text-[12px] font-medium px-2.5 py-1 rounded-full border" style={{ backgroundColor: TEAL_TINT, color: TEAL_DARK, borderColor: `${TEAL}40` }}>
                        {form.batch.split(':')[0]} Selected
                      </span>
                    )}
                  </div>
                )}

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded shrink-0" style={{ accentColor: TEAL }} />
                  <span className="text-[12.5px] leading-[1.55]" style={{ color: MUTED }}>
                    I agree to be contacted about this cohort and understand that final schedule, fee, admission and
                    payment details will be confirmed by DSeT Academy.
                  </span>
                </label>

                {touched && !isValid && (
                  <p className="text-xs font-medium" style={{ color: '#e11d48' }}>Please fill all required fields and accept the consent to continue.</p>
                )}
                {payError && (
                  <div className="rounded-lg p-3 text-xs leading-relaxed" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
                    {payError}
                  </div>
                )}

                <button type="submit" disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm
                             transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
                  style={{ backgroundColor: TEAL, color: NAVY_DEEP }}>
                  {busy
                    ? (payableSlug ? 'Opening secure checkout…' : 'Submitting…')
                    : payableSlug
                      ? <>Pay securely &amp; confirm seat <ArrowRight size={15} /></>
                      : <>Welcome me aboard <ArrowRight size={15} /></>}
                </button>
                <p className="text-[11px] text-center leading-relaxed" style={{ color: MUTED }}>
                  {payableSlug
                    ? 'Secure payment via Razorpay. Card and bank details are never stored on DSeT servers.'
                    : 'No payment required. Our Academy team will reach out with next steps.'}
                </p>
              </form>
            ) : receipt?.paid ? (
              <div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: TEAL_TINT }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL_DARK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold mb-2.5" style={{ color: INK }}>Payment verified. Your seat is confirmed.</h4>
                <p className={`${T.body} mb-4`} style={{ color: MUTED }}>
                  You are enrolled in <strong style={{ color: INK }}>{receipt?.programmeTitle}</strong>. A receipt has been
                  emailed to {form.email} and sent to {form.mobile} on WhatsApp. A separate welcome email with the
                  programme brochure is on its way. The Academy team will follow up with your cohort schedule.
                </p>
                <div className="rounded-lg p-3.5 text-xs leading-relaxed mb-5" style={{ backgroundColor: LIGHT_BG, color: INK }}>
                  Registration ID<br />
                  <span className="font-mono font-semibold">{receipt?.registrationId}</span>
                </div>
                <button type="button" onClick={handleClose}
                  className="w-full py-3 rounded-full font-semibold text-sm text-white transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: INK }}>
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: TEAL_TINT }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL_DARK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold mb-2.5" style={{ color: INK }}>Congratulations, {form.fullName.split(' ')[0]}!</h4>
                <p className={`${T.body} mb-4`} style={{ color: MUTED }}>
                  You're on the list for <strong style={{ color: INK }}>{receipt?.programmeTitle}</strong>. Welcome to
                  great learning ahead. Our Academy team will reach out shortly with next steps.
                </p>
                <div className="rounded-lg p-3.5 text-xs leading-relaxed mb-5" style={{ backgroundColor: LIGHT_BG, color: INK }}>
                  Reference ID<br />
                  <span className="font-mono font-semibold">{receipt?.registrationId}</span>
                </div>
                <button type="button" onClick={handleClose}
                  className="w-full py-3 rounded-full font-semibold text-sm text-white transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: INK }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

/** In-app viewer for a brochure PDF — embedded, not a download/new-tab link. */
function BrochureModal({ url, onClose }: { url: string | null; onClose: () => void }) {
  return (
    <Dialog open={!!url} onClose={onClose} className="relative z-[100]" transition>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/50 transition-opacity duration-200 data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
        <DialogPanel
          transition
          className="relative w-full max-w-4xl h-[85vh] rounded-2xl bg-white shadow-2xl overflow-hidden transition-all duration-200 data-[closed]:opacity-0 data-[closed]:scale-95"
        >
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b bg-white shrink-0" style={{ borderColor: BORDER }}>
            <DialogTitle className="text-[15px] font-semibold" style={{ color: INK }}>Programme brochure</DialogTitle>
            <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-black/5" aria-label="Close">
              <X size={18} />
            </button>
          </div>
          {url && (
            <iframe
              key={url}
              src={`${url}#toolbar=1&navpanes=0`}
              title="Programme brochure"
              className="absolute inset-0 top-[57px] w-full border-0 bg-[#f4f5f7]"
              style={{ height: 'calc(100% - 57px)' }}
            />
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default function AcademyPage() {
  const [filter, setFilter] = useState('All');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyProgramme, setApplyProgramme] = useState<string | undefined>(undefined);
  const [brochureUrl, setBrochureUrl] = useState<string | null>(null);

  const openApply = (programme?: string) => {
    setApplyProgramme(programme);
    setApplyOpen(true);
  };

  const visiblePrograms = filter === 'All' ? PROGRAMS : PROGRAMS.filter((p) => p.tags.includes(filter));
  // Payable cohorts get the featured treatment; everything else drops to the compact row.
  const featuredPrograms = visiblePrograms.filter((p) => 'slug' in p && p.slug);
  const otherPrograms    = visiblePrograms.filter((p) => !('slug' in p && p.slug));

  return (
    <Layout
      title="DSeT Academy | Applied Intelligence, Taught"
      description="DSeT Academy — a practitioner-led capability platform where educators, trainers, students and entrepreneurs learn to apply AI inside the industries they already understand. Starting with the School of Life Science - Skill Development Training & Research (SLSSDTR)."
    >
      <div className={`${productPageFont.variable} font-[family-name:var(--font-product-page)]`} style={{ color: INK }}>

        {/* ═══════════ HERO ═══════════ */}
        <section className="relative overflow-hidden min-h-[85vh] lg:min-h-[88vh] flex flex-col justify-between" style={{ backgroundColor: '#040d1a' }}>
          {/* Full-bleed background photo */}
          <div className="absolute inset-0">
            <Image
              src="/Academy1.png"
              alt="DSeT Academy"
              fill
              priority
              className="object-cover object-right md:object-[70%_center] lg:object-center"
              sizes="100vw"
            />
            {/* Left side soft gradient vignette to blend seamlessly into dark navy */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, #040d1a 0%, rgba(4,13,26,0.94) 26%, rgba(4,13,26,0.65) 48%, rgba(4,13,26,0.1) 72%, transparent 100%)',
              }}
            />
            {/* Top & bottom subtle vignettes for smooth navbar and stat strip transitions */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(4,13,26,0.4) 0%, transparent 20%, transparent 75%, rgba(4,13,26,0.9) 100%)',
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 md:pt-16 pb-8 sm:pb-12 relative z-10 my-auto">
            <div className="max-w-2xl">
              <motion.div initial="hidden" animate="show" variants={fadeUp} transition={step(0)}
                className="flex items-center gap-2.5 mb-5">
                <span className="w-5 h-[2px] rounded-full" style={{ backgroundColor: TEAL }} />
                <span className={`${T.meta} normal-case`} style={{ color: TEAL }}>
                  DSeT Academy · FOUNDING COHORTS
                </span>
              </motion.div>

              <motion.h1
                initial="hidden" animate="show" variants={fadeUp} transition={step(1)}
                className={`${T.display} mb-5 text-white`}
              >
                Domain expertise.<br />
                <span style={{ color: TEAL }}>Applied AI.</span><br />
                Real outcomes.
              </motion.h1>

              <motion.p
                initial="hidden" animate="show" variants={fadeUp} transition={step(2)}
                className="text-[15px] sm:text-base text-white/75 max-w-lg mb-8 leading-[1.7]"
              >
                A practitioner-led capability platform where educators, trainers, students and entrepreneurs
                learn to apply AI inside the industries they already understand.
              </motion.p>

              <motion.div initial="hidden" animate="show" variants={fadeUp} transition={step(3)}
                className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openApply()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm transition-[transform,box-shadow] duration-200 ease-out hover:shadow-[0_0_28px_rgba(32,196,173,0.4)] shadow-lg active:scale-[0.98] cursor-pointer"
                  style={{ backgroundColor: TEAL, color: NAVY_DEEP }}
                >
                  <span>Reserve a cohort seat</span>
                  <ArrowUpRight size={17} strokeWidth={2.5} />
                </button>
                <a
                  href="#life-sciences"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-full font-semibold text-sm border border-white/25 text-white transition-colors duration-200 hover:bg-white/10 active:scale-[0.98]"
                >
                  Explore Life Sciences
                </a>
              </motion.div>

              <motion.div
                initial="hidden" animate="show" variants={fadeUp} transition={step(4)}
                className="flex items-center gap-3 mt-6 flex-wrap"
              >
                <span className="text-[12px] text-white/50 font-medium">Follow DSeT Academy:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={ACADEMY_LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Follow DSeT Academy on LinkedIn"
                    aria-label="DSeT Academy on LinkedIn"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <IconLinkedin size={13} />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={ACADEMY_INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Follow DSeT on Instagram"
                    aria-label="DSeT on Instagram"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <IconInstagram size={13} />
                    <span>Instagram</span>
                  </a>
                  <a
                    href={ACADEMY_FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Follow DSeT on Facebook"
                    aria-label="DSeT on Facebook"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <IconFacebook size={13} />
                    <span>Facebook</span>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stat strip — 4 columns with vertical dividers matching the screenshot */}
          <div className="border-t border-white/10 relative z-10 w-full" style={{ backgroundColor: '#030c1a' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                {STAT_STRIP.map((s, i) => (
                  <motion.div
                    key={s.title}
                    initial="hidden" whileInView="show" viewport={{ once: true }}
                    variants={fadeUp} transition={step(i)}
                    className={`${i === 0 ? 'lg:pl-0 lg:pr-6' : i === STAT_STRIP.length - 1 ? 'lg:pl-6 lg:pr-0' : 'lg:px-6'} sm:px-6 py-6 flex flex-col justify-start`}
                  >
                    <h4 className={`${T.cardTitle} text-white mb-1.5`}>{s.title}</h4>
                    <p className="text-white/55 text-[12.5px] leading-[1.6]">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ FOUR CAPABILITY PATHWAYS ═══════════ */}
        <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <SectionHead
              anchor={false}
              title={<>One Academy. Four ways to create multiplier impact.</>}
              lead="DSeT Academy is not a catalogue of generic courses. Each pathway converts existing domain knowledge into applied, ethical and deployable AI capability."
              className="mb-12"
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-y-9 gap-x-8">
              {PATHWAYS.map((p, i) => (
                <motion.div
                  key={p.n}
                  initial="hidden" whileInView="show" viewport={{ once: true }}
                  variants={fadeUp} transition={step(i)}
                  className="group border-t pt-5" style={{ borderColor: BORDER }}
                >
                  <Ordinal n={p.n} />
                  <h3 className={`${T.cardTitle} mt-3 mb-2`}>{p.title}</h3>
                  <p className={`${T.body} mb-4`} style={{ color: MUTED }}>{p.desc}</p>
                  <a href="#programs"
                    className="text-[13px] font-semibold inline-flex items-center gap-1.5 transition-[gap] duration-200 group-hover:gap-2.5"
                    style={{ color: TEAL_DARK }}>
                    {p.link} <ArrowRight size={13} />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ SCHOOL OF LIFE SCIENCES ═══════════ */}
        <section id="life-sciences" className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: LIGHT_BG }}>
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.82fr_1.18fr] gap-8 lg:gap-12 items-start">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
              className="relative rounded-2xl p-8 sm:p-10 overflow-hidden flex flex-col justify-between lg:sticky lg:top-28"
              style={{ backgroundColor: NAVY }}>
              <div className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full border border-white/5" />
              <div className="absolute -bottom-8 -right-4 w-44 h-44 rounded-full border border-white/5" />
              <div className="relative">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-5 h-px" style={{ backgroundColor: TEAL }} />
                  <span className={T.meta} style={{ color: TEAL }}>Pioneer School</span>
                </div>
                <h2 className={`${T.h2} text-white mb-4 leading-tight`}>School of Life Science - Skill Development Training &amp; Research (SLSSDTR)</h2>
                <p className="text-white/60 text-[13.5px] sm:text-sm leading-[1.7] mb-8">
                  AI capability for professionals and institutions across pharmacy, healthcare, nursing, wellness
                  and life-sciences research — grounded in domain evidence, data responsibility and human oversight.
                </p>
              </div>
              <div className="relative inline-flex items-center gap-2 text-[12.5px] text-white/70 border border-white/15 rounded-lg px-3.5 py-2.5 w-fit leading-snug">
                Developed in collaboration with <strong className="text-white font-semibold">Imperical Consulting (Pvt.) Ltd.</strong>
              </div>
            </motion.div>

            <div className="divide-y" style={{ borderColor: BORDER }}>
              {LIFE_SCIENCE_DOMAINS.map((d, i) => (
                <motion.div
                  key={d.title}
                  initial="hidden" whileInView="show" viewport={{ once: true }}
                  variants={fadeUp} transition={step(i)}
                  className="flex gap-5 py-6 first:pt-0"
                  style={{ borderColor: BORDER }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-semibold text-[13px]"
                    style={{ backgroundColor: TEAL_TINT, color: TEAL_DARK }}>
                    {d.tag}
                  </div>
                  <div>
                    <h4 className={`${T.cardTitle} mb-1.5`}>{d.title}</h4>
                    <p className={T.body} style={{ color: MUTED }}>{d.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ THE DSeT LEARNING MODEL ═══════════ */}
        {/* border-b keeps this from merging into the white section below. */}
        <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b" style={{ borderColor: BORDER }}>
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
              className="lg:sticky lg:top-28 lg:self-start">
              <h2 className={`${T.h2Support} mb-4`}>
                From knowing AI to applying it responsibly.
              </h2>
              <p className={`${T.body} mb-7`} style={{ color: MUTED }}>
                Every cohort follows a six-stage learning journey adapted from DSeT ARC™ — the same execution
                discipline used to move complex industry problems from discovery to value.
              </p>
              <a href="#programs"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-[13px] text-white transition-[transform,opacity] duration-200 ease-out hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: INK }}>
                See founding programmes <ArrowRight size={14} />
              </a>
            </motion.div>

            <div className="relative pl-8">
              <div className="absolute left-[8px] top-2 bottom-2 w-px" style={{ backgroundColor: BORDER }} />
              <div className="space-y-8">
                {LEARNING_MODEL.map((s, i) => (
                  <motion.div
                    key={s.tag}
                    initial="hidden" whileInView="show" viewport={{ once: true }}
                    variants={fadeUp} transition={step(i)}
                    className="relative"
                  >
                    <span className="absolute -left-8 top-1 w-[17px] h-[17px] rounded-full border-2 bg-white flex items-center justify-center"
                      style={{ borderColor: TEAL }}>
                      <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: TEAL }} />
                    </span>
                    <span className={T.meta} style={{ color: TEAL_DARK }}>{s.tag}</span>
                    <h4 className={`${T.cardTitle} mt-2 mb-1.5`}>{s.title}</h4>
                    <p className={`${T.body} mb-3`} style={{ color: MUTED }}>{s.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.pills.map((pill) => (
                        <span key={pill} className="text-[11.5px] font-medium px-2.5 py-1 rounded-md border" style={{ borderColor: BORDER, color: MUTED }}>
                          {pill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ FOUNDING PROGRAMMES ═══════════ */}
        {/* Payable cohorts are featured at double width; the rest drop to a compact 4-up. */}
        <section id="programs" className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <SectionHead
              eyebrow="FOUNDING PROGRAMMES"
              title="Choose your starting point."
              lead="Programmes can run as open cohorts or as customised institutional cohorts. Final schedule and fee are confirmed before secure payment."
              className="mb-9"
            />

            <div className="flex flex-wrap gap-1.5 mb-9">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-4 py-1.5 rounded-full text-[13px] font-semibold border transition-colors duration-200"
                  style={filter === f
                    ? { backgroundColor: INK, color: '#fff', borderColor: INK }
                    : { backgroundColor: '#fff', color: MUTED, borderColor: BORDER }}>
                  {f}
                </button>
              ))}
            </div>

            {featuredPrograms.length > 0 && (
              <div className="grid lg:grid-cols-2 gap-5 mb-5">
                {featuredPrograms.map((p, i) => (
                  <motion.div
                    key={p.title}
                    initial="hidden" whileInView="show" viewport={{ once: true }}
                    variants={fadeUp} transition={step(i)}
                    className={`relative rounded-2xl border p-7 sm:p-8 flex flex-col ${HOVER_LIFT}`}
                    style={{ borderColor: BORDER, backgroundColor: '#fff' }}
                  >
                    <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
                      style={{ background: `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})` }} />

                    <div className="flex items-center justify-between gap-3 mb-5">
                      <span className={T.meta} style={{ color: TEAL_DARK }}>{p.eyebrow}</span>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: TEAL_TINT, color: TEAL_DARK }}>
                        {p.badge}
                      </span>
                    </div>

                    <h3 className="text-[20px] sm:text-[22px] font-semibold leading-snug tracking-[-0.02em] mb-3">{p.title}</h3>
                    <p className={`${T.body} mb-6 flex-grow`} style={{ color: MUTED }}>{p.desc}</p>

                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 py-5 border-y mb-5" style={{ borderColor: BORDER }}>
                      {[['Format', p.format], ['Outcome', p.outcome], ['For', p.forWhom]].map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1" style={{ color: '#aab3c2' }}>{k}</dt>
                          <dd className="text-[12.5px] leading-[1.5]" style={{ color: INK }}>{v}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[26px] font-semibold tracking-[-0.02em] leading-none">{p.fee}</p>
                        <p className="text-[11px] mt-1.5" style={{ color: MUTED }}>incl. 18% GST</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {'brochure' in p && p.brochure && (
                          <button type="button" onClick={() => setBrochureUrl(p.brochure as string)}
                            className="shrink-0 text-[12px] font-semibold underline underline-offset-2"
                            style={{ color: TEAL_DARK }}>
                            View brochure
                          </button>
                        )}
                        <button type="button" onClick={() => openApply(p.title)}
                          className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-[12px] text-white transition-[transform,opacity] duration-200 ease-out hover:opacity-90 active:scale-[0.98]"
                          style={{ backgroundColor: INK }}>
                          {p.cta} <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {otherPrograms.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {otherPrograms.map((p, i) => (
                  <motion.div
                    key={p.title}
                    initial="hidden" whileInView="show" viewport={{ once: true }}
                    variants={fadeUp} transition={step(i, 0.1)}
                    className={`group relative overflow-hidden rounded-xl border bg-white p-6 flex flex-col ${HOVER_LIFT}`}
                    style={{ borderColor: BORDER }}
                  >
                    {/* Accent wipes in on hover, echoing the solid bar on the featured cards
                        above without competing with them at rest. */}
                    <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
                      style={{ background: `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})` }} />

                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full w-fit mb-4"
                      style={{ backgroundColor: LIGHT_BG, color: MUTED, border: `1px solid ${BORDER}` }}>
                      {p.badge}
                    </span>
                    <h3 className={`${T.cardTitle} mb-2.5`}>{p.title}</h3>
                    <p className={`${T.body} mb-6 flex-grow`} style={{ color: MUTED }}>{p.desc}</p>

                    {/* Opens the same modal as the paid cohorts. It has no published fee, so
                        the modal skips Razorpay and submits as a general interest signup —
                        one label, one consistent action across all four cards. */}
                    <button type="button" onClick={() => openApply(p.title)}
                      className="inline-flex items-center justify-center gap-2 py-2.5 rounded-full border text-[13px] font-semibold
                                 border-[#0d7d6f]/35 text-[#0d7d6f]
                                 transition-[background-color,color,border-color,transform] duration-200 ease-out
                                 hover:bg-[#0d7d6f] hover:text-white hover:border-[#0d7d6f] active:scale-[0.98]">
                      {p.cta} <ArrowRight size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {visiblePrograms.length === 0 && (
              <p className={T.body} style={{ color: MUTED }}>No programmes match this filter yet.</p>
            )}

            {/* Not a course catalogue entry — a standing offer that every programme above
                can be re-scoped to one or more departments on request. */}
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
              className="mt-9 rounded-2xl border p-7 sm:p-8"
              style={{ borderColor: BORDER, backgroundColor: LIGHT_BG }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
                <div className="lg:max-w-sm shrink-0">
                  <h3 className="text-[18px] sm:text-[19px] font-semibold tracking-[-0.02em] mb-2" style={{ color: INK }}>
                    Need training built around your department?
                  </h3>
                  <p className={T.body} style={{ color: MUTED }}>
                    Every team doesn&rsquo;t do the same work. Tell us your department and we tailor the modules to it,
                    instead of one generic course for everyone.
                  </p>
                </div>
                <div className="flex-grow">
                  <div className="flex flex-wrap gap-2 mb-5">
                    {CUSTOM_DEPARTMENTS.map((d) => (
                      <span key={d} className="text-[12px] font-medium px-3 py-1.5 rounded-full border bg-white"
                        style={{ borderColor: BORDER, color: INK }}>
                        {d}
                      </span>
                    ))}
                  </div>
                  <button type="button" onClick={() => openApply('Customized Department Training')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-[12px] text-white
                               transition-[transform,opacity] duration-200 ease-out hover:opacity-90 active:scale-[0.98]"
                    style={{ backgroundColor: INK }}>
                    Talk to our experts <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════ VERTICAL SCHOOL ARCHITECTURE ═══════════ */}
        <section className="py-16 lg:py-20 overflow-hidden" style={{ backgroundColor: LIGHT_BG }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead
              anchor={false}
              title={<>Start deep. Then scale across DSeT&apos;s industries.</>}
              lead="Each school combines domain faculty, DSeT platform practitioners, institutional partners and applied research."
              className="mb-9"
            />
          </div>

          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 lg:scroll-px-8
                          px-4 sm:px-6 lg:px-8 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* Spacer keeps the rail aligned to the container on wide screens */}
            <div className="hidden xl:block shrink-0" style={{ width: 'max(0px, calc((100vw - 72rem) / 2 - 2rem))' }} />
            {VERTICAL_SCHOOLS.map((s, i) => (
              <motion.div
                key={s.name}
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={fadeUp} transition={step(i)}
                className={`snap-start shrink-0 w-[270px] sm:w-[300px] rounded-xl p-5 border ${HOVER_LIFT}`}
                style={s.live
                  ? { backgroundColor: NAVY, borderColor: NAVY }
                  : { backgroundColor: '#fff', borderColor: BORDER }}
              >
                <span className={T.meta} style={{ color: s.live ? TEAL : '#aab3c2' }}>
                  {s.status}
                </span>
                <h4 className={`${T.cardTitle} mt-3 mb-2`} style={{ color: s.live ? '#fff' : INK }}>{s.name}</h4>
                <p className="text-[12.5px] leading-[1.6]" style={{ color: s.live ? 'rgba(255,255,255,0.6)' : MUTED }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════ RESEARCH & ACADEMIC RIGOUR (DAARC) ═══════════ */}
        <section className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: NAVY }}>
          <div className="pointer-events-none absolute top-0 left-0 w-1/2 h-full blur-3xl rounded-full" style={{ background: `${TEAL}0d` }} />
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.08fr_0.92fr] gap-10 lg:gap-16 items-start relative">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <Eyebrow dark>RESEARCH AND ACADEMIC RIGOUR</Eyebrow>
              <h2 className={`${T.h2} mb-5 text-white`}>
                Practice informed by research.<br />Research tested in practice.
              </h2>
              <p className="text-white/60 text-[13.5px] sm:text-sm leading-[1.7] mb-4 max-w-lg">
                The DSeT Applied AI &amp; Research Advisory Council (DAARC) is being constituted to guide academic
                quality, responsible AI, research collaboration, publications, IP pathways and industry relevance
                across Academy schools.
              </p>
              <p className="text-[12.5px] text-white/35 leading-relaxed max-w-lg">
                DSeT ARC™ is the delivery and learning framework. DAARC is the proposed advisory and research council.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-px rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              {RESEARCH_PILLARS.map((r, i) => (
                <motion.div
                  key={r.title}
                  initial="hidden" whileInView="show" viewport={{ once: true }}
                  variants={fadeUp} transition={step(i)}
                  className="p-5 transition-colors duration-200 hover:bg-white/[0.06]"
                  style={{ backgroundColor: NAVY }}
                >
                  <h4 className={`${T.cardTitle} mb-2`} style={{ color: TEAL }}>{r.title}</h4>
                  <p className="text-[12.5px] leading-[1.6] text-white/55">{r.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ GOVERNANCE MODEL ═══════════ */}
        <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: LIGHT_BG }}>
          <div className="max-w-5xl mx-auto">
            <SectionHead
              anchor={false}
              title="Built as an ecosystem, not a faculty list."
              lead="Named appointments will be announced only after written consent and confirmation of scope."
              className="mb-10"
            />

            <div className="border-t" style={{ borderColor: BORDER }}>
              {GOVERNANCE_ROLES.map((r, i) => (
                <motion.div
                  key={r.tag}
                  initial="hidden" whileInView="show" viewport={{ once: true }}
                  variants={fadeUp} transition={step(i)}
                  className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_minmax(0,15rem)_1fr] gap-x-4 sm:gap-x-6 gap-y-1.5 items-start
                             py-5 border-b transition-colors duration-200 hover:bg-white/70"
                  style={{ borderColor: BORDER }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-[11px] text-white row-span-2 sm:row-span-1"
                    style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})` }}>
                    {r.tag}
                  </div>
                  <h4 className={`${T.cardTitle} self-center`}>{r.title}</h4>
                  <p className={`${T.body} col-start-2 sm:col-start-3 self-center`} style={{ color: MUTED }}>{r.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
              className="text-[11.5px] leading-relaxed mt-6 max-w-2xl" style={{ color: '#94a0b2' }}>
              Appointments are independent professional/advisory engagements governed by separate written terms;
              they are not represented as employment positions.
            </motion.p>
          </div>
        </section>

        {/* ═══════════ CTA BANNER ═══════════ */}
        <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
              className="rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              style={{ backgroundColor: TEAL }}>
              <div>
                <h3 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.025em] leading-tight mb-2" style={{ color: NAVY_DEEP }}>
                  Bring your domain. Leave with something deployable.
                </h3>
                <p className="text-[13px]" style={{ color: '#0d5c52' }}>
                  Reserve a seat, propose an institutional cohort or join the trainer ecosystem.
                </p>
              </div>
              <button type="button" onClick={() => openApply()}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-[13px] text-white whitespace-nowrap transition-[transform,opacity] duration-200 ease-out hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: NAVY_DEEP }}>
                Start your application <ArrowUpRight size={15} />
              </button>
            </motion.div>
          </div>
        </section>

        {/* ═══════════ FAQ ═══════════ */}
        <section id="enquiry" className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: LIGHT_BG }}>
          <div className="max-w-3xl mx-auto">
            <SectionHead anchor={false} title="Clear answers before you enrol." className="mb-8" />

            <div className="border-t" style={{ borderColor: BORDER }}>
              {FAQS.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <motion.div
                    key={f.q}
                    initial="hidden" whileInView="show" viewport={{ once: true }}
                    variants={fadeUp} transition={step(i)}
                    className="border-b" style={{ borderColor: BORDER }}
                  >
                    <button onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 text-left py-5 group">
                      <span className="text-[14.5px] font-semibold leading-snug transition-opacity duration-200 group-hover:opacity-60">
                        {f.q}
                      </span>
                      <ChevronDown size={17} className="shrink-0 transition-transform duration-200 ease-out"
                        style={{ color: MUTED, transform: isOpen ? 'rotate(180deg)' : 'none' }} />
                    </button>
                    {/* grid-rows 0fr -> 1fr animates height without measuring content. */}
                    <div
                      className="grid transition-[grid-template-rows] duration-[250ms] ease-out"
                      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <p className={`${T.body} pb-5 pr-8`} style={{ color: MUTED }}>{f.a}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t" style={{ borderColor: BORDER }}>
              <Link href="/contact"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-[gap] duration-200 hover:gap-2.5"
                style={{ color: TEAL_DARK }}>
                Still have questions? Contact the Academy team <ArrowRight size={14} />
              </Link>
              <div className="flex items-center gap-2 text-[12.5px]" style={{ color: MUTED }}>
                <span className="font-medium text-slate-600">Connect with us:</span>
                <div className="flex items-center gap-1.5">
                  <a
                    href={ACADEMY_LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Follow DSeT Academy on LinkedIn"
                    aria-label="LinkedIn"
                    className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-200 hover:border-slate-400 hover:text-[#0a66c2] transition-colors"
                  >
                    <IconLinkedin size={13} />
                  </a>
                  <a
                    href={ACADEMY_INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Follow on Instagram"
                    aria-label="Instagram"
                    className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-200 hover:border-slate-400 hover:text-[#e4405f] transition-colors"
                  >
                    <IconInstagram size={13} />
                  </a>
                  <a
                    href={ACADEMY_FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Follow on Facebook"
                    aria-label="Facebook"
                    className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-200 hover:border-slate-400 hover:text-[#1877f2] transition-colors"
                  >
                    <IconFacebook size={13} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </div>

      <ApplicationModal open={applyOpen} onClose={() => setApplyOpen(false)} presetProgramme={applyProgramme} />
      <BrochureModal url={brochureUrl} onClose={() => setBrochureUrl(null)} />
    </Layout>
  );
}
