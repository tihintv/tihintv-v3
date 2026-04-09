import { supabase } from "./supabaseClient";
import { revalidateSiteData } from "./revalidateSiteData";

type UpdateEpisodePayload = {
  original_movie_slug: string;
  original_episode_number: number;
  movie_slug: string;
  episode_number: number;
  title: string;
  video_url: string;
};

export async function updateEpisodeInSupabase(
  payload: UpdateEpisodePayload
) {
  const { data, error } = await supabase
    .from("episodes")
    .update({
      movie_slug: payload.movie_slug,
      episode_number: payload.episode_number,
      title: payload.title,
      video_url: payload.video_url,
    })
    .eq("movie_slug", payload.original_movie_slug)
    .eq("episode_number", payload.original_episode_number)
    .select()
    .single();

  if (error) {
    console.error("updateEpisodeInSupabase error:", error);
    throw new Error(error.message || "Không thể cập nhật tập phim");
  }

  if (!data) {
    throw new Error("Không tìm thấy tập phim để cập nhật");
  }

  await revalidateSiteData("all");

  return data;
}

export default updateEpisodeInSupabase;