import Link from "next/link";
import MovieCard from "@/components/MovieCard";

type Movie = {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  year?: number;
  genres?: string[];
  poster: string;
  banner?: string;
  featured?: boolean;
  updated_at?: string;
  content_type?: string;
  episode_count?: number;
  latest_episode_number?: number | null;
  total_episodes?: number | null;
};

type Props = {
  id: string;
  title: string;
  movies: Movie[];
  // compact = true: chỉ hiển thị 2 hàng (tối đa 10 phim, trên màn
  // hình lớn là 2 hàng x 5 cột; màn hình nhỏ hơn thì ẩn bớt thẻ
  // bằng CSS để vẫn đúng 2 hàng: điện thoại 2 cột = 4 phim,
  // sm 3 cột = 6 phim, lg 4 cột = 8 phim). Dùng khi hiển thị
  // mặc định trên trang chủ để trang không quá dài. Khi người dùng
  // đang tìm kiếm/lọc thì không dùng compact để hiện đủ kết quả.
  compact?: boolean;
};

// Ẩn các thẻ vượt quá 2 hàng theo từng cỡ màn hình (khớp với số
// cột của lưới: 2 / 3 / 4 / 5 cột). Thẻ bị ẩn vẫn nằm trong DOM
// nhưng display:none nên trình duyệt không tải ảnh của nó.
const TWO_ROWS_CLASS =
  "[&>*:nth-child(n+5)]:hidden " +
  "sm:[&>*:nth-child(n+5)]:block sm:[&>*:nth-child(n+7)]:hidden " +
  "lg:[&>*:nth-child(n+7)]:block lg:[&>*:nth-child(n+9)]:hidden " +
  "xl:[&>*:nth-child(n+9)]:block xl:[&>*:nth-child(n+11)]:hidden";

export default function SectionGrid({ id, title, movies, compact }: Props) {
  const variant =
    id === "moi-cap-nhat"
      ? "latest"
      : id === "phim-bo"
      ? "series"
      : "default";

  // Khi compact chỉ lấy tối đa 10 phim (đủ 2 hàng ở màn hình lớn
  // nhất) để DOM gọn nhẹ; CSS ở trên sẽ ẩn bớt ở màn hình nhỏ.
  const visibleMovies = compact ? movies.slice(0, 10) : movies;

  return (
    <section id={id} className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-white md:text-3xl">{title}</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/50">{movies.length} phim</span>
          {compact && movies.length > 4 ? (
            <Link
              href="/movies"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Xem tất cả →
            </Link>
          ) : null}
        </div>
      </div>

      <div
        className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${
          compact ? TWO_ROWS_CLASS : ""
        }`}
      >
        {visibleMovies.map((movie) => (
          <MovieCard
            key={movie.slug}
            movie={movie}
            variant={variant}
          />
        ))}
      </div>
    </section>
  );
}
