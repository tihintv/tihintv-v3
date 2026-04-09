import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target") || "all";

  // Thêm "max" làm tham số thứ 2 để chiều lòng Next.js bản mới
  if (target === "movies" || target === "all") {
    revalidateTag("movies", "max");
  }

  if (target === "episodes" || target === "all") {
    revalidateTag("episodes", "max");
  }

  return NextResponse.json({ 
    revalidated: true, 
    target: target,
    now: Date.now() 
  });
}