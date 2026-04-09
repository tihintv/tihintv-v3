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
  }, [showAutoNext]);

  return (
    <div className="relative w-full aspect-video">
      <iframe
        src={videoUrl}
        className="w-full h-full"
        allow="autoplay; fullscreen"
        allowFullScreen
      />

      {showAutoNext && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-zinc-900 p-6 rounded-xl text-center">
            <h2 className="text-white text-lg mb-2">
              Tập tiếp theo sẽ phát sau {countdown}s
            </h2>

            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() =>
                  router.push(`/watch/${slug}/${nextEpisodeNumber}`)
                }
                className="bg-red-500 px-4 py-2 rounded text-white"
              >
                Xem ngay
              </button>

              <button
                onClick={() => setShowAutoNext(false)}
                className="bg-gray-600 px-4 py-2 rounded text-white"
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