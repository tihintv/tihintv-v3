import Link from "next/link";
import type { Movie } from "@/data/movies";

export default function HeroBanner({ movie }: { movie: Movie }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900">
      <div
        className="relative min-h-[420px] bg-cover bg-center"
        style={{
          backgroundImage: `url(${movie.banner})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />

        <div className="relative flex min-h-[420px] items-end p-6 md:p-10">
          <div className="max-w-2xl space-y-4">
            <span className="inline-block rounded-full bg-red-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              Phim nổi bật
            </span>

            <h1 className="text-3xl font-bold md:text-5xl">
              {movie.title}
            </h1>

            <p className="line-clamp-3 text-sm text-white/80 md:text-base">
              {movie.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href={`/watch/${movie.slug}`}
                className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                ▶ Xem ngay
              </Link>

              <Link
                href={`/movie/${movie.slug}`}
                className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Chi tiết
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}