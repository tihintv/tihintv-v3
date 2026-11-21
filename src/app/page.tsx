import HomeClient from "@/components/HomeClient";
import { getMoviesWithEpisodeMeta } from "@/lib/getMoviesWithEpisodeMeta";

export default async function HomePage() {
  const movies = await getMoviesWithEpisodeMeta();

  return <HomeClient movies={movies} />;
}
