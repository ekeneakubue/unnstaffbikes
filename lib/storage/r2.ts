import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getR2Config, buildPublicUrl } from "./r2-config";
import {
  deleteViaCloudflareApi,
  isCloudflareApiConfigured,
  uploadViaCloudflareApi,
} from "./r2-cloudflare-api";
import {
  canUseTemporaryCredentials,
  deleteViaTemporaryCredentials,
  uploadViaTemporaryCredentials,
} from "./r2-temp-credentials";
import {
  deleteFromLocalStorage,
  uploadToLocalStorage,
} from "./local-storage";

function isLocalStorageEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.R2_ALLOW_LOCAL_FALLBACK === "true"
  );
}

async function runUploadAttempts({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}) {
  const errors: string[] = [];

  if (isCloudflareApiConfigured()) {
    try {
      return await uploadViaCloudflareApi({ key, body, contentType });
    } catch (error) {
      errors.push(
        `cloudflare-api: ${error instanceof Error ? error.message : "failed"}`,
      );
    }
  }

  if (canUseTemporaryCredentials()) {
    try {
      await uploadViaTemporaryCredentials({ key, body, contentType });
      return { key, url: buildPublicUrl(key) };
    } catch (error) {
      errors.push(
        `temporary-credentials: ${error instanceof Error ? error.message : "failed"}`,
      );
    }
  }

  try {
    return await uploadToR2S3({ key, body, contentType });
  } catch (error) {
    errors.push(`s3: ${error instanceof Error ? error.message : "failed"}`);
  }

  throw new Error(
    `All R2 upload methods failed. ${errors.join(" | ")}`,
  );
}

let r2Client: S3Client | null = null;

function createR2Client() {
  const { accountId, accessKeyId, secretAccessKey } = getR2Config();

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function getR2Client() {
  // In dev, always read fresh credentials from .env after restarts/edits.
  if (process.env.NODE_ENV === "development") {
    return createR2Client();
  }

  if (!r2Client) {
    r2Client = createR2Client();
  }

  return r2Client;
}

async function uploadToR2S3({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}) {
  const { bucketName } = getR2Config();
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return {
    key,
    url: buildPublicUrl(key),
  };
}

async function deleteFromR2S3(key: string) {
  const { bucketName } = getR2Config();
  const client = getR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}

export { buildPublicUrl } from "./r2-config";

export function generateProfilePhotoKey(originalName: string) {
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(extension)
    ? extension
    : "jpg";

  return `profile-photos/${crypto.randomUUID()}.${safeExtension}`;
}

export async function uploadToR2({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}) {
  try {
    return await runUploadAttempts({ key, body, contentType });
  } catch (error) {
    if (isLocalStorageEnabled()) {
      console.warn(
        "R2 upload unavailable; saving profile photo to public/uploads because R2_ALLOW_LOCAL_FALLBACK=true.",
      );
      return uploadToLocalStorage({ key, body });
    }

    throw error;
  }
}

export async function deleteFromR2(key: string) {
  const errors: string[] = [];

  if (isCloudflareApiConfigured()) {
    try {
      await deleteViaCloudflareApi(key);
      return;
    } catch (error) {
      errors.push(
        `cloudflare-api: ${error instanceof Error ? error.message : "failed"}`,
      );
    }
  }

  if (canUseTemporaryCredentials()) {
    try {
      await deleteViaTemporaryCredentials(key);
      return;
    } catch (error) {
      errors.push(
        `temporary-credentials: ${error instanceof Error ? error.message : "failed"}`,
      );
    }
  }

  try {
    await deleteFromR2S3(key);
    return;
  } catch (error) {
    errors.push(`s3: ${error instanceof Error ? error.message : "failed"}`);
  }

  if (isLocalStorageEnabled()) {
    await deleteFromLocalStorage(key);
    return;
  }

  throw new Error(`All R2 delete methods failed. ${errors.join(" | ")}`);
}

export {
  ALLOWED_IMAGE_ACCEPT,
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  validateImageFile,
} from "@/lib/validate-image";
