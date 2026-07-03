import {
  deleteFromR2,
  generateProfilePhotoKey,
  uploadToR2,
  validateImageFile,
} from "@/lib/storage/r2";
import { isCloudflareApiConfigured } from "@/lib/storage/r2-cloudflare-api";
import { isR2Configured, validateR2Credentials } from "@/lib/storage/r2-config";

export function generateUserPhotoKey(originalName: string) {
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(extension)
    ? extension
    : "jpg";

  return `user-photos/${crypto.randomUUID()}.${safeExtension}`;
}

export async function uploadProfilePhoto(file: File, keyPrefix: "profile" | "user" = "profile") {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 storage is not configured.");
  }

  const credentialError = validateR2Credentials();
  if (credentialError && !isCloudflareApiConfigured()) {
    throw new Error(credentialError);
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const key =
    keyPrefix === "user"
      ? generateUserPhotoKey(file.name)
      : generateProfilePhotoKey(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadToR2({
    key,
    body: buffer,
    contentType: file.type,
  });

  return uploaded;
}

export async function safeDeleteUploadedPhoto(key: string) {
  try {
    await deleteFromR2(key);
  } catch {
    // Ignore cleanup failures.
  }
}
