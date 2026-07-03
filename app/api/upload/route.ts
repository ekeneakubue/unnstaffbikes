import { NextResponse } from "next/server";
import { isR2Configured, validateR2Credentials } from "@/lib/storage/r2-config";
import { isCloudflareApiConfigured } from "@/lib/storage/r2-cloudflare-api";
import {
  generateProfilePhotoKey,
  uploadToR2,
  validateImageFile,
} from "@/lib/storage/r2";

export async function POST(request: Request) {
  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "Cloudflare R2 storage is not configured." },
      { status: 503 },
    );
  }

  const credentialError = validateR2Credentials();
  if (credentialError && !isCloudflareApiConfigured()) {
    return NextResponse.json({ error: credentialError }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const key = generateProfilePhotoKey(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToR2({
      key,
      body: buffer,
      contentType: file.type,
    });

    return NextResponse.json({
      key: uploaded.key,
      url: uploaded.url,
    });
  } catch (error) {
    console.error("R2 upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload file to Cloudflare R2." },
      { status: 500 },
    );
  }
}
