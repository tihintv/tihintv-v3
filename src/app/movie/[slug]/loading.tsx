export default function LoadingMovieDetailPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="animate-pulse overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="aspect-[16/6] w-full bg-white/10" />

          <div className="space-y-4 p-6 md:p-8">
            <div className="h-10 w-2/3 rounded bg-white/10" />
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-5/6 rounded bg-white/10" />

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="h-11 w-36 rounded-xl bg-white/10" />
              <div className="h-11 w-32 rounded-xl bg-white/10" />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[2/3] animate-pulse rounded-2xl bg-white/10"
            />
          ))}
        </div>
      </div>
    </main>
  );
}