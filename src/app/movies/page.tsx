"use client";

import { useMemo, useState } from "react";
import SectionGrid from "@/components/SectionGrid";
import { movies } from "@/data/movies";

export default function MoviesPage() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");

  const sortedMovies = [...movies].sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1
  );

  const genres = Array.from(
    new Set(movies.flatMap((movie) => movie.genres))
  );

  const filteredMovies = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return sortedMovies.filter((movie) => {
      const inTitle = movie.title.toLowerCase().includes(keyword);
      const inGenres = movie.genres.some((g) =>
        g.toLowerCase().includes(keyword)
      );
      const inDescription = movie.description
        .toLowerCase()
        .includes(keyword);

      const matchKeyword =
        keyword === "" || inTitle || inGenres || inDescription;

      const matchGenre =
        genre === "" || movie.genres.includes(genre);

      return matchKeyword && matchGenre;
    });
  }, [query, genre, sortedMovies]);

  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 md:py-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold md:text-4xl">Tất cả phim</h1>
          <p className="text-white/60">
            Danh sách toàn bộ phim hiện có trên TihinTV.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold md:text-2xl">Tìm trong kho phim</h2>

          <input
            type="text"
            placeholder="Nhập tên phim, thể loại..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-red-500"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setGenre("")}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                genre === ""
                  ? "border-red-500 bg-red-500 text-white"
                  : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              Tất cả
            </button>

            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  genre === g
                    ? "border-red-500 bg-red-500 text-white"
                    : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        {filteredMovies.length > 0 ? (
          <SectionGrid
            title={`Kho phim${
              query || genre ? `: ${filteredMovies.length} kết quả` : ""
            }`}
            movies={filteredMovies}
          />
        ) : (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <h3 className="text-2xl font-bold">Không tìm thấy phim</h3>
            <p className="mt-3 text-white/60">
              Không có phim nào khớp với từ khóa hoặc thể loại bạn đã chọn.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}