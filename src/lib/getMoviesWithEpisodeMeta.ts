import { supabase } from "./supabaseClient";

type MovieRow = {
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
};

type EpisodeRow = {
  id: string;
  movie_slug: string;
  episode_number: number;
  title: string;
  video_url: string;
  created_at?: string;
};

export async function getMoviesWithEpisodeMeta() {
  const { data: movies, error: moviesError } = await supabase
    .from("movies")
    .select("*")
    .order("updated_at", { ascending: false });

  if (moviesError) {
    console.error("Supabase movies error:", moviesError);
    return [];
  }

  const { data: episodes, error: episodesError } = await supabase
    .from("episodes")
    .select("*");

  if (episodesError) {
    console.error("Supabase episodes error:", episodesError);
    return (movies || []).map((movie: MovieRow) => ({
      ...movie,
      episode_count: 0,
      latest_episode_number: null,
    }));
  }

  const grouped = new Map<string, EpisodeRow[]>();

  for (const episode of (episodes || []) as EpisodeRow[]) {
    const current = grouped.get(episode.movie_slug) || [];
    current.push(episode);
    grouped.set(episode.movie_slug, current);
  }

  return (movies || []).map((movie: MovieRow) => {
    const movieEpisodes = grouped.get(movie.slug) || [];
    const latestEpisodeNumber =
      movieEpisodes.length > 0
        ? Math.max(...movieEpisodes.map((ep) => ep.episode_number))
        : null;

    return {
      ...movie,
      episode_count:
        movie.content_type === "series" ? movieEpisodes.length : 0,
      latest_episode_number:
        movie.content_type === "series" ? latestEpisodeNumber : null,
    };
  });
}