import { notFound, redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import WatchTracker from "@/components/WatchTracker";
import { getMoviesWithEpisodeMeta } from "@/lib/getMoviesWithEpisodeMeta";
import { getEpisodes } from "@/lib/getEpisodes";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const movies = await getMoviesWithEpisodeMeta();
  const movie =
    movies.find(
      (item: any) => item.slug.toLowerCase() === slug.toLowerCase()
    ) ?? null;

  if (!movie) return notFound();

  if (movie.content_type === "series") {
    const episodes = await getEpisodes(movie.slug);

    if (!episodes.length) {
      return (
        <main className="min-h-screen bg-neutral-950">
          <SiteHeader />
          <div className="mx-auto max-w-6xl px-4 py-8 text-white">
            Chưa có tập nào cho phim bộ này.
          </div>
        </main>
      );
    }

    const sortedEpisodes = [...episodes].sort(
      (a: any, b: any) => a.episode_number - b.episode_number
    );

    const latestEpisode = sortedEpisodes[sortedEpisodes.length - 1];

    redirect(`/watch/${movie.slug}/${latestEpisode.episode_number}`);
  }

  return (
    <main className="min-h-screen bg-neutral-950">
      <SiteHeader />

      <WatchTracker
        movieSlug={movie.slug}
        movieTitle={movie.title}
        moviePoster={movie.poster}
        contentType="movie"
        watchHref={`/watch/${movie.slug}`}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <h1 className="mb-6 text-2xl font-bold text-white md:text-3xl">
          {movie.title}
        </h1>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
          <div className="aspect-video w-full">
            <iframe
              src={movie.video_url || ""}
              allow="autoplay; fullscreen"
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold text-white">Mô tả</h2>
          <p className="mt-3 leading-7 text-white/80">{movie.description}</p>
        </div>
      </div>
    </main>
  );
}