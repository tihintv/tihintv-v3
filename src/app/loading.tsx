import HeroBannerSkeleton from "@/components/HeroBannerSkeleton";
import SectionGridSkeleton from "@/components/SectionGridSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6 md:px-6 md:py-8">
        <HeroBannerSkeleton />

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5">
          <div className="flex flex-col gap-3">
            <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-72 animate-pulse rounded bg-white/10" />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="md:col-span-2 xl:col-span-2">
              <div className="h-12 w-full animate-pulse rounded-2xl bg-white/10" />
            </div>

            <div className="h-12 w-full animate-pulse rounded-2xl bg-white/10" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-white/10" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-white/10" />
          </div>
        </section>

        <SectionGridSkeleton title="Mới cập nhật" />
        <SectionGridSkeleton title="Phim bộ" />
        <SectionGridSkeleton title="Phim lẻ" />
      </div>
    </main>
  );
}