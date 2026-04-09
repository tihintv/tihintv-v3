"use client";

import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import ConfirmModal from "@/components/ConfirmModal";
import { getMoviesWithEpisodeMeta } from "@/lib/getMoviesWithEpisodeMeta";
import { getEpisodes } from "@/lib/getEpisodes";
import { addMovieToSupabase } from "@/lib/addMovieToSupabase";
import { updateMovieInSupabase } from "@/lib/updateMovieInSupabase";
import { deleteMovieFromSupabase } from "@/lib/deleteMovieFromSupabase";
import { addEpisodeToSupabase } from "@/lib/addEpisodeToSupabase";
import { updateEpisodeInSupabase } from "@/lib/updateEpisodeInSupabase";
import { deleteEpisodeFromSupabase } from "@/lib/deleteEpisodeFromSupabase";

type Movie = {
  id?: string | number;
  slug: string;
  title: string;
  description: string;
  year: number;
  genres: string[];
  poster: string;
  banner: string;
  video_url?: string | null;
  featured?: boolean;
  updated_at?: string;
  content_type: "movie" | "series";
  total_episodes?: number | null;
  latest_episode_number?: number | null;
};

type Episode = {
  id?: string | number;
  movie_slug: string;
  episode_number: number;
  title: string;
  video_url: string;
  created_at?: string;
};

const emptyMovieForm: Movie = {
  slug: "",
  title: "",
  description: "",
  year: new Date().getFullYear(),
  genres: [],
  poster: "",
  banner: "",
  video_url: "",
  featured: false,
  content_type: "movie",
  total_episodes: null,
};

const emptyEpisodeForm: Episode = {
  movie_slug: "",
  episode_number: 1,
  title: "",
  video_url: "",
};

function parseGenres(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatMovieType(contentType: "movie" | "series") {
  return contentType === "movie" ? "Phim lẻ" : "Phim bộ";
}

export default function AdminPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedMovieSlug, setSelectedMovieSlug] = useState("");
  const [search, setSearch] = useState("");

  const [movieForm, setMovieForm] = useState<Movie>(emptyMovieForm);
  const [episodeForm, setEpisodeForm] = useState<Episode>(emptyEpisodeForm);

  const [editingMovieSlug, setEditingMovieSlug] = useState<string | null>(null);
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | number | null>(null);

  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [submittingMovie, setSubmittingMovie] = useState(false);
  const [submittingEpisode, setSubmittingEpisode] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmType, setConfirmType] = useState<"movie" | "episode" | null>(null);
  const [confirmMovieSlug, setConfirmMovieSlug] = useState<string | null>(null);
  const [confirmEpisodeId, setConfirmEpisodeId] = useState<string | number | null>(null);

  async function loadMovies() {
    try {
      setLoadingMovies(true);
      const data = await getMoviesWithEpisodeMeta();
      const normalizedMovies = (data as Movie[]) || [];

      setMovies(normalizedMovies);

      if (!selectedMovieSlug) {
        const firstSeries = normalizedMovies.find(
          (movie) => movie.content_type === "series"
        );

        if (firstSeries) {
          setSelectedMovieSlug(firstSeries.slug);
          setEpisodeForm((prev) => ({
            ...prev,
            movie_slug: firstSeries.slug,
          }));
        }
      }
    } catch (error) {
      console.error("Lỗi load movies:", error);
    } finally {
      setLoadingMovies(false);
    }
  }

  async function loadEpisodes(slug: string) {
    if (!slug) {
      setEpisodes([]);
      return;
    }

    try {
      setLoadingEpisodes(true);
      const data = await getEpisodes(slug);
      const sorted = [...(data as Episode[])].sort(
        (a, b) => a.episode_number - b.episode_number
      );
      setEpisodes(sorted);
    } catch (error) {
      console.error("Lỗi load episodes:", error);
      setEpisodes([]);
    } finally {
      setLoadingEpisodes(false);
    }
  }

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    if (selectedMovieSlug) {
      loadEpisodes(selectedMovieSlug);
      setEpisodeForm((prev) => ({
        ...prev,
        movie_slug: selectedMovieSlug,
      }));
    }
  }, [selectedMovieSlug]);

  const filteredMovies = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return movies;

    return movies.filter((movie) => {
      const title = movie.title?.toLowerCase() || "";
      const slug = movie.slug?.toLowerCase() || "";
      const genres = (movie.genres || []).join(" ").toLowerCase();

      return (
        title.includes(keyword) ||
        slug.includes(keyword) ||
        genres.includes(keyword)
      );
    });
  }, [movies, search]);

  const selectedMovie =
    movies.find((movie) => movie.slug === selectedMovieSlug) ?? null;

  const totalMovies = movies.length;
  const totalSeries = movies.filter((movie) => movie.content_type === "series").length;
  const totalSingleMovies = movies.filter(
    (movie) => movie.content_type === "movie"
  ).length;

  function resetMovieForm() {
    setMovieForm(emptyMovieForm);
    setEditingMovieSlug(null);
  }

  function resetEpisodeForm() {
    setEpisodeForm({
      ...emptyEpisodeForm,
      movie_slug: selectedMovieSlug || "",
    });
    setEditingEpisodeId(null);
  }

  function handleEditMovie(movie: Movie) {
    setMovieForm({
      ...movie,
      genres: movie.genres || [],
      video_url: movie.video_url || "",
      total_episodes: movie.total_episodes ?? null,
    });
    setEditingMovieSlug(movie.slug);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleEditEpisode(episode: Episode) {
    setEpisodeForm({
      movie_slug: episode.movie_slug,
      episode_number: episode.episode_number,
      title: episode.title || "",
      video_url: episode.video_url || "",
    });
    setEditingEpisodeId(episode.id ?? null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmitMovie(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmittingMovie(true);

      // ✅ CHỈ LẤY ĐÚNG CÁC CỘT TRONG DATABASE, KHÔNG LẤY CÁC TRƯỜNG ẢO
      const payload = {
        slug: movieForm.slug.trim().toLowerCase(),
        title: movieForm.title.trim(),
        description: movieForm.description.trim(),
        year: Number(movieForm.year),
        genres: movieForm.genres,
        poster: movieForm.poster.trim(),
        banner: movieForm.banner.trim(),
        video_url: movieForm.video_url?.trim() || null,
        featured: Boolean(movieForm.featured),
        content_type: movieForm.content_type,
        total_episodes:
          movieForm.content_type === "series"
            ? Number(movieForm.total_episodes || 0) || null
            : null,
      };

      if (editingMovieSlug) {
        await updateMovieInSupabase(editingMovieSlug, payload);
      } else {
        await addMovieToSupabase(payload);
      }

      await loadMovies();

      if (payload.content_type === "series") {
        setSelectedMovieSlug(payload.slug);
        await loadEpisodes(payload.slug);
      }

      resetMovieForm();
    } catch (error) {
      console.error("Lỗi submit movie:", error);
    } finally {
      setSubmittingMovie(false);
    }
  }

  async function handleSubmitEpisode(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmittingEpisode(true);

      const payload = {
        movie_slug: episodeForm.movie_slug,
        episode_number: Number(episodeForm.episode_number),
        title: episodeForm.title.trim(),
        video_url: episodeForm.video_url.trim(),
      };

      if (editingEpisodeId) {
        // XÓA record cũ
        await deleteEpisodeFromSupabase(editingEpisodeId);
        // THÊM record mới
        await addEpisodeToSupabase(payload);
      } else {
        await addEpisodeToSupabase(payload);
      }

      await loadEpisodes(payload.movie_slug);
      await loadMovies();
      resetEpisodeForm();
    } catch (error) {
      console.error("Lỗi submit episode:", error);
    } finally {
      setSubmittingEpisode(false);
    }
  }

  function openDeleteMovieModal(movie: Movie) {
    setConfirmType("movie");
    setConfirmMovieSlug(movie.slug);
    setConfirmEpisodeId(null);
    setConfirmTitle("Xóa phim");
    setConfirmMessage(
      `Bạn có chắc muốn xóa phim "${movie.title}" không? Hành động này không thể hoàn tác.`
    );
    setConfirmOpen(true);
  }

  function openDeleteEpisodeModal(episode: Episode) {
    setConfirmType("episode");
    setConfirmEpisodeId(episode.id ?? null);
    setConfirmMovieSlug(null);
    setConfirmTitle("Xóa tập phim");
    setConfirmMessage(
      `Bạn có chắc muốn xóa Tập ${episode.episode_number}${
        episode.title ? ` - ${episode.title}` : ""
      } không? Hành động này không thể hoàn tác.`
    );
    setConfirmOpen(true);
  }

  function closeConfirmModal() {
    if (confirmLoading) return;

    setConfirmOpen(false);
    setConfirmType(null);
    setConfirmMovieSlug(null);
    setConfirmEpisodeId(null);
    setConfirmTitle("");
    setConfirmMessage("");
  }

  async function handleConfirmDelete() {
    try {
      setConfirmLoading(true);

      if (confirmType === "movie" && confirmMovieSlug) {
        await deleteMovieFromSupabase(confirmMovieSlug);

        if (selectedMovieSlug === confirmMovieSlug) {
          setSelectedMovieSlug("");
          setEpisodes([]);
        }

        await loadMovies();
      }

      if (confirmType === "episode" && confirmEpisodeId != null) {
        await deleteEpisodeFromSupabase(confirmEpisodeId);
        await loadEpisodes(selectedMovieSlug);
        await loadMovies();
      }

      closeConfirmModal();
    } catch (error) {
      console.error("Lỗi xóa:", error);
    } finally {
      setConfirmLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:py-10">
        <section className="mb-8 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
                Dashboard
              </p>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Admin quản trị TiHinTV
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
                Quản lý phim, tập phim và dữ liệu hiển thị trên website theo cách
                gọn hơn, dễ nhìn hơn và thuận tiện hơn khi thao tác hằng ngày.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-center">
                <p className="text-2xl font-bold text-white">{totalMovies}</p>
                <p className="mt-1 text-xs text-white/50">Tổng phim</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-center">
                <p className="text-2xl font-bold text-white">{totalSingleMovies}</p>
                <p className="mt-1 text-xs text-white/50">Phim lẻ</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-center">
                <p className="text-2xl font-bold text-white">{totalSeries}</p>
                <p className="mt-1 text-xs text-white/50">Phim bộ</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.95fr]">
          <section className="space-y-8">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)] md:p-6">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                    Movie form
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-white">
                    {editingMovieSlug ? "Chỉnh sửa phim" : "Thêm phim mới"}
                  </h2>
                  <p className="mt-1 text-sm text-white/55">
                    Điền đầy đủ thông tin phim để hiển thị đẹp trên web.
                  </p>
                </div>

                {editingMovieSlug ? (
                  <button
                    type="button"
                    onClick={resetMovieForm}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Hủy chỉnh sửa
                  </button>
                ) : null}
              </div>

              <form onSubmit={handleSubmitMovie} className="grid gap-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/75">Slug</label>
                    <input
                      type="text"
                      placeholder="vd: dead-account"
                      value={movieForm.slug}
                      onChange={(e) =>
                        setMovieForm((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-red-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/75">Tên phim</label>
                    <input
                      type="text"
                      placeholder="Nhập tên phim"
                      value={movieForm.title}
                      onChange={(e) =>
                        setMovieForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-red-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/75">Mô tả</label>
                  <textarea
                    placeholder="Tóm tắt nội dung phim..."
                    value={movieForm.description}
                    onChange={(e) =>
                      setMovieForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="min-h-[130px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-red-500"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/75">Năm</label>
                    <input
                      type="number"
                      placeholder="2025"
                      value={movieForm.year}
                      onChange={(e) =>
                        setMovieForm((prev) => ({
                          ...prev,
                          year: Number(e.target.value),
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-red-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/75">Loại phim</label>
                    <select
                      value={movieForm.content_type}
                      onChange={(e) =>
                        setMovieForm((prev) => ({
                          ...prev,
                          content_type: e.target.value as "movie" | "series",
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-red-500"
                    >
                      <option value="movie">Phim lẻ</option>
                      <option value="series">Phim bộ</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2 xl:col-span-1">
                    <label className="text-sm font-medium text-white/75">Thể loại</label>
                    <input
                      type="text"
                      placeholder="hành động, anime, tình cảm"
                      value={movieForm.genres.join(", ")}
                      onChange={(e) =>
                        setMovieForm((prev) => ({
                          ...prev,
                          genres: parseGenres(e.target.value),
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/75">Poster URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={movieForm.poster}
                      onChange={(e) =>
                        setMovieForm((prev) => ({ ...prev, poster: e.target.value }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/75">Banner URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={movieForm.banner}
                      onChange={(e) =>
                        setMovieForm((prev) => ({ ...prev, banner: e.target.value }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-red-500"
                    />
                  </div>
                </div>

                {movieForm.content_type === "movie" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/75">
                      Video URL (phim lẻ)
                    </label>
                    <input
                      type="text"
                      placeholder="Google Drive preview URL hoặc link phát"
                      value={movieForm.video_url || ""}
                      onChange={(e) =>
                        setMovieForm((prev) => ({
                          ...prev,
                          video_url: e.target.value,
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-red-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/75">Tổng số tập</label>
                    <input
                      type="number"
                      placeholder="vd: 12"
                      value={movieForm.total_episodes ?? ""}
                      onChange={(e) =>
                        setMovieForm((prev) => ({
                          ...prev,
                          total_episodes: e.target.value
                            ? Number(e.target.value)
                            : null,
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-red-500"
                    />
                  </div>
                )}

                <label className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4">
                  <input
                    type="checkbox"
                    checked={Boolean(movieForm.featured)}
                    onChange={(e) =>
                      setMovieForm((prev) => ({
                        ...prev,
                        featured: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm font-medium text-white/80">
                    Đánh dấu là phim nổi bật
                  </span>
                </label>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingMovie}
                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingMovie
                      ? "Đang xử lý..."
                      : editingMovieSlug
                      ? "Cập nhật phim"
                      : "Thêm phim"}
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)] md:p-6">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                    Episode form
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-white">
                    {editingEpisodeId ? "Chỉnh sửa tập phim" : "Thêm tập phim"}
                  </h2>
                  <p className="mt-1 text-sm text-white/55">
                    Chỉ dùng cho phim bộ. Chọn phim rồi nhập số tập và link phát.
                  </p>
                </div>

                {editingEpisodeId ? (
                  <button
                    type="button"
                    onClick={resetEpisodeForm}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Hủy chỉnh sửa
                  </button>
                ) : null}
              </div>

              <form onSubmit={handleSubmitEpisode} className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/75">Chọn phim bộ</label>
                  <select
                    value={episodeForm.movie_slug}
                    onChange={(e) =>
                      setEpisodeForm((prev) => ({
                        ...prev,
                        movie_slug: e.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-red-500"
                    required
                  >
                    <option value="">Chọn phim</option>
                    {movies
                      .filter((movie) => movie.content_type === "series")
                      .map((movie) => (
                        <option key={movie.slug} value={movie.slug}>
                          {movie.title}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-[140px_1fr]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/75">Số tập</label>
                    <input
                      type="number"
                      placeholder="1"
                      value={episodeForm.episode_number}
                      onChange={(e) =>
                        setEpisodeForm((prev) => ({
                          ...prev,
                          episode_number: Number(e.target.value),
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-red-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/75">Tên tập</label>
                    <input
                      type="text"
                      placeholder="Tên tập (có thể để trống nếu không cần)"
                      value={episodeForm.title}
                      onChange={(e) =>
                        setEpisodeForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/75">Video URL</label>
                  <input
                    type="text"
                    placeholder="Google Drive preview URL"
                    value={episodeForm.video_url}
                    onChange={(e) =>
                      setEpisodeForm((prev) => ({
                        ...prev,
                        video_url: e.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-red-500"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingEpisode}
                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingEpisode
                      ? "Đang xử lý..."
                      : editingEpisodeId
                      ? "Cập nhật tập"
                      : "Thêm tập"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="space-y-8">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)] md:p-6">
              <div className="mb-5 flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                      Library
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-white">
                      Danh sách phim
                    </h2>
                  </div>

                  <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-medium text-white/60">
                    {filteredMovies.length} / {movies.length} phim
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Tìm theo tên, slug, thể loại..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-red-500"
                />
              </div>

              {loadingMovies ? (
                <p className="text-white/60">Đang tải danh sách phim...</p>
              ) : filteredMovies.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-white/55">
                  Không có phim nào phù hợp với từ khóa tìm kiếm.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMovies.map((movie) => {
                    const isSelected = selectedMovieSlug === movie.slug;
                    const isSeries = movie.content_type === "series";

                    return (
                      <div
                        key={movie.slug}
                        className={`rounded-2xl border p-4 transition ${
                          isSelected
                            ? "border-red-500/40 bg-red-500/10"
                            : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="mb-2 flex flex-wrap gap-2">
                                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/75">
                                  {formatMovieType(movie.content_type)}
                                </span>

                                {movie.year ? (
                                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/65">
                                    {movie.year}
                                  </span>
                                ) : null}

                                {movie.featured ? (
                                  <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-300">
                                    Nổi bật
                                  </span>
                                ) : null}
                              </div>

                              <h3 className="line-clamp-2 text-base font-bold leading-6 text-white md:text-lg">
                                {movie.title}
                              </h3>

                              <p className="mt-1 truncate text-xs text-white/40">
                                {movie.slug}
                              </p>

                              {movie.genres?.length ? (
                                <p className="mt-2 line-clamp-1 text-sm text-white/55">
                                  {movie.genres.join(" • ")}
                                </p>
                              ) : null}
                            </div>

                            {isSeries ? (
                              <button
                                type="button"
                                onClick={() => setSelectedMovieSlug(movie.slug)}
                                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                  isSelected
                                    ? "bg-red-500 text-white"
                                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                }`}
                              >
                                {isSelected ? "Đang chọn" : "Xem tập"}
                              </button>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditMovie(movie)}
                              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                              Sửa
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteMovieModal(movie)}
                              className="inline-flex h-10 items-center justify-center rounded-xl bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-400"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)] md:p-6">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                    Episode list
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-white">
                    Danh sách tập
                  </h2>
                  <p className="mt-1 text-sm text-white/55">
                    {selectedMovie
                      ? `Đang xem tập của: ${selectedMovie.title}`
                      : "Chọn một phim bộ để quản lý tập"}
                  </p>
                </div>

                <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-medium text-white/60">
                  {episodes.length} tập
                </div>
              </div>

              {!selectedMovieSlug ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-white/55">
                  Hãy chọn một phim bộ ở phần danh sách phim để xem và quản lý tập.
                </div>
              ) : loadingEpisodes ? (
                <p className="text-white/60">Đang tải danh sách tập...</p>
              ) : episodes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-white/55">
                  Phim này chưa có tập nào.
                </div>
              ) : (
                <div className="space-y-3">
                  {episodes.map((episode) => (
                    <div
                      key={episode.id ?? `${episode.movie_slug}-${episode.episode_number}`}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/[0.03]"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="mb-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                            Tập {episode.episode_number}
                          </div>

                          <h3 className="line-clamp-2 text-sm font-bold leading-6 text-white md:text-base">
                            {episode.title || `Tập ${episode.episode_number}`}
                          </h3>

                          <p className="mt-1 truncate text-xs text-white/40">
                            {episode.movie_slug}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditEpisode(episode)}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteEpisodeModal(episode)}
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-400"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="Xóa luôn"
        cancelText="Hủy"
        loading={confirmLoading}
        danger
        onCancel={closeConfirmModal}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}