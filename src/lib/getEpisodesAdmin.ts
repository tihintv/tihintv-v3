import { supabase } from "./supabaseClient";

export type AdminEpisode = {
  id: string;
  movie_slug: string;
  episode_number: number;
  title: string;
  video_url: string;
};

function normalizeEpisode(episode: any): AdminEpisode {
  return {
    id: episode.id,
    movie_slug: episode.movie_slug ?? "",
    episode_number: Number(episode.episode_number ?? 0),
    title: episode.title ?? "",
    video_url: episode.video_url ?? "",
  };
}

export async function getEpisodesAdmin(
  movieSlug: string
): Promise<AdminEpisode[]> {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("movie_slug", movieSlug)
    .order("episode_number", { ascending: true });

  if (error) {
    console.error("getEpisodesAdmin error:", error);
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeEpisode);
}