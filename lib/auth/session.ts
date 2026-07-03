import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/generated/prisma/enums";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./constants";

export type SessionPayload = {
  userId: string;
  role: UserRole;
  exp: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "development") {
    return "dev-only-auth-secret-change-in-production";
  }

  throw new Error("AUTH_SECRET is not set");
}

function signPayload(payload: string) {
  return createHmac("sha256", getAuthSecret())
    .update(payload)
    .digest("base64url");
}

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(body);
  return `${body}.${signature}`;
}

export function decodeSession(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = signPayload(body);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (
      !payload.userId ||
      !payload.role ||
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return decodeSession(token);
}

export async function createSession(user: { id: string; role: UserRole }) {
  const cookieStore = await cookies();
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const token = encodeSession({
    userId: user.id,
    role: user.role,
    exp,
  });

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
