import { Fragment, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/components/auth/withAuth';
import { formatPaise } from '@/lib/academyPrograms';

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
  contacted: boolean;
  createdAt: string;
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
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Academy Registrations</h1>
              <p className="text-sm text-gray-500">Cohort enrolments, Razorpay payments and general interest</p>
            </div>
            <div className="flex items-center gap-4">
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
                                    <dt className="text-gray-500">Role</dt><dd className="text-gray-900">{r.role}</dd>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 py-1">
                                    <dt className="text-gray-500">Institution</dt>
                                    <dd className="text-gray-900">{r.institution || '—'}</dd>
                                  </div>
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
        </div>
      </div>
    </>
  );
}

export default withAuth(AdminAcademyRegistrations);
