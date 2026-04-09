import { getMoviesWithEpisodeMeta } from "./getMoviesWithEpisodeMeta";

export async function getMovies() {
  return await getMoviesWithEpisodeMeta();
}