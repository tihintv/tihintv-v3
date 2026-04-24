import Image from "next/image";
import Link from "next/link";

type Movie = {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  year?: number;
  genres?: string[];
  poster: string;
  banner?: string;
  featured?: boolean;
  updated_at?: string;
  content_type?: string;
  episode_count?: number;
  latest_episode_number?: number | null;
  total_episodes?: number | null;
};

type Props = {
  movie: Movie;
  variant?: "default" | "latest" | "series";
};

export default function MovieCard({
  movie,
  variant = "default",
}: Props) {
  const isSeries = movie.content_type === "series";
  const watchHref = isSeries
    ? `/watch/${movie.slug}/${movie.latest_episode_number || 1}`
    : `/watch/${movie.slug}`;

  const detailHref = `/movie/${movie.slug}`;

  let topRightBadge: string | null = null;

  if (isSeries && variant === "latest" && movie.latest_episode_number) {
    topRightBadge = `Tập ${movie.latest_episode_number}`;
  } else if (isSeries && variant === "series") {
    if (movie.total_episodes && movie.episode_count) {
      topRightBadge = `${movie.episode_count}/${movie.total_episodes}`;
    } else if (movie.latest_episode_number) {
      topRightBadge = `Tập ${movie.latest_episode_number}`;
    }
  } else if (isSeries && movie.latest_episode_number) {
    topRightBadge = `Tập ${movie.latest_episode_number}`;
  }

  return (
    <article className="group relative overflow-visible rounded-3xl">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 group-hover:-translate-y-1 group-hover:border-white/20 group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
        <Link href={detailHref} className="block">
          <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
            <Image
              src={movie.poster}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {isSeries ? "Phim bộ" : "Phim lẻ"}
              </span>
            </div>

            {topRightBadge ? (
              <div className="absolute right-3 top-3">
                <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  {topRightBadge}
                </span>
              </div>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="group/title relative">
                <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] transition group-hover:text-red-300">
                  {movie.title}
                </h3>

                <div className="mt-2 flex flex-wrap gap-2">
                  {movie.year ? (
                    <span className="rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[11px] text-white/85 backdrop-blur-sm">
                      {movie.year}
                    </span>
                  ) : null}

                  {movie.genres?.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden max-w-[260px] rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-sm leading-relaxed text-white shadow-2xl group-hover/title:block">
                  {movie.title}
                </div>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
              <Link
                href={watchHref}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_10px_30px_rgba(239,68,68,0.45)] transition hover:scale-105 hover:bg-red-400"
                aria-label={`Xem ${movie.title}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="ml-1 h-8 w-8"
                >
                  <path d="M8 5.14v14l11-7-11-7Z" />
                </svg>
              </Link>
            </div>
          </div>
        </Link>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-3 py-3">
          <Link
            href={watchHref}
            className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
          >
            Xem ngay
          </Link>

          <Link
            href={detailHref}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}