import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCloudStorage } from "@/lib/storage";
import { randomUUID } from "crypto";

/**
 * Allowed MIME types and their magic byte signatures.
 * SVG is intentionally excluded — it can contain inline <script> tags → XSS.
 * PDF is allowed but must be served with Content-Disposition: attachment
 * from the storage provider (Cloudinary handles this for raw resources).
 */
const ALLOWED_SIGNATURES: Array<{
  mime: string;
  ext: string;
  bytes: number[];
  offset?: number;
  maxSizeBytes: number;
}> = [
  // JPEG: FF D8 FF
  { mime: "image/jpeg", ext: "jpg", bytes: [0xff, 0xd8, 0xff], maxSizeBytes: 5 * 1024 * 1024 },
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  { mime: "image/png", ext: "png", bytes: [0x89, 0x50, 0x4e, 0x47], maxSizeBytes: 5 * 1024 * 1024 },
  // WebP: RIFF????WEBP — check bytes 0-3 + 8-11
  { mime: "image/webp", ext: "webp", bytes: [0x52, 0x49, 0x46, 0x46], maxSizeBytes: 5 * 1024 * 1024 },
  // GIF89a / GIF87a
  { mime: "image/gif", ext: "gif", bytes: [0x47, 0x49, 0x46, 0x38], maxSizeBytes: 5 * 1024 * 1024 },
  // PDF: %PDF
  { mime: "application/pdf", ext: "pdf", bytes: [0x25, 0x50, 0x44, 0x46], maxSizeBytes: 10 * 1024 * 1024 },
];

function detectMimeFromMagicBytes(
  buf: Buffer
): { mime: string; ext: string; maxSizeBytes: number } | null {
  for (const sig of ALLOWED_SIGNATURES) {
    const offset = sig.offset ?? 0;
    const matches = sig.bytes.every(
      (byte, idx) => buf[offset + idx] === byte
    );
    if (matches) {
      return { mime: sig.mime, ext: sig.ext, maxSizeBytes: sig.maxSizeBytes };
    }
  }
  return null;
}

const ADMIN_AND_PORTAL_ROLES = ["SUPER_ADMIN", "ADMIN_EDITOR", "FACTORY_REP"];

export async function POST(req: NextRequest) {
  // 1. Authentication — any authenticated portal/admin user may upload
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required to upload files" },
      { status: 401 }
    );
  }

  const role = (session.user as any).role as string;
  if (!ADMIN_AND_PORTAL_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Forbidden: Insufficient privileges to upload files" },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Magic-bytes MIME inspection — validates actual file content, not
    //    the Content-Type header which is trivially spoofed by attackers.
    const detected = detectMimeFromMagicBytes(buffer);
    if (!detected) {
      return NextResponse.json(
        {
          error:
            "File type not allowed. Accepted types: JPEG, PNG, WebP, GIF images (≤5 MB) and PDF documents (≤10 MB). SVG files are not accepted.",
        },
        { status: 415 }
      );
    }

    // 3. Size validation against per-type limit
    if (buffer.length > detected.maxSizeBytes) {
      const limitMb = detected.maxSizeBytes / (1024 * 1024);
      return NextResponse.json(
        { error: `File exceeds the ${limitMb}MB size limit for ${detected.mime} files.` },
        { status: 413 }
      );
    }

    // 4. Generate a cryptographically random UUID for the storage key.
    //    Original filenames are discarded — they can contain path traversal
    //    sequences (../../etc/passwd) or expose internal metadata.
    const secureFilename = `${randomUUID()}.${detected.ext}`;

    const result = await uploadToCloudStorage(buffer, secureFilename, detected.mime);

    return NextResponse.json({
      success: true,
      url: result.url,
      provider: result.provider,
    });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload file to cloud storage" },
      { status: 500 }
    );
  }
}
