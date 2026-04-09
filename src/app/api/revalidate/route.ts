import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const target = body?.target ?? "all";

    if (target === "movies" || target === "all") {
      revalidateTag("movies");
    }

    if (target === "episodes" || target === "all") {
      revalidateTag("latest-episodes");
    }

    revalidatePath("/");
    revalidatePath("/movies");

    return NextResponse.json({
      ok: true,
      target,
      revalidatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("revalidate api error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Revalidate thất bại",
      },
      { status: 500 }
    );
  }
}