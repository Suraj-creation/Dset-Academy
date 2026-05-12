import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/components/auth/withAuth';
import type { Application, ApplicationStatus } from '@/lib/applications.server';
import type { JobWithStatus } from '@/lib/jobs.server';

// ── Types ──────────────────────────────────────────────────────
type Tab = 'applications' | 'jobs';

const STATUS_META: Record<ApplicationStatus, { label: string; bg: string; text: string }> = {
  new:        { label: 'New',         bg: 'bg-blue-100',   text: 'text-blue-700' },
  reviewed:   { label: 'Reviewed',    bg: 'bg-yellow-100', text: 'text-yellow-700' },
  shortlisted:{ label: 'Shortlisted', bg: 'bg-green-100',  text: 'text-green-700' },
  rejected:   { label: 'Rejected',    bg: 'bg-red-100',    text: 'text-red-600' },
};

const DEPT_COLORS: Record<string, string> = {
  Engineering:    '#ff851b',
  Product:        '#5e17ea',
  Infrastructure: '#0ea5e9',
  Sales:          '#22c55e',
  Other:          '#94a3b8',
};

const EMPTY_JOB: Omit<JobWithStatus, 'id'> = {
  title: '', department: 'Engineering', location: 'Bengaluru, India',
  type: 'Full-time', level: 'Mid-Level', color: '#1e90ff',
  description: '', isActive: true,
};

// ── Helpers ────────────────────────────────────────────────────
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
function AdminCareers() {
  const { logout } = useAuth();
  const router = useRouter();

  // ── State ──
  const [tab, setTab] = useState<Tab>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<JobWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());

  // Applications UI
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Jobs UI
  const [editingJob, setEditingJob] = useState<JobWithStatus | null>(null);
  const [showAddJob, setShowAddJob] = useState(false);
  const [jobForm, setJobForm] = useState<Omit<JobWithStatus, 'id'>>(EMPTY_JOB);
  const [jobSaving, setJobSaving] = useState(false);

  // ── Load data ──
  useEffect(() => {
    Promise.all([
      fetch('/api/applications').then((r) => r.json()),
      fetch('/api/jobs?admin=true').then((r) => r.json()),
    ])
      .then(([appData, jobData]) => {
        setApplications(appData.applications ?? []);
        setJobs(jobData.jobs ?? []);
      })
      .catch(() => setError('Failed to load data. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const addPending = (id: string) => setPending((p) => new Set(p).add(id));
  const removePending = (id: string) => setPending((p) => { const n = new Set(p); n.delete(id); return n; });

  // ── Application actions ──
  const handleStatusChange = useCallback(async (app: Application, status: ApplicationStatus) => {
    if (pending.has(app.id)) return;
    addPending(app.id);
    try {
      const res = await fetch(`/api/applications?id=${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated: Application = await res.json();
      setApplications((prev) => prev.map((a) => (a.id === app.id ? updated : a)));
    } catch {
      setError('Failed to update status.');
    } finally {
      removePending(app.id);
    }
  }, [pending]);

  const handleDeleteApp = useCallback(async (id: string) => {
    if (pending.has(id)) return;
    if (!confirm('Delete this application permanently?')) return;
    addPending(id);
    try {
      const res = await fetch(`/api/applications?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setApplications((prev) => prev.filter((a) => a.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {
      setError('Failed to delete application.');
    } finally {
      removePending(id);
    }
  }, [pending, expandedId]);

  // ── Job actions ──
  const handleToggleActive = useCallback(async (job: JobWithStatus) => {
    if (pending.has(String(job.id))) return;
    addPending(String(job.id));
    try {
      const res = await fetch(`/api/jobs?id=${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !job.isActive }),
      });
      if (!res.ok) throw new Error();
      const updated: JobWithStatus = await res.json();
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
    } catch {
      setError('Failed to update job.');
    } finally {
      removePending(String(job.id));
    }
  }, [pending]);

  const handleDeleteJob = useCallback(async (id: number) => {
    if (pending.has(String(id))) return;
    if (!confirm('Delete this job listing? Applications for this role will not be affected.')) return;
    addPending(String(id));
    try {
      const res = await fetch(`/api/jobs?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch {
      setError('Failed to delete job.');
    } finally {
      removePending(String(id));
    }
  }, [pending]);

  const handleSaveJob = useCallback(async () => {
    if (!jobForm.title.trim()) { setError('Job title is required.'); return; }
    setJobSaving(true);
    try {
      const isEdit = !!editingJob;
      const url = isEdit ? `/api/jobs?id=${editingJob!.id}` : '/api/jobs';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobForm),
      });
      if (!res.ok) throw new Error();
      const saved: JobWithStatus = await res.json();
      if (isEdit) {
        setJobs((prev) => prev.map((j) => (j.id === saved.id ? saved : j)));
      } else {
        setJobs((prev) => [...prev, saved]);
      }
      setShowAddJob(false);
      setEditingJob(null);
      setJobForm(EMPTY_JOB);
    } catch {
      setError('Failed to save job.');
    } finally {
      setJobSaving(false);
    }
  }, [jobForm, editingJob]);

  const startEdit = (job: JobWithStatus) => {
    setEditingJob(job);
    setJobForm({ title: job.title, department: job.department, location: job.location, type: job.type, level: job.level, color: job.color, description: job.description, isActive: job.isActive });
    setShowAddJob(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelJobForm = () => { setShowAddJob(false); setEditingJob(null); setJobForm(EMPTY_JOB); };

  // ── Filtered applications ──
  const filteredApps = applications.filter((a) => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.jobTitle.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // ── Stats ──
  const stats = {
    total:       applications.length,
    new:         applications.filter((a) => a.status === 'new').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    rejected:    applications.filter((a) => a.status === 'rejected').length,
  };

  const handleLogout = () => { logout(); router.replace('/auth/signin'); };

  // ── Render ──────────────────────────────────────────────────
  return (
    <>
      <Head><title>Admin — Careers | DSeT</title></Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Careers Admin</h1>
                <p className="text-sm text-gray-500">Manage applications and job listings</p>
              </div>
              <nav className="hidden sm:flex items-center gap-1">
                <Link href="/admin/leads"  className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Leads</Link>
                <Link href="/admin/events" className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Events</Link>
                <Link href="/admin/blog"   className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Blog</Link>
                <span className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-100">Careers</span>
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
              <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Total Applications" value={stats.total}       color="#001f3f" />
                <StatCard label="New"                value={stats.new}         color="#1e90ff" />
                <StatCard label="Shortlisted"        value={stats.shortlisted} color="#22c55e" />
                <StatCard label="Rejected"           value={stats.rejected}    color="#ef4444" />
              </div>

              {/* Tabs */}
              <div className="mb-6 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 w-fit shadow-sm">
                {(['applications', 'jobs'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize transition-colors duration-150 ${
                      tab === t ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {t === 'applications' ? `Applications (${applications.length})` : `Jobs (${jobs.length})`}
                  </button>
                ))}
              </div>

              {/* ── Applications Tab ── */}
              {tab === 'applications' && (
                <div>
                  {/* Filter bar */}
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search name, email, or role…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-64"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {(['all', 'new', 'reviewed', 'shortlisted', 'rejected'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors duration-150 ${
                            statusFilter === s
                              ? 'bg-gray-900 text-white'
                              : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          {s === 'all' ? `All (${applications.length})` : `${s} (${applications.filter((a) => a.status === s).length})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredApps.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 py-20 text-center text-gray-400">
                      {applications.length === 0 ? 'No applications received yet.' : 'No results match your filter.'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredApps.map((app) => {
                        const isBusy = pending.has(app.id);
                        const isExpanded = expandedId === app.id;
                        const meta = STATUS_META[app.status];
                        const deptColor = DEPT_COLORS[app.jobTitle.split(' ').pop() ?? ''] ?? '#94a3b8';

                        return (
                          <div
                            key={app.id}
                            className={`rounded-xl border border-gray-200 bg-white shadow-sm transition-opacity ${isBusy ? 'opacity-60 pointer-events-none' : ''}`}
                          >
                            {/* Row */}
                            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                              <div className="flex items-center gap-4 min-w-0">
                                {/* Color dot */}
                                <div
                                  className="h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                  style={{ backgroundColor: DEPT_COLORS[app.jobTitle.includes('Engineering') || app.jobTitle.includes('ML') ? 'Engineering' : app.jobTitle.includes('Product') ? 'Product' : app.jobTitle.includes('Sales') ? 'Sales' : app.jobTitle.includes('DevOps') || app.jobTitle.includes('Infrastructure') ? 'Infrastructure' : 'Other'] ?? '#94a3b8' }}
                                >
                                  {app.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-gray-900">{app.name}</span>
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.bg} ${meta.text}`}>
                                      {meta.label}
                                    </span>
                                  </div>
                                  <p className="truncate text-sm text-gray-500">{app.jobTitle}</p>
                                  <p className="text-xs text-gray-400">{app.email} · {formatDate(app.submittedAt)}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {/* Status selector */}
                                <select
                                  value={app.status}
                                  onChange={(e) => handleStatusChange(app, e.target.value as ApplicationStatus)}
                                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 outline-none cursor-pointer hover:border-gray-400 focus:border-blue-400"
                                >
                                  <option value="new">New</option>
                                  <option value="reviewed">Reviewed</option>
                                  <option value="shortlisted">Shortlisted</option>
                                  <option value="rejected">Rejected</option>
                                </select>

                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                  {isExpanded ? 'Hide' : 'View'}
                                </button>

                                <button
                                  onClick={() => handleDeleteApp(app.id)}
                                  className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {/* Expanded details */}
                            {isExpanded && (
                              <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                                <div className="grid gap-6 sm:grid-cols-2">
                                  <div className="space-y-3 text-sm">
                                    <h4 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-gray-400">Contact</h4>
                                    <p><span className="font-medium text-gray-600">Phone:</span> <span className="text-gray-800">{app.phone}</span></p>
                                    {app.linkedin && (
                                      <p><span className="font-medium text-gray-600">LinkedIn:</span>{' '}
                                        <a href={app.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                                          {app.linkedin}
                                        </a>
                                      </p>
                                    )}
                                    {app.portfolio && (
                                      <p><span className="font-medium text-gray-600">Portfolio:</span>{' '}
                                        <a href={app.portfolio} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                                          {app.portfolio}
                                        </a>
                                      </p>
                                    )}
                                    <h4 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-gray-400 pt-2">Role Fit</h4>
                                    <p><span className="font-medium text-gray-600">Experience:</span> <span className="text-gray-800">{app.experience}</span></p>
                                    <p><span className="font-medium text-gray-600">Notice Period:</span> <span className="text-gray-800">{app.noticePeriod}</span></p>
                                    <p><span className="font-medium text-gray-600">Found via:</span> <span className="text-gray-800">{app.source}</span></p>
                                    <p>
                                      <span className="font-medium text-gray-600">Resume:</span>{' '}
                                      <a href={app.resumeLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                        View Resume →
                                      </a>
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-gray-400">Cover Note</h4>
                                    <p className="rounded-lg bg-gray-50 p-4 text-sm leading-7 text-gray-700 whitespace-pre-wrap">{app.coverNote}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Jobs Tab ── */}
              {tab === 'jobs' && (
                <div>
                  {/* Add / Edit form */}
                  {showAddJob && (
                    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
                      <h3 className="mb-5 text-base font-bold text-gray-900">
                        {editingJob ? `Editing: ${editingJob.title}` : 'Add New Job'}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-semibold text-gray-600">Job Title *</label>
                          <input
                            type="text"
                            placeholder="e.g. Senior AI Engineer"
                            value={jobForm.title}
                            onChange={(e) => setJobForm((f) => ({ ...f, title: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">Department</label>
                          <select
                            value={jobForm.department}
                            onChange={(e) => setJobForm((f) => ({ ...f, department: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 cursor-pointer"
                          >
                            {['Engineering', 'Product', 'Infrastructure', 'Sales', 'Design', 'Operations'].map((d) => (
                              <option key={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">Location</label>
                          <input
                            type="text"
                            placeholder="e.g. Bengaluru, India"
                            value={jobForm.location}
                            onChange={(e) => setJobForm((f) => ({ ...f, location: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">Type</label>
                          <select
                            value={jobForm.type}
                            onChange={(e) => setJobForm((f) => ({ ...f, type: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 cursor-pointer"
                          >
                            {['Full-time', 'Part-time', 'Contract', 'Internship'].map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">Level</label>
                          <select
                            value={jobForm.level}
                            onChange={(e) => setJobForm((f) => ({ ...f, level: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 cursor-pointer"
                          >
                            {['Fresher', 'Junior', 'Mid-Level', 'Mid-Senior', 'Senior', 'Lead', 'Manager'].map((l) => (
                              <option key={l}>{l}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">Badge Color</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={jobForm.color}
                              onChange={(e) => setJobForm((f) => ({ ...f, color: e.target.value }))}
                              className="h-9 w-14 cursor-pointer rounded-lg border border-gray-300"
                            />
                            <span className="text-sm text-gray-500">{jobForm.color}</span>
                            <div className="flex gap-1.5">
                              {['#ff851b', '#1e90ff', '#5e17ea', '#22c55e', '#0ea5e9', '#a855f7'].map((c) => (
                                <button
                                  key={c}
                                  onClick={() => setJobForm((f) => ({ ...f, color: c }))}
                                  className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                                  style={{ backgroundColor: c, borderColor: jobForm.color === c ? '#1e3a5f' : 'transparent' }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-semibold text-gray-600">Description</label>
                          <textarea
                            rows={3}
                            placeholder="Describe the role, responsibilities, and impact…"
                            value={jobForm.description}
                            onChange={(e) => setJobForm((f) => ({ ...f, description: e.target.value }))}
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={jobForm.isActive}
                            onChange={(e) => setJobForm((f) => ({ ...f, isActive: e.target.checked }))}
                            className="h-4 w-4 cursor-pointer rounded"
                          />
                          <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Active (visible on careers page)
                          </label>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={handleSaveJob}
                          disabled={jobSaving}
                          className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors disabled:opacity-60"
                        >
                          {jobSaving ? 'Saving…' : editingJob ? 'Save Changes' : 'Add Job'}
                        </button>
                        <button
                          onClick={cancelJobForm}
                          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {!showAddJob && (
                    <div className="mb-5">
                      <button
                        onClick={() => { setShowAddJob(true); setEditingJob(null); setJobForm(EMPTY_JOB); }}
                        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
                      >
                        + Add New Job
                      </button>
                    </div>
                  )}

                  {jobs.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 py-20 text-center text-gray-400">
                      No jobs yet. Add your first listing.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jobs.map((job) => {
                        const isBusy = pending.has(String(job.id));
                        return (
                          <div
                            key={job.id}
                            className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-opacity ${isBusy ? 'opacity-60 pointer-events-none' : ''}`}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div
                                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                style={{ backgroundColor: job.color }}
                              />
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-gray-900">{job.title}</span>
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                    job.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {job.isActive ? '● Active' : '○ Inactive'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">{job.department} · {job.level} · {job.location}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleActive(job)}
                                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                                  job.isActive
                                    ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50'
                                    : 'border-green-200 text-green-600 hover:bg-green-50'
                                }`}
                              >
                                {job.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => startEdit(job)}
                                className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default withAuth(AdminCareers);
