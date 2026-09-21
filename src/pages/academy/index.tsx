import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { productPageFont } from '@/lib/productPageTypography';
import { ArrowRight, ArrowUpRight, ChevronDown, X } from 'lucide-react';

const IconLinkedin = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className="inline-block flex-shrink-0">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

/* ─── Brand tokens ─────────────────────────────────────────── */
const NAVY      = '#0a1830';
const NAVY_DEEP = '#071224';
const TEAL      = '#20c4ad';
const INK       = '#0f1b2d';
const MUTED     = '#64748b';
const LIGHT_BG  = '#f6f7fb';
const BORDER    = '#e6e9f0';
const ACADEMY_LINKEDIN_URL = 'https://www.linkedin.com/company/103688936/';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

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
  },
  {
    eyebrow: 'VENTURE PATHWAY', badge: 'Enrolment open', badgeLive: true,
    title: 'Entrepreneur Mastery Program', tags: ['Entrepreneurs'],
    desc: 'Lead AI adoption across your organisation — or build your own AI-transformation practice — for Life Science & Healthcare, through 60+ AI tools mapped to 18 business departments.',
    format: '32-hour workshop cohort', outcome: 'Detailed certificate + paid assignments', forWhom: 'Founders and aspiring entrepreneurs',
    fee: '₹60,180', cta: 'Register for this cohort', href: '/academy/programs/entrepreneur-mastery',
  },
  {
    eyebrow: 'CAMPUS TO CAREER', badge: 'Institutional', badgeLive: false,
    title: 'AI Foundations for Life Sciences Students', tags: ['Students'],
    desc: 'Practical AI literacy, data thinking, safe tool use and a domain capstone designed for employability and research readiness.',
    format: 'Live labs + project', outcome: 'Demonstrable capstone portfolio', forWhom: 'UG, PG and research students',
    fee: null, cta: 'Request a campus cohort', href: '#enquiry',
  },
  {
    eyebrow: 'MULTIPLIER', badge: 'Interest list', badgeLive: false,
    title: 'DSeT Applied AI Train-the-Trainer', tags: ['Trainers'],
    desc: 'Learn facilitation, lab design, evaluation and vertical adaptation to deliver rigorous DSeT Academy learning experiences.',
    format: 'Guided certification pathway', outcome: 'Micro-teach + facilitator portfolio', forWhom: 'Trainers and domain practitioners',
    fee: null, cta: 'Join the interest list', href: '#enquiry',
  },
  {
    eyebrow: 'INSTITUTIONAL', badge: 'Custom cohort', badgeLive: false,
    title: 'AI Curriculum & Faculty Enablement Lab', tags: ['Faculty'],
    desc: 'A working lab for departments that need curriculum mapping, faculty capacity, assessments and industry-linked student projects.',
    format: 'Department workshop + advisory', outcome: 'Implementable curriculum blueprint', forWhom: 'Universities, colleges, councils',
    fee: null, cta: 'Plan an institutional cohort', href: '#enquiry',
  },
  {
    eyebrow: 'CROSS-VERTICAL', badge: 'Coming next', badgeLive: false,
    title: 'Applied AI for Engineering & Management', tags: ['Students', 'Entrepreneurs'],
    desc: 'Problem framing, agentic workflows, analytics and implementation thinking through industrial and enterprise casework.',
    format: 'Modular live cohort', outcome: 'Industry problem portfolio', forWhom: 'Engineering and management learners',
    fee: null, cta: 'Get launch updates', href: '#enquiry',
  },
];

const VERTICAL_SCHOOLS = [
  { name: 'School of Life Sciences',            desc: 'Pharma, healthcare, nursing, wellness and life-sciences research.', status: 'NOW LAUNCHING', live: true },
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

const PROGRAMME_OPTIONS = [...PROGRAMS.map((p) => p.title), 'Institutional partnership'];
const ROLE_OPTIONS = [
  'Faculty / academic leader',
  'Trainer / facilitator',
  'Student / researcher',
  'Entrepreneur / founder',
  'Institution / corporate representative',
];

/* ═══════ Small UI pieces ═══════ */
function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-4 h-px" style={{ backgroundColor: TEAL }} />
      <span className="text-xs font-semibold tracking-[0.12em]" style={{ color: dark ? TEAL : '#0d7d6f' }}>
        {children}
      </span>
    </div>
  );
}

const inputClass = 'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:ring-2';

function ApplicationModal({ open, onClose, presetProgramme }: { open: boolean; onClose: () => void; presetProgramme?: string }) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [form, setForm] = useState({ programme: '', fullName: '', email: '', mobile: '', role: '', institution: '', consent: false });
  const [touched, setTouched] = useState(false);

  if (!open) return null;

  const programme = form.programme || presetProgramme || '';
  const isValid = form.fullName.trim() && form.email.trim() && form.mobile.trim() && form.role && form.consent;

  const summaryText =
    `DSeT Academy — Founding Cohort application\n` +
    `Programme: ${programme || 'General enquiry'}\n` +
    `Name: ${form.fullName}\n` +
    `Email: ${form.email}\n` +
    `Mobile: ${form.mobile}\n` +
    `Joining as: ${form.role}\n` +
    `Institution: ${form.institution || '—'}`;

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const whatsappHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(summaryText)}`;
  const emailHref = `mailto:contact@dsetconsulting.com?subject=${encodeURIComponent('DSeT Academy — Founding Cohort application')}&body=${encodeURIComponent(summaryText)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    setStep('success');
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('form');
      setTouched(false);
      setForm({ programme: '', fullName: '', email: '', mobile: '', role: '', institution: '', consent: false });
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={handleClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl">

        <div className="sticky top-0 z-10 bg-white px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b" style={{ borderColor: BORDER }}>
          <button onClick={handleClose} aria-label="Close"
            className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors">
            <X size={18} style={{ color: INK }} />
          </button>
          <Eyebrow>FOUNDING COHORT</Eyebrow>
          <h3 className="text-2xl font-bold" style={{ color: INK }}>
            {step === 'form' ? 'Reserve your place' : 'Reserve your place'}
          </h3>
        </div>

        <div className="relative z-0 px-6 sm:px-8 py-6">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: INK }}>Programme or enquiry</label>
                <div className="relative">
                  <select value={form.programme || presetProgramme || ''} onChange={(e) => setForm({ ...form, programme: e.target.value })}
                    className={`${inputClass} appearance-none pr-10`} style={{ borderColor: TEAL, color: INK }}>
                    <option value="">Choose one</option>
                    {PROGRAMME_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MUTED }} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: INK }}>Full name</label>
                  <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Your name" className={inputClass} style={{ borderColor: touched && !form.fullName ? '#e11d48' : BORDER, color: INK }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: INK }}>Work email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@institution.org" className={inputClass} style={{ borderColor: touched && !form.email ? '#e11d48' : BORDER, color: INK }} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: INK }}>Mobile number</label>
                  <input required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="+91 …" className={inputClass} style={{ borderColor: touched && !form.mobile ? '#e11d48' : BORDER, color: INK }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: INK }}>You are joining as</label>
                  <div className="relative">
                    <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className={`${inputClass} appearance-none pr-10`}
                      style={{ borderColor: touched && !form.role ? '#e11d48' : (form.role ? TEAL : BORDER), color: INK }}>
                      <option value="">Select role</option>
                      {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MUTED }} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: INK }}>Institution / organisation</label>
                <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  placeholder="Institution or company name" className={inputClass} style={{ borderColor: BORDER, color: INK }} />
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded shrink-0" style={{ accentColor: TEAL }} />
                <span className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  I agree to be contacted about this cohort and understand that final schedule, fee, admission and
                  payment details will be confirmed by DSeT Academy.
                </span>
              </label>
              {touched && !isValid && (
                <p className="text-xs font-medium" style={{ color: '#e11d48' }}>Please fill all required fields and accept the consent to continue.</p>
              )}

              <button type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-full font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: TEAL, color: NAVY_DEEP }}>
                Continue to cohort confirmation <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: '#e6fbf7' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d7d6f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-3" style={{ color: INK }}>Registration captured on this device.</h4>
              <p className="text-sm leading-relaxed mb-7" style={{ color: MUTED }}>
                Send your pre-filled application to the Academy team. Once the cohort and fee are confirmed, you
                will receive the verified Razorpay checkout.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: TEAL, color: NAVY_DEEP }}>
                  Send via WhatsApp
                </a>
                <a href={emailHref}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: INK }}>
                  Send via email
                </a>
              </div>

              <div className="rounded-xl p-4 text-xs leading-relaxed" style={{ backgroundColor: '#fff8e6', color: '#8a6d1f' }}>
                Razorpay activation requires the approved cohort payment link or live key/order service. No payment
                data is collected on this page.
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function AcademyPage() {
  const [filter, setFilter] = useState('All');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyProgramme, setApplyProgramme] = useState<string | undefined>(undefined);

  const openApply = (programme?: string) => {
    setApplyProgramme(programme);
    setApplyOpen(true);
  };

  const visiblePrograms = filter === 'All' ? PROGRAMS : PROGRAMS.filter((p) => p.tags.includes(filter));

  return (
    <Layout
      title="DSeT Academy | Applied Intelligence, Taught"
      description="DSeT Academy — a practitioner-led capability platform where educators, trainers, students and entrepreneurs learn to apply AI inside the industries they already understand. Starting with the School of Life Sciences."
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
              <motion.div initial="hidden" animate="show" variants={fadeUp} className="flex items-center gap-2.5 mb-5">
                <span className="w-5 h-[2px] rounded-full" style={{ backgroundColor: TEAL }} />
                <span className="text-xs sm:text-sm font-semibold tracking-[0.14em]" style={{ color: TEAL }}>
                  DSeT Academy · Founding Cohorts
                </span>
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-[1.12] tracking-tight mb-5 text-white"
              >
                Domain expertise.<br />
                <span style={{ color: TEAL }}>Applied AI.</span><br />
                Real outcomes.
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="text-base sm:text-lg text-white/80 max-w-xl mb-8 leading-relaxed font-normal"
              >
                A practitioner-led capability platform where educators, trainers, students and entrepreneurs
                learn to apply AI inside the industries they already understand.
              </motion.p>

              <motion.div initial="hidden" animate="show" variants={fadeUp} className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => openApply()}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-base text-[#071224] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(32,196,173,0.45)] shadow-lg active:scale-[0.98] cursor-pointer"
                  style={{ backgroundColor: TEAL }}
                >
                  <span>Reserve a cohort seat</span>
                  <ArrowUpRight size={18} strokeWidth={2.5} />
                </button>
                <a
                  href="#life-sciences"
                  className="inline-flex items-center justify-center px-7 py-3.5 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-base bg-white text-[#071224] transition-all duration-200 hover:bg-white/90 hover:scale-[1.03] shadow-lg active:scale-[0.98]"
                >
                  Explore Life Sciences
                </a>
              </motion.div>

              <motion.a
                initial="hidden"
                animate="show"
                variants={fadeUp}
                href={ACADEMY_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/60 hover:text-white transition-colors mt-5"
              >
                <IconLinkedin size={15} /> Follow DSeT Academy on LinkedIn
              </motion.a>
            </div>
          </div>

          {/* Stat strip — 4 columns with vertical dividers matching the screenshot */}
          <div className="border-t border-white/10 relative z-10 w-full" style={{ backgroundColor: '#030c1a' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={stagger}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10"
              >
                {STAT_STRIP.map((s, i) => (
                  <motion.div
                    key={s.title}
                    variants={fadeUp}
                    className={`${i === 0 ? 'lg:pl-0 lg:pr-6' : i === STAT_STRIP.length - 1 ? 'lg:pl-6 lg:pr-0' : 'lg:px-6'} sm:px-6 py-6 sm:py-7 flex flex-col justify-start`}
                  >
                    <h4 className="text-white font-semibold text-base sm:text-[17px] mb-1.5 tracking-tight">
                      {s.title}
                    </h4>
                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                      {s.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════ FOUR CAPABILITY PATHWAYS ═══════════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="max-w-xl">
                <Eyebrow>FOUR CAPABILITY PATHWAYS</Eyebrow>
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: INK }}>
                  One Academy. Four ways to create multiplier impact.
                </h2>
              </motion.div>
              <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                className="max-w-sm text-sm leading-relaxed" style={{ color: MUTED }}>
                DSeT Academy is not a catalogue of generic courses. Each pathway converts existing domain
                knowledge into applied, ethical and deployable AI capability.
              </motion.p>
            </div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border overflow-hidden" style={{ borderColor: BORDER }}>
              {PATHWAYS.map((p, i) => (
                <motion.div key={p.n} variants={fadeUp}
                  className={`p-7 ${i !== PATHWAYS.length - 1 ? 'sm:border-r' : ''} border-b sm:border-b-0`}
                  style={{ borderColor: BORDER }}>
                  <div className="text-3xl font-bold mb-5" style={{ color: '#c9cfdb' }}>{p.n}</div>
                  <h3 className="font-bold mb-3">{p.title}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: MUTED }}>{p.desc}</p>
                  <a href="#programs" className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: TEAL }}>
                    {p.link} <ArrowRight size={14} />
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════ SCHOOL OF LIFE SCIENCES ═══════════ */}
        <section id="life-sciences" className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: LIGHT_BG }}>
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
              className="relative rounded-3xl p-9 sm:p-11 overflow-hidden flex flex-col justify-between" style={{ backgroundColor: NAVY }}>
              <div className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full border border-white/5" />
              <div className="absolute -bottom-8 -right-4 w-44 h-44 rounded-full border border-white/5" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-4 h-px" style={{ backgroundColor: TEAL }} />
                  <span className="text-xs font-semibold tracking-[0.12em] uppercase" style={{ color: TEAL }}>Pioneer School · Now Enrolling</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">School of Life Sciences</h2>
                <p className="text-white/65 leading-relaxed mb-8">
                  AI capability for professionals and institutions across pharmacy, healthcare, nursing, wellness
                  and life-sciences research — grounded in domain evidence, data responsibility and human oversight.
                </p>
              </div>
              <div className="relative inline-flex items-center gap-2 text-sm text-white/80 border border-white/15 rounded-full px-4 py-2.5 w-fit">
                Developed in collaboration with <strong className="text-white">Imperical Consulting (Pvt.) Ltd.</strong>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid gap-4">
              {LIFE_SCIENCE_DOMAINS.map((d) => (
                <motion.div key={d.title} variants={fadeUp}
                  className="bg-white rounded-2xl border p-6 flex gap-4" style={{ borderColor: BORDER }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                    style={{ backgroundColor: '#e6fbf7', color: '#0d7d6f' }}>
                    {d.tag}
                  </div>
                  <div>
                    <h4 className="font-bold mb-1.5">{d.title}</h4>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{d.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════ THE DSeT LEARNING MODEL ═══════════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <Eyebrow>THE DSeT LEARNING MODEL</Eyebrow>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
                From knowing AI to applying it responsibly.
              </h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: MUTED }}>
                Every cohort follows a six-stage learning journey adapted from DSeT ARC™ — the same execution
                discipline used to move complex industry problems from discovery to value.
              </p>
              <a href="#programs"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm text-white"
                style={{ backgroundColor: INK }}>
                See founding programmes <ArrowRight size={15} />
              </a>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
              className="relative pl-9">
              <div className="absolute left-[9px] top-2 bottom-2 w-px" style={{ backgroundColor: BORDER }} />
              <div className="space-y-10">
                {LEARNING_MODEL.map((step) => (
                  <motion.div key={step.tag} variants={fadeUp} className="relative">
                    <span className="absolute -left-9 top-1 w-[18px] h-[18px] rounded-full border-2 bg-white flex items-center justify-center"
                      style={{ borderColor: TEAL }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TEAL }} />
                    </span>
                    <span className="text-xs font-semibold tracking-[0.1em] uppercase" style={{ color: '#4a7fd6' }}>{step.tag}</span>
                    <h4 className="font-bold text-lg mt-1.5 mb-1.5">{step.title}</h4>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: MUTED }}>{step.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.pills.map((pill) => (
                        <span key={pill} className="text-xs font-medium px-3 py-1.5 rounded-full border" style={{ borderColor: BORDER, color: INK }}>
                          {pill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════ FOUNDING PROGRAMMES ═══════════ */}
        <section id="programs" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="max-w-xl">
                <Eyebrow>FOUNDING PROGRAMMES</Eyebrow>
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight">Choose your starting point.</h2>
              </motion.div>
              <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                className="max-w-sm text-sm leading-relaxed" style={{ color: MUTED }}>
                Programmes can run as open cohorts or as customised institutional cohorts. Final schedule and
                fee are confirmed before secure payment.
              </motion.p>
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-5 py-2 rounded-full text-sm font-semibold border transition-colors"
                  style={filter === f
                    ? { backgroundColor: INK, color: '#fff', borderColor: INK }
                    : { backgroundColor: '#fff', color: INK, borderColor: BORDER }}>
                  {f}
                </button>
              ))}
            </div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visiblePrograms.map((p) => (
                <motion.div key={p.title} variants={fadeUp}
                  className="rounded-2xl border p-7 flex flex-col" style={{ borderColor: BORDER }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold tracking-[0.1em] uppercase" style={{ color: TEAL }}>{p.eyebrow}</span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: p.badgeLive ? '#e6fbf7' : '#f1f2f6', color: p.badgeLive ? '#0d7d6f' : MUTED }}>
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-3 leading-snug">{p.title}</h3>
                  <p className="text-sm leading-relaxed mb-5 flex-grow" style={{ color: MUTED }}>{p.desc}</p>

                  <div className="text-xs space-y-1.5 mb-6" style={{ color: MUTED }}>
                    <p><strong style={{ color: INK }}>Format:</strong> {p.format}</p>
                    <p><strong style={{ color: INK }}>Outcome:</strong> {p.outcome}</p>
                    <p><strong style={{ color: INK }}>For:</strong> {p.forWhom}</p>
                  </div>

                  {p.fee && <p className="text-xl font-bold mb-4">{p.fee} <span className="text-xs font-normal" style={{ color: MUTED }}>incl. GST</span></p>}

                  <button type="button" onClick={() => openApply(p.title)}
                    className="inline-flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: INK }}>
                    {p.cta}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════ VERTICAL SCHOOL ARCHITECTURE ═══════════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: LIGHT_BG }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="max-w-xl">
                <Eyebrow>VERTICAL SCHOOL ARCHITECTURE</Eyebrow>
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight">Start deep. Then scale across DSeT&apos;s industries.</h2>
              </motion.div>
              <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                className="max-w-sm text-sm leading-relaxed" style={{ color: MUTED }}>
                Each school combines domain faculty, DSeT platform practitioners, institutional partners and applied research.
              </motion.p>
            </div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {VERTICAL_SCHOOLS.map((s) => (
                <motion.div key={s.name} variants={fadeUp}
                  className="rounded-2xl p-6 border"
                  style={s.live
                    ? { backgroundColor: NAVY, borderColor: NAVY }
                    : { backgroundColor: '#fff', borderColor: BORDER }}>
                  <span className="text-[11px] font-semibold tracking-[0.1em] uppercase"
                    style={{ color: s.live ? TEAL : '#4a7fd6' }}>
                    {s.status}
                  </span>
                  <h4 className="font-bold mt-3 mb-2" style={{ color: s.live ? '#fff' : INK }}>{s.name}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: s.live ? 'rgba(255,255,255,0.6)' : MUTED }}>{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════ RESEARCH & ACADEMIC RIGOUR (DAARC) ═══════════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: NAVY }}>
          <div className="pointer-events-none absolute top-0 left-0 w-1/2 h-full blur-3xl rounded-full" style={{ background: `${TEAL}0d` }} />
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start relative">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <Eyebrow dark>RESEARCH AND ACADEMIC RIGOUR</Eyebrow>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-6 text-white">
                Practice informed by research.<br />Research tested in practice.
              </h2>
              <p className="text-white/65 leading-relaxed mb-4">
                The DSeT Applied AI &amp; Research Advisory Council (DAARC) is being constituted to guide academic
                quality, responsible AI, research collaboration, publications, IP pathways and industry relevance
                across Academy schools.
              </p>
              <p className="text-sm text-white/40 leading-relaxed">
                DSeT ARC™ is the delivery and learning framework. DAARC is the proposed advisory and research council.
              </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
              className="grid sm:grid-cols-2 gap-4">
              {RESEARCH_PILLARS.map((r) => (
                <motion.div key={r.title} variants={fadeUp}
                  className="rounded-2xl p-6 border" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <h4 className="font-bold mb-2" style={{ color: TEAL }}>{r.title}</h4>
                  <p className="text-sm leading-relaxed text-white/60">{r.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════ GOVERNANCE MODEL ═══════════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: LIGHT_BG }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="max-w-xl">
                <Eyebrow>GOVERNANCE MODEL</Eyebrow>
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                  Built as an ecosystem, not a faculty list.
                </h2>
              </motion.div>
              <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                className="max-w-sm text-sm leading-relaxed" style={{ color: MUTED }}>
                Named appointments will be announced only after written consent and confirmation of scope.
              </motion.p>
            </div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
              {GOVERNANCE_ROLES.map((r) => (
                <motion.div key={r.tag} variants={fadeUp}
                  className="bg-white rounded-2xl border p-6" style={{ borderColor: BORDER }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs text-white mb-5"
                    style={{ background: `linear-gradient(135deg, ${TEAL}, #0d7d6f)` }}>
                    {r.tag}
                  </div>
                  <h4 className="font-bold mb-2 leading-snug">{r.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{r.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
              className="text-xs leading-relaxed" style={{ color: MUTED }}>
              Appointments are independent professional/advisory engagements governed by separate written terms;
              they are not represented as employment positions.
            </motion.p>
          </div>
        </section>

        {/* ═══════════ CTA BANNER ═══════════ */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
              className="rounded-3xl p-9 sm:p-11 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              style={{ backgroundColor: TEAL }}>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: NAVY_DEEP }}>
                  Bring your domain. Leave with something deployable.
                </h3>
                <p className="text-sm" style={{ color: '#0d5c52' }}>
                  Reserve a seat, propose an institutional cohort or join the trainer ecosystem.
                </p>
              </div>
              <button type="button" onClick={() => openApply()}
                className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm text-white whitespace-nowrap"
                style={{ backgroundColor: NAVY_DEEP }}>
                Start your application <ArrowUpRight size={16} />
              </button>
            </motion.div>
          </div>
        </section>

        {/* ═══════════ FAQ ═══════════ */}
        <section id="enquiry" className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: LIGHT_BG }}>
          <div className="max-w-3xl mx-auto">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-12">
              <Eyebrow>FREQUENTLY ASKED</Eyebrow>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">Clear answers before you enrol.</h2>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="space-y-3">
              {FAQS.map((f, i) => (
                <motion.div key={f.q} variants={fadeUp} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: BORDER }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 text-left px-6 py-5">
                    <span className="font-semibold text-sm">{f.q}</span>
                    <ChevronDown size={18} className="shrink-0 transition-transform" style={{ color: MUTED, transform: openFaq === i ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: MUTED }}>{f.a}</div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mt-10 text-center">
              <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: TEAL }}>
                Still have questions — contact the Academy team <ArrowRight size={15} />
              </Link>
            </motion.div>
          </div>
        </section>

      </div>

      <ApplicationModal open={applyOpen} onClose={() => setApplyOpen(false)} presetProgramme={applyProgramme} />
    </Layout>
  );
}
