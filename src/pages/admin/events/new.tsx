// pages/admin/events/new.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { withAuth } from "@/components/auth/withAuth";


function NewEvent() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date, description, status, media: [] }),
    });
    if (res.ok) router.push("/admin/events");
    else setSubmitting(false);
  };

  return (
    <>
      <Head><title>New Event | Admin</title></Head>
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <Link href="/admin/events">
              <span className="text-blue-600 hover:underline text-sm">← Back to Events</span>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Event</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Annual Tech Fest 2025"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the event..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              {/* Status toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex gap-3">
                  {(["draft", "published"] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${
                        status === s
                          ? s === "published"
                            ? "bg-green-50 border-green-300 text-green-700"
                            : "bg-yellow-50 border-yellow-300 text-yellow-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {s === "published" ? "● Published" : "○ Draft"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg font-medium transition"
                >
                  {submitting ? "Creating..." : "Create Event"}
                </button>
                <Link href="/admin/events">
                  <button type="button" className="text-gray-600 hover:bg-gray-100 px-6 py-2.5 rounded-lg transition">
                    Cancel
                  </button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(NewEvent);
