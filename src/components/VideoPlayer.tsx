"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  slug: string;
  episode: number;
  videoUrl: string;
  nextEpisodeNumber?: number;
}

// Thay đường dẫn Cloudflare Worker của em vào đây
const CLOUDFLARE_WORKER_URL = "https://tihintv-stream.ten-cua-em.workers.dev";

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

  // Kiểm tra xem có phải link Google Drive không
  const isGoogleDriveVideo = (url: string) => {
    if (!url) return false;
    return (
      url.includes("drive.google.com") ||
      url.includes("googleapis.com/drive/v3/files/")
    );
  };

  // Tách ID từ link Google Drive và chuyển qua luồng Cloudflare Worker
  const getWorkerStreamUrl = (url: string) => {
    if (!url) return "";

    // Tách ID từ link googleapis.com/drive/v3/files/{ID}
    const matchApi = url.match(/\/files\/([a-zA-Z0-9_-]+)/);
    if (matchApi && matchApi[1]) {
      return `${CLOUDFLARE_WORKER_URL}?id=${matchApi[1]}`;
    }

    // Tách ID từ link dạng /file/d/{ID}/view hoặc /preview
    const matchPath = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (matchPath && matchPath[1]) {
      return `${CLOUDFLARE_WORKER_URL}?id=${matchPath[1]}`;
    }

    // Tách ID từ link dạng ?id={ID}
    const matchParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchParam && matchParam[1]) {
      return `${CLOUDFLARE_WORKER_URL}?id=${matchParam[1]}`;
    }

    return url;
  };

  // Xử lý các link nhúng bên thứ 3 khác (nếu có)
  const formatEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("streamtape.com/v/")) {
      return url.replace("streamtape.com/v/", "streamtape.com/e/");
    }
    return url;
  };

  return (
    <div className="relative w-full aspect-video bg-black overflow-hidden select-none touch-pan-y">
      {isGoogleDriveVideo(videoUrl) ? (
        <video
          key={videoUrl}
          src={getWorkerStreamUrl(videoUrl)}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload"
          crossOrigin="anonymous"
          className="absolute top-0 left-0 w-full h-full object-contain bg-black outline-none"
        >
          Trình duyệt của bạn không hỗ trợ phát video này.
        </video>
      ) : (
        <iframe
          src={formatEmbedUrl(videoUrl)}
          className="absolute top-0 left-0 w-full h-full border-0 outline-none"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}

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
