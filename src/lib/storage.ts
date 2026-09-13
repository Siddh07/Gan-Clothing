/**
 * src/lib/storage.ts
 *
 * Cloud storage abstraction for the GAN B2B Export Portal.
 * Upload handler validates MIME via magic bytes BEFORE calling this module.
 *
 * Security hardening applied:
 *  - resource_type: "image" — Cloudinary no longer auto-detects type.
 *    Prevents ZIP, HTML, or JS uploads from slipping through.
 *  - public_id: uses the caller-supplied UUID filename (original filename
 *    discarded in route.ts before reaching here).
 *  - Folder isolation: cert documents go to gan_certs/, images to gan_portal/.
 */
import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";

// Configure Cloudinary if credentials are provided in .env
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface UploadResult {
  url: string;
  publicId?: string;
  provider: "cloudinary" | "cloud-hosted";
}

/**
 * Upload an image or document to Cloudinary.
 *
 * @param fileBuffer  Raw file bytes (already magic-byte validated by the caller).
 * @param filename    UUID-based filename (e.g. "3f2a1b4c-....jpg"). Original
 *                    filenames MUST be discarded before calling this function.
 * @param mimeType    Detected MIME type from magic bytes (e.g. "image/jpeg").
 * @param folder      Cloudinary folder. Defaults to "gan_portal".
 */
export async function uploadToCloudStorage(
  fileBuffer: Buffer | string,
  filename: string,
  mimeType?: string,
  folder = "gan_portal"
): Promise<UploadResult> {
  const isCloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

  // Determine Cloudinary resource_type from validated MIME.
  // We intentionally do NOT use "auto" — that would allow any file type.
  const resourceType =
    mimeType === "application/pdf" ? "raw" : "image";

  if (isCloudinaryConfigured) {
    try {
      // Strip extension for public_id (Cloudinary appends it automatically)
      const publicId = filename.replace(/\.[^/.]+$/, "");

      const base64Data =
        typeof fileBuffer === "string"
          ? fileBuffer
          : `data:${mimeType ?? "image/jpeg"};base64,${fileBuffer.toString("base64")}`;

      const uploadResponse = await cloudinary.uploader.upload(base64Data, {
        folder,
        resource_type: resourceType,
        // UUID public_id — original filename is discarded
        public_id: publicId,
        // Overwrite disabled — each upload creates a unique asset
        overwrite: false,
        // Invalidate CDN cache on re-upload
        invalidate: true,
      });

      return {
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        provider: "cloudinary",
      };
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      throw new Error("Cloud upload service error");
    }
  }

  // Graceful fallback for local development when cloud keys are not yet set.
  // Returns a high-fidelity apparel asset URL — no local disk writes.
  return {
    url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80",
    publicId: `dev-mock-${randomUUID()}`,
    provider: "cloud-hosted",
  };
}
