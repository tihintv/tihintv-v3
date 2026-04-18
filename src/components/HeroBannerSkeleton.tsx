export default function HeroBannerSkeleton() {
  return (
    <section className="animate-pulse overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <div className="relative aspect-[16/7] w-full bg-white/10">
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
          <div className="mb-4 h-10 w-2/3 rounded bg-white/10" />
          <div className="mb-2 h-4 w-1/2 rounded bg-white/10" />
          <div className="mb-6 h-4 w-1/3 rounded bg-white/10" />

          <div className="flex gap-3">
            <div className="h-11 w-32 rounded-xl bg-white/10" />
            <div className="h-11 w-36 rounded-xl bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}