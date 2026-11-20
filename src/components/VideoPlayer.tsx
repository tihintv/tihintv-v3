"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPreviewUrl } from "@/lib/formatPreviewUrl";
import { extractDriveFileId, getDriveStreamUrl } from "@/lib/driveStream";

interface Props {
  slug: string;
  episode: number;
  videoUrl: string;
  nextEpisodeNumber?: number;
  // Tên hiển thị cho phim lẻ (mặc định: "Tập ${episode}").
  title?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const SPEEDS = [1, 1.25, 1.5, 2, 0.5, 0.75];

export default function VideoPlayer({
  slug,
  episode,
  videoUrl,
  nextEpisodeNumber,
  title,
}: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fileId = extractDriveFileId(videoUrl);
  const label = title || `Tập ${episode}`;

  // "custom": thẻ <video> + nút của web (tự ẩn).
  // "iframe": nhúng /preview của Drive (dự phòng khi stream lỗi).
  const [mode, setMode] = useState<"custom" | "iframe">(
    fileId ? "custom" : "iframe"
  );
  const [streamFailed, setStreamFailed] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [showAutoNext, setShowAutoNext] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // Hiện nút rồi hẹn 3 giây sau ẩn — chỉ khi đang phát.
  const pokeControls = useCallback(() => {
    setShowControls(true);
    clearHideTimer();
    const video = videoRef.current;
    if (video && !video.paused) {
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [clearHideTimer]);

  useEffect(() => clearHideTimer, [clearHideTimer]);

  // Tự động chuyển tập sau 19 phút (giữ hành vi cũ).
  useEffect(() => {
    if (!nextEpisodeNumber) return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      if ((Date.now() - startTime) / 1000 > 60 * 19) {
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

  // Theo dõi trạng thái toàn màn hình để đổi icon.
  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  }, []);

  const seekBy = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.max(
      0,
      Math.min(video.duration, video.currentTime + delta)
    );
  }, []);

  const seekToRatio = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration)) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width)
      );
      video.currentTime = ratio * video.duration;
      pokeControls();
    },
    [pokeControls]
  );

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void container.requestFullscreen();
    }
  }, []);

  const cycleSpeed = useCallback(() => {
    const video = videoRef.current;
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
    if (video) video.playbackRate = next;
  }, [speed]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (mode !== "custom") return;
    if (e.key === " " || e.key.toLowerCase() === "k") {
      e.preventDefault();
      togglePlay();
      pokeControls();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      seekBy(10);
      pokeControls();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      seekBy(-10);
      pokeControls();
    } else if (e.key.toLowerCase() === "f") {
      toggleFullscreen();
    } else if (e.key.toLowerCase() === "m") {
      setMuted((m) => !m);
    }
  };

  // Stream lỗi (chưa có khóa API, file chưa công khai...) thì rơi về
  // iframe /preview như trước — web không bao giờ đen màn hình.
  // Riêng file demo thì không có bản Drive thật nên báo lỗi luôn.
  const handleVideoError = () => {
    setWaiting(false);
    if (fileId === "demo") {
      setStreamFailed(true);
      return;
    }
    setMode("iframe");
  };

  const playedRatio = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedRatio = duration > 0 ? (bufferedEnd / duration) * 100 : 0;
  const controlsVisible = showControls || !playing;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseMove={pokeControls}
      onTouchStart={pokeControls}
      className={
        mode === "custom"
          // Trình phát riêng: nút nổi TRÊN video nên khung chỉ cần 16:9,
          // không cần cộng thêm 200px như iframe Drive nữa.
          ? "relative w-full aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl outline-none select-none"
          // Iframe Drive (dự phòng): giữ khung cao hơn trên điện thoại
          // như bản v2, vì nút của Drive nằm DƯỚI video.
          : "relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl max-sm:h-[calc(100vw*9/16+200px)] max-sm:max-h-[460px] sm:aspect-video"
      }
    >
      {mode === "custom" && !streamFailed ? (
        <>
          <video
            ref={videoRef}
            src={getDriveStreamUrl(fileId || "")}
            className="absolute inset-0 block h-full w-full"
            preload="metadata"
            playsInline
            onClick={() => {
              togglePlay();
              pokeControls();
            }}
            onPlay={() => {
              setPlaying(true);
              pokeControls();
            }}
            onPause={() => {
              setPlaying(false);
              setShowControls(true);
              clearHideTimer();
            }}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              setCurrentTime(v.currentTime);
              try {
                if (v.buffered.length > 0) {
                  setBufferedEnd(v.buffered.end(v.buffered.length - 1));
                }
              } catch {
                // bỏ qua
              }
            }}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onWaiting={() => setWaiting(true)}
            onPlaying={() => setWaiting(false)}
            onCanPlay={() => setWaiting(false)}
            onEnded={() => {
              setPlaying(false);
              setShowControls(true);
              if (nextEpisodeNumber) setShowAutoNext(true);
            }}
            onError={handleVideoError}
            onVolumeChange={(e) => {
              setVolume(e.currentTarget.volume);
              setMuted(e.currentTarget.muted);
            }}
          />

          {/* Vòng xoay khi đang tải/đệm */}
          {waiting && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            </div>
          )}

          {/* Nút Play lớn ở giữa khi đang tạm dừng */}
          {!playing && !waiting && (
            <button
              aria-label="Phát"
              onClick={() => {
                togglePlay();
                pokeControls();
              }}
              className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/20"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-3xl text-white backdrop-blur-sm transition hover:bg-red-500">
                ▶
              </span>
            </button>
          )}

          {/* Thanh điều khiển: tự ẩn sau 3 giây khi đang phát,
              chạm/di chuột vào thì hiện lại. */}
          <div
            className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pt-8 pb-2 transition-opacity duration-300 sm:px-4 ${
              controlsVisible
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
            onMouseMove={pokeControls}
          >
            {/* Thanh tua */}
            <div
              role="slider"
              aria-label="Thanh tua"
              aria-valuemin={0}
              aria-valuemax={Math.floor(duration)}
              aria-valuenow={Math.floor(currentTime)}
              tabIndex={0}
              className="group relative h-5 cursor-pointer"
              onClick={seekToRatio}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") seekBy(10);
                if (e.key === "ArrowLeft") seekBy(-10);
              }}
            >
              <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 overflow-hidden rounded-full bg-white/30">
                <div
                  className="absolute top-0 left-0 h-full bg-white/50"
                  style={{ width: `${bufferedRatio}%` }}
                />
                <div
                  className="absolute top-0 left-0 h-full bg-red-500"
                  style={{ width: `${playedRatio}%` }}
                />
              </div>
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow"
                style={{ left: `${playedRatio}%` }}
              />
            </div>

            {/* Hàng nút */}
            <div className="flex items-center gap-1 text-white sm:gap-2">
              <button
                aria-label={playing ? "Tạm dừng" : "Phát"}
                onClick={() => {
                  togglePlay();
                  pokeControls();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-white/20"
              >
                {playing ? "❚❚" : "▶"}
              </button>

              <button
                aria-label="Tua lại 10 giây"
                onClick={() => {
                  seekBy(-10);
                  pokeControls();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition hover:bg-white/20"
              >
                ↺10
              </button>

              <button
                aria-label="Tua nhanh 10 giây"
                onClick={() => {
                  seekBy(10);
                  pokeControls();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition hover:bg-white/20"
              >
                10↻
              </button>

              <span className="ml-1 text-xs font-medium whitespace-nowrap text-white/90 sm:text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <span className="flex-1" />

              <button
                aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  v.muted = !v.muted;
                  pokeControls();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-white/20"
              >
                {muted || volume === 0 ? "🔇" : "🔊"}
              </button>

              <input
                aria-label="Âm lượng"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = videoRef.current;
                  const val = Number(e.target.value);
                  setVolume(val);
                  setMuted(val === 0);
                  if (v) {
                    v.volume = val;
                    v.muted = val === 0;
                  }
                }}
                className="hidden w-20 accent-red-500 sm:block"
              />

              <button
                aria-label="Tốc độ phát"
                onClick={() => {
                  cycleSpeed();
                  pokeControls();
                }}
                className="flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-xs font-bold transition hover:bg-white/20 sm:text-sm"
              >
                {speed}x
              </button>

              <button
                aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                onClick={() => {
                  toggleFullscreen();
                  pokeControls();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-white/20"
              >
                {isFullscreen ? "⤢" : "⛶"}
              </button>
            </div>
          </div>
        </>
      ) : mode === "iframe" ? (
        <iframe
          src={formatPreviewUrl(videoUrl)}
          className="absolute top-0 left-0 block h-full w-full border-0 outline-none"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title={label}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/80">
          Không tải được video mẫu. Kiểm tra mạng rồi tải lại trang.
        </div>
      )}

      {showAutoNext && nextEpisodeNumber && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
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
