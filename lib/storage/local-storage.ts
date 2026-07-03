import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export function isLocalStorageEnabled() {
  return process.env.NODE_ENV === "development";
}

function localFilePath(key: string) {
  return path.join(UPLOAD_DIR, key);
}

export async function uploadToLocalStorage({
  key,
  body,
}: {
  key: string;
  body: Buffer | Uint8Array;
}) {
  const filePath = localFilePath(key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body);

  return {
    key,
    url: `/uploads/${key.replace(/\\/g, "/")}`,
  };
}

export async function deleteFromLocalStorage(key: string) {
  try {
    await unlink(localFilePath(key));
  } catch {
    // Ignore missing files during cleanup.
  }
}
