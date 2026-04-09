import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import WatchTracker from "@/components/WatchTracker";
import VideoPlayer from "@/components/VideoPlayer";
import { getEpisodes } from "@/lib/getEpisodes";
import { getMoviesWithEpisodeMeta } from "@/lib/getMoviesWithEpisodeMeta";

export default async function WatchEpisodePage({
  params,
}: {
  params: Promise<{ slug: string; episode: string }>;
}) {
  const { slug, episode } = await params;

  const movies = await getMoviesWithEpisodeMeta();
  const movie =
    movies.find((m: any) => m.slug.toLowerCase() === slug.toLowerCase()) ??
    null;

  if (!movie) return notFound();

  const rawEpisodes = await getEpisodes(slug);
  const episodes = [...rawEpisodes].sort(
    (a: any, b: any) => a.episode_number - b.episode_number
  );

  const episodeNumber = Number(episode);

  const currentEpisode = episodes.find(
    (ep: any) => ep.episode_number === episodeNumber
  );

  if (!currentEpisode) return notFound();

  const currentIndex = episodes.findIndex(
    (ep: any) => ep.episode_number === episodeNumber
  );

  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode =
    currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  return (
    <main className="min-h-screen bg-neutral-950">
      <SiteHeader />

      <WatchTracker
        movieSlug={movie.slug}
        movieTitle={movie.title}
        moviePoster={movie.poster}
        contentType="series"
        watchHref={`/watch/${slug}/${currentEpisode.episode_number}`}
        episodeNumber={currentEpisode.episode_number}
        episodeTitle={currentEpisode.title || null}
        totalEpisodes={movie.total_episodes ?? null}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/60">{movie.title}</p>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              Tập {currentEpisode.episode_number}
              {currentEpisode.title ? ` - ${currentEpisode.title}` : ""}
            </h1>
          </div>

          <div className="flex gap-3">
            {prevEpisode ? (
              <Link
                href={`/watch/${slug}/${prevEpisode.episode_number}`}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                ← Tập trước
              </Link>
            ) : (
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/30">
                ← Tập trước
              </span>
            )}

            {nextEpisode ? (
              <Link
                href={`/watch/${slug}/${nextEpisode.episode_number}`}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                Tập sau →
              </Link>
            ) : (
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/30">
                Tập sau →
              </span>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
          <VideoPlayer
            slug={slug}
            episode={currentEpisode.episode_number}
            videoUrl={currentEpisode.video_url}
            nextEpisodeNumber={nextEpisode?.episode_number}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white">Danh sách tập</h2>
            <span className="text-sm text-white/50">
              {episodes.length} tập
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {episodes.map((ep: any) => {
              const isActive = ep.episode_number === episodeNumber;

              return (
                <Link
                  key={ep.id}
                  href={`/watch/${slug}/${ep.episode_number}`}
                  className={`rounded-xl border px-3 py-2 text-center text-sm font-semibold transition ${
                    isActive
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-white/10 bg-black/30 text-white hover:bg-white/10"
                  }`}
                >
                  Tập {ep.episode_number}
                </Link>
              );
            })}
          </div>

          <div className="pt-5">
            <Link
              href={`/movie/${slug}`}
              className="inline-flex rounded-xl border border-white/15 px-5 py-3 font-semibold text-white/90 transition hover:bg-white/10"
            >
              Quay lại chi tiết
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}