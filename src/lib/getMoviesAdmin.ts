import { supabase } from "./supabaseClient";

export type AdminMovie = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  year: number;
  genres: string[];
  poster: string;
  banner: string;
  video_url?: string | null;
  featured?: boolean;
  updated_at?: string;
  content_type?: string;
  episode_count?: number;
  latest_episode_number?: number | null;
  total_episodes?: number | null;
};

function normalizeMovie(movie: any): AdminMovie {
  return {
    id: movie.id,
    slug: movie.slug ?? "",
    title: movie.title ?? "",
    description: movie.description ?? "",
    year: Number(movie.year ?? 0),
    genres: Array.isArray(movie.genres)
      ? movie.genres
      : typeof movie.genres === "string"
      ? movie.genres
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [],
    poster: movie.poster ?? "",
    banner: movie.banner ?? "",
    video_url: movie.video_url ?? null,
    featured: Boolean(movie.featured),
    updated_at: movie.updated_at ?? "",
    content_type:
      typeof movie.content_type === "string"
        ? movie.content_type.trim().toLowerCase()
        : "movie",
    episode_count:
      typeof movie.episode_count === "number" ? movie.episode_count : 0,
    latest_episode_number:
      typeof movie.latest_episode_number === "number"
        ? movie.latest_episode_number
        : null,
    total_episodes:
      typeof movie.total_episodes === "number" ? movie.total_episodes : null,
  };
}

export async function getMoviesAdmin(): Promise<AdminMovie[]> {
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getMoviesAdmin error:", error);
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeMovie);
}