import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-md shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-wide text-red-500 transition hover:text-red-400"
        >
          TihinTV
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-white/80">
          <Link href="/" className="transition hover:text-white">
            Trang chủ
          </Link>

          <Link href="/#moi-cap-nhat" className="transition hover:text-white">
            Mới cập nhật
          </Link>

          <Link href="/movies" className="transition hover:text-white">
            Tất cả phim
          </Link>
        </nav>
      </div>
    </header>
  );
}