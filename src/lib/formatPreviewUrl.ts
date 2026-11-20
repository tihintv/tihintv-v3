// Chuẩn hoá link video về dạng nhúng /preview của Google Drive.
// GIỮ NGUYÊN link /preview — KHÔNG đổi sang uc?export=download.
// Lý do: file phim thường >100MB, Google chặn uc bằng trang cảnh báo
// virus-scan ("too large for Google to scan for viruses"), thẻ <video>
// không phát được trang đó nên sẽ đen. Link /preview vẫn là cách đúng
// cho file lớn, admin cứ dán link /preview như cũ.
export function formatPreviewUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();

  if (trimmed.includes("streamtape.com/v/")) {
    return trimmed.replace("streamtape.com/v/", "streamtape.com/e/");
  }

  if (trimmed.includes("drive.google.com")) {
    if (trimmed.includes("/preview")) return trimmed;
    if (trimmed.includes("/view")) {
      return trimmed.replace("/view", "/preview");
    }
    const match = trimmed.match(/\/d\/([^/?#]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  const matchWorker = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchWorker && matchWorker[1]) {
    return `https://drive.google.com/file/d/${matchWorker[1]}/preview`;
  }

  return trimmed;
}
