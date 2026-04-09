"use client";

import { useMemo, useState } from "react";
import MovieCard from "@/components/MovieCard";
import useDebounce from "@/hooks/useDebounce";

type Movie = {
  slug: string;
  title: string;
  description: string;
  year: number;
  genres: string[];
  poster: string;
  banner: string;
  updated_at?: string;
  content_type?: string;
};

type Props = {
  movies: Movie[];
};

type ContentFilter = "all" | "movie" | "series";
type SortFilter = "updated" | "az" | "year_desc" | "year_asc";

function normalizeVietnamese(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export default function MoviesClient({ movies }: Props) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const [contentFilter, setContentFilter] = useState<ContentFilter>("all");
  const [sortFilter, setSortFilter] = useState<SortFilter>("updated");

  const filteredMovies = useMemo(() => {
    const keyword = normalizeVietnamese(debouncedQuery);

    let result = [...movies];

    if (keyword) {
      result = result.filter((movie) => {
        const title = normalizeVietnamese(movie.title || "");
        const desc = normalizeVietnamese(movie.description || "");
        const genres = (movie.genres || []).map((g) =>
          normalizeVietnamese(g)
        );
        const year = String(movie.year || "");

        return (
          title.includes(keyword) ||
          desc.includes(keyword) ||
          genres.some((g) => g.includes(keyword)) ||
          year.includes(keyword)
        );
      });
    }

    if (contentFilter !== "all") {
      result = result.filter((m) => m.content_type === contentFilter);
    }

    result.sort((a, b) => {
      switch (sortFilter) {
        case "az":
          return a.title.localeCompare(b.title, "vi");

        case "year_desc":
          return (b.year || 0) - (a.year || 0);

        case "year_asc":
          return (a.year || 0) - (b.year || 0);

        case "updated":
        default:
          return (a.updated_at || "") < (b.updated_at || "") ? 1 : -1;
      }
    });

    return result;
  }, [movies, debouncedQuery, contentFilter, sortFilter]);

  const clearFilters = () => {
    setQuery("");
    setContentFilter("all");
    setSortFilter("updated");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold text-white">Tìm kiếm</h2>

          <button
            onClick={clearFilters}
            className="text-sm text-white/70 transition hover:text-white"
          >
            Xóa bộ lọc
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="text"
            placeholder="Tìm phim..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none focus:border-red-500"
          />

          <select
            value={contentFilter}
            onChange={(e) =>
              setContentFilter(e.target.value as ContentFilter)
            }
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none focus:border-red-500"
          >
            <option value="all">Tất cả</option>
            <option value="movie">Phim lẻ</option>
            <option value="series">Phim bộ</option>
          </select>

          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value as SortFilter)}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none focus:border-red-500"
          >
            <option value="updated">Mới cập nhật</option>
            <option value="az">A-Z</option>
            <option value="year_desc">Năm mới nhất</option>
            <option value="year_asc">Năm cũ nhất</option>
          </select>
        </div>

        <p className="text-sm text-white/50">{filteredMovies.length} phim</p>
      </div>

      {filteredMovies.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
          Không tìm thấy phim
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.slug} movie={movie as any} />
          ))}
        </div>
      )}
    </div>
  );
}