import HomeClient from "@/components/HomeClient";
import { getMoviesWithEpisodeMeta } from "@/lib/getMoviesWithEpisodeMeta";

// Trang chủ là trang tĩnh: nếu không đặt revalidate thì Vercel giữ
// nguyên bản đã build, tập/phim mới thêm ở Admin sẽ không hiện cho
// tới khi deploy lại. Đặt 60 giây để trang chủ tự làm mới tối đa
// mỗi 60 giây — lưới an toàn cho trường hợp API /api/revalidate
// (được gọi sau mỗi lần Admin lưu) gặp lỗi.
export const revalidate = 60;

export default async function HomePage() {
  const movies = await getMoviesWithEpisodeMeta();

  return <HomeClient movies={movies} />;
}
