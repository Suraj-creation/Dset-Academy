import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { withAuth } from "@/components/auth/withAuth";
import { GalleryEvent } from "@/lib/events.server";

function AdminEvents() {
  const { logout } = useAuth();
  const router     = useRouter();

  const [events,  setEvents]  = useState<GalleryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  // Track which event IDs have an in-flight request to prevent double-actions
  const [pending, setPending] = useState<Set<string>>(new Set());

  const addPending    = (id: string) => setPending(p => new Set(p).add(id));
  const removePending = (id: string) => setPending(p => { const n = new Set(p); n.delete(id); return n; });

  useEffect(() => {
    fetch("/api/events?admin=true")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load events");
        return res.json();
      })
      .then(data => setEvents(Array.isArray(data.events) ? data.events : []))
      .catch(err  => setError(err.message))
      .finally(()  => setLoading(false));
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (pending.has(id)) return;
    if (!confirm("Delete this event and all its media?")) return;

    addPending(id);
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch {
      setError("Could not delete event. Please try again.");
    } finally {
      removePending(id);
    }
  }, [pending]);

  const handleToggleStatus = useCallback(async (event: GalleryEvent) => {
    if (pending.has(event.id)) return;

    const newStatus = event.status === "published" ? "draft" : "published";
    addPending(event.id);
    try {
      const res = await fetch(`/api/events?id=${event.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Status update failed");
      const updated: GalleryEvent = await res.json();
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: updated.status } : e));
    } catch {
      setError("Could not update status. Please try again.");
    } finally {
      removePending(event.id);
    }
  }, [pending]);

  const handleToggleFeatured = useCallback(async (event: GalleryEvent) => {
    if (pending.has(event.id)) return;

    addPending(event.id);
    try {
      const res = await fetch(`/api/events?id=${event.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isFeatured: !event.isFeatured }),
      });
      if (!res.ok) throw new Error("Feature update failed");
      const updated: GalleryEvent = await res.json();

      // Server unfeatures all others when featuring one — mirror that locally
      setEvents(prev => prev.map(e => ({
        ...e,
        isFeatured: e.id === event.id ? updated.isFeatured : false,
      })));
    } catch {
      setError("Could not update featured status. Please try again.");
    } finally {
      removePending(event.id);
    }
  }, [pending]);

  const handleLogout = () => {
    logout();
    router.replace("/auth/signin");
  };

  return (
    <>
      <Head>
        <title>Admin Events | DSeT</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-5xl mx-auto">

          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                <p className="text-gray-500 mt-1">Manage event-based photo &amp; video albums</p>
              </div>
              <nav className="hidden sm:flex items-center gap-1">
                <span className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-100">Events</span>
                <Link href="/admin/blog"    className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Blog</Link>
                <Link href="/admin/careers" className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Careers</Link>
                <Link href="/admin/leads"   className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Leads</Link>
              </nav>
            </div>

            <div className="flex gap-3">
              <Link href="/admin/events/new">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm">
                  + New Event
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
              <button onClick={() => setError(null)} className="ml-4 font-bold">✕</button>
            </div>
          )}

          {loading && (
            <div className="text-center py-20 text-gray-400">Loading events...</div>
          )}

          {!loading && events.length === 0 && (
            <div className="text-center py-20 text-gray-400 border-2 border-dashed rounded-xl">
              <p className="text-xl mb-2">No events yet</p>
              <p className="text-sm">Create your first event</p>
            </div>
          )}

          {!loading && events.length > 0 && (
            <div className="grid gap-4">
              {events.map(event => {
                const isBusy = pending.has(event.id);
                return (
                  <div
                    key={event.id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between hover:shadow-md transition ${isBusy ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {event.media?.length > 0 ? (
                          event.media[0].type === "video" ? (
                            <video src={event.media[0].url} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={event.media[0].url} alt={event.title} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📷</div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>

                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            event.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {event.status === "published" ? "● Published" : "○ Draft"}
                          </span>

                          {event.isFeatured && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              ⭐ Featured
                            </span>
                          )}
                        </div>

                        <p className="text-gray-500 text-sm">
                          {new Date(event.date).toLocaleDateString("en-IN")}
                        </p>

                        <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {event.media?.length || 0} media items
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFeatured(event)}
                        disabled={isBusy}
                        className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        {event.isFeatured ? "Unfeature" : "Feature"}
                      </button>

                      <button
                        onClick={() => handleToggleStatus(event)}
                        disabled={isBusy}
                        className={`text-sm px-3 py-1.5 rounded-lg transition font-medium disabled:opacity-50 ${
                          event.status === "published" ? "text-yellow-600 hover:bg-yellow-50" : "text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {event.status === "published" ? "Unpublish" : "Publish"}
                      </button>

                      <Link href={`/admin/events/edit/${event.id}`}>
                        <button className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">
                          Manage Media
                        </button>
                      </Link>

                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={isBusy}
                        className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
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
      </div>
    </>
  );
}

export default withAuth(AdminEvents);
