"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ContinueWatchingItem,
  getContinueWatching,
  removeContinueWatching,
} from "@/lib/continueWatching";

export default function ContinueWatchingSection() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    setItems(getContinueWatching());
  }, []);

  function handleRemove(movieSlug: string) {
    removeContinueWatching(movieSlug);
    setItems((prev) => prev.filter((item) => item.movieSlug !== movieSlug));
  }

  if (items.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          Tiếp tục xem
        </h2>
        <span className="text-sm text-white/50">{items.length} phim</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <article
            key={item.movieSlug}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
          >
            <Link href={item.watchHref} className="block">
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                <Image
                  src={item.moviePoster}
                  alt={item.movieTitle}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute left-3 top-3">
                  <span className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {item.contentType === "series" ? "Phim bộ" : "Phim lẻ"}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    {item.movieTitle}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.contentType === "series" && item.episodeNumber ? (
                      <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                        {item.totalEpisodes
                          ? `Tập ${item.episodeNumber}/${item.totalEpisodes}`
                          : `Tập ${item.episodeNumber}`}
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs text-white/85 backdrop-blur-sm">
                        Phim lẻ
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>

            <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-3">
              <Link
                href={item.watchHref}
                className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                Xem tiếp
              </Link>

              <button
                type="button"
                onClick={() => handleRemove(item.movieSlug)}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                Xóa
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}