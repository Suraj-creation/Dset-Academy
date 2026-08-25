import { useState, useMemo, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/components/auth/withAuth';
import { WHITEPAPER_CATEGORIES, CATEGORY_META, type WhitepaperCategory } from '@/data/whitepapers';
import type { WhitepaperRecord, WhitepaperLeadRecord } from '@/lib/whitepapers.server';

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab        = 'whitepapers' | 'leads';
type LeadStatus = 'valid' | 'suspicious' | 'rejected';

interface FormData {
  title:        string;
  description:  string;
  category:     WhitepaperCategory | '';
  pdfUrl:       string;
  thumbnailUrl: string;
  isPublished:  boolean;
  pageCount:    string;
  readTime:     string;
  tags:         string;
}

const EMPTY_FORM: FormData = {
  title: '', description: '', category: '', pdfUrl: '', thumbnailUrl: '',
  isPublished: true, pageCount: '', readTime: '', tags: '',
};

const STATUS_META: Record<LeadStatus, { label: string; bg: string; text: string; border: string }> = {
  valid:      { label: 'Valid',      bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  suspicious: { label: 'Suspicious', bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200'   },
  rejected:   { label: 'Rejected',   bg: 'bg-red-100',     text: 'text-red-600',     border: 'border-red-200'     },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Main ──────────────────────────────────────────────────────────────────────

function AdminWhitepapers() {
  const { logout } = useAuth();

  const [whitepapers,    setWhitepapers]    = useState<WhitepaperRecord[]>([]);
  const [leads,          setLeads]          = useState<WhitepaperLeadRecord[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [leadsLoading,   setLeadsLoading]   = useState(false);
  const [activeTab,      setActiveTab]      = useState<Tab>('whitepapers');
  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState<'all' | LeadStatus>('all');
  const [showForm,       setShowForm]       = useState(false);
  const [editTarget,     setEditTarget]     = useState<WhitepaperRecord | null>(null);
  const [form,           setForm]           = useState<FormData>(EMPTY_FORM);
  const [errors,         setErrors]         = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving,         setSaving]         = useState(false);
  const [uploadingPdf,   setUploadingPdf]   = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const pdfInputRef   = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch data ──────────────────────────────────────────────────────────────

  const fetchWhitepapers = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/whitepapers?admin=true');
      const data = await res.json();
      setWhitepapers(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    setLoading(false);
  };

  const fetchLeads = async () => {
    setLeadsLoading(true);
    try {
      const res  = await fetch('/api/whitepaper-leads');
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    setLeadsLoading(false);
  };

  useEffect(() => { fetchWhitepapers(); }, []);
  useEffect(() => {
    if (activeTab === 'leads' && leads.length === 0) fetchLeads();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setSearch(''); setStatusFilter('all'); }, [activeTab]);

  // ── Derived counts ──────────────────────────────────────────────────────────

  const validCount      = leads.filter((l) => (l.leadStatus ?? 'valid') === 'valid').length;
  const suspiciousCount = leads.filter((l) => l.leadStatus === 'suspicious').length;
  const rejectedCount   = leads.filter((l) => l.leadStatus === 'rejected').length;

  // ── Filtered lists ──────────────────────────────────────────────────────────

  const filteredWhitepapers = useMemo(() => {
    const q = search.toLowerCase();
    return whitepapers.filter((w) =>
      !q || w.title.toLowerCase().includes(q) || w.category.toLowerCase().includes(q),
    );
  }, [whitepapers, search]);

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      const matchStatus = statusFilter === 'all' || (l.leadStatus ?? 'valid') === statusFilter;
      const matchSearch = !q || l.fullName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) || l.company.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [leads, search, statusFilter]);

  // ── File upload ─────────────────────────────────────────────────────────────

  const uploadFile = async (file: File, type: 'pdf' | 'image'): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res  = await fetch(`/api/upload-whitepaper?type=${type}`, { method: 'POST', body: fd });
      const data = await res.json();
      return res.ok ? data.url : null;
    } catch { return null; }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    const url = await uploadFile(file, 'pdf');
    if (url) setForm((p) => ({ ...p, pdfUrl: url }));
    else alert('PDF upload failed');
    setUploadingPdf(false);
    e.target.value = '';
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    const url = await uploadFile(file, 'image');
    if (url) setForm((p) => ({ ...p, thumbnailUrl: url }));
    else alert('Thumbnail upload failed');
    setUploadingThumb(false);
    e.target.value = '';
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (wp: WhitepaperRecord) => {
    setEditTarget(wp);
    setForm({
      title:        wp.title,
      description:  wp.description,
      category:     wp.category as WhitepaperCategory,
      pdfUrl:       wp.pdfUrl,
      thumbnailUrl: wp.thumbnailUrl,
      isPublished:  wp.isPublished,
      pageCount:    String(wp.pageCount),
      readTime:     wp.readTime,
      tags:         wp.tags.join(', '),
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category)           e.category    = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const tags    = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const payload = {
      id:           editTarget?.id,
      title:        form.title,
      description:  form.description,
      category:     form.category,
      pdfUrl:       form.pdfUrl,
      thumbnailUrl: form.thumbnailUrl,
      isPublished:  form.isPublished,
      pageCount:    parseInt(form.pageCount) || 0,
      readTime:     form.readTime || '',
      tags,
    };
    try {
      const res = await fetch('/api/whitepapers', {
        method:  editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchWhitepapers();
        setShowForm(false);
      } else {
        const d = await res.json();
        alert(d.error ?? 'Save failed');
      }
    } catch { alert('Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this whitepaper?')) return;
    const res = await fetch(`/api/whitepapers?id=${id}`, { method: 'DELETE' });
    if (res.ok) setWhitepapers((prev) => prev.filter((w) => w.id !== id));
    else alert('Delete failed');
  };

  const handleToggle = async (wp: WhitepaperRecord) => {
    const res = await fetch('/api/whitepapers', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: wp.id, isPublished: !wp.isPublished }),
    });
    if (res.ok) {
      const updated = await res.json();
      setWhitepapers((prev) => prev.map((w) => w.id === wp.id ? updated : w));
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    const res = await fetch(`/api/whitepaper-leads?id=${id}`, { method: 'DELETE' });
    if (res.ok) setLeads((prev) => prev.filter((l) => l.id !== id));
    else alert('Delete failed');
  };

  const exportCSV = () => {
    const header = ['Name', 'Email', 'Company', 'Whitepaper', 'Purpose', 'Lead Status', 'Score', 'Date'].join(',');
    const rows = leads.map((l) =>
      [
        `"${l.fullName}"`, l.email, `"${l.company}"`, `"${l.whitepaperTitle}"`,
        l.purpose, l.leadStatus ?? 'valid', l.leadScore ?? 0, formatDate(l.createdAt),
      ].join(','),
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `whitepaper-leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = (hasError?: boolean) =>
    `w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      hasError ? 'border-red-400' : 'border-gray-300'
    }`;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'whitepapers', label: 'Whitepapers', count: whitepapers.length },
    { id: 'leads',       label: 'Leads',       count: leads.length },
  ];

  return (
    <>
      <Head><title>Whitepapers Admin | DSeT Consulting</title></Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6">
              <h1 className="text-3xl font-bold text-gray-900">Whitepapers</h1>
              <nav className="hidden sm:flex items-center gap-1">
                <Link href="/admin/blog"    className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Blog</Link>
                <Link href="/admin/events"  className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Events</Link>
                <Link href="/admin/careers" className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Careers</Link>
                <Link href="/admin/leads"   className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Leads</Link>
                <span className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-100">Whitepapers</span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'whitepapers' && (
                <button
                  onClick={openAdd}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  + Add Whitepaper
                </button>
              )}
              {activeTab === 'leads' && leads.length > 0 && (
                <button
                  onClick={exportCSV}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Export CSV
                </button>
              )}
              <button
                onClick={() => logout()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-gray-200">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === t.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── Leads: Stats + Filters ── */}
          {activeTab === 'leads' && !leadsLoading && (
            <>
              <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{leads.length}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                  <p className="text-sm text-emerald-600">Valid</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">{validCount}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                  <p className="text-sm text-amber-600">Suspicious</p>
                  <p className="mt-1 text-2xl font-bold text-amber-700">{suspiciousCount}</p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
                  <p className="text-sm text-red-500">Rejected</p>
                  <p className="mt-1 text-2xl font-bold text-red-600">{rejectedCount}</p>
                </div>
              </div>
            </>
          )}

          {/* Search + Status Filter */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder={activeTab === 'whitepapers' ? 'Search by title or category…' : 'Search by name, email or company…'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {activeTab === 'leads' && (
              <div className="flex gap-2">
                {([
                  { key: 'all',        label: `All (${leads.length})` },
                  { key: 'valid',      label: `Valid (${validCount})` },
                  { key: 'suspicious', label: `Suspicious (${suspiciousCount})` },
                  { key: 'rejected',   label: `Rejected (${rejectedCount})` },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                      statusFilter === key
                        ? 'bg-gray-900 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Whitepapers Table ── */}
          {activeTab === 'whitepapers' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {loading ? (
                <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Title', 'Category', 'Status', 'Downloads', 'Created', 'Actions'].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWhitepapers.map((wp) => {
                      const meta = CATEGORY_META[wp.category as WhitepaperCategory];
                      return (
                        <tr key={wp.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 max-w-xs">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{meta?.icon ?? '📄'}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">{wp.title}</p>
                                <div className="flex gap-1 mt-1">
                                  {wp.tags.slice(0, 2).map((t) => (
                                    <span key={t} className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className="px-2.5 py-1 rounded-full text-xs font-medium"
                              style={{ background: `${meta?.color ?? '#888'}18`, color: meta?.color ?? '#888' }}
                            >
                              {wp.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              wp.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {wp.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {wp.downloadCount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(wp.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggle(wp)}
                                className="text-xs px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                {wp.isPublished ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                onClick={() => openEdit(wp)}
                                className="text-xs px-3 py-1.5 border border-transparent rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(wp.id)}
                                className="text-xs px-3 py-1.5 border border-transparent rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredWhitepapers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                          No whitepapers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Leads Table ── */}
          {activeTab === 'leads' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {leadsLoading ? (
                <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Name', 'Company', 'Whitepaper', 'Purpose', 'Lead Quality', 'Date', 'Actions'].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeads.map((lead) => {
                      const status     = (lead.leadStatus ?? 'valid') as LeadStatus;
                      const statusMeta = STATUS_META[status];
                      return (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{lead.fullName}</p>
                            <p className="text-xs text-gray-500">{lead.email}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {lead.company}
                          </td>
                          <td className="px-6 py-4 max-w-[180px]">
                            <p className="text-sm text-gray-600 line-clamp-1">{lead.whitepaperTitle}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {lead.purpose}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                              {statusMeta.label}
                              <span className="font-normal opacity-70">· {lead.leadScore ?? 0}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(lead.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="text-xs px-3 py-1.5 border border-transparent rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                          No leads yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editTarget ? 'Edit Whitepaper' : 'New Whitepaper'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., AI Trends in Industrial IoT 2025"
                  value={form.title}
                  onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); setErrors((p) => ({ ...p, title: undefined })); }}
                  className={inputCls(!!errors.title)}
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of the whitepaper…"
                  value={form.description}
                  onChange={(e) => { setForm((p) => ({ ...p, description: e.target.value })); setErrors((p) => ({ ...p, description: undefined })); }}
                  className={inputCls(!!errors.description)}
                  style={{ resize: 'vertical' }}
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select
                  value={form.category}
                  onChange={(e) => { setForm((p) => ({ ...p, category: e.target.value as WhitepaperCategory })); setErrors((p) => ({ ...p, category: undefined })); }}
                  className={inputCls(!!errors.category)}
                >
                  <option value="">Select a category</option>
                  {WHITEPAPER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Count</label>
                  <input type="number" min={1} placeholder="24" value={form.pageCount} onChange={(e) => setForm((p) => ({ ...p, pageCount: e.target.value }))} className={inputCls()} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label>
                  <input type="text" placeholder="12 min" value={form.readTime} onChange={(e) => setForm((p) => ({ ...p, readTime: e.target.value }))} className={inputCls()} />
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PDF File</label>
                <div className="flex gap-2 items-start">
                  <input
                    type="text"
                    placeholder="Upload or paste URL"
                    value={form.pdfUrl}
                    onChange={(e) => setForm((p) => ({ ...p, pdfUrl: e.target.value }))}
                    className={`${inputCls()} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploadingPdf}
                    className="shrink-0 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
                  >
                    {uploadingPdf ? 'Uploading…' : 'Upload PDF'}
                  </button>
                  <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
                </div>
                {form.pdfUrl && form.pdfUrl !== '#' && (
                  <p className="mt-1 text-xs text-green-600 truncate">✓ {form.pdfUrl}</p>
                )}
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>
                <div className="flex gap-2 items-start">
                  <input
                    type="text"
                    placeholder="Upload or paste URL"
                    value={form.thumbnailUrl}
                    onChange={(e) => setForm((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                    className={`${inputCls()} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    disabled={uploadingThumb}
                    className="shrink-0 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
                  >
                    {uploadingThumb ? 'Uploading…' : 'Upload Image'}
                  </button>
                  <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbUpload} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                <input type="text" placeholder="Edge AI, Predictive Maintenance, IIoT" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} className={inputCls()} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex gap-3">
                  {([true, false] as const).map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, isPublished: val }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        form.isPublished === val
                          ? val ? 'bg-green-100 border-green-300 text-green-800' : 'bg-yellow-100 border-yellow-300 text-yellow-800'
                          : 'bg-white border-gray-300 text-gray-500'
                      }`}
                    >
                      {val ? 'Published' : 'Draft'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : (editTarget ? 'Save Changes' : 'Create Whitepaper')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default withAuth(AdminWhitepapers);
