import MovieCard from "@/components/MovieCard";

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
  id: string;
  title: string;
  movies: Movie[];
};

export default function SectionGrid({ id, title, movies }: Props) {
  const variant =
    id === "moi-cap-nhat"
      ? "latest"
      : id === "phim-bo"
      ? "series"
      : "default";

  return (
    <section id={id} className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-white md:text-3xl">{title}</h2>
        <span className="text-sm text-white/50">{movies.length} phim</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard
            key={movie.slug}
            movie={movie}
            variant={variant}
          />
        ))}
      </div>
    </section>
  );
}