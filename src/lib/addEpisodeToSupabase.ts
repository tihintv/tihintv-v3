import { supabase } from "./supabaseClient";
import { revalidateSiteData } from "./revalidateSiteData";

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

  await revalidateSiteData("all");

  return data;
}