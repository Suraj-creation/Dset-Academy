import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/components/auth/withAuth';

// ── Types ──────────────────────────────────────────────────────
type LeadScore = 'hot' | 'warm' | 'cold';

interface Lead {
  id:        string;
  name?:     string;
  email?:    string;
  company?:  string;
  intent:    string;
  score:     LeadScore;
  messages:  number;
  createdAt: string;
}

const SCORE_META: Record<LeadScore, { label: string; bg: string; text: string; border: string }> = {
  hot:  { label: 'Hot',  bg: 'bg-red-100',     text: 'text-red-700',     border: 'border-red-200'     },
  warm: { label: 'Warm', bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200'   },
  cold: { label: 'Cold', bg: 'bg-gray-100',    text: 'text-gray-600',    border: 'border-gray-200'    },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
function AdminLeads() {
  const { logout } = useAuth();
  const router = useRouter();

  const [leads,   setLeads]   = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [filter,  setFilter]  = useState<'all' | LeadScore>('all');
  const [search,  setSearch]  = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/leads');
      const data = await res.json();
      setLeads(data.leads ?? []);
    } catch {
      setError('Failed to load leads. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead permanently?')) return;
    try {
      await fetch(`/api/admin/leads?id=${id}`, { method: 'DELETE' });
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setError('Failed to delete lead.');
    }
  };

  const handleLogout = () => { logout(); router.replace('/auth/signin'); };

  const leadsWithEmail = leads.filter((l) => l.email);
  const hot  = leadsWithEmail.filter((l) => l.score === 'hot').length;
  const warm = leadsWithEmail.filter((l) => l.score === 'warm').length;
  const cold = leadsWithEmail.filter((l) => l.score === 'cold').length;

  const filtered = leadsWithEmail.filter((l) => {
    const matchScore  = filter === 'all' || l.score === filter;
    const q           = search.toLowerCase();
    const matchSearch = !q ||
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.company?.toLowerCase().includes(q);
    return matchScore && matchSearch;
  });

  return (
    <>
      <Head><title>Admin — Chat Leads | DSeT</title></Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chat Leads</h1>
                <p className="text-sm text-gray-500">Visitors interested in consulting</p>
              </div>
              <nav className="hidden sm:flex items-center gap-1">
                <Link href="/admin/contacts"   className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Contacts</Link>
                <Link href="/admin/events"     className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Events</Link>
                <Link href="/admin/blog"       className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Blog</Link>
                <Link href="/admin/careers"    className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Careers</Link>
                <span className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-100">Leads</span>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-8">

          {/* Error banner */}
          {error && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
              <button onClick={() => setError(null)} className="ml-4 font-bold text-red-500 hover:text-red-700">✕</button>
            </div>
          )}

          {loading ? (
            <div className="py-24 text-center text-gray-400">Loading…</div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Total Leads</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{leadsWithEmail.length}</p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
                  <p className="text-sm text-red-500">Hot</p>
                  <p className="mt-1 text-3xl font-bold text-red-700">{hot}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                  <p className="text-sm text-amber-600">Warm</p>
                  <p className="mt-1 text-3xl font-bold text-amber-700">{warm}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Cold</p>
                  <p className="mt-1 text-3xl font-bold text-gray-600">{cold}</p>
                </div>
              </div>

              {/* Search + Filter */}
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search name, email, or company…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-64"
                />
                <div className="flex gap-2">
                  {([
                    { key: 'all',  label: `All (${leadsWithEmail.length})` },
                    { key: 'hot',  label: `Hot (${hot})` },
                    { key: 'warm', label: `Warm (${warm})` },
                    { key: 'cold', label: `Cold (${cold})` },
                  ] as const).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors duration-150 ${
                        filter === key
                          ? 'bg-gray-900 text-white'
                          : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leads list */}
              {filtered.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-gray-200 py-20 text-center text-gray-400">
                  {leadsWithEmail.length === 0
                    ? 'No chat leads yet — they will appear here after chatbot conversations.'
                    : 'No results match your filter.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((lead) => {
                    const meta = SCORE_META[lead.score];
                    return (
                      <div
                        key={lead.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#5e17ea] flex items-center justify-center text-white text-sm font-bold">
                            {(lead.name ?? lead.email ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-gray-900">{lead.name ?? 'Unknown'}</span>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold border ${meta.bg} ${meta.text} ${meta.border}`}>
                                {meta.label}
                                <span className="font-normal opacity-70">· {lead.messages} msg</span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              <a href={`mailto:${lead.email}`} className="hover:text-[#5e17ea]">{lead.email}</a>
                              {lead.company && <> · {lead.company}</>}
                            </p>
                            <p className="text-xs text-gray-400">
                              {lead.intent?.replace(/_/g, ' ')} · {formatDate(lead.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${lead.email}`}
                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            Send Email
                          </a>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="mt-4 text-xs text-gray-400 text-center">
                {filtered.length} of {leadsWithEmail.length} leads shown
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default withAuth(AdminLeads);
