import { Fragment, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/components/auth/withAuth';
import { formatPaise } from '@/lib/academyPrograms';
import { Download, FileSpreadsheet, GraduationCap, CreditCard, Activity, Loader2, FileText, Eye } from 'lucide-react';

type PaymentStatus = 'created' | 'paid' | 'failed' | 'refunded';

interface Registration {
  id: string;
  programmeSlug: string;
  programmeTitle: string;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  institution: string | null;
  location: string | null;
  country: string | null;
  batch: string | null;
  department: string | null;
  courseName: string | null;
  currentYear: string | null;
  subjectSpecialization: string | null;
  companyName: string | null;
  companyType: string | null;
  otherProfessionDetail: string | null;
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  currency: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  paymentStatus: PaymentStatus;
  enrollmentStatus: string;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  paymentMethod: string | null;
  amountCaptured: number | null;
  razorpayFee: number | null;
  razorpayTax: number | null;
  payerEmail: string | null;
  payerContact: string | null;
  amountMismatch: boolean;
}

// General interest signups — no payment involved (institutional, interest-list,
// custom cohort, "coming next"). Kept separate from Registration/paymentStatus so
// the revenue stats above are never diluted by rows that were never meant to pay.
interface Interest {
  id: string;
  programmeTitle: string;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  institution: string | null;
  location: string | null;
  country: string | null;
  department: string | null;
  courseName: string | null;
  currentYear: string | null;
  subjectSpecialization: string | null;
  companyName: string | null;
  companyType: string | null;
  otherProfessionDetail: string | null;
  contacted: boolean;
  createdAt: string;
}

// Google-signed-in visitors who viewed or downloaded a programme brochure — the
// lead-capture list for people who showed interest but have not registered yet.
interface BrochureEvent {
  id: string;
  action: string;
  programmeSlug: string;
  programmeTitle: string;
  createdAt: string;
  name: string | null;
  email: string;
  hostedDomain: string | null;
}

const STATUS_META: Record<PaymentStatus, { label: string; cls: string }> = {
  paid:     { label: 'Paid',     cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  created:  { label: 'Pending',  cls: 'bg-amber-100 text-amber-700 border-amber-200'       },
  failed:   { label: 'Failed',   cls: 'bg-red-100 text-red-600 border-red-200'             },
  refunded: { label: 'Refunded', cls: 'bg-slate-200 text-slate-700 border-slate-300'       },
};

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function AdminAcademyRegistrations() {
  const { logout } = useAuth();
  const router = useRouter();

  const [rows, setRows]       = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const [interest, setInterest]             = useState<Interest[]>([]);
  const [interestLoading, setInterestLoading] = useState(true);
  const [interestBusyId, setInterestBusyId]   = useState<string | null>(null);
  const [exporting, setExporting]             = useState<string | null>(null);

  const [brochureEvents, setBrochureEvents]   = useState<BrochureEvent[]>([]);
  const [brochureLoading, setBrochureLoading] = useState(true);

  const handleExport = async (type: string, format: 'xlsx' | 'csv') => {
    const key = `${type}-${format}`;
    setExporting(key);
    try {
      const res = await fetch(`/api/admin/export/${type}?format=${format}`);
      if (!res.ok) throw new Error('Export request failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers.get('content-disposition');
      let filename = `${type}_export.${format}`;
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to generate export file. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/academy-registrations');
        if (res.status === 401) { router.replace('/auth/signin'); return; }
        if (!res.ok) throw new Error('request failed');
        const data = await res.json();
        setRows(data.registrations ?? []);
      } catch {
        setError('Failed to load registrations. Please refresh.');
      } finally {
        setLoading(false);
      }
    })();

    (async () => {
      try {
        const res = await fetch('/api/academy/interest');
        if (!res.ok) return;
        const data = await res.json();
        setInterest(data.registrations ?? []);
      } finally {
        setInterestLoading(false);
      }
    })();

    (async () => {
      try {
        const res = await fetch('/api/admin/brochure-events');
        if (!res.ok) return;
        const data = await res.json();
        setBrochureEvents(data.events ?? []);
      } finally {
        setBrochureLoading(false);
      }
    })();
  }, [router]);

  const handleMarkContacted = async (id: string) => {
    setInterestBusyId(id);
    try {
      const res = await fetch(`/api/academy/interest?id=${id}`, { method: 'PATCH' });
      if (res.ok) setInterest(prev => prev.map(r => r.id === id ? { ...r, contacted: true } : r));
    } finally {
      setInterestBusyId(null);
    }
  };

  const paid = rows.filter(r => r.paymentStatus === 'paid');
  // Revenue counts verified payments only — pending orders are not money received.
  const revenue = paid.reduce((sum, r) => sum + r.totalAmount, 0);

  const filtered = useMemo(() => rows.filter(r => {
    const matchStatus = statusFilter === 'all' || r.paymentStatus === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q
      || r.fullName.toLowerCase().includes(q)
      || r.email.toLowerCase().includes(q)
      || r.mobile.toLowerCase().includes(q)
      || r.programmeTitle.toLowerCase().includes(q)
      || (r.razorpayPaymentId ?? '').toLowerCase().includes(q)
      || (r.razorpayOrderId ?? '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }), [rows, search, statusFilter]);

  const handleLogout = () => { logout(); router.replace('/auth/signin'); };

  return (
    <>
      <Head><title>Admin — Academy Registrations | DSeT</title></Head>

      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Academy Registrations</h1>
              <p className="text-sm text-gray-500">Cohort enrolments, Razorpay payments and general interest</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">← Dashboard</Link>
              <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900">Logout</button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-6">
          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Revenue collected</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{formatPaise(revenue)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Confirmed</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{paid.length}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">
                {rows.filter(r => r.paymentStatus === 'created').length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Failed</p>
              <p className="mt-1 text-2xl font-bold text-red-500">
                {rows.filter(r => r.paymentStatus === 'failed').length}
              </p>
            </div>
          </div>

          {/* Admissions & Payments Export Center */}
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-md">
            {/* Header & All-in-One Master Download */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-5 border-b border-indigo-800/60">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-tight text-white">Admissions &amp; Payments Export Center</h2>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-300 border border-emerald-400/30">Live Neon DB</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">
                      Instant multi-entity reporting for cohort enrolments, Razorpay settlements, and Life Sciences (SLSSDTR) cross-portal referrals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Master All-in-One Link/Button */}
              <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                <button
                  onClick={() => handleExport('unified', 'xlsx')}
                  disabled={!!exporting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {exporting === 'unified-xlsx' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Generating Master Workbook...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 text-white" />
                      <span>All-in-One Executive Workbook (.xlsx)</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-indigo-200/80 font-normal text-right">
                  Includes all 4 sheets: Academic Registrations, Razorpay Payments, Life Sciences Inquiries, and Brochure Downloads
                </p>
              </div>
            </div>

            {/* 4 Individual Datasets — one panel, divided into columns rather than
                nested cards-within-a-card. */}
            <div className="mt-5 rounded-xl border border-white/10 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 bg-white/[0.03] border-b border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200/90">
                  Individual Datasets &amp; Downloads
                </p>
                <p className="text-[11px] text-slate-400">
                  Export each section independently in Excel (.xlsx) or CSV format
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y divide-white/10 sm:divide-y-0 sm:divide-x">
                {[
                  {
                    type: 'registrations', icon: GraduationCap, iconCls: 'bg-indigo-500/20 text-indigo-300',
                    title: 'Academic Registrations',
                    desc: 'Complete participant records, cohorts, demographics, department, and institution details.',
                    btnCls: 'bg-indigo-500/30 hover:bg-indigo-500/40 text-indigo-200 border-indigo-400/30',
                    dlIconCls: 'text-indigo-300',
                  },
                  {
                    type: 'payments', icon: CreditCard, iconCls: 'bg-emerald-500/20 text-emerald-300',
                    title: 'Razorpay Payments',
                    desc: 'Transaction IDs, captured amounts, gateway fees, GST tax breakdown, and net settlements.',
                    btnCls: 'bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-200 border-emerald-400/30',
                    dlIconCls: 'text-emerald-300',
                  },
                  {
                    type: 'lifesciences', icon: Activity, iconCls: 'bg-teal-500/20 text-teal-300',
                    title: 'Life Sciences Inquiries',
                    desc: 'SLSSDTR portal leads, cross-referrals from DSeT, subject specializations, and applicant requests.',
                    btnCls: 'bg-teal-500/30 hover:bg-teal-500/40 text-teal-200 border-teal-400/30',
                    dlIconCls: 'text-teal-300',
                  },
                  {
                    type: 'brochures', icon: FileText, iconCls: 'bg-amber-500/20 text-amber-300',
                    title: 'Brochure Downloads',
                    desc: 'Google-verified visitors who viewed or downloaded a programme brochure, with name, email and timestamp.',
                    btnCls: 'bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 border-amber-400/30',
                    dlIconCls: 'text-amber-300',
                  },
                ].map((d) => (
                  <div key={d.type} className="flex flex-col justify-between p-4 hover:bg-white/[0.03] transition-colors">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-md ${d.iconCls}`}>
                          <d.icon className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">{d.title}</h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">{d.desc}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                      <button
                        onClick={() => handleExport(d.type, 'xlsx')}
                        disabled={!!exporting}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${d.btnCls}`}
                      >
                        {exporting === `${d.type}-xlsx` ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className={`h-3.5 w-3.5 ${d.dlIconCls}`} />
                        )}
                        <span>Download Excel</span>
                      </button>
                      <button
                        onClick={() => handleExport(d.type, 'csv')}
                        disabled={!!exporting}
                        title="Download as CSV"
                        className="inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 px-2.5 py-2 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {exporting === `${d.type}-csv` ? '...' : 'CSV'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, mobile, payment ID…"
              className="min-w-[260px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
            <div className="flex gap-1">
              {(['all', 'paid', 'created', 'failed'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize ${
                    statusFilter === s
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s === 'created' ? 'pending' : s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {loading ? (
            <div className="py-16 text-center text-gray-500">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-500">
              No registrations yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-left">
                    <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-4 py-3">Applicant</th>
                      <th className="px-4 py-3">Programme</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Registered</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map(r => {
                      const meta = STATUS_META[r.paymentStatus] ?? STATUS_META.created;
                      const open = expanded === r.id;
                      return (
                        <Fragment key={r.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">{r.fullName}</div>
                              <div className="text-xs text-gray-500">{r.email}</div>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{r.programmeTitle}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">{formatPaise(r.totalAmount)}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.cls}`}>
                                {meta.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{formatDateTime(r.createdAt)}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => setExpanded(open ? null : r.id)}
                                className="text-xs font-medium text-gray-600 hover:text-gray-900"
                              >
                                {open ? 'Hide' : 'Details'}
                              </button>
                            </td>
                          </tr>
                          {open && (
                            <tr className="bg-gray-50">
                              <td colSpan={6} className="px-4 py-4">
                                <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Registration ID</dt>
                                    <dd className="font-mono text-xs text-gray-900">{r.id}</dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Mobile</dt><dd className="text-gray-900">{r.mobile}</dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Profession</dt><dd className="text-gray-900">{r.role}</dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Batch</dt><dd className="text-gray-900">{r.batch || '—'}</dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Location / Country</dt>
                                    <dd className="text-gray-900">{[r.location, r.country].filter(Boolean).join(', ') || '—'}</dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Institution</dt>
                                    <dd className="text-gray-900">{r.institution || '—'}</dd>
                                  </div>
                                  {r.department && (
                                    <div className="flex justify-between border-b border-gray-200 py-1">
                                      <dt className="text-gray-500">Department</dt><dd className="text-gray-900">{r.department}</dd>
                                    </div>
                                  )}
                                  {(r.courseName || r.currentYear) && (
                                    <div className="flex justify-between border-b border-gray-200 py-1">
                                      <dt className="text-gray-500">Course / Year</dt>
                                      <dd className="text-gray-900">{[r.courseName, r.currentYear].filter(Boolean).join(' · ') || '—'}</dd>
                                    </div>
                                  )}
                                  {r.subjectSpecialization && (
                                    <div className="flex justify-between border-b border-gray-200 py-1">
                                      <dt className="text-gray-500">Subject specialization</dt><dd className="text-gray-900">{r.subjectSpecialization}</dd>
                                    </div>
                                  )}
                                  {(r.companyName || r.companyType) && (
                                    <div className="flex justify-between border-b border-gray-200 py-1">
                                      <dt className="text-gray-500">Company / Type</dt>
                                      <dd className="text-gray-900">{[r.companyName, r.companyType].filter(Boolean).join(' · ') || '—'}</dd>
                                    </div>
                                  )}
                                  {r.otherProfessionDetail && (
                                    <div className="flex justify-between border-b border-gray-200 py-1">
                                      <dt className="text-gray-500">Other (specify)</dt><dd className="text-gray-900">{r.otherProfessionDetail}</dd>
                                    </div>
                                  )}
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Programme fee</dt>
                                    <dd className="text-gray-900">{formatPaise(r.baseAmount)}</dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">GST @ 18%</dt>
                                    <dd className="text-gray-900">{formatPaise(r.gstAmount)}</dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Order ID</dt>
                                    <dd className="font-mono text-xs text-gray-900">{r.razorpayOrderId ?? '—'}</dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Payment ID</dt>
                                    <dd className="font-mono text-xs text-gray-900">{r.razorpayPaymentId ?? '—'}</dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Enrolment</dt>
                                    <dd className="text-gray-900 capitalize">{r.enrollmentStatus}</dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Paid at</dt>
                                    <dd className="text-gray-900">{formatDateTime(r.paidAt)}</dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Method</dt>
                                    <dd className="text-gray-900 uppercase">{r.paymentMethod ?? '—'}</dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Captured</dt>
                                    <dd className="text-gray-900">
                                      {r.amountCaptured != null ? formatPaise(r.amountCaptured) : '—'}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Razorpay fee + tax</dt>
                                    <dd className="text-gray-900">
                                      {r.razorpayFee != null ? formatPaise(r.razorpayFee + (r.razorpayTax ?? 0)) : '—'}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Net settlement</dt>
                                    <dd className="font-semibold text-gray-900">
                                      {r.amountCaptured != null
                                        ? formatPaise(r.amountCaptured - (r.razorpayFee ?? 0) - (r.razorpayTax ?? 0))
                                        : '—'}
                                    </dd>
                                  </div>
                                  {r.amountMismatch && (
                                    <div className="flex justify-between border-b border-gray-200 py-1 sm:col-span-2">
                                      <dt className="text-gray-500">⚠ Amount</dt>
                                      <dd className="font-semibold text-red-600">
                                        Captured amount differs from the quoted fee — reconcile in Razorpay.
                                      </dd>
                                    </div>
                                  )}
                                  {r.failureReason && (
                                    <div className="flex justify-between border-b border-gray-200 py-1 sm:col-span-2">
                                      <dt className="text-gray-500">Failure reason</dt>
                                      <dd className="text-red-600">{r.failureReason}</dd>
                                    </div>
                                  )}
                                </dl>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── General interest ── */}
          {/* No payment involved (institutional, interest-list, custom cohort, "coming
              next"). Separate table since these rows never carry payment/status fields. */}
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">General Interest</h2>
                <p className="text-sm text-gray-500">Signups with no published fee yet — no payment involved</p>
              </div>
              {!interestLoading && (
                <span className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                  {interest.filter(r => !r.contacted).length} awaiting outreach
                </span>
              )}
            </div>

            {interestLoading ? (
              <div className="py-10 text-center text-gray-500">Loading…</div>
            ) : interest.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white py-10 text-center text-gray-500">
                No interest signups yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-left">
                      <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <th className="px-4 py-3">Applicant</th>
                        <th className="px-4 py-3">Programme</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Submitted</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {interest.map(r => (
                        <tr key={r.id} className={r.contacted ? 'opacity-60' : 'hover:bg-gray-50'}>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">{r.fullName}</div>
                            <div className="text-xs text-gray-500">{r.email} · {r.mobile}</div>
                            {r.institution && <div className="text-xs text-gray-400">{r.institution}</div>}
                            {r.department && <div className="text-xs text-gray-400">Dept: {r.department}</div>}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{r.programmeTitle}</td>
                          <td className="px-4 py-3 text-gray-500">{r.role}</td>
                          <td className="px-4 py-3 text-gray-500">{formatDateTime(r.createdAt)}</td>
                          <td className="px-4 py-3 text-right">
                            {r.contacted ? (
                              <span className="text-xs font-medium text-emerald-600">Contacted</span>
                            ) : (
                              <button
                                onClick={() => handleMarkContacted(r.id)}
                                disabled={interestBusyId === r.id}
                                className="text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
                              >
                                Mark contacted
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── Brochure activity ── */}
          {/* Google-verified visitors who viewed or downloaded a brochure but have not
              necessarily registered — the earliest, widest-funnel signal on this page. */}
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Brochure Activity</h2>
                <p className="text-sm text-gray-500">Google sign-ins captured on brochure view or download</p>
              </div>
              {!brochureLoading && (
                <span className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                  {brochureEvents.length} events
                </span>
              )}
            </div>

            {brochureLoading ? (
              <div className="py-10 text-center text-gray-500">Loading…</div>
            ) : brochureEvents.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white py-10 text-center text-gray-500">
                No brochure activity yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-left">
                      <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <th className="px-4 py-3">Visitor</th>
                        <th className="px-4 py-3">Brochure</th>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">When</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {brochureEvents.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">{e.name ?? e.email}</div>
                            <div className="text-xs text-gray-500">{e.email}</div>
                            {e.hostedDomain && <div className="text-xs text-gray-400">{e.hostedDomain}</div>}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{e.programmeTitle}</td>
                          <td className="px-4 py-3">
                            {e.action === 'download' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                <Download className="h-3 w-3" /> Downloaded
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                <Eye className="h-3 w-3" /> Viewed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{formatDateTime(e.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(AdminAcademyRegistrations);
