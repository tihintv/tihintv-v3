export default function MovieCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="aspect-[2/3] w-full bg-white/10" />

      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 rounded bg-white/10" />
        <div className="h-4 w-1/2 rounded bg-white/10" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-white/10" />
          <div className="h-6 w-20 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}