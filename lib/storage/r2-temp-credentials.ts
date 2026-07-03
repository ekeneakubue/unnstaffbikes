import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getR2Config } from "./r2-config";

const API_BASE = "https://api.cloudflare.com/client/v4";

type TempCredentialResponse = {
  success?: boolean;
  errors?: Array<{ message?: string }>;
  result?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
  };
};

function getCloudflareApiToken() {
  return process.env.CLOUDFLARE_API_TOKEN?.trim() || null;
}

export function canUseTemporaryCredentials() {
  return Boolean(
    getCloudflareApiToken() &&
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID,
  );
}

async function createTemporaryCredentials() {
  const token = getCloudflareApiToken();
  if (!token) {
    throw new Error("CLOUDFLARE_API_TOKEN is not configured.");
  }

  const { accountId, accessKeyId, bucketName } = getR2Config();
  const response = await fetch(
    `${API_BASE}/accounts/${accountId}/r2/temp-access-credentials`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucket: bucketName,
        parentAccessKeyId: accessKeyId,
        permission: "object-read-write",
        ttlSeconds: 3600,
      }),
    },
  );

  const data = (await response.json()) as TempCredentialResponse;
  if (!response.ok || !data.success || !data.result) {
    throw new Error(
      data.errors?.[0]?.message ??
        `Failed to create temporary R2 credentials (HTTP ${response.status}).`,
    );
  }

  const { accessKeyId: tempKey, secretAccessKey, sessionToken } = data.result;
  if (!tempKey || !secretAccessKey || !sessionToken) {
    throw new Error("Temporary R2 credentials response was incomplete.");
  }

  return {
    accessKeyId: tempKey,
    secretAccessKey,
    sessionToken,
  };
}

function createTempS3Client(credentials: {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}) {
  const { accountId } = getR2Config();

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });
}

export async function uploadViaTemporaryCredentials({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}) {
  const { bucketName } = getR2Config();
  const credentials = await createTemporaryCredentials();
  const client = createTempS3Client(credentials);

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function deleteViaTemporaryCredentials(key: string) {
  const { bucketName } = getR2Config();
  const credentials = await createTemporaryCredentials();
  const client = createTempS3Client(credentials);

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}

export async function probeTemporaryCredentials() {
  const credentials = await createTemporaryCredentials();
  return {
    accessKeyIdPrefix: credentials.accessKeyId.slice(0, 6),
    hasSessionToken: Boolean(credentials.sessionToken),
  };
}
