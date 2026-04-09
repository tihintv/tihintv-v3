import HomeClient from "@/components/HomeClient";
import { getMoviesWithEpisodeMeta } from "@/lib/getMoviesWithEpisodeMeta";
import { getLatestEpisodes } from "@/lib/getLatestEpisodes";

export default async function HomePage() {
  const [movies, latestEpisodes] = await Promise.all([
    getMoviesWithEpisodeMeta(),
    getLatestEpisodes(),
  ]);

  return (
    <HomeClient
      movies={movies}
      latestEpisodes={latestEpisodes}
    />
  );
}