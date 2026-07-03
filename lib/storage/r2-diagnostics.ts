import { buildPublicUrl, getR2Config } from "./r2-config";
import {
  deleteViaTemporaryCredentials,
  uploadViaTemporaryCredentials,
} from "./r2-temp-credentials";

export type UploadAttemptResult =
  | { ok: true; method: string; url: string }
  | { ok: false; method: string; error: string };

async function runAttempt(
  method: string,
  fn: () => Promise<void>,
): Promise<UploadAttemptResult> {
  try {
    await fn();
    return { ok: true, method, url: "" };
  } catch (error) {
    return {
      ok: false,
      method,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function diagnoseR2Upload({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}) {
  const { uploadViaCloudflareApi, isCloudflareApiConfigured } = await import(
    "./r2-cloudflare-api"
  );
  const { canUseTemporaryCredentials } = await import("./r2-temp-credentials");
  const { PutObjectCommand, S3Client } = await import("@aws-sdk/client-s3");

  const attempts: UploadAttemptResult[] = [];

  if (isCloudflareApiConfigured()) {
    attempts.push(
      await runAttempt("cloudflare-api", async () => {
        await uploadViaCloudflareApi({ key, body, contentType });
      }),
    );
  }

  if (canUseTemporaryCredentials()) {
    attempts.push(
      await runAttempt("temporary-credentials", async () => {
        await uploadViaTemporaryCredentials({ key, body, contentType });
      }),
    );
  }

  attempts.push(
    await runAttempt("s3", async () => {
      const { accountId, accessKeyId, secretAccessKey, bucketName } =
        getR2Config();
      const client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
    }),
  );

  const success = attempts.find((attempt) => attempt.ok);
  if (success) {
    return {
      ok: true as const,
      method: success.method,
      url: buildPublicUrl(key),
      attempts,
    };
  }

  return { ok: false as const, attempts };
}

export async function cleanupR2Upload(key: string, method: string) {
  if (method === "cloudflare-api") {
    const { deleteViaCloudflareApi } = await import("./r2-cloudflare-api");
    await deleteViaCloudflareApi(key);
    return;
  }

  if (method === "temporary-credentials") {
    await deleteViaTemporaryCredentials(key);
    return;
  }

  const { DeleteObjectCommand, S3Client } = await import("@aws-sdk/client-s3");
  const { accountId, accessKeyId, secretAccessKey, bucketName } = getR2Config();
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}
