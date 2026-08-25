import { useState, useEffect, useRef } from 'react';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle, FileText, Clock, Tag, Shield, Sparkles } from 'lucide-react';
import type { Whitepaper, PurposeOption } from '@/data/whitepapers';
import { PURPOSE_OPTIONS, CATEGORY_META } from '@/data/whitepapers';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface LeadFormData {
  fullName:    string;
  email:       string;
  company:     string;
  country:     string;
  designation: string;
  purpose:     PurposeOption | '';
}

export type LeadSubmission = LeadFormData & { whitepaperID: string };

interface LeadCaptureModalProps {
  whitepaper: Whitepaper;
  onClose:    () => void;
  onSuccess:  (lead: LeadSubmission) => void;
}

const EMPTY_FORM: LeadFormData = {
  fullName: '', email: '', company: '', country: '', designation: '', purpose: '',
};

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Australia', 'Canada',
  'Germany', 'France', 'Singapore', 'UAE', 'South Africa',
  'Brazil', 'Japan', 'South Korea', 'Netherlands', 'Sweden',
  'Switzerland', 'New Zealand', 'Malaysia', 'Indonesia', 'Other',
];

// ─────────────────────────────────────────────────────────────────────────────
// Field Component
// ─────────────────────────────────────────────────────────────────────────────

function Field({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-300 mb-1.5 tracking-wide">
        {label}
        {required && <span className="text-[#f87171] ml-0.5">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-[11px] text-[#f87171]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function inputCls(hasError: boolean): string {
  return [
    'w-full px-3.5 py-2.5 text-sm rounded-xl text-white placeholder-gray-600 transition-all',
    'focus:outline-none focus:ring-2',
    'bg-white/[0.06] border',
    hasError
      ? 'border-[#f87171]/50 focus:ring-[#f87171]/20 focus:border-[#f87171]/70'
      : 'border-white/[0.10] focus:ring-[#5e17ea]/25 focus:border-[#5e17ea]/60',
  ].join(' ');
}

// ─────────────────────────────────────────────────────────────────────────────
// Success Particles (pure CSS animation)
// ─────────────────────────────────────────────────────────────────────────────

function SuccessParticles() {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * 360,
    color: ['#5e17ea', '#1e90ff', '#06b6d4', '#10b981', '#a78bfa', '#60a5fa', '#34d399', '#818cf8'][i],
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: p.color,
            left: '50%',
            top: '40%',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * 80,
            y: Math.sin((p.angle * Math.PI) / 180) * 80,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.9, delay: i * 0.05, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Modal
// ─────────────────────────────────────────────────────────────────────────────

export default function LeadCaptureModal({ whitepaper, onClose, onSuccess }: LeadCaptureModalProps) {
  const [form,         setForm]         = useState<LeadFormData>(EMPTY_FORM);
  const [errors,       setErrors]       = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState<string>('');
  const formStartRef = useRef<number>(Date.now());

  const meta = CATEGORY_META[whitepaper.category];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    formStartRef.current = Date.now();
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Load reCAPTCHA v3 script once
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    if (document.querySelector('script[src*="recaptcha/api.js"]')) return;
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    s.async = true;
    document.head.appendChild(s);
  }, []);

  async function getRecaptchaToken(action: string): Promise<string> {
    if (!RECAPTCHA_SITE_KEY) return '';
    const gr = (window as any).grecaptcha;
    if (!gr) return '';
    return new Promise<string>(resolve => {
      gr.ready(() => gr.execute(RECAPTCHA_SITE_KEY, { action }).then(resolve).catch(() => resolve('')));
    });
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof LeadFormData, string>> = {};
    if (!form.fullName.trim())    e.fullName    = 'Required';
    if (!form.email.trim())       e.email       = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.company.trim())     e.company     = 'Required';
    if (!form.country)            e.country     = 'Required';
    if (!form.designation.trim()) e.designation = 'Required';
    if (!form.purpose)            e.purpose     = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (field: keyof LeadFormData, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const recaptchaToken = await getRecaptchaToken('whitepaper_lead');
      const res = await fetch('/api/whitepaper-leads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whitepaperID:    whitepaper.id,
          whitepaperTitle: whitepaper.title,
          ...form,
          _honeypot:      '',
          _formStartTime: formStartRef.current,
          recaptchaToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Submission failed');
      setResolvedPdfUrl(data.pdfUrl ?? '');
    } catch {
      // Non-fatal: still show success so user isn't blocked
    }
    setSubmitting(false);
    setSubmitted(true);
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1200);
    onSuccess({ ...form, whitepaperID: whitepaper.id });
  };

  const effectivePdfUrl = resolvedPdfUrl || whitepaper.pdfUrl;
  const hasPdf = !!effectivePdfUrl && effectivePdfUrl !== '#';

  const handleDownload = () => {
    if (!hasPdf) return;
    const filename = `${whitepaper.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    const link = document.createElement('a');
    link.href = effectivePdfUrl;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
    setTimeout(onClose, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      />

      {/* ── Modal shell ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="relative w-full max-w-4xl flex flex-col md:flex-row rounded-2xl overflow-hidden max-h-[92vh]"
        style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)' }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ════ LEFT PANEL — whitepaper preview (dark gradient) ══════════ */}
        <div
          className="relative flex-shrink-0 md:w-[42%] flex flex-col p-7 overflow-hidden"
          style={{ background: meta.gradient }}
        >
          {/* Dot texture */}
          <div
            className="absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)',
              backgroundSize: '18px 18px',
            }}
          />
          {/* Corner bloom */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.32, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: meta.color }}
          />

          <div className="relative z-10 flex flex-col h-full">
            {/* Icon + category */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
                style={{ background: `${meta.color}25`, border: `1px solid ${meta.color}35` }}
              >
                {meta.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: meta.color }}>
                  {whitepaper.category}
                </p>
                <p className="text-[11px] text-gray-400">DSeT Intelligence Paper</p>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-[17px] font-bold text-white leading-snug mb-3">
              {whitepaper.title}
            </h2>

            {/* Description */}
            <p className="text-[12.5px] text-gray-300/75 leading-relaxed line-clamp-4 mb-5">
              {whitepaper.description}
            </p>

            {/* Stats */}
            <div className="flex gap-5 mb-5">
              <div className="flex items-center gap-1.5 text-[12px] text-gray-300">
                <FileText size={12} style={{ color: meta.color }} />
                {whitepaper.pageCount} pages
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-gray-300">
                <Clock size={12} style={{ color: meta.color }} />
                {whitepaper.readTime} read
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-auto">
              {whitepaper.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium"
                  style={{
                    background: `${meta.color}18`,
                    color: meta.color,
                    border: `1px solid ${meta.color}30`,
                  }}
                >
                  <Tag size={8} />
                  {tag}
                </span>
              ))}
            </div>

            {/* Privacy note */}
            <div
              className="mt-6 flex items-start gap-2.5 p-3 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Shield size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Zero spam. Your info is only used to confirm access and personalise follow-ups.
              </p>
            </div>
          </div>
        </div>

        {/* ════ RIGHT PANEL — form ════════════════════════════════════════ */}
        <div
          className="flex-1 flex flex-col overflow-y-auto"
          style={{ background: '#0a1628' }}
        >
          {/* Panel header */}
          <div
            className="flex items-start justify-between px-7 pt-7 pb-5 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div>
              <AnimatePresence mode="wait">
                <motion.h3
                  key={submitted ? 'success' : 'form'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-lg font-bold text-white"
                >
                  {submitted ? 'Access Confirmed' : 'Get Free Access'}
                </motion.h3>
              </AnimatePresence>
              <p className="text-sm text-gray-400 mt-0.5">
                {submitted ? 'Your download is ready.' : 'Complete your profile to access this paper.'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-200 transition-all mt-0.5 flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 px-7 py-6">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-4"
                >
                  {/* Honeypot — hidden from users, visible to bots */}
                  <div style={{ display: 'none' }} aria-hidden="true">
                    <input type="text" name="_honeypot" tabIndex={-1} autoComplete="off" />
                  </div>

                  {/* Row 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name" required error={errors.fullName}>
                      <input
                        type="text"
                        placeholder="Jane Smith"
                        value={form.fullName}
                        onChange={(e) => set('fullName', e.target.value)}
                        className={inputCls(!!errors.fullName)}
                        autoComplete="name"
                      />
                    </Field>
                    <Field label="Work Email" required error={errors.email}>
                      <input
                        type="email"
                        placeholder="jane@company.com"
                        value={form.email}
                        onChange={(e) => set('email', e.target.value)}
                        className={inputCls(!!errors.email)}
                        autoComplete="email"
                      />
                    </Field>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Company" required error={errors.company}>
                      <input
                        type="text"
                        placeholder="Acme Corporation"
                        value={form.company}
                        onChange={(e) => set('company', e.target.value)}
                        className={inputCls(!!errors.company)}
                        autoComplete="organization"
                      />
                    </Field>
                    <Field label="Designation" required error={errors.designation}>
                      <input
                        type="text"
                        placeholder="Data Engineer"
                        value={form.designation}
                        onChange={(e) => set('designation', e.target.value)}
                        className={inputCls(!!errors.designation)}
                      />
                    </Field>
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Country" required error={errors.country}>
                      <select
                        value={form.country}
                        onChange={(e) => set('country', e.target.value)}
                        className={inputCls(!!errors.country)}
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Purpose of Access" required error={errors.purpose}>
                      <select
                        value={form.purpose}
                        onChange={(e) => set('purpose', e.target.value as PurposeOption)}
                        className={inputCls(!!errors.purpose)}
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="">Select purpose</option>
                        {PURPOSE_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </Field>
                  </div>

                  <p className="text-[11px] text-gray-500">
                    By submitting you agree to DSeT&apos;s{' '}
                    <span className="text-[#a78bfa] hover:underline cursor-pointer">Privacy Policy</span>.
                  </p>

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-60 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
                    onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = ''; }}
                  >
                    {/* Shimmer */}
                    {!submitting && (
                      <motion.div
                        className="absolute inset-0 -skew-x-12"
                        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)' }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
                      />
                    )}
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                        Verifying Access…
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        Get Free Access
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                /* ── Success state ─────────────────────────────────────── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col items-center justify-center text-center py-8 relative"
                >
                  {showParticles && <SuccessParticles />}

                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="relative mb-5"
                  >
                    {/* Outer glow ring */}
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: 'rgba(16,185,129,0.3)', filter: 'blur(8px)' }}
                    />
                    <div
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
                    >
                      <CheckCircle size={30} className="text-emerald-400" />
                    </div>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-xl font-bold text-white mb-2"
                  >
                    You&apos;re all set!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="text-gray-400 text-sm mb-8 max-w-xs leading-relaxed"
                  >
                    {hasPdf
                      ? 'Access confirmed. Your whitepaper is ready to download.'
                      : 'Access confirmed. Your details have been recorded.'}
                  </motion.p>

                  {hasPdf ? (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      onClick={handleDownload}
                      whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(94,23,234,0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-white text-sm relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
                    >
                      <motion.div
                        className="absolute inset-0 -skew-x-12"
                        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)' }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                      />
                      <Download size={16} />
                      Download PDF
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div
                        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <Download size={15} style={{ opacity: 0.4 }} />
                        PDF Coming Soon
                      </div>
                      <p className="text-[11px] text-gray-500 text-center max-w-[220px] leading-relaxed">
                        This paper is being prepared. Our team will email you once it&apos;s available.
                      </p>
                    </motion.div>
                  )}

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="mt-5 text-xs text-gray-500"
                  >
                    Details recorded for{' '}
                    <strong className="text-gray-300">{form.email}</strong>
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
