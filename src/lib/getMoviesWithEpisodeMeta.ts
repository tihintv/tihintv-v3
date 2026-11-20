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

type EpisodeMetaRow = {
  movie_slug: string;
  episode_number: number;
};

// Lấy toàn bộ danh sách tập theo từng lô 1000 dòng để không bị giới hạn mặc định của Supabase
async function fetchAllEpisodeMeta(): Promise<EpisodeMetaRow[]> {
  const PAGE_SIZE = 1000;
  let allEpisodes: EpisodeMetaRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("episodes")
      .select("movie_slug, episode_number")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      break;
    }

    allEpisodes = allEpisodes.concat(data as EpisodeMetaRow[]);

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return allEpisodes;
}

export async function getMoviesWithEpisodeMeta() {
  const { data: movies, error: moviesError } = await supabase
    .from("movies")
    .select("*")
    .order("updated_at", { ascending: false });

  if (moviesError) {
    console.error("Supabase movies error:", moviesError);
    return [];
  }

  let episodes: EpisodeMetaRow[] = [];

  try {
    episodes = await fetchAllEpisodeMeta();
  } catch (episodesError) {
    console.error("Supabase episodes error:", episodesError);
    return (movies || []).map((movie: MovieRow) => ({
      ...movie,
      episode_count: 0,
      latest_episode_number: null,
    }));
  }

  const grouped = new Map<string, number[]>();

  for (const episode of episodes) {
    const epNum = Number(episode.episode_number);
    if (!episode.movie_slug || Number.isNaN(epNum)) continue;

    const current = grouped.get(episode.movie_slug) || [];
    current.push(epNum);
    grouped.set(episode.movie_slug, current);
  }

  return (movies || []).map((movie: MovieRow) => {
    const episodeNumbers = grouped.get(movie.slug) || [];
    const latestEpisodeNumber =
      episodeNumbers.length > 0 ? Math.max(...episodeNumbers) : null;

    return {
      ...movie,
      episode_count:
        movie.content_type === "series" ? episodeNumbers.length : 0,
      latest_episode_number:
        movie.content_type === "series" ? latestEpisodeNumber : null,
    };
  });
}
