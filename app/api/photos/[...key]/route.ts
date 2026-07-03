import { NextResponse } from "next/server";
import { readLocalPhoto } from "@/lib/storage/local-storage";
import { getObjectFromR2 } from "@/lib/storage/r2";
import { isR2Configured } from "@/lib/storage/r2-config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: keyParts } = await params;
  const key = keyParts.join("/");

  if (!key || key.includes("..")) {
    return NextResponse.json({ error: "Invalid photo key." }, { status: 400 });
  }

  if (isR2Configured()) {
    try {
      const object = await getObjectFromR2(key);
      return new NextResponse(object.body, {
        headers: {
          "Content-Type": object.contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // Fall through to local dev storage.
    }
  }

  try {
    const local = await readLocalPhoto(key);
    return new NextResponse(local.body, {
      headers: {
        "Content-Type": local.contentType,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }
}
