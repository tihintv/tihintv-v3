"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  slug: string;
  episode: number;
  videoUrl: string;
  nextEpisodeNumber?: number;
}

export default function VideoPlayer({
  slug,
  episode,
  videoUrl,
  nextEpisodeNumber,
}: Props) {
  const router = useRouter();

  const [showAutoNext, setShowAutoNext] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!nextEpisodeNumber) return;

    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;

      // Giả lập video ~20 phút
      if (elapsed > 60 * 19) {
        setShowAutoNext(true);
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [nextEpisodeNumber]);

  useEffect(() => {
    if (!showAutoNext) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push(`/watch/${slug}/${nextEpisodeNumber}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showAutoNext, slug, nextEpisodeNumber, router]);

  return (
    <div className="relative w-full aspect-video bg-black overflow-hidden">
      {/* 🔥 ĐÂY LÀ PHÉP THUẬT:
        - Trên Mobile: Ép to 200% (w-[200%] h-[200%]) rồi thu nhỏ lại (scale-50) để hiện full nút.
        - Trên Máy tính/Tablet (md:): Trả lại 100% kích thước gốc vì màn đã đủ to.
      */}
      <iframe
        src={videoUrl}
        className="absolute top-0 left-0 w-[200%] h-[200%] origin-top-left scale-50 md:w-full md:h-full md:scale-100 border-0 outline-none"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />

      {showAutoNext && (
        <div className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 shadow-2xl p-6 rounded-2xl text-center">
            <h2 className="text-white text-lg mb-2 font-semibold">
              Tập tiếp theo sẽ phát sau {countdown}s
            </h2>

            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() =>
                  router.push(`/watch/${slug}/${nextEpisodeNumber}`)
                }
                className="bg-red-500 hover:bg-red-400 transition px-5 py-2 rounded-xl text-white font-semibold"
              >
                ▶ Xem ngay
              </button>

              <button
                onClick={() => setShowAutoNext(false)}
                className="bg-white/10 hover:bg-white/20 transition px-5 py-2 rounded-xl text-white font-semibold"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}