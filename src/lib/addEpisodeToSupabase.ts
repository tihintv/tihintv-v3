import { supabase } from "./supabaseClient";
import { revalidateSiteData } from "./revalidateSiteData";
import { touchMovieUpdatedAt } from "./touchMovieUpdatedAt";

type AddEpisodeInput = {
  movie_slug: string;
  episode_number: number;
  title: string;
  video_url: string;
};

export async function addEpisodeToSupabase(episode: AddEpisodeInput) {
  const { data, error } = await supabase
    .from("episodes")
    .insert([episode])
    .select();

  if (error) {
    console.error("addEpisodeToSupabase error:", error);
    throw new Error(error.message);
  }

  // Đẩy phim lên đầu mục "Mới cập nhật" rồi mới làm mới trang chủ.
  await touchMovieUpdatedAt(episode.movie_slug);
  await revalidateSiteData("all");

  return data;
}