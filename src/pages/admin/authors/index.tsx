import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getAllAuthors, createAuthor, updateAuthor, deleteAuthor, type Author } from '@/lib/authors';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/components/auth/withAuth';

const emptyForm = { name: '', designation: '', bio: '', photoUrl: '', linkedinUrl: '', isActive: true };

const AdminAuthors = () => {
  const { role, logout } = useAuth();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const canManage = role === 'publisher' || role === 'admin';

  useEffect(() => { fetchAuthors(); }, []);

  const fetchAuthors = async () => {
    try {
      setAuthors(await getAllAuthors());
    } catch {
      // stays empty
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setPhotoFile(null);
    setPhotoPreview('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (author: Author) => {
    setForm({
      name: author.name,
      designation: author.designation,
      bio: author.bio,
      photoUrl: author.photoUrl,
      linkedinUrl: author.linkedinUrl || '',
      isActive: author.isActive,
    });
    setPhotoPreview(author.photoUrl);
    setEditingId(author.id);
    setShowForm(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { alert('Name is required.'); return; }
    setSaving(true);
    try {
      let photoUrl = form.photoUrl;
      if (photoFile) {
        const fd = new FormData();
        fd.append('image', photoFile);
        const r = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!r.ok) throw new Error('Photo upload failed');
        photoUrl = (await r.json()).url;
      }

      const payload = { ...form, photoUrl };
      if (editingId) {
        await updateAuthor(editingId, payload);
      } else {
        await createAuthor(payload);
      }
      await fetchAuthors();
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save author.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this author profile? This cannot be undone.')) return;
    try {
      await deleteAuthor(id);
      await fetchAuthors();
    } catch {
      alert('Failed to delete author.');
    }
  };

  return (
    <>
      <Head><title>Authors — DSeT Admin</title></Head>
      <div className="min-h-screen bg-[#f9fafb]">
        <div className="bg-white border-b border-gray-200 px-5 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link href="/admin/blog" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-lg font-bold text-gray-900">Author Profiles</h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {canManage && (
                <button
                  onClick={() => { resetForm(); setShowForm(true); }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Author
                </button>
              )}
              <button
                onClick={() => logout()}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-5 py-6 space-y-5">
          {!canManage && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
              Only a Publisher or Admin can add or edit author profiles. You can view the list below.
            </div>
          )}

          {showForm && canManage && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-900">{editingId ? 'Edit Author' : 'New Author'}</h2>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="w-20 h-20 rounded-full object-cover bg-gray-100" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                      No photo
                    </div>
                  )}
                  <label className="mt-2 block text-center text-xs text-blue-600 cursor-pointer hover:underline">
                    Upload photo
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>

                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Designation (e.g. Senior Data Engineer)"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="url"
                    placeholder="LinkedIn URL (optional)"
                    value={form.linkedinUrl}
                    onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <textarea
                rows={3}
                placeholder="Short bio (1-2 lines)"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active (selectable on new posts)
              </label>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving…' : editingId ? 'Update Author' : 'Create Author'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
            ) : authors.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">No author profiles yet.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {authors.map((author) => (
                  <li key={author.id} className="flex items-center gap-4 px-5 py-4">
                    {author.photoUrl ? (
                      <img src={author.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover bg-gray-100 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-bold flex-shrink-0">
                        {author.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{author.name}</span>
                        {!author.isActive && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">Inactive</span>
                        )}
                      </div>
                      {author.designation && <p className="text-xs text-gray-500">{author.designation}</p>}
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(author)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(author.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(AdminAuthors);
