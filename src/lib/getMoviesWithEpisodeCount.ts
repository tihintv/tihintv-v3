import { getMoviesWithEpisodeMeta } from "./getMoviesWithEpisodeMeta";

export async function getMoviesWithEpisodeCount() {
  const movies = await getMoviesWithEpisodeMeta();

  return movies.map((movie) => ({
    ...movie,
    episode_count: movie.episode_count ?? 0,
  }));
}