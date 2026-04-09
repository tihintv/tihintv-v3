import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target") || "all";

  if (target === "movies" || target === "all") {
    revalidateTag("movies");
  }

  if (target === "episodes" || target === "all") {
    revalidateTag("episodes");
  }

  return NextResponse.json({ 
    revalidated: true, 
    target: target,
    now: Date.now() 
  });
}