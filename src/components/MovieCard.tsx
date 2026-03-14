import Link from "next/link";
import type { Movie } from "@/data/movies";

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-black/50">
      <div className="relative aspect-[2/3] overflow-hidden bg-neutral-900">
        <Link href={`/movie/${movie.slug}`} className="block h-full w-full">
          <img
            src={movie.poster}
            alt={movie.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        </Link>

        <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/40" />

        <Link
          href={`/watch/${movie.slug}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-2xl text-white shadow-lg transition hover:scale-110">
            ▶
          </div>
        </Link>
      </div>

      <div className="space-y-2 p-3">
        <Link href={`/movie/${movie.slug}`} className="block">
          <h3 className="line-clamp-1 text-base font-semibold text-white transition group-hover:text-red-400">
            {movie.title}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70">
            {movie.year}
          </span>

          {movie.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}