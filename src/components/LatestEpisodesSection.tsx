import Link from "next/link";

type Episode = {
  id: string;
  movie_slug: string;
  episode_number: number;
  title: string;
  video_url: string;
};

type Movie = {
  slug: string;
  title: string;
  poster: string;
};

export default function LatestEpisodesSection({
  episodes,
  movies,
}: {
  episodes: Episode[];
  movies: Movie[];
}) {
  const movieMap = new Map(movies.map((movie) => [movie.slug, movie]));

  if (!episodes.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Tập mới cập nhật</h2>
        <span className="text-sm text-white/50">{episodes.length} tập</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {episodes.map((episode) => {
          const movie = movieMap.get(episode.movie_slug);
          if (!movie) return null;

          return (
            <Link
              key={episode.id}
              href={`/watch/${episode.movie_slug}/${episode.episode_number}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <div className="relative aspect-video overflow-hidden bg-neutral-900">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                  Tập {episode.episode_number}
                </div>
              </div>

              <div className="space-y-1 p-3">
                <p className="line-clamp-1 font-semibold text-white">
                  {movie.title}
                </p>
                <p className="line-clamp-1 text-sm text-white/60">
                  {episode.title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}