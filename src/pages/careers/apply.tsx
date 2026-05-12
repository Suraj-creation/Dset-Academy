import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import type { GetStaticProps } from 'next';
import { ArrowLeft, ArrowRight, Briefcase, CheckCircle, MapPin, UploadCloud, File, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { getActiveJobs, type JobWithStatus } from '@/lib/jobs.server';

// ── Styling constants ──────────────────────────────────────────
const inputBase =
  'w-full rounded-xl border border-[#dce7f5] bg-[#f8fafd] px-4 py-3 text-sm text-[#001f3f] placeholder:text-[#94a3b8] outline-none transition-all duration-150 focus:border-[#1e90ff] focus:bg-white focus:ring-2 focus:ring-[#1e90ff]/10';
const inputErr =
  'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100/50';

const smoothEase = [0.22, 1, 0.36, 1] as const;

// ── Types ──────────────────────────────────────────────────────
type FormData = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  experience: string;
  noticePeriod: string;
  source: string;
  coverNote: string;
};

// ── Validation ─────────────────────────────────────────────────
function validate(d: FormData): Record<string, string> {
  const e: Record<string, string> = {};
  if (!d.name.trim() || d.name.length < 2) e.name = 'Full name is required.';
  if (!d.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email))
    e.email = 'A valid email address is required.';
  if (!d.phone.trim() || d.phone.length < 6) e.phone = 'Phone number is required.';
  if (d.linkedin && !/^https?:\/\/(www\.)?linkedin\.com/.test(d.linkedin))
    e.linkedin = 'Must be a valid linkedin.com URL.';
  if (!d.experience) e.experience = 'Please select your experience level.';
  if (!d.noticePeriod) e.noticePeriod = 'Please select your notice period.';
  if (!d.source) e.source = 'Please tell us how you found this role.';
  if (!d.coverNote.trim() || d.coverNote.length < 30)
    e.coverNote = 'Please write at least 30 characters.';
  return e;
}

// ── Sub-components ─────────────────────────────────────────────
function FormSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[#001f3f] text-[10px] font-extrabold text-white">
          {number}
        </span>
        <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#001f3f]">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-semibold text-[#001f3f]">
        {label}
        {required && <span className="ml-0.5 text-[#ff851b]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-[11px] leading-snug text-[#8a9ab0]">{hint}</p>}
      {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

interface ApplyProps { jobs: JobWithStatus[] }

// ── Page ───────────────────────────────────────────────────────
export default function ApplyPage({ jobs }: ApplyProps) {
  const router = useRouter();
  const jobId = router.isReady ? Number(router.query.id) : null;
  const job = jobs.find((j) => j.id === jobId) ?? null;

  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '',
    linkedin: '', portfolio: '',
    experience: '', noticePeriod: '', source: '',
    coverNote: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');

  const setField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // cls: returns input class with optional error state
  const cls = (field: keyof FormData, extra = '') =>
    `${inputBase}${errors[field] ? ` ${inputErr}` : ''} ${extra}`.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (!resumeFile) {
      setResumeError('Please upload your resume (PDF, max 5 MB).');
      errs.resumeFile = 'required';
    } else {
      setResumeError('');
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTimeout(() => {
        document.querySelector('[data-has-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      // 1. Upload PDF
      const fd = new window.FormData();
      fd.append('resume', resumeFile!);
      const uploadRes = await fetch('/api/upload-resume', { method: 'POST', body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Resume upload failed.');
      const resumeLink: string = uploadData.url;

      // 2. Submit application
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job?.id, jobTitle: job?.title, ...form, resumeLink }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Submission failed.');
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────
  if (!router.isReady) {
    return (
      <Layout title="Apply | DSeT Careers">
        <div className="flex min-h-screen items-center justify-center bg-[#0c1629]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      </Layout>
    );
  }

  // ── Not found ──────────────────────────────────────────────
  if (!job) {
    return (
      <Layout title="Role Not Found | DSeT Careers">
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c1629] px-4 text-center">
          <p className="mb-3 text-sm text-white/40">Role not found</p>
          <h1 className="mb-7 text-3xl font-bold text-white">This role no longer exists.</h1>
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#001f3f] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse all roles
          </Link>
        </div>
      </Layout>
    );
  }

  // ── Main ───────────────────────────────────────────────────
  return (
    <Layout
      title={`Apply — ${job.title} | DSeT Careers`}
      description={`Apply for ${job.title} at DSeT Consulting. ${job.description}`}
    >
      <div className="min-h-screen bg-[#0c1629]">

        {/* Breadcrumb */}
        <div className="border-b border-white/[0.06] bg-[#0b1829]">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-[13px] text-white/40">
              <Link href="/careers" className="transition-colors duration-150 hover:text-white/80">
                Careers
              </Link>
              <span>/</span>
              <span className="text-white/60">{job.department}</span>
              <span>/</span>
              <span className="max-w-[240px] truncate text-white/90">{job.title}</span>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr] lg:items-start">

            {/* ── Left: Job Summary (sticky) ─────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: smoothEase }}
              className="lg:sticky lg:top-32"
            >
              <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
                {/* Gradient accent bar */}
                <div
                  className="h-1.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${job.color}, #1e90ff)` }}
                />
                <div className="p-7">
                  {/* Badges */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold text-white"
                      style={{ backgroundColor: job.color }}
                    >
                      {job.department}
                    </span>
                    <span className="inline-flex rounded-full border border-[#e8eef7] bg-[#f3f7fb] px-3 py-1 text-[11px] font-medium text-[#5a6a7a]">
                      {job.level}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-xl font-bold leading-snug tracking-[-0.03em] text-[#001f3f]">
                    {job.title}
                  </h1>

                  {/* Meta */}
                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm text-[#5a6a7a]">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#1e90ff]" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-[#5a6a7a]">
                      <Briefcase className="h-3.5 w-3.5 flex-shrink-0" style={{ color: job.color }} />
                      {job.type}
                    </div>
                  </div>

                  <div className="my-5 h-px bg-[#e8eef7]" />

                  <p className="text-[13px] leading-[1.8] text-[#5a6a7a]">{job.description}</p>

                  <div className="my-5 h-px bg-[#e8eef7]" />

                  <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#001f3f]">
                    Questions?
                  </p>
                  <a href="mailto:careers@dsetconsulting.com" className="text-sm text-[#1e90ff] hover:underline">
                    careers@dsetconsulting.com
                  </a>

                  <div className="mt-6">
                    <Link
                      href="/careers"
                      className="inline-flex items-center gap-2 text-[13px] text-[#8a9ab0] transition-colors duration-150 hover:text-[#001f3f]"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      All open roles
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Right: Form / Success ──────────────────────── */}
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, delay: 0.07, ease: smoothEase }}
                >
                  <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.28)]">

                    {/* Form header */}
                    <div className="border-b border-[#f0f5fc] px-8 pb-6 pt-8">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ff851b]">
                        Application Form
                      </p>
                      <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#001f3f]">
                        Apply for{' '}
                        <span
                          className="bg-clip-text text-transparent"
                          style={{ backgroundImage: `linear-gradient(90deg, ${job.color}, #1e90ff)` }}
                        >
                          {job.title}
                        </span>
                      </h2>
                      <p className="mt-2 text-[13px] text-[#6b7a90]">
                        Fields marked <span className="font-semibold text-[#ff851b]">*</span> are required.
                        We&apos;ll respond within 48 hours.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="divide-y divide-[#f0f5fc]">

                      {/* 01 Your Details */}
                      <div className="px-8 py-7">
                        <FormSection number="01" title="Your Details">
                          <div className="grid gap-5 sm:grid-cols-2">
                            <div data-has-error={errors.name ? '' : undefined}>
                              <Field label="Full Name" required error={errors.name}>
                                <input
                                  type="text"
                                  placeholder="Jane Smith"
                                  value={form.name}
                                  onChange={(e) => setField('name', e.target.value)}
                                  className={cls('name')}
                                />
                              </Field>
                            </div>
                            <div data-has-error={errors.email ? '' : undefined}>
                              <Field label="Email Address" required error={errors.email}>
                                <input
                                  type="email"
                                  placeholder="jane@example.com"
                                  value={form.email}
                                  onChange={(e) => setField('email', e.target.value)}
                                  className={cls('email')}
                                />
                              </Field>
                            </div>
                            <div className="sm:col-span-2" data-has-error={errors.phone ? '' : undefined}>
                              <Field label="Phone Number" required error={errors.phone}>
                                <input
                                  type="tel"
                                  placeholder="+91 98765 43210"
                                  value={form.phone}
                                  onChange={(e) => setField('phone', e.target.value)}
                                  className={cls('phone')}
                                />
                              </Field>
                            </div>
                          </div>
                        </FormSection>
                      </div>

                      {/* 02 Professional Profile */}
                      <div className="px-8 py-7">
                        <FormSection number="02" title="Professional Profile">
                          <div className="grid gap-5 sm:grid-cols-2">
                            <div data-has-error={errors.linkedin ? '' : undefined}>
                              <Field
                                label="LinkedIn URL"
                                error={errors.linkedin}
                                hint="Optional — helps us know you faster"
                              >
                                <input
                                  type="url"
                                  placeholder="https://linkedin.com/in/your-profile"
                                  value={form.linkedin}
                                  onChange={(e) => setField('linkedin', e.target.value)}
                                  className={cls('linkedin')}
                                />
                              </Field>
                            </div>
                            <Field label="GitHub / Portfolio" hint="Optional — share your best work">
                              <input
                                type="url"
                                placeholder="https://github.com/yourname"
                                value={form.portfolio}
                                onChange={(e) => setField('portfolio', e.target.value)}
                                className={inputBase}
                              />
                            </Field>
                          </div>
                        </FormSection>
                      </div>

                      {/* 03 About This Application */}
                      <div className="px-8 py-7">
                        <FormSection number="03" title="About This Application">
                          <div className="grid gap-5 sm:grid-cols-3">
                            <div data-has-error={errors.experience ? '' : undefined}>
                              <Field label="Experience" required error={errors.experience}>
                                <select
                                  value={form.experience}
                                  onChange={(e) => setField('experience', e.target.value)}
                                  className={cls('experience', 'cursor-pointer appearance-none')}
                                >
                                  <option value="">Select…</option>
                                  <option>0–1 year (Fresher)</option>
                                  <option>1–3 years</option>
                                  <option>3–6 years</option>
                                  <option>6–10 years</option>
                                  <option>10+ years</option>
                                </select>
                              </Field>
                            </div>
                            <div data-has-error={errors.noticePeriod ? '' : undefined}>
                              <Field label="Notice Period" required error={errors.noticePeriod}>
                                <select
                                  value={form.noticePeriod}
                                  onChange={(e) => setField('noticePeriod', e.target.value)}
                                  className={cls('noticePeriod', 'cursor-pointer appearance-none')}
                                >
                                  <option value="">Select…</option>
                                  <option>Immediate</option>
                                  <option>15 days</option>
                                  <option>30 days</option>
                                  <option>60 days</option>
                                  <option>90 days</option>
                                </select>
                              </Field>
                            </div>
                            <div data-has-error={errors.source ? '' : undefined}>
                              <Field label="How did you find us?" required error={errors.source}>
                                <select
                                  value={form.source}
                                  onChange={(e) => setField('source', e.target.value)}
                                  className={cls('source', 'cursor-pointer appearance-none')}
                                >
                                  <option value="">Select…</option>
                                  <option>LinkedIn</option>
                                  <option>Google Search</option>
                                  <option>Referral</option>
                                  <option>Job Board</option>
                                  <option>DSeT Website</option>
                                  <option>Other</option>
                                </select>
                              </Field>
                            </div>
                          </div>
                        </FormSection>
                      </div>

                      {/* 04 Why This Role */}
                      <div className="px-8 py-7">
                        <FormSection number="04" title="Why This Role?">
                          <div data-has-error={errors.coverNote ? '' : undefined}>
                            <label className="mb-2 block text-[13px] font-semibold text-[#001f3f]">
                              Cover Note <span className="text-[#ff851b]">*</span>
                            </label>
                            <textarea
                              rows={5}
                              placeholder="I'm excited about this role because..."
                              value={form.coverNote}
                              onChange={(e) => setField('coverNote', e.target.value)}
                              className={`${cls('coverNote')} resize-none`}
                            />
                            <div className="mt-2 flex items-start justify-between gap-4">
                              <p className="text-[11px] leading-snug text-[#8a9ab0]">
                                Tell us why you want to work on this problem and what you&apos;d bring to the team.
                              </p>
                              <span
                                className={`flex-shrink-0 text-[11px] font-semibold ${
                                  form.coverNote.length >= 30 ? 'text-[#22c55e]' : 'text-[#8a9ab0]'
                                }`}
                              >
                                {form.coverNote.length}/30+
                              </span>
                            </div>
                            {errors.coverNote && (
                              <p className="mt-1 text-[11px] text-red-500">{errors.coverNote}</p>
                            )}
                          </div>
                        </FormSection>
                      </div>

                      {/* 05 Resume */}
                      <div className="px-8 py-7">
                        <FormSection number="05" title="Your Resume">
                          <div data-has-error={resumeError ? '' : undefined}>
                            <label className="mb-2 block text-[13px] font-semibold text-[#001f3f]">
                              Resume <span className="text-[#ff851b]">*</span>
                            </label>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="application/pdf,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                if (f && f.size > 5 * 1024 * 1024) {
                                  setResumeError('File is too large. Max 5 MB.');
                                  setResumeFile(null);
                                  return;
                                }
                                setResumeFile(f);
                                setResumeError('');
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className={`w-full rounded-xl border-2 border-dashed px-5 py-7 text-center transition-all duration-150 hover:border-[#1e90ff] focus:outline-none ${
                                resumeError ? 'border-red-300 bg-red-50' : resumeFile ? 'border-[#22c55e] bg-[#f0fdf4]' : 'border-[#dce7f5] bg-[#f8fafd]'
                              }`}
                            >
                              {resumeFile ? (
                                <div className="flex items-center justify-center gap-3">
                                  <File className="h-5 w-5 flex-shrink-0 text-[#22c55e]" />
                                  <span className="max-w-[240px] truncate text-sm font-semibold text-[#001f3f]">
                                    {resumeFile.name}
                                  </span>
                                  <span className="text-xs text-[#8a9ab0]">
                                    ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(ev) => { ev.stopPropagation(); setResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                    className="ml-1 rounded-full p-0.5 text-[#8a9ab0] hover:text-red-500 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <UploadCloud className="h-8 w-8 text-[#8a9ab0]" />
                                  <p className="text-sm font-semibold text-[#001f3f]">Click to upload your resume</p>
                                  <p className="text-xs text-[#8a9ab0]">PDF only · Max 5 MB</p>
                                </div>
                              )}
                            </button>
                            {resumeError && (
                              <p className="mt-1.5 text-[11px] text-red-500">{resumeError}</p>
                            )}
                          </div>
                        </FormSection>
                      </div>

                      {/* Submit row */}
                      <div className="px-8 py-7">
                        {apiError && (
                          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
                            {apiError}
                          </div>
                        )}
                        {/* Honeypot */}
                        <input type="text" name="_honeypot" className="hidden" tabIndex={-1} autoComplete="off" />
                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-[12px] text-[#8a9ab0]">
                            By submitting, you agree to our Privacy Policy.
                          </p>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            style={{
                              background: `linear-gradient(135deg, ${job.color}, #5e17ea)`,
                              boxShadow: `0 8px 28px ${job.color}45`,
                            }}
                          >
                            {submitting ? (
                              <>
                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Submitting…
                              </>
                            ) : (
                              <>
                                Submit Application
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </motion.div>
              ) : (

                /* ── Success state ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: smoothEase }}
                  className="flex items-start justify-center"
                >
                  <div className="w-full overflow-hidden rounded-[1.75rem] bg-white px-8 py-16 text-center shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:px-14">
                    {/* Animated check */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
                      className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full"
                      style={{ background: `linear-gradient(135deg, ${job.color}25, #22c55e25)` }}
                    >
                      <CheckCircle className="h-10 w-10 text-[#22c55e]" />
                    </motion.div>

                    <p
                      className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.16em]"
                      style={{ color: job.color }}
                    >
                      Application Received
                    </p>
                    <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#001f3f]">
                      Thank you, {form.name.split(' ')[0]}!
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#5a6a7a]">
                      We&apos;ve received your application for{' '}
                      <span className="font-semibold text-[#001f3f]">{job.title}</span>. Our team will
                      review it and get back to you within{' '}
                      <span className="font-semibold text-[#001f3f]">48 hours</span>.
                    </p>

                    {/* Summary card */}
                    <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-[#e8eef7] bg-[#f8fafd] px-6 py-5 text-left">
                      <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8a9ab0]">
                        Submission Summary
                      </p>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[#5a6a7a]">Role</span>
                          <span className="text-right font-semibold text-[#001f3f] max-w-[200px] truncate">{job.title}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[#5a6a7a]">Email sent to</span>
                          <span className="font-semibold text-[#001f3f] truncate max-w-[200px]">{form.email}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[#5a6a7a]">Notice Period</span>
                          <span className="font-semibold text-[#001f3f]">{form.noticePeriod}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[#5a6a7a]">Experience</span>
                          <span className="font-semibold text-[#001f3f]">{form.experience}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <Link
                        href="/careers"
                        className="inline-flex items-center gap-2 rounded-full border border-[#dce7f5] bg-[#f8fafd] px-6 py-3 text-sm font-semibold text-[#001f3f] transition-colors duration-200 hover:border-[#1e90ff] hover:text-[#1e90ff]"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Browse more roles
                      </Link>
                      <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
                        style={{ background: `linear-gradient(135deg, ${job.color}, #5e17ea)` }}
                      >
                        Back to DSeT
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<ApplyProps> = async () => {
  const jobs = await getActiveJobs();
  return { props: { jobs }, revalidate: 60 };
};
