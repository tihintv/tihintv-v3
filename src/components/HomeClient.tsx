"use client";

import { useEffect, useMemo, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import SectionGrid from "@/components/SectionGrid";
import LatestEpisodesSection from "@/components/LatestEpisodesSection";
import ContinueWatchingSection from "@/components/ContinueWatchingSection";
import useDebounce from "@/hooks/useDebounce";
import { getMoviesFromCache, saveMoviesToCache } from "@/lib/movieCache";
import {
  getLatestEpisodesFromCache,
  saveLatestEpisodesToCache,
} from "@/lib/latestEpisodeCache";

type Movie = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  year: number;
  genres: string[];
  poster: string;
  banner: string;
  featured?: boolean;
  updated_at?: string;
  content_type?: string;
  episode_count?: number;
  latest_episode_number?: number | null;
  total_episodes?: number | null;
};

type LatestEpisode = {
  id?: string;
  movie_slug: string;
  episode_number: number;
  title: string;
  video_url: string;
  created_at?: string;
  movie_title?: string;
  movie_poster?: string;
};

type Props = {
  movies: Movie[];
  latestEpisodes: LatestEpisode[];
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

export default function HomeClient({ movies, latestEpisodes }: Props) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const [displayMovies, setDisplayMovies] = useState<Movie[]>(movies);
  const [displayLatestEpisodes, setDisplayLatestEpisodes] =
    useState<LatestEpisode[]>(latestEpisodes);

  const [contentFilter, setContentFilter] = useState<ContentFilter>("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState<SortFilter>("updated");

  useEffect(() => {
    if (movies.length > 0) {
      setDisplayMovies(movies);
      saveMoviesToCache(movies);
      return;
    }

    const cachedMovies = getMoviesFromCache();
    if (cachedMovies.length > 0) {
      setDisplayMovies(cachedMovies);
    }
  }, [movies]);

  useEffect(() => {
    if (latestEpisodes.length > 0) {
      setDisplayLatestEpisodes(latestEpisodes);
      saveLatestEpisodesToCache(latestEpisodes);
      return;
    }

    const cachedEpisodes = getLatestEpisodesFromCache();
    if (cachedEpisodes.length > 0) {
      setDisplayLatestEpisodes(cachedEpisodes);
    }
  }, [latestEpisodes]);

  const featuredMovies = useMemo(() => {
    const featured = displayMovies.filter((movie) => movie.featured);
    if (featured.length > 0) {
      return featured.slice(0, 5);
    }
    return displayMovies.slice(0, 5);
  }, [displayMovies]);

  const allGenres = useMemo(() => {
    const genreSet = new Set<string>();

    displayMovies.forEach((movie) => {
      movie.genres?.forEach((genre) => {
        if (genre?.trim()) genreSet.add(genre.trim());
      });
    });

    return Array.from(genreSet).sort((a, b) => a.localeCompare(b, "vi"));
  }, [displayMovies]);

  const allYears = useMemo(() => {
    const yearSet = new Set<number>();

    displayMovies.forEach((movie) => {
      if (movie.year) yearSet.add(movie.year);
    });

    return Array.from(yearSet).sort((a, b) => b - a);
  }, [displayMovies]);

  const filteredMovies = useMemo(() => {
    const normalizedKeyword = normalizeVietnamese(debouncedQuery);

    let result = [...displayMovies];

    if (normalizedKeyword) {
      result = result.filter((movie) => {
        const normalizedTitle = normalizeVietnamese(movie.title || "");
        const normalizedDescription = normalizeVietnamese(
          movie.description || ""
        );
        const normalizedGenres = (movie.genres || []).map((genre) =>
          normalizeVietnamese(genre)
        );
        const normalizedYear = String(movie.year || "");

        const inTitle = normalizedTitle.includes(normalizedKeyword);
        const inDescription =
          normalizedDescription.includes(normalizedKeyword);
        const inGenres = normalizedGenres.some((genre) =>
          genre.includes(normalizedKeyword)
        );
        const inYear = normalizedYear.includes(normalizedKeyword);

        return inTitle || inDescription || inGenres || inYear;
      });
    }

    if (contentFilter !== "all") {
      result = result.filter((movie) => movie.content_type === contentFilter);
    }

    if (genreFilter !== "all") {
      result = result.filter((movie) =>
        (movie.genres || []).some(
          (genre) =>
            normalizeVietnamese(genre) === normalizeVietnamese(genreFilter)
        )
      );
    }

    if (yearFilter !== "all") {
      result = result.filter((movie) => String(movie.year) === yearFilter);
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
  }, [
    debouncedQuery,
    displayMovies,
    contentFilter,
    genreFilter,
    yearFilter,
    sortFilter,
  ]);

  const latestMovies = useMemo(() => {
    return [...filteredMovies].sort((a, b) =>
      (a.updated_at || "") < (b.updated_at || "") ? 1 : -1
    );
  }, [filteredMovies]);

  const seriesMovies = filteredMovies.filter(
    (movie) => movie.content_type === "series"
  );

  const singleMovies = filteredMovies.filter(
    (movie) => movie.content_type === "movie"
  );

  const isSearching =
    query.trim().length > 0 ||
    contentFilter !== "all" ||
    genreFilter !== "all" ||
    yearFilter !== "all";

  const hasMovies = displayMovies.length > 0;
  const hasFilteredMovies = filteredMovies.length > 0;

  const clearFilters = () => {
    setQuery("");
    setContentFilter("all");
    setGenreFilter("all");
    setYearFilter("all");
    setSortFilter("updated");
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6 md:px-6 md:py-8">
        
        {featuredMovies.length > 0 ? (
          <HeroBanner movies={featuredMovies as any} />
        ) : null}

        {!isSearching ? <ContinueWatchingSection /> : null}

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white md:text-2xl">
                Tìm kiếm phim
              </h2>
              <p className="text-sm text-white/50">
                Tìm theo tên phim, mô tả, thể loại, năm phát hành
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Xóa bộ lọc
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="md:col-span-2 xl:col-span-2">
              <input
                type="text"
                placeholder="Nhập tên phim, thể loại, năm..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-red-500"
              />
            </div>

            <select
              value={contentFilter}
              onChange={(e) =>
                setContentFilter(e.target.value as ContentFilter)
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-red-500"
            >
              <option value="all">Tất cả loại phim</option>
              <option value="movie">Phim lẻ</option>
              <option value="series">Phim bộ</option>
            </select>

            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-red-500"
            >
              <option value="all">Tất cả thể loại</option>
              {allGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-red-500"
            >
              <option value="all">Tất cả năm</option>
              {allYears.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                Kết quả: {filteredMovies.length} phim
              </span>

              {contentFilter !== "all" ? (
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
                  {contentFilter === "movie" ? "Phim lẻ" : "Phim bộ"}
                </span>
              ) : null}

              {genreFilter !== "all" ? (
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
                  {genreFilter}
                </span>
              ) : null}

              {yearFilter !== "all" ? (
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
                  {yearFilter}
                </span>
              ) : null}
            </div>

            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value as SortFilter)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-red-500 md:w-[220px]"
            >
              <option value="updated">Sắp xếp: Mới cập nhật</option>
              <option value="az">Sắp xếp: A-Z</option>
              <option value="year_desc">Sắp xếp: Năm mới nhất</option>
              <option value="year_asc">Sắp xếp: Năm cũ nhất</option>
            </select>
          </div>
        </section>

        {!hasMovies ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <h3 className="text-2xl font-bold text-white">
              Đang tải dữ liệu hoặc chưa có phim...
            </h3>
            <p className="mt-3 text-white/60">
              Nếu bạn vừa mở web, có thể database đang khởi động lại. Hãy thử
              tải lại sau ít phút.
            </p>
          </section>
        ) : !hasFilteredMovies ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <h3 className="text-2xl font-bold text-white">
              Không tìm thấy phim phù hợp
            </h3>
            <p className="mt-3 text-white/60">
              Hãy thử đổi từ khóa, bỏ bớt bộ lọc, hoặc chọn thể loại khác.
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-2xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-400"
              >
                Đặt lại tìm kiếm
              </button>
            </div>
          </section>
        ) : (
          <>
            {!isSearching && displayLatestEpisodes.length > 0 ? (
              <LatestEpisodesSection episodes={displayLatestEpisodes as any} movies={movies as any} />
            ) : null}

            <SectionGrid
              id="moi-cap-nhat"
              title="Mới cập nhật"
              movies={latestMovies as any}
            />

            {seriesMovies.length > 0 ? (
              <SectionGrid
                id="phim-bo"
                title="Phim bộ"
                movies={seriesMovies as any}
              />
            ) : null}

            {singleMovies.length > 0 ? (
              <SectionGrid
                id="phim-le"
                title="Phim lẻ"
                movies={singleMovies as any}
              />
            ) : null}

            <SectionGrid
              id="tat-ca-phim"
              title="Tất cả phim"
              movies={filteredMovies as any}
            />
          </>
        )}
      </div>
    </div>
  );
}