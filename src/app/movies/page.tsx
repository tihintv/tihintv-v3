import { getMoviesWithEpisodeMeta } from "@/lib/getMoviesWithEpisodeMeta";
import MoviesClient from "@/components/MoviesClient";

export default async function MoviesPage() {
  const movies = await getMoviesWithEpisodeMeta();

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-3xl font-bold">Tất cả phim</h1>

        <MoviesClient movies={movies as any} />
      </div>
    </main>
  );
}