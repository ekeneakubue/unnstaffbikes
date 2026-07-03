import { buildPublicUrl, getR2Config } from "./r2-config";

const API_BASE = "https://api.cloudflare.com/client/v4";

function getCloudflareApiToken() {
  return process.env.CLOUDFLARE_API_TOKEN?.trim() || null;
}

export function isCloudflareApiConfigured() {
  return Boolean(
    getCloudflareApiToken() &&
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_BUCKET_NAME,
  );
}

function objectApiUrl(accountId: string, bucketName: string, key: string) {
  // Slashes in object keys must remain literal in the path.
  return `${API_BASE}/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}`;
}

type CloudflareApiResponse = {
  success?: boolean;
  errors?: Array<{ code?: number; message?: string }>;
};

function getCloudflareApiError(data: CloudflareApiResponse, fallback: string) {
  return data.errors?.[0]?.message ?? fallback;
}

export async function uploadViaCloudflareApi({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}) {
  const token = getCloudflareApiToken();
  if (!token) {
    throw new Error("CLOUDFLARE_API_TOKEN is not configured.");
  }

  const { accountId, bucketName } = getR2Config();
  const response = await fetch(objectApiUrl(accountId, bucketName, key), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType,
    },
    body: new Uint8Array(Buffer.isBuffer(body) ? body : Buffer.from(body)),
  });

  const data = (await response.json()) as CloudflareApiResponse;
  if (!response.ok || !data.success) {
    throw new Error(
      getCloudflareApiError(data, `HTTP ${response.status}`),
    );
  }

  return {
    key,
    url: buildPublicUrl(key),
  };
}

export async function deleteViaCloudflareApi(key: string) {
  const token = getCloudflareApiToken();
  if (!token) {
    throw new Error("CLOUDFLARE_API_TOKEN is not configured.");
  }

  const { accountId, bucketName } = getR2Config();
  const response = await fetch(objectApiUrl(accountId, bucketName, key), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await response.json()) as CloudflareApiResponse;
  if (!response.ok || !data.success) {
    throw new Error(
      getCloudflareApiError(data, `HTTP ${response.status}`),
    );
  }
}
