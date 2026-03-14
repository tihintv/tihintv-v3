import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { movies } from "@/data/movies";

export default function MovieDetailPage({ params }: { params: { slug: string } }) {
  const movie = movies.find((item) => item.slug === params.slug);

  if (!movie) return notFound();

  return (
    <main className="min-h-screen bg-neutral-950">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" />
          </div>

          <div>
            <p className="text-sm text-red-400">{movie.year}</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">{movie.title}</h1>

            <div className="mt-4 flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span key={genre} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/75">
                  {genre}
                </span>
              ))}
            </div>

            <p className="mt-6 leading-7 text-white/80">{movie.description}</p>

            <div className="mt-8 flex gap-3">
              <Link href={`/watch/${movie.slug}`} className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-400">
                Xem ngay
              </Link>
              <Link href="/" className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-white/90 transition hover:bg-white/10">
                Quay lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}