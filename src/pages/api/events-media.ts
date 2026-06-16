import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import { uploadBlob, deleteBlob } from "@/lib/azure-blob";
import { addMediaToEvent, removeMediaFromEvent, getGalleryEventById } from "@/lib/events.server";

export const config = { api: { bodyParser: false } };

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4",  "video/webm", "video/quicktime",
]);

const MAX_FILE_SIZE  = 100 * 1024 * 1024;
const MAX_IMAGE_SIZE =  10 * 1024 * 1024;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { eventId, mediaId } = req.query;

  // ── POST — Upload media ────────────────────────────────────
  if (req.method === "POST") {
    if (!eventId || typeof eventId !== "string")
      return res.status(400).json({ message: "eventId is required" });

    const event = await getGalleryEventById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const tmpDir = path.join(process.cwd(), "tmp");
    fs.mkdirSync(tmpDir, { recursive: true });

    const form = formidable({
      uploadDir: tmpDir,
      keepExtensions: true,
      multiples: true,
      maxFileSize: MAX_FILE_SIZE,
      filter: (part) => !!part.mimetype && ALLOWED_MIME_TYPES.has(part.mimetype),
    });

    form.parse(req, async (err, _fields, files) => {
      if (err) {
        return res.status(400).json({
          message: err.message?.includes("maxFileSize")
            ? `File too large. Max: images ${MAX_IMAGE_SIZE / (1024 * 1024)} MB, videos ${MAX_FILE_SIZE / (1024 * 1024)} MB`
            : "Upload failed — file type may not be allowed",
        });
      }

      const rawFiles = files.file;
      if (!rawFiles) return res.status(400).json({ message: "No file uploaded" });

      const fileArray: File[] = Array.isArray(rawFiles) ? rawFiles : [rawFiles];
      const results = [];

      for (const file of fileArray) {
        const mime = file.mimetype ?? "";
        if (!ALLOWED_MIME_TYPES.has(mime)) {
          fs.unlinkSync(file.filepath);
          return res.status(400).json({ message: `File type not allowed: ${mime}` });
        }

        const isVideo = mime.startsWith("video/");
        if (!isVideo && file.size > MAX_IMAGE_SIZE) {
          fs.unlinkSync(file.filepath);
          return res.status(400).json({
            message: `Image too large. Max ${MAX_IMAGE_SIZE / (1024 * 1024)} MB`,
          });
        }

        try {
          const ext      = path.extname(file.originalFilename ?? (isVideo ? ".mp4" : ".jpg"));
          const blobName = `events/${eventId}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}${ext}`;
          const buffer   = await fsPromises.readFile(file.filepath);
          const url      = await uploadBlob(buffer, blobName, mime);
          await fsPromises.unlink(file.filepath).catch(() => {});

          const updated = await addMediaToEvent(eventId, { type: isVideo ? "video" : "image", url });
          if (!updated) {
            await deleteBlob(url);
            return res.status(500).json({ message: "Failed to save media to event" });
          }
          results.push({ url, type: isVideo ? "video" : "image" });
        } catch {
          fs.unlinkSync(file.filepath);
          return res.status(500).json({ message: "Upload to storage failed" });
        }
      }

      return res.status(200).json({ uploaded: results });
    });

    return;
  }

  // ── DELETE — Remove media ──────────────────────────────────
  if (req.method === "DELETE") {
    if (!eventId || !mediaId)
      return res.status(400).json({ message: "eventId and mediaId are required" });

    const event = await getGalleryEventById(eventId as string);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const media = event.media.find((m) => m.id === mediaId);
    if (!media) return res.status(404).json({ message: "Media not found" });

    // Delete from Azure Blob if it's a blob URL
    if (media.url.startsWith("https://")) await deleteBlob(media.url);

    const updated = await removeMediaFromEvent(eventId as string, mediaId as string);
    if (!updated) return res.status(500).json({ message: "Failed to remove media" });

    try {
      await res.revalidate("/events");
      await res.revalidate(`/events/${eventId}`);
    } catch {}

    return res.status(200).json(updated);
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
