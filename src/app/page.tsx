"use client";

import { useMemo, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import SectionGrid from "@/components/SectionGrid";
import { featuredMovie, movies } from "@/data/movies";

export default function HomePage() {
  const [query, setQuery] = useState("");

  const latestMovies = [...movies].sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1
  );

  const filteredMovies = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return movies;

    return movies.filter((movie) => {
      const inTitle = movie.title.toLowerCase().includes(keyword);
      const inGenres = movie.genres.some((genre) =>
        genre.toLowerCase().includes(keyword)
      );
      const inDescription = movie.description.toLowerCase().includes(keyword);

      return inTitle || inGenres || inDescription;
    });
  }, [query]);

  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6 md:px-6 md:py-8">
        <HeroBanner movie={featuredMovie} />

        <section className="space-y-3">
          <h2 className="text-xl font-bold md:text-2xl">Tìm kiếm phim</h2>

          <input
            type="text"
            placeholder="Nhập tên phim, thể loại..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-red-500"
          />
        </section>

        {!query ? (
          <>
            <SectionGrid
              id="moi-cap-nhat"
              title="Mới cập nhật"
              movies={latestMovies}
            />

            <SectionGrid
              id="tat-ca-phim"
              title="Tất cả phim"
              movies={movies}
            />
          </>
        ) : (
          <SectionGrid
            title={`Kết quả tìm kiếm: ${filteredMovies.length} phim`}
            movies={filteredMovies}
          />
        )}
      </div>
    </main>
  );
}