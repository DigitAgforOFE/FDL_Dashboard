import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const DATA_DIR = process.env.DATA_DIR ?? "./upload-data";
const ALLOWED_TYPES = ["photos", "videos", "recordings", "locations"] as const;

// Map file extensions to MIME types so images/videos can render inline
// instead of being forced to download.
const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".m4v": "video/x-m4v",
  ".3gp": "video/3gpp",
  ".avi": "video/x-msvideo",
  ".ogg": "audio/ogg",
  ".oga": "audio/ogg",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".amr": "audio/amr",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string; filename: string }> }
) {
  const { type, filename } = await params;

  if (!ALLOWED_TYPES.includes(type as (typeof ALLOWED_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const safe = path.basename(filename);
  if (!safe || safe !== filename) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(DATA_DIR, type, safe);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(safe).toLowerCase();
  const mime = MIME_BY_EXT[ext];

  // Render known images/videos/audio inline; otherwise force a safe download.
  const disposition = mime ? "inline" : "attachment";
  return new NextResponse(buffer, {
    headers: {
      "Content-Disposition": `${disposition}; filename="${safe}"`,
      "Content-Type": mime ?? "application/octet-stream",
    },
  });
}
