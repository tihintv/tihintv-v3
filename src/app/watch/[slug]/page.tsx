import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { movies } from "@/data/movies";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const movie = movies.find(
    (item) => item.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!movie) return notFound();

  return (
    <main className="min-h-screen bg-neutral-950">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl">{movie.title}</h1>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
          <div className="aspect-video w-full">
            <iframe
              src={movie.videoUrl}
              allow="autoplay; fullscreen"
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Mô tả</h2>
          <p className="mt-3 leading-7 text-white/80">{movie.description}</p>
        </div>
      </div>
    </main>
  );
}