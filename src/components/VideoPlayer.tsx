"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  slug: string;
  episode: number;
  videoUrl: string;
  nextEpisodeNumber?: number;
}

// Điền mã API Key của bạn vào đây (hoặc đưa vào biến môi trường NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY)
const GOOGLE_DRIVE_API_KEY = "AIzaSyCE1PLfcBWw2glAGYD9QCFUcukCXlvPbSY";

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

  // Kiểm tra xem có phải link Google Drive (hoặc link googleapis) không
  const isGoogleDriveVideo = (url: string) => {
    if (!url) return false;
    return url.includes("drive.google.com") || url.includes("googleapis.com/drive/v3/files/");
  };

  // Tự động chuyển link Google Drive thường sang link luồng trực tiếp của Drive API v3
  const getDirectDriveStreamUrl = (url: string) => {
    if (!url) return "";

    // Nếu đã là link googleapis.com/drive/v3/files/ thì giữ nguyên
    if (url.includes("googleapis.com/drive/v3/files/")) {
      return url;
    }

    // Tách mã ID từ link dạng /file/d/{ID}/view hoặc /preview
    const matchPath = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (matchPath && matchPath[1]) {
      return `https://www.googleapis.com/drive/v3/files/${matchPath[1]}?alt=media&key=${GOOGLE_DRIVE_API_KEY}`;
    }

    // Tách mã ID từ link dạng ?id={ID}
    const matchParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchParam && matchParam[1]) {
      return `https://www.googleapis.com/drive/v3/files/${matchParam[1]}?alt=media&key=${GOOGLE_DRIVE_API_KEY}`;
    }

    return url;
  };

  // Xử lý các link nhúng bên thứ 3 khác (nếu có dùng xen kẽ)
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
        /* Trình phát HTML5 Video gốc: Không quảng cáo, chuẩn giao diện Mobile & PC */
        <video
          key={videoUrl}
          src={getDirectDriveStreamUrl(videoUrl)}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload"
          className="absolute top-0 left-0 w-full h-full object-contain bg-black outline-none"
        >
          Trình duyệt của bạn không hỗ trợ phát video này.
        </video>
      ) : (
        /* Dự phòng Iframe cho các nguồn bên ngoài khác */
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
