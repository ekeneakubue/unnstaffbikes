import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

function hashWithSalt(password: string, salt: string) {
  return scryptSync(password, salt, 64);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = hashWithSalt(password, salt).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const hashBuffer = Buffer.from(hash, "hex");
  const candidate = hashWithSalt(password, salt);

  if (hashBuffer.length !== candidate.length) return false;
  return timingSafeEqual(hashBuffer, candidate);
}
