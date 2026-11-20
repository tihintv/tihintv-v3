// Trình phát riêng (v3): lấy video Drive qua đường dẫn trung gian
// /api/stream thay vì nhúng iframe /preview của Drive.
//
// Lý do: nút điều khiển của iframe Drive KHÔNG tự ẩn khi đang phát
// (đã kiểm chứng 22:34-22:36: để yên 10-15 giây nút vẫn hiện nguyên,
// chạm vào giữa video chỉ tạm dừng chứ không gọi/ẩn nút). Nút là của
// Drive, code web không can thiệp được từ ngoài (cross-origin).
// Với thẻ <video> + nút điều khiển của chính web thì web tự quyết
// được: phát thì ẩn sau 3 giây không chạm, chạm vào thì hiện lại.
//
// Cách lấy video: route /api/stream chuyển tiếp yêu cầu Range tới
// Google Drive API (files?alt=media), khóa API nằm ở biến môi trường
// phía máy chủ GOOGLE_DRIVE_API_KEY, KHÔNG nằm trong code public.
// Link uc?export=download KHÔNG dùng được: file >100MB bị Google chặn
// bằng trang cảnh báo virus-scan, thẻ <video> sẽ đen (đã kiểm chứng
// với Triage X ep10, 1.6GB).

// Lấy ID file Drive từ link /preview, /view, /d/[ID] hoặc ?id=.
// Trả về null nếu không phải link Drive.
export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed.includes("drive.google.com")) return null;

  const pathMatch = trimmed.match(/\/d\/([A-Za-z0-9_-]+)/);
  if (pathMatch && pathMatch[1]) return pathMatch[1];

  const queryMatch = trimmed.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (queryMatch && queryMatch[1]) return queryMatch[1];

  return null;
}

// URL stream qua proxy cùng origin (tránh CORS, giấu khóa API).
export function getDriveStreamUrl(fileId: string): string {
  return `/api/stream?fileId=${encodeURIComponent(fileId)}`;
}
