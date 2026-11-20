import SiteHeader from "@/components/SiteHeader";
import VideoPlayer from "@/components/VideoPlayer";

// Trang test trình phát riêng (v3) — KHÔNG cần khóa Drive API.
// Phát video mẫu Sintel trailer qua /api/stream?fileId=demo để kiểm
// tra: nút tự ẩn sau 3 giây khi đang phát, chạm vào hiện lại, tua
// được, đổi tốc độ, toàn màn hình. Muốn test phim thật thì thêm
// GOOGLE_DRIVE_API_KEY vào biến môi trường trên Vercel rồi mở trang
// xem phim bình thường.
export default function TestPlayerPage() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">
          Test trình phát riêng
        </h1>
        <p className="mb-6 text-sm leading-6 text-white/60">
          Video mẫu Sintel trailer (không phải phim trong thư viện). Bấm
          Play rồi để yên 3 giây: thanh điều khiển phải tự ẩn đi; chạm
          hoặc di chuột vào video thì nó hiện lại. Kéo thanh tua để kiểm
          tra tua nhanh. Nếu trang này chạy tốt mà phim thật vẫn không
          chạy thì xem lại khóa Drive API trên Vercel.
        </p>

        <VideoPlayer
          slug="demo"
          episode={1}
          videoUrl="https://drive.google.com/file/d/demo/preview"
          title="Video mẫu — Sintel trailer"
        />
      </div>
    </main>
  );
}
