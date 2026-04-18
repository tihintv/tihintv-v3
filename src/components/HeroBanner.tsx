"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Movie } from "@/data/movies";

export default function HeroBanner({
  movies,
}: {
  movies: (Movie & { content_type?: string })[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Tự động chuyển slide sau mỗi 3 giây
  useEffect(() => {
    if (!movies || movies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 3000); // Đã đổi từ 5000 thành 3000 ở đây

    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  const playHref =
    currentMovie.content_type === "series"
      ? `/movie/${currentMovie.slug}`
      : `/watch/${currentMovie.slug}`;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 group">
      <div className="relative min-h-[420px] md:min-h-[500px]">
        {movies.map((movie, index) => (
          <div
            key={movie.slug}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{
              backgroundImage: `url(${movie.banner || movie.poster})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
          </div>
        ))}

        <div className="relative z-20 flex min-h-[420px] md:min-h-[500px] items-end p-6 md:p-10">
          <div className="max-w-2xl space-y-4">
            <span className="inline-block rounded-full bg-red-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              Phim nổi bật
            </span>

            <h1 className="text-3xl font-bold md:text-5xl text-white drop-shadow-lg">
              {currentMovie.title}
            </h1>

            <p className="line-clamp-3 text-sm text-white/80 md:text-base drop-shadow-md">
              {currentMovie.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {currentMovie.genres?.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-white/20 bg-black/30 backdrop-blur-sm px-3 py-1 text-xs text-white/80"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href={playHref}
                className="rounded-xl bg-red-500 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] transition hover:bg-red-400 hover:scale-[1.02] active:scale-95"
              >
                ▶ Xem ngay
              </Link>

              <Link
                href={`/movie/${currentMovie.slug}`}
                className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-md px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20 hover:text-white"
              >
                Chi tiết
              </Link>
            </div>
          </div>
        </div>

        {movies.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-red-500"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Chuyển đến phim ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
