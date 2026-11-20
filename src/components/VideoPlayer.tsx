"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPreviewUrl } from "@/lib/formatPreviewUrl";

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

  return (
    // Khung 16:9 duy nhất, co giãn theo màn hình.
    // KHÔNG dùng paddingBottom 56.25% ở đây nữa và KHÔNG bọc thêm
    // một khung aspect-video nào ở ngoài nữa — bọc 2 lớp là nguyên
    // nhân khung bị hụt / méo trên điện thoại.
    // Link vẫn giữ dạng /preview của Drive (xem formatPreviewUrl):
    // KHÔNG đổi sang uc?export=download, file >100MB sẽ bị Google
    // chặn bằng trang cảnh báo virus-scan và <video> sẽ đen.
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl">
      <iframe
        src={formatPreviewUrl(videoUrl)}
        className="absolute top-0 left-0 block h-full w-full border-0 outline-none"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title={`Tập ${episode}`}
      />

      {showAutoNext && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6 text-center shadow-2xl">
            <h2 className="mb-2 text-lg font-semibold text-white">
              Tập tiếp theo sẽ phát sau {countdown}s
            </h2>

            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() =>
                  router.push(`/watch/${slug}/${nextEpisodeNumber}`)
                }
                className="rounded-xl bg-red-500 px-5 py-2 font-semibold text-white transition hover:bg-red-400"
              >
                ▶ Xem ngay
              </button>

              <button
                onClick={() => setShowAutoNext(false)}
                className="rounded-xl bg-white/10 px-5 py-2 font-semibold text-white transition hover:bg-white/20"
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
