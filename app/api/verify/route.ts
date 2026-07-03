import { NextResponse } from "next/server";
import { findApplicantForVerification } from "@/lib/verify";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required." },
      { status: 400 },
    );
  }

  try {
    const owner = await findApplicantForVerification(query);

    if (!owner) {
      return NextResponse.json(
        {
          error:
            "No registration found for this number. Please check the details and try again.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ owner });
  } catch (error) {
    console.error("Verification lookup failed:", error);
    return NextResponse.json(
      { error: "Unable to verify owner right now. Please try again." },
      { status: 500 },
    );
  }
}
