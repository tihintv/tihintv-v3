import SectionGridSkeleton from "@/components/SectionGridSkeleton";

export default function LoadingMoviesPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 h-10 w-48 animate-pulse rounded bg-white/10" />

        <section className="mb-6 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 animate-pulse rounded bg-white/10" />
            <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="h-11 animate-pulse rounded-xl bg-white/10" />
            <div className="h-11 animate-pulse rounded-xl bg-white/10" />
            <div className="h-11 animate-pulse rounded-xl bg-white/10" />
          </div>

          <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
        </section>

        <SectionGridSkeleton title="Đang tải danh sách phim..." />
      </div>
    </main>
  );
}