import MovieCardSkeleton from "@/components/MovieCardSkeleton";

type Props = {
  title?: string;
  count?: number;
};

export default function SectionGridSkeleton({
  title = "Đang tải...",
  count = 8,
}: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}