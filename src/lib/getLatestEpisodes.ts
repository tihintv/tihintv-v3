import { unstable_cache } from "next/cache";
import { supabase } from "./supabaseClient";

export type LatestEpisode = {
  id?: string;
  movie_slug: string;
  episode_number: number;
  title: string;
  video_url: string;
  created_at?: string;
  movie_title?: string;
  movie_poster?: string;
};

function normalizeEpisode(row: any): LatestEpisode {
  return {
    id: row.id,
    movie_slug: row.movie_slug ?? "",
    episode_number: Number(row.episode_number ?? 0),
    title: row.title ?? "",
    video_url: row.video_url ?? "",
    created_at: row.created_at ?? "",
    movie_title: row.movies?.title ?? "",
    movie_poster: row.movies?.poster ?? "",
  };
}

async function fetchLatestEpisodesOnce(): Promise<LatestEpisode[]> {
  const { data, error } = await supabase
    .from("episodes")
    .select(
      `
      id,
      movie_slug,
      episode_number,
      title,
      video_url,
      created_at,
      movies (
        title,
        poster
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeEpisode);
}

async function fetchLatestEpisodesWithRetry(): Promise<LatestEpisode[]> {
  try {
    return await fetchLatestEpisodesOnce();
  } catch (error) {
    console.error("getLatestEpisodes lần 1 lỗi:", error);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      return await fetchLatestEpisodesOnce();
    } catch (retryError) {
      console.error("getLatestEpisodes retry vẫn lỗi:", retryError);
      return [];
    }
  }
}

const getLatestEpisodesCached = unstable_cache(
  async () => {
    return await fetchLatestEpisodesWithRetry();
  },
  ["tihintv-get-latest-episodes"],
  {
    revalidate: 60,
    tags: ["latest-episodes"],
  }
);

export async function getLatestEpisodes(): Promise<LatestEpisode[]> {
  return await getLatestEpisodesCached();
}