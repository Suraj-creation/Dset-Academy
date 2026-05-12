import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import {
  getGalleryEvents,
  getGalleryEventById,
  addGalleryEvent,
  updateGalleryEvent,
  deleteGalleryEvent,
  setCoverMedia,
} from "@/lib/events.server";



// ── Zod schemas ───────────────────────────────────────────
const createEventSchema = z.object({
  title:       z.string().min(1, "Title is required"),
  date:        z.string().min(1, "Date is required"),
  description: z.string().optional(),
  status:      z.enum(["published", "draft"]).optional().default("draft"),
});

const updateEventSchema = z.object({
  title:        z.string().min(1).optional(),
  date:         z.string().min(1).optional(),
  description:  z.string().optional(),
  status:       z.enum(["published", "draft"]).optional(),
  coverMediaId: z.string().optional(),
});

// ── Handler ───────────────────────────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, action } = req.query;

  try {
    // ── GET ──────────────────────────────────────────────
    if (req.method === "GET") {
      if (id) {
        const event = await getGalleryEventById(id as string);
        if (!event) return res.status(404).json({ message: "Event not found" });
        if (event.status === "draft" && req.query.admin !== "true") {
          return res.status(404).json({ message: "Event not found" });
        }
        return res.status(200).json(event);
      }
      const includeAll = req.query.admin === "true";
      const events = await getGalleryEvents(includeAll);
      return res.status(200).json({ events });
    }

    // ── POST ─────────────────────────────────────────────
    if (req.method === "POST") {
      const result = createEventSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ errors: result.error.flatten() });

      const newEvent = await addGalleryEvent({
        title:       result.data.title,
        date:        result.data.date,
        description: result.data.description ?? "",
        status:      result.data.status,
        media:       [],
      });
      return res.status(201).json(newEvent);
    }

    // ── PUT ──────────────────────────────────────────────
    if (req.method === "PUT") {
      if (!id) return res.status(400).json({ message: "Event ID required" });

      // Cover image action
      if (action === "cover") {
        const { mediaId } = req.body;
        if (!mediaId) return res.status(400).json({ message: "mediaId required" });
        const updated = await setCoverMedia(id as string, mediaId);
        if (!updated) return res.status(404).json({ message: "Event or media not found" });
        return res.status(200).json(updated);
      }

      const result = updateEventSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ errors: result.error.flatten() });

      const updated = await updateGalleryEvent(id as string, result.data);
      if (!updated) return res.status(404).json({ message: "Event not found" });
      return res.status(200).json(updated);
    }

    // ── DELETE ───────────────────────────────────────────
    if (req.method === "DELETE") {
      if (!id) return res.status(400).json({ message: "Event ID required" });
      const deleted = await deleteGalleryEvent(id as string);
      if (!deleted) return res.status(404).json({ message: "Event not found" });
      return res.status(200).json({ message: "Event deleted" });
    }

    return res.status(405).json({ message: "Method Not Allowed" });

  } catch (error) {
    console.error("Events API Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
