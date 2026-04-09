import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import MovieCard from "@/components/MovieCard";
import { getMoviesWithEpisodeMeta } from "@/lib/getMoviesWithEpisodeMeta";
import { getEpisodes } from "@/lib/getEpisodes";
import { getRelatedMovies } from "@/lib/getRelatedMovies";

// 🔥 Bổ sung Type khai báo rõ ràng các trường dữ liệu để Vercel không bắt bẻ
type MovieDetail = {
  slug: string;
  title: string;
  description: string;
  year: number;
  genres: string[];
  poster: string;
  banner?: string;
  video_url?: string | null;
  featured?: boolean;
  content_type: string;
  total_episodes?: number | null; // Đây chính là "chìa khóa" fix lỗi
  episode_count?: number;
  [key: string]: any; // Dự phòng an toàn cho các trường ẩn khác
};

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const movies = await getMoviesWithEpisodeMeta();

  // 🔥 Ép kiểu (cast) về MovieDetail để TypeScript nhận diện được total_episodes
  const movie =
    (movies.find(
      (item: any) => item.slug.toLowerCase() === slug.toLowerCase()
    ) as MovieDetail) ?? null;

  if (!movie) return notFound();

  const episodes =
    movie.content_type === "series" ? await getEpisodes(movie.slug) : [];

  const sortedEpisodes = [...episodes].sort(
    (a: any, b: any) => a.episode_number - b.episode_number
  );

  const relatedMovies = getRelatedMovies(movie as any, movies as any, 6);

  return (
    <main className="min-h-screen bg-neutral-950">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img
              src={movie.poster}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="text-sm text-red-400">{movie.year}</p>

            <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
              {movie.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              {movie.genres?.map((genre: string) => (
                <span
                  key={genre}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/75"
                >
                  {genre}
                </span>
              ))}
            </div>

            <p className="mt-6 leading-7 text-white/80">{movie.description}</p>

            {movie.content_type === "movie" ? (
              <div className="mt-8 flex gap-3">
                <Link
                  href={`/watch/${movie.slug}`}
                  className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-400"
                >
                  Xem ngay
                </Link>

                <Link
                  href="/movies"
                  className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-white/90 transition hover:bg-white/10"
                >
                  Quay lại
                </Link>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-white">Danh sách tập</h2>

                  {movie.total_episodes ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
                      {movie.episode_count || 0}/{movie.total_episodes} tập
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
                      {sortedEpisodes.length} tập
                    </span>
                  )}
                </div>

                {sortedEpisodes.length === 0 ? (
                  <p className="text-white/60">Chưa có tập nào.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {sortedEpisodes.map((episode: any) => (
                      <Link
                        key={episode.id}
                        href={`/watch/${movie.slug}/${episode.episode_number}`}
                        className="flex h-12 min-w-[48px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-white transition hover:bg-red-500 hover:text-white"
                        title={`Tập ${episode.episode_number} - ${episode.title}`}
                      >
                        {episode.episode_number}
                      </Link>
                    ))}
                  </div>
                )}

                {sortedEpisodes.length > 0 && (
                  <div className="pt-4">
                    <Link
                      href={`/watch/${movie.slug}/${sortedEpisodes[sortedEpisodes.length - 1].episode_number}`}
                      className="inline-block rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-400"
                    >
                      Xem tập mới nhất
                    </Link>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href="/movies"
                    className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-white/90 transition hover:bg-white/10"
                  >
                    Quay lại
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {relatedMovies.length > 0 ? (
          <section className="mt-12 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                Phim liên quan
              </h2>
              <span className="text-sm text-white/50">
                {relatedMovies.length} gợi ý
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {relatedMovies.map((relatedMovie: any) => (
                <MovieCard
                  key={relatedMovie.slug}
                  movie={relatedMovie}
                  variant="default"
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}