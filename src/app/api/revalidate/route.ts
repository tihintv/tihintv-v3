import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// LỖI CŨ (khiến tập mới thêm ở Admin không hiện lên web):
// - Admin gọi API này bằng POST (xem src/lib/revalidateSiteData.ts),
//   nhưng route này trước đây CHỈ có GET nên POST luôn trả về 405
//   và việc làm mới cache không bao giờ chạy.
// - Dù có gọi được thì nó cũng chỉ revalidateTag("movies"/"episodes")
//   mà không có chỗ nào dùng 2 tag đó, nên trang chủ (trang tĩnh)
//   vẫn giữ bản cũ trong cache. Trang chủ đang được Vercel cache
//   (X-Vercel-Cache: HIT, Age hàng chục nghìn giây) nên tập mới
//   thêm vào không bao giờ hiện cho tới khi deploy lại.
//
// SỬA: cả GET và POST đều làm mới thật sự:
// - revalidatePath("/") và "/movies" để trang chủ + trang danh sách
//   phim được tạo lại từ dữ liệu mới ngay lần truy cập tiếp theo.
// - Giữ lại revalidateTag để phòng khi sau này có dùng tag.
// - Trang chủ có thêm `export const revalidate = 60` (xem
//   src/app/page.tsx) làm lưới an toàn: dù API này có lỗi thì
//   trang chủ vẫn tự làm mới tối đa mỗi 60 giây.
function doRevalidate(target: string) {
  if (target === "movies" || target === "all") {
    revalidateTag("movies", "max");
  }

  if (target === "episodes" || target === "all") {
    revalidateTag("episodes", "max");
  }

  // Trang danh sách là trang tĩnh nên phải làm mới đường dẫn.
  // Trang chi tiết phim (/movie/[slug]) và trang xem (/watch/...)
  // là trang động nên luôn lấy dữ liệu mới, không cần làm mới.
  revalidatePath("/", "page");
  revalidatePath("/movies", "page");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target") || "all";

  doRevalidate(target);

  return NextResponse.json({
    revalidated: true,
    target: target,
    now: Date.now(),
  });
}

export async function POST(request: Request) {
  let target = "all";
  try {
    const body = await request.json();
    if (typeof body?.target === "string") {
      target = body.target;
    }
  } catch {
    // Không đọc được body thì mặc định làm mới tất cả.
  }

  doRevalidate(target);

  return NextResponse.json({
    revalidated: true,
    target: target,
    now: Date.now(),
  });
}
