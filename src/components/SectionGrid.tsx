import type { Movie } from "@/data/movies";
import MovieCard from "./MovieCard";

export default function SectionGrid({
  title,
  movies,
  id,
}: {
  title: string;
  movies: Movie[];
  id?: string;
}) {
  return (
    <section id={id} className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
        <span className="shrink-0 text-sm text-white/50">{movies.length} phim</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}