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
