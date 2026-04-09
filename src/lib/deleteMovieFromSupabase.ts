import { supabase } from "./supabaseClient";
import { revalidateSiteData } from "./revalidateSiteData";

export async function deleteMovieFromSupabase(slug: string) {
  // 🔥 Xóa episode trước
  await supabase.from("episodes").delete().eq("movie_slug", slug);

  // 🔥 Sau đó xóa movie
  const { error } = await supabase
    .from("movies")
    .delete()
    .eq("slug", slug);

  if (error) {
    console.error("deleteMovie error:", error);
    throw new Error(error.message);
  }

  await revalidateSiteData("all");

  return true;
}