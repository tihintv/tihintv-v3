import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const start = Date.now();

  const { error } = await supabase
    .from("movies")
    .select("slug")
    .limit(1);

  return NextResponse.json({
    ok: !error,
    error: error?.message ?? null,
    time: new Date().toISOString(),
    duration: Date.now() - start,
  });
}