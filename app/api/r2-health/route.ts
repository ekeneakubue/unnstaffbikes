import { NextResponse } from "next/server";
import { getR2Config, isR2Configured, validateR2Credentials } from "@/lib/storage/r2-config";
import { isCloudflareApiConfigured } from "@/lib/storage/r2-cloudflare-api";
import { canUseTemporaryCredentials } from "@/lib/storage/r2-temp-credentials";
import { cleanupR2Upload, diagnoseR2Upload } from "@/lib/storage/r2-diagnostics";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production." }, { status: 404 });
  }

  if (!isR2Configured()) {
    return NextResponse.json({ ok: false, step: "config", error: "R2 env vars missing." }, { status: 503 });
  }

  const credentialError = validateR2Credentials();
  if (credentialError && !isCloudflareApiConfigured()) {
    return NextResponse.json({ ok: false, step: "credentials", error: credentialError }, { status: 503 });
  }

  const { bucketName } = getR2Config();
  const testKey = `health-check/${crypto.randomUUID()}.txt`;
  const result = await diagnoseR2Upload({
    key: testKey,
    body: Buffer.from("ok"),
    contentType: "text/plain",
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        bucket: bucketName,
        cloudflareApi: isCloudflareApiConfigured(),
        temporaryCredentials: canUseTemporaryCredentials(),
        attempts: result.attempts,
      },
      { status: 503 },
    );
  }

  try {
    await cleanupR2Upload(testKey, result.method);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        step: "cleanup",
        method: result.method,
        error: message,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    bucket: bucketName,
    method: result.method,
    url: result.url,
    attempts: result.attempts,
  });
}
