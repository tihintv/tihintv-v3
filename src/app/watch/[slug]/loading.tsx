export default function LoadingWatchMoviePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-6 space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-9 w-72 animate-pulse rounded bg-white/10" />
        </div>

        <div className="animate-pulse overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
          <div className="aspect-video w-full bg-white/10" />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    </main>
  );
}