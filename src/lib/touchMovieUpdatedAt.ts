import { supabase } from "./supabaseClient";

// Đẩy một phim lên đầu mục "Mới cập nhật" bằng cách cập nhật
// updated_at của phim đó thành thời điểm hiện tại.
//
// LÝ DO CẦN HÀM NÀY: mục "Mới cập nhật" trên trang chủ xếp phim
// theo updated_at. Khi thêm/sửa/xóa tập phim, trước đây code chỉ
// thay đổi bảng episodes mà KHÔNG chạm vào bảng movies, nên phim
// đó vẫn nằm ở vị trí cũ (thường ngoài top 10, tức là không nhìn
// thấy trên trang chủ vì mỗi mục chỉ hiện 2 hàng) dù Admin đã báo
// "Phim đã được đẩy lên Top!". Từ nay, mỗi lần tập phim thay đổi
// thì updated_at của phim cũng được cập nhật, phim sẽ nhảy lên
// đầu mục "Mới cập nhật" ngay sau khi trang chủ làm mới.
//
// Hàm này không bao giờ throw: nếu cập nhật updated_at lỗi thì
// chỉ ghi log, tập phim đã lưu vẫn giữ nguyên (không báo lỗi giả
// khiến người dùng tưởng là chưa lưu được tập).
export async function touchMovieUpdatedAt(
  movieSlug: string | null | undefined
): Promise<void> {
  if (!movieSlug) return;

  const { error } = await supabase
    .from("movies")
    .update({ updated_at: new Date().toISOString() })
    .eq("slug", movieSlug);

  if (error) {
    console.error("touchMovieUpdatedAt error:", error);
  }
}
