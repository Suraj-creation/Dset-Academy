import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/components/auth/withAuth';

// ── Types ──────────────────────────────────────────────────────
type ConversationStatus = 'bot' | 'human' | 'closed';

interface Conversation {
  id:                   string; // wa_id
  customerName?:        string;
  status:               ConversationStatus;
  lastInboundAt?:        string;
  lastOutboundAt?:       string;
  handoverRequestedAt?:  string;
  createdAt:             string;
}

const STATUS_META: Record<ConversationStatus, { label: string; bg: string; text: string; border: string }> = {
  human:  { label: 'Needs Human', bg: 'bg-red-100',   text: 'text-red-700',   border: 'border-red-200'   },
  bot:    { label: 'Bot Active',  bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  closed: { label: 'Closed',      bg: 'bg-gray-100',  text: 'text-gray-600',  border: 'border-gray-200'  },
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// ── Main Component ─────────────────────────────────────────────
function AdminWhatsApp() {
  const { logout } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [filter,        setFilter]        = useState<'all' | ConversationStatus>('all');
  const [resettingId,   setResettingId]   = useState<string | null>(null);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/whatsapp/admin/conversations');
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      setError('Failed to load conversations. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConversations(); }, []);

  const handleResumeBot = async (waId: string) => {
    setResettingId(waId);
    try {
      await fetch('/api/whatsapp/admin/reset-status', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ waId }),
      });
      setConversations((prev) => prev.map((c) => (c.id === waId ? { ...c, status: 'bot', handoverRequestedAt: undefined } : c)));
    } catch {
      setError('Failed to resume bot for this conversation.');
    } finally {
      setResettingId(null);
    }
  };

  const handleLogout = () => { logout(); router.replace('/auth/signin'); };

  const needsHuman = conversations.filter((c) => c.status === 'human').length;
  const botActive  = conversations.filter((c) => c.status === 'bot').length;

  const filtered = conversations.filter((c) => filter === 'all' || c.status === filter);

  return (
    <>
      <Head><title>Admin — WhatsApp | DSeT</title></Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">WhatsApp Conversations</h1>
                <p className="text-sm text-gray-500">AI auto-replies &amp; human handovers</p>
              </div>
              <nav className="hidden sm:flex items-center gap-1">
                <Link href="/admin/leads"    className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Leads</Link>
                <Link href="/admin/contacts" className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Contacts</Link>
                <span className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-100">WhatsApp</span>
                <Link href="/admin/whatsapp/coexistence-setup" className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Coexistence Setup</Link>
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

          {/* Info banner */}
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Replies happen inside the DSeT WhatsApp Business App itself (Coexistence). This page is for
            visibility and clearing stuck handovers — it is not a chat interface.
          </div>

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
              <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Total Conversations</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{conversations.length}</p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
                  <p className="text-sm text-red-500">Needs Human</p>
                  <p className="mt-1 text-3xl font-bold text-red-700">{needsHuman}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                  <p className="text-sm text-emerald-600">Bot Active</p>
                  <p className="mt-1 text-3xl font-bold text-emerald-700">{botActive}</p>
                </div>
              </div>

              {/* Filter */}
              <div className="mb-5 flex gap-2">
                {([
                  { key: 'all',    label: `All (${conversations.length})` },
                  { key: 'human',  label: `Needs Human (${needsHuman})` },
                  { key: 'bot',    label: `Bot Active (${botActive})` },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                      filter === key
                        ? 'bg-gray-900 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Conversations list */}
              {filtered.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-gray-200 py-20 text-center text-gray-400">
                  {conversations.length === 0
                    ? 'No WhatsApp conversations yet — they will appear here once customers start messaging.'
                    : 'No results match your filter.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((c) => {
                    const meta = STATUS_META[c.status];
                    return (
                      <div
                        key={c.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#25d366] flex items-center justify-center text-white text-sm font-bold">
                            {(c.customerName ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-gray-900">{c.customerName ?? 'Unknown'}</span>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold border ${meta.bg} ${meta.text} ${meta.border}`}>
                                {meta.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">+{c.id}</p>
                            <p className="text-xs text-gray-400">
                              Last inbound {formatDate(c.lastInboundAt)}
                              {c.handoverRequestedAt && <> · Handover requested {formatDate(c.handoverRequestedAt)}</>}
                            </p>
                          </div>
                        </div>

                        {c.status === 'human' && (
                          <button
                            onClick={() => handleResumeBot(c.id)}
                            disabled={resettingId === c.id}
                            className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
                          >
                            {resettingId === c.id ? 'Resuming…' : 'Resume Bot'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="mt-4 text-xs text-gray-400 text-center">
                {filtered.length} of {conversations.length} conversations shown
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default withAuth(AdminWhatsApp);
