import { supabase } from "./supabaseClient";
import { revalidateSiteData } from "./revalidateSiteData";

type UpdateMovieInput = {
  slug?: string;
  title?: string;
  description?: string;
  year?: number;
  genres?: string[];
  poster?: string;
  banner?: string;
  video_url?: string | null;
  featured?: boolean;
  content_type?: string;
  total_episodes?: number | null;
};

export async function updateMovieInSupabase(
  oldSlug: string,
  updates: UpdateMovieInput
) {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("movies")
    .update(payload)
    .eq("slug", oldSlug)
    .select(); // 🔥 Anh đã xóa .single() ở đây để chống crash

  if (error) {
    console.error("updateMovieInSupabase error:", error);
    throw new Error(error.message || "Không thể cập nhật phim");
  }

  // Nếu data rỗng nghĩa là cập nhật không thành công do RLS hoặc sai slug
  if (!data || data.length === 0) {
    throw new Error("Lưu thất bại! Hãy kiểm tra lại quyền UPDATE (RLS) trên Supabase.");
  }

  // Nếu đổi slug phim bộ thì sync luôn movie_slug trong episodes
  if (
    updates.slug &&
    updates.slug !== oldSlug &&
    (updates.content_type === "series" || updates.content_type === undefined)
  ) {
    const { error: episodeSyncError } = await supabase
      .from("episodes")
      .update({ movie_slug: updates.slug })
      .eq("movie_slug", oldSlug);

    if (episodeSyncError) {
      console.error("sync episodes movie_slug error:", episodeSyncError);
      throw new Error(
        episodeSyncError.message || "Cập nhật phim thành công nhưng không sync được tập"
      );
    }
  }

  await revalidateSiteData("all");

  return data[0]; // Trả về item đầu tiên
}

export default updateMovieInSupabase;