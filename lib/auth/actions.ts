"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "./session";

export type LoginResult = {
  error?: string;
  redirectTo?: string;
};

function safeRedirectPath(path: string | null, role: "ADMIN" | "VERIFIER") {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return role === "ADMIN" ? "/admin" : "/verifier";
  }

  if (path.startsWith("/admin") && role !== "ADMIN") {
    return "/verifier";
  }

  return path;
}

export async function login(
  _prevState: LoginResult,
  formData: FormData,
): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim() || null;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive || !verifyPassword(password, user.password)) {
      return { error: "Invalid email or password." };
    }

    if (user.role !== "ADMIN" && user.role !== "VERIFIER") {
      return { error: "You do not have access to this portal." };
    }

    await createSession({ id: user.id, role: user.role });

    return { redirectTo: safeRedirectPath(next, user.role) };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("AUTH_SECRET is not set")
    ) {
      return {
        error:
          "Sign-in is not configured on the server. Set AUTH_SECRET in production environment variables.",
      };
    }

    console.error("Login failed:", error);
    return { error: "Unable to sign in right now. Please try again." };
  }
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
