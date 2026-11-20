// Proxy stream video từ Google Drive (v3) — KHÔNG lộ khóa API ra client.
//
// Trình duyệt chỉ gọi /api/stream?fileId=... (cùng origin, không CORS).
// Route này chuyển tiếp yêu cầu sang Drive API với khóa ở biến môi
// trường phía máy chủ GOOGLE_DRIVE_API_KEY, rồi trả từng đoạn video
// về cho trình duyệt.
//
// QUAN TRỌNG — Range: trình phát <video> không tải cả file một lúc,
// nó xin từng đoạn nhỏ bằng header Range (ví dụ bytes=0-1048575).
// Route phải chuyển tiếp nguyên header Range sang upstream và trả về
// đúng status 206 + header Content-Range, nếu không sẽ không tua
// (seek) được và trình phát có thể tải lại từ đầu liên tục. Mỗi yêu
// cầu chỉ là một đoạn vài MB nên xong trong vài giây — không giữ
// function chạy suốt cả tập phim.
//
// fileId=demo: video mẫu công khai (Big Buck Bunny, Google sample
// bucket) để test trình phát mà không cần khóa API.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_UPSTREAM = "https://media.w3.org/2010/05/sintel/trailer.mp4";

function isValidFileId(fileId: string): boolean {
  return /^[A-Za-z0-9_-]{1,100}$/.test(fileId);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("fileId") || "";

  if (!isValidFileId(fileId)) {
    return Response.json(
      { error: "fileId không hợp lệ" },
      { status: 400 }
    );
  }

  let upstream: string;
  if (fileId === "demo") {
    upstream = DEMO_UPSTREAM;
  } else {
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
    if (!apiKey) {
      // Chưa cấu hình khóa: trình phát sẽ tự rơi về iframe /preview.
      return Response.json(
        { error: "Chưa cấu hình GOOGLE_DRIVE_API_KEY" },
        { status: 503 }
      );
    }
    upstream = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
  }

  const headers: Record<string, string> = {};
  const range = req.headers.get("range");
  if (range) headers["range"] = range;

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstream, { headers });
  } catch {
    return Response.json(
      { error: "Không kết nối được tới nguồn video" },
      { status: 502 }
    );
  }

  if (!upstreamRes.ok || !upstreamRes.body) {
    // 404/403 (khóa sai, Drive API chưa bật, khóa bị giới hạn,
    // file không công khai, sai ID...) — trả về lý do gốc của Google
    // (chỉ reason + message, đã ẩn số project) để chẩn đoán được
    // chính xác thay vì chỉ thấy status. Trình phát vẫn tự rơi về
    // iframe /preview khi gặp lỗi này.
    let reason = "unknown";
    let message = "";
    try {
      const text = await upstreamRes.text();
      const parsed = JSON.parse(text) as {
        error?: { message?: string; errors?: { reason?: string }[] };
      };
      reason = parsed.error?.errors?.[0]?.reason || "unknown";
      message = (parsed.error?.message || "").replace(/\b\d{6,}\b/g, "***");
    } catch {
      // Không đọc được body lỗi thì giữ nguyên status.
    }
    return Response.json(
      { error: "Google Drive từ chối yêu cầu", upstreamStatus: upstreamRes.status, reason, message },
      { status: upstreamRes.status }
    );
  }

  const outHeaders = new Headers();
  const contentType = upstreamRes.headers.get("content-type");
  const contentLength = upstreamRes.headers.get("content-length");
  const contentRange = upstreamRes.headers.get("content-range");
  const acceptRanges = upstreamRes.headers.get("accept-ranges");
  if (contentType) outHeaders.set("content-type", contentType);
  if (contentLength) outHeaders.set("content-length", contentLength);
  if (contentRange) outHeaders.set("content-range", contentRange);
  outHeaders.set("accept-ranges", acceptRanges || "bytes");
  outHeaders.set("cache-control", "private, max-age=0, no-store");

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: outHeaders,
  });
}
