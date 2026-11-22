// So sánh 2 phim theo thời gian cập nhật, mới nhất xếp trước.
//
// LỖI CŨ: code cũ viết `(a.updated_at || "") < (b.updated_at || "") ? 1 : -1`
// — khi 2 phim có cùng updated_at (phim cũ chưa có updated_at,
// hoặc nhiều phim được cập nhật cùng lúc) thì hàm trả về -1 thay
// vì 0, tức là vừa bảo "a trước b" vừa bảo "b trước a". Hàm so
// sánh như vậy vi phạm quy tắc của Array.sort nên thứ tự xếp ra
// là tùy tiện và KHÁC NHAU giữa các lần sort cùng một dữ liệu.
// Hậu quả thấy rõ trên trang chủ: mục "Mới cập nhật" (sort riêng)
// và mục "Phim bộ" / "Tất cả phim" (sort trong filteredMovies)
// hiện thứ tự khác nhau, có phim lúc hiện lúc mất khỏi top 10
// dù dữ liệu không đổi — người dùng tưởng là phim mới thêm
// không hiển thị.
//
// SỬA: trả về 0 khi bằng nhau, kèm tie-breaker theo slug để thứ
// tự luôn ổn định và giống nhau ở mọi mục, mọi lần tải trang.
// Phim chưa có updated_at (chuỗi rỗng) xếp cuối cùng.
export function compareUpdatedDesc(
  aUpdatedAt: string | null | undefined,
  bUpdatedAt: string | null | undefined,
  aSlug: string,
  bSlug: string
): number {
  const ua = aUpdatedAt || "";
  const ub = bUpdatedAt || "";
  if (ua < ub) return 1;
  if (ua > ub) return -1;
  return (aSlug || "").localeCompare(bSlug || "", "vi");
}
