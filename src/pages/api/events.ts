import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import { isAdminRequest } from "@/lib/auth";
import {
  getGalleryEvents,
  getGalleryEventById,
  addGalleryEvent,
  updateGalleryEvent,
  deleteGalleryEvent,
  setCoverMedia,
  setFeaturedEvent,
} from "@/lib/events.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, action } = req.query;

  try {
    // ── GET ──────────────────────────────────────────────
    if (req.method === "GET") {
      if (id) {
        const event = await getGalleryEventById(id as string);
        if (!event) return res.status(404).json({ message: "Event not found" });
        return res.status(200).json(event);
      }
      const includeAll = req.query.admin === "true";
      const events = await getGalleryEvents(includeAll);
      return res.status(200).json({ events });
    }

    // ── POST ─────────────────────────────────────────────
    if (req.method === "POST") {
      if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: "Unauthorized" });
      const { title, date, description, status } = req.body;
      if (!title || !date) {
        return res.status(400).json({ message: "title and date are required" });
      }
      const newEvent = await addGalleryEvent({
        title,
        date,
        description: description ?? "",
        status: status ?? "draft",
        media: [],
      });
      try { await res.revalidate("/events"); } catch {}
      return res.status(201).json(newEvent);
    }

    // ── PUT ──────────────────────────────────────────────
    if (req.method === "PUT") {
      if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: "Unauthorized" });
      if (!id) return res.status(400).json({ message: "Event ID required" });

      if (action === "cover") {
        const { mediaId } = req.body;
        if (!mediaId) return res.status(400).json({ message: "mediaId required" });
        const updated = await setCoverMedia(id as string, mediaId);
        if (!updated) return res.status(404).json({ message: "Event or media not found" });
        try { await res.revalidate("/events"); await res.revalidate(`/events/${id}`); } catch {}
        return res.status(200).json(updated);
      }

      const updated = await updateGalleryEvent(id as string, req.body);
      if (!updated) return res.status(404).json({ message: "Event not found" });
      try { await res.revalidate("/events"); await res.revalidate(`/events/${id}`); } catch {}
      return res.status(200).json(updated);
    }

    if (action === "feature") {
      const updated = await setFeaturedEvent(id as string);
      if (!updated) return res.status(404).json({ message: "Event not found" });
      try { await res.revalidate("/events"); } catch {}
      return res.status(200).json(updated);
    }

    // ── DELETE ───────────────────────────────────────────
    if (req.method === "DELETE") {
      if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: "Unauthorized" });
      if (!id) return res.status(400).json({ message: "Event ID required" });

      const event = await getGalleryEventById(id as string);
      if (!event) return res.status(404).json({ message: "Event not found" });

      for (const media of event.media) {
        const filePath = path.join(process.cwd(), "public", media.url);
        try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
      }

      const deleted = await deleteGalleryEvent(id as string);
      if (!deleted) return res.status(404).json({ message: "Event not found" });

      try { await res.revalidate("/events"); } catch {}
      return res.status(200).json({ message: "Event and media deleted" });
    }

    return res.status(405).json({ message: "Method Not Allowed" });

  } catch (error) {
    console.error("Events API Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
