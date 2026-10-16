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

  // Chuẩn hóa link Google Drive sang dạng /preview để phát mượt mà ổn định nhất
  const formatPreviewUrl = (url: string) => {
    if (!url) return "";
    
    // Xử lý nếu là link streamtape (nếu có dùng lót dạ)
    if (url.includes("streamtape.com/v/")) {
      return url.replace("streamtape.com/v/", "streamtape.com/e/");
    }

    if (url.includes("drive.google.com")) {
      if (url.includes("/view")) {
        return url.replace("/view", "/preview");
      }
      const match = url.match(/\/d\/([^/]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    
    // Nếu là link worker cũ thì bóc lại ID Google Drive để về /preview chính chủ
    const matchWorker = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchWorker && matchWorker[1]) {
      return `https://drive.google.com/file/d/${matchWorker[1]}/preview`;
    }

    return url;
  };

  return (
    <div className="relative w-full aspect-video bg-black overflow-hidden rounded-xl shadow-lg select-none touch-pan-y">
      {/* Iframe Google Drive chuẩn chỉnh: Tự động co giãn 16:9, không lộ viền thừa trên mobile */}
      <iframe
        src={formatPreviewUrl(videoUrl)}
        className="absolute top-0 left-0 w-full h-full border-0 outline-none"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
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
