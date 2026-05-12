import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { withAuth } from "@/components/auth/withAuth";


interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
}

interface GalleryEvent {
  id: string;
  title: string;
  date: string;
  description?: string;
  status: "published" | "draft";
  coverMediaId?: string;
  media: MediaItem[];
}

function EditEvent() {
  const router = useRouter();
  const { id } = router.query;
  const fileRef = useRef<HTMLInputElement>(null);

  const [event, setEvent] = useState<GalleryEvent | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/events?id=${id}`)
      .then(res => res.json())
      .then((data: GalleryEvent) => {
        setEvent(data);
        setTitle(data.title);
        setDate(data.date);
        setDescription(data.description ?? "");
        setStatus(data.status ?? "draft");
      });
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/events?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date, description, status }),
    });
    const updated = await res.json();
    setEvent(prev => prev ? { ...prev, ...updated } : prev);
    setSaving(false);
  };

  const uploadFiles = async (files: FileList) => {
    if (!files.length) return;
    setUploading(true);
    setUploadMsg(`Uploading ${files.length} file(s)...`);
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append("file", f));
    try {
      const res = await fetch(`/api/events-media?eventId=${id}`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.uploaded) {
        const refreshed = await fetch(`/api/events?id=${id}`).then(r => r.json());
        setEvent(refreshed);
        setUploadMsg(`✓ ${data.uploaded.length} file(s) uploaded!`);
      }
    } catch {
      setUploadMsg("Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => setUploadMsg(""), 3000);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("Remove this media item?")) return;
    await fetch(`/api/events-media?eventId=${id}&mediaId=${mediaId}`, { method: "DELETE" });
    setEvent(prev => prev ? { ...prev, media: prev.media.filter(m => m.id !== mediaId) } : prev);
  };

  const handleSetCover = async (mediaId: string) => {
    const res = await fetch(`/api/events?id=${id}&action=cover`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId }),
    });
    const updated = await res.json();
    setEvent(prev => prev ? { ...prev, coverMediaId: updated.coverMediaId } : prev);
  };

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  );

  return (
    <>
      <Head><title>Edit: {event.title} | Admin</title></Head>
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-4xl mx-auto space-y-6">

          <Link href="/admin/events">
            <span className="text-blue-600 hover:underline text-sm">← Back to Events</span>
          </Link>

          {/* Event Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900" />
              </div>

              {/* Status toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex gap-3">
                  {(["draft", "published"] as const).map(s => (
                    <button key={s} type="button" onClick={() => setStatus(s)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${
                        status === s
                          ? s === "published" ? "bg-green-50 border-green-300 text-green-700" : "bg-yellow-50 border-yellow-300 text-yellow-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}>
                      {s === "published" ? "● Published" : "○ Draft"}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg font-medium transition text-sm">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Media Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Media ({event.media?.length || 0} items)
              </h2>
              <div>
                <input ref={fileRef} type="file" multiple accept="image/*,video/*"
                  className="hidden" id="media-upload"
                  onChange={e => e.target.files && uploadFiles(e.target.files)} />
                <label htmlFor="media-upload">
                  <span className={`cursor-pointer inline-flex items-center gap-2 ${uploading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded-lg text-sm font-medium transition`}>
                    {uploading ? "Uploading..." : "+ Upload Photos/Videos"}
                  </span>
                </label>
              </div>
            </div>

            {uploadMsg && (
              <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                {uploadMsg}
              </div>
            )}

            {/* Drag & Drop area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition mb-4 ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-400"}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
            >
              <p className="text-3xl mb-2">📁</p>
              <p className="text-sm text-gray-400">Click or drag & drop images/videos here</p>
              <p className="text-xs text-gray-300 mt-1">JPG, PNG, GIF, MP4, MOV etc.</p>
            </div>

            {/* Media Grid */}
            {event.media?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {event.media.map(item => {
                  const isCover = event.coverMediaId === item.id;
                  return (
                    <div key={item.id} className={`relative group rounded-lg overflow-hidden bg-gray-100 aspect-square border-2 transition ${isCover ? "border-yellow-400" : "border-transparent"}`}>
                      {item.type === "video" ? (
                        <video src={item.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      )}

                      {/* Type badge */}
                      <div className={`absolute bottom-1 left-1 text-xs px-1.5 py-0.5 rounded font-medium ${item.type === "video" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"}`}>
                        {item.type === "video" ? "🎬" : "🖼"}
                      </div>

                      {/* Cover badge */}
                      {isCover && (
                        <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded font-bold">
                          Cover
                        </div>
                      )}

                      {/* Hover actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                        {item.type === "image" && !isCover && (
                          <button onClick={() => handleSetCover(item.id)}
                            className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded font-medium">
                            Set Cover
                          </button>
                        )}
                        <button onClick={() => handleDeleteMedia(item.id)}
                          className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4 text-sm">No media uploaded yet.</p>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default withAuth(EditEvent);
