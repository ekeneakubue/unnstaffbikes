import { NextResponse } from "next/server";
import {
  createApplicant,
  formatRegistrationError,
  getRegistrationErrorStatus,
  parseRegistrationForm,
  type RegistrationInput,
} from "@/lib/registration";
import { isR2Configured, validateR2Credentials } from "@/lib/storage/r2-config";
import { isCloudflareApiConfigured } from "@/lib/storage/r2-cloudflare-api";
import {
  deleteFromR2,
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

  let uploadedKey: string | null = null;
  let registrationInput: RegistrationInput | null = null;

  try {
    const formData = await request.formData();
    const profilePhoto = formData.get("profilePhoto");

    if (!(profilePhoto instanceof File)) {
      return NextResponse.json(
        { error: "Profile photo is required." },
        { status: 400 },
      );
    }

    const validationError = validateImageFile(profilePhoto);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const key = generateProfilePhotoKey(profilePhoto.name);
    const buffer = Buffer.from(await profilePhoto.arrayBuffer());
    const uploaded = await uploadToR2({
      key,
      body: buffer,
      contentType: profilePhoto.type,
    });
    uploadedKey = uploaded.key;

    formData.set("profilePhotoUrl", uploaded.url);

    const parsed = parseRegistrationForm(formData);
    if (typeof parsed === "string") {
      if (uploadedKey) await deleteFromR2(uploadedKey);
      return NextResponse.json({ error: parsed }, { status: 400 });
    }

    registrationInput = parsed;
    const applicant = await createApplicant(parsed);

    return NextResponse.json({
      id: applicant.id,
      staffNumber: applicant.staffNumber,
      motorcycleNo: applicant.motorcycleNo,
      profilePhotoUrl: applicant.profilePhotoUrl,
    });
  } catch (error) {
    if (uploadedKey) {
      try {
        await deleteFromR2(uploadedKey);
      } catch {
        // Ignore cleanup failures.
      }
    }

    console.error("Registration failed:", error);
    return NextResponse.json(
      {
        error: await formatRegistrationError(error, registrationInput ?? undefined),
      },
      { status: getRegistrationErrorStatus(error) },
    );
  }
}
