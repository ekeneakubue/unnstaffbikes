"use server";

import type { UserRole } from "@/lib/generated/prisma/client";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  safeDeleteUploadedPhoto,
  uploadProfilePhoto,
} from "@/lib/upload-profile-photo";
import type { CreateUserState } from "./types";

export type { CreateUserState } from "./types";

export async function createUser(
  _prevState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const firstname = String(formData.get("firstname") ?? "").trim();
  const surname = String(formData.get("surname") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "VERIFIER") as UserRole;
  const profilePhoto = formData.get("profilePhoto");

  if (!firstname) return { error: "First name is required." };
  if (!surname) return { error: "Surname is required." };
  if (!email) return { error: "Email is required." };
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (role !== "ADMIN" && role !== "VERIFIER") {
    return { error: "Invalid role selected." };
  }
  if (!(profilePhoto instanceof File) || profilePhoto.size === 0) {
    return { error: "Profile photo is required." };
  }

  let uploadedKey: string | null = null;

  try {
    const uploaded = await uploadProfilePhoto(profilePhoto, "user");
    uploadedKey = uploaded.key;

    await prisma.user.create({
      data: {
        firstname,
        surname,
        email,
        password: hashPassword(password),
        role,
        profilePhotoUrl: uploaded.url,
      },
    });
  } catch (error) {
    if (uploadedKey) {
      await safeDeleteUploadedPhoto(uploadedKey);
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "A user with this email already exists." };
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Failed to create user. Please try again." };
  }

  return { success: true };
}
