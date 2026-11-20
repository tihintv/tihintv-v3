# TiHinTV v3 — đã sửa player (20/11/2026)

## Lỗi đã sửa
- Khung phim bị hụt / méo trên điện thoại, nút trong player nhảy lung tung.
- Phim lẻ dùng thẳng `movie.video_url` nên link `/view`, `uc` hay `?id=` không
  được chuẩn hoá về `/preview`, Drive hiện nguyên trang web trong khung 16:9.

## Đã đổi (3 file sửa + 1 file mới)
1. `src/components/VideoPlayer.tsx` — khung 16:9 duy nhất bằng
   `aspect-video`, bỏ kiểu `paddingBottom: 56.25%` cũ, bỏ `select-none
   touch-pan-y` trên khung player. Iframe thêm
   `encrypted-media`, `title`, `border-0`.
2. `src/app/watch/[slug]/[episode]/page.tsx` — bỏ khung `aspect-video`
   bọc ngoài VideoPlayer. Trước đây bọc 2 lớp 16:9 lồng nhau, đó là
   nguyên nhân khung bị hụt trên điện thoại. Giờ chỉ còn 1 lớp, nằm
   trong chính VideoPlayer.
3. `src/app/watch/[slug]/page.tsx` (phim lẻ) — dùng chung
   `formatPreviewUrl()` như VideoPlayer, khung 16:9 giữ nguyên.
4. `src/lib/formatPreviewUrl.ts` (mới) — hàm chuẩn hoá link về
   `/preview`, dùng chung cho cả phim bộ và phim lẻ. Đã có sẵn logic
   Streamtape `v/` -> `e/`.

## KHÔNG đổi — quan trọng
- Vẫn giữ link `/preview` của Drive, KHÔNG đổi sang
  `uc?export=download`. File phim thường >100MB, Google chặn uc bằng
  trang cảnh báo virus-scan ("too large for Google to scan for
  viruses"), thẻ `<video>` sẽ đen. Đã kiểm tra với Triage X ep10
  (1,6 GB) ngày 20/11/2026.
- Không dán Drive API key vào code web công khai.
- Admin vẫn dán link `/preview` như cũ, không cần nhập lại các tập cũ.

## Kiểm tra
- `npx tsc --noEmit`: pass, không lỗi.
- `npm run build`: biên dịch thành công (Compiled successfully),
  chỉ dừng ở bước thu thập dữ liệu trang vì thiếu biến môi trường
  Supabase (`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
  trên máy kiểm tra — các biến này đã có sẵn trên Vercel, không phải
  lỗi do bản sửa này.

## Cách đưa lên GitHub / Vercel
1. Giải nén file zip này, thay toàn bộ code cũ bằng code trong này
   (hoặc chỉ chép 4 file đã đổi ở trên vào repo).
2. Commit + push lên nhánh `main` trên GitHub.
3. Vercel tự deploy lại `tihintv-v3.vercel.app` trong 1-2 phút.
4. Kiểm tra trên điện thoại bằng tập Triage X ep10: khung phải lấp
   đầy chiều ngang, không bị cắt 2 bên, bấm fullscreen được.


---

# Bản sửa v2 — khung cao hơn trên điện thoại (chưa gửi, chờ test A/B)

## Bằng chứng
- Mở thẳng link Drive /preview trên điện thoại (22:09): video + thanh
  tua + 2 hàng nút hiện đầy đủ, không bị cắt.
- Nhúng trong khung 16:9 trên điện thoại: nút bị tràn ra ngoài khung
  và bị overflow-hidden cắt mất (đã test trên iPhone XS, 11 Pro,
  17 Pro Max, POCO X3 Pro và F12 426x832).
- Máy tính vẫn đúng vì khung cao 623px, nút nhỏ nên vừa.

## Đã đổi (v2)
- `src/components/VideoPlayer.tsx` và `src/app/watch/[slug]/page.tsx`
  (phim lẻ): trên điện thoại (<640px) chiều cao khung =
  chiều cao video 16:9 + 200px, tối đa 460px; từ 640px trở lên vẫn
  `aspect-video` như cũ. Không đổi link, vẫn giữ /preview, không dùng uc.
- Trang test A/B: khung A đỏ 16:9 cũ vs khung B xanh cao hơn 200px,
  cùng file Triage X ep10 — cần người dùng mở trên điện thoại và xác
  nhận khung B hiện đủ nút trước khi coi v2 là xong.


---

# Bản v3 — trình phát riêng, nút tự ẩn (chưa gửi, chờ test)

## Vấn đề
- Bản v2 đã sửa được nút bị cắt trên điện thoại, nhưng nút của iframe
  Drive KHÔNG tự ẩn khi đang phát (kiểm chứng 22:34-22:36: để yên
  10-15 giây nút vẫn hiện nguyên; chạm giữa video chỉ tạm dừng).
  Nút là của Drive, code web không can thiệp được từ ngoài.

## Đã đổi (v3)
- `src/app/api/stream/route.ts` (mới): proxy stream video. Trình
  duyệt gọi /api/stream?fileId=... (cùng origin), route chuyển tiếp
  header Range sang Drive API (alt=media) với khóa ở biến môi trường
  phía máy chủ GOOGLE_DRIVE_API_KEY, trả về 206 + Content-Range để
  tua được. `fileId=demo` phát video mẫu Sintel trailer để test
  không cần khóa. Không dùng uc (file >100MB bị chặn virus-scan).
- `src/components/VideoPlayer.tsx` (viết lại): thẻ <video> + nút
  điều khiển của web — Play/Tạm dừng, tua ±10s, thanh tua (kéo/chạm
  để tua, hiện cả phần đã đệm), thời gian, âm lượng, tốc độ phát
  (0.5x-2x), toàn màn hình. Nút tự ẩn sau 3 giây khi đang phát,
  chạm/di chuột vào thì hiện lại; tạm dừng thì nút luôn hiện.
  Khung trở lại 16:9 trên mọi màn hình (nút nổi trên video).
  Stream lỗi (chưa có khóa, file chưa công khai...) thì tự rơi về
  iframe /preview như bản v2, web không bao giờ đen màn hình.
- `src/app/watch/[slug]/page.tsx` (phim lẻ): dùng chung VideoPlayer.
- `src/app/test-player/page.tsx` (mới): trang test trình phát bằng
  video mẫu, mở /test-player là xem được, không cần khóa API.
- `.env.example` (mới): hướng dẫn lấy khóa Drive API và dán vào
  Vercel (Settings > Environment Variables > GOOGLE_DRIVE_API_KEY),
  rồi Redeploy. Không commit khóa vào GitHub.

## Cách test
- Chưa có khóa: mở /test-player — phải phát được video mẫu, nút tự
  ẩn sau 3 giây, tua được. Phim thật sẽ rơi về iframe /preview.
- Có khóa: thêm GOOGLE_DRIVE_API_KEY trên Vercel, redeploy, mở một
  tập phim thật — phải phát bằng trình phát riêng, nút tự ẩn.


---

# Bản v3.1 — chẩn đoán lỗi 403 của Google (chỉ đổi route stream)

## Vấn đề
- Trang /test-player chạy tốt (demo 206), code v3 đã deploy, khóa
  GOOGLE_DRIVE_API_KEY đã có trên Vercel, nhưng tập phim thật vẫn
  rơi về iframe Drive cũ. Kiểm tra trực tiếp đường stream với file
  Triage X ep10: Google trả 403 Forbidden, rỗng — tức là khóa đã có
  trong môi trường nhưng Google từ chối. Nguyên nhân thường gặp:
  Drive API chưa bật trong project của khóa, khóa bị giới hạn chỉ
  cho API khác, khóa bị giới hạn theo app/referrer (ví dụ khóa tạo
  cho app Android), hoặc khóa sai.

## Đã đổi (v3.1, chỉ 1 file)
- `src/app/api/stream/route.ts`: khi upstream lỗi thì không trả về
  body rỗng nữa mà trả JSON gồm upstreamStatus + reason + message
  gốc của Google (đã ẩn số project dài) để đọc được lý do chính
  xác, ví dụ accessNotConfigured (chưa bật Drive API),
  ipRefererBlocked (khóa bị giới hạn referrer), keyInvalid (khóa
  sai), forbidden (file không có quyền). Trình phát vẫn tự rơi về
  iframe như trước khi stream lỗi.
