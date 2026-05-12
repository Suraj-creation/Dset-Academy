import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/components/auth/withAuth';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  message: string;
  submittedAt: string;
  read: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function AdminContacts() {
  const { logout } = useAuth();
  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/contact');
      const data = await res.json();
      setContacts(data.contacts ?? []);
    } catch {
      setError('Failed to load contacts. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact permanently?')) return;
    try {
      await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('Failed to delete contact.');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/contact?id=${id}`, { method: 'PATCH' });
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, read: true } : c))
      );
    } catch {
      setError('Failed to mark as read.');
    }
  };

  const handleLogout = () => { logout(); router.replace('/auth/signin'); };

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.service?.toLowerCase().includes(q)
    );
  });

  const unread = contacts.filter((c) => !c.read).length;

  return (
    <>
      <Head><title>Admin — Contacts | DSeT</title></Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Contacts</h1>
                <p className="text-sm text-gray-500">Demo requests from the contact form</p>
              </div>
              <nav className="hidden sm:flex items-center gap-1">
                <span className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-100">Contacts</span>
                <Link href="/admin/leads"   className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Leads</Link>
                <Link href="/admin/events"  className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Events</Link>
                <Link href="/admin/blog"    className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Blog</Link>
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
              <div className="mb-8 grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Total Submissions</p>
                  <p className="mt-1 text-3xl font-bold" style={{ color: '#10b981' }}>{contacts.length}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Unread</p>
                  <p className="mt-1 text-3xl font-bold" style={{ color: '#ef4444' }}>{unread}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Read</p>
                  <p className="mt-1 text-3xl font-bold text-gray-400">{contacts.length - unread}</p>
                </div>
              </div>

              {/* Search */}
              <div className="mb-5">
                <input
                  type="text"
                  placeholder="Search name, email, company, or service…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-72"
                />
              </div>

              {/* Contacts list */}
              {filtered.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-gray-200 py-20 text-center text-gray-400">
                  {contacts.length === 0
                    ? 'No contact form submissions yet.'
                    : 'No results match your search.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((contact) => (
                    <div
                      key={contact.id}
                      className={`rounded-xl border bg-white shadow-sm transition-all ${contact.read ? 'border-gray-200' : 'border-[#10b981]/40 bg-emerald-50/30'}`}
                    >
                      {/* Row */}
                      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#10b981] flex items-center justify-center text-white text-sm font-bold">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-gray-900">{contact.name}</span>
                              {!contact.read && (
                                <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-700">
                                  New
                                </span>
                              )}
                              {contact.service && (
                                <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600">
                                  {contact.service}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              <a href={`mailto:${contact.email}`} className="hover:text-[#10b981]">{contact.email}</a>
                              {contact.company && <> · {contact.company}</>}
                              {contact.phone && <> · {contact.phone}</>}
                            </p>
                            <p className="text-xs text-gray-400">{formatDate(contact.submittedAt)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpanded(expanded === contact.id ? null : contact.id)}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            {expanded === contact.id ? 'Hide' : 'View Message'}
                          </button>
                          <a
                            href={`mailto:${contact.email}`}
                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            Reply
                          </a>
                          {!contact.read && (
                            <button
                              onClick={() => handleMarkRead(contact.id)}
                              className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Expanded message */}
                      {expanded === contact.id && (
                        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 rounded-b-xl">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Message</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{contact.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-4 text-xs text-gray-400 text-center">
                {filtered.length} of {contacts.length} contacts shown
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default withAuth(AdminContacts);
