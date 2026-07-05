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

  // HACK CUỐI CÙNG: Biến link Drive thành link tải trực tiếp (Direct Download Link)
  // để thẻ <video> của điện thoại có thể đọc và phát mượt mà giao diện gốc
  const getDirectUrl = (url: string) => {
    if (url.includes("drive.google.com")) {
      const match = url.match(/\/d\/([^/]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    return url;
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden">
      {/* Thay <iframe> bướng bỉnh bằng thẻ <video> chuẩn native của điện thoại */}
      <video
        src={getDirectUrl(videoUrl)}
        controls
        playsInline
        className="w-full h-full object-contain outline-none"
      />

      {showAutoNext && (
        <div className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 shadow-2xl p-6 rounded-2xl text-center">
            <h2 className="text-white text-lg mb-2 font-semibold">
              Tập tiếp theo sẽ phát sau {countdown}s
            </h2>
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => router.push(`/watch/${slug}/${nextEpisodeNumber}`)}
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