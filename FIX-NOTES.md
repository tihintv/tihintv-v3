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


---

# Bản v3.2 — giới hạn mỗi đoạn stream 8MB (chỉ đổi route stream)

## Vấn đề (người dùng test kỹ và báo lại 00:17)
- Lúc đầu trình phát riêng CÓ chạy, nhưng web rất LAG, video tải
  rất chậm; sau 1-2 lần refresh thì trang quay lại khung Drive cũ.
- Nguyên nhân: trình phát <video> xin cả file 1.6GB trong MỘT yêu
  cầu (Range: bytes=0-), route phải giữ function chạy suốt để
  truyền hết file, Vercel cắt function giữa chừng vì quá giới hạn
  thời gian chạy, video nhận lỗi rồi tự rơi về iframe /preview.
  Đó cũng là lý do video tải chậm: dữ liệu đi vòng qua Vercel mà
  còn bị cắt giữa chừng rồi tải lại.

## Đã đổi (v3.2, chỉ 1 file)
- `src/app/api/stream/route.ts`: mỗi yêu cầu chỉ lấy tối đa 8MB.
  Yêu cầu không giới hạn (bytes=0-) hay dài hơn 8MB đều được viết
  lại thành đoạn 8MB, trả về 206 + Content-Range đúng đoạn đó;
  trình phát hết đoạn này thì tự xin đoạn tiếp theo. Không đổi
  khóa API, không cần cấu hình thêm gì trên Vercel.


---

# Bản v4 — sửa lỗi build thất bại + tối ưu tốc độ tải trang (21/11)

## 1. Lỗi build: 4 lần deploy liên tiếp thất bại trên Vercel

### Nguyên nhân (đã kiểm chứng bằng `tsc` trên code GitHub hiện tại)
Khi quay lại v2, file `VideoPlayer.tsx` được thay bằng bản v2
(không còn prop `title`), nhưng trang test trình phát riêng
`src/app/test-player/page.tsx` (còn sót lại từ v3) vẫn truyền
prop `title` vào VideoPlayer:

```
src/app/test-player/page.tsx(30,11): error TS2322:
Property 'title' does not exist on type 'IntrinsicAttributes & Props'.
```

`next build` kiểm tra TypeScript nên Vercel build thất bại cả 4
lần "Add files via upload" (21:24-21:33). Hai lần deploy xóa
thư mục `src/app/api` trước đó vẫn thành công vì lúc đó
VideoPlayer còn là bản v3 (có prop `title`).

### Đã sửa
- Xóa `src/app/test-player/page.tsx` (trang test của v3, không
  còn dùng được vì route `/api/stream` đã bị xóa).
- Xóa `src/lib/driveStream.ts` (code phụ của v3, không còn file
  nào import nó).
- Kiểm chứng: `tsc --noEmit` PASS, `npm run build` PASS trên máy
  test (build hoàn tất, đủ 8 route; lỗi TLS trong log build chỉ
  là Supabase giả lập không truy cập được, code đã bắt lỗi và
  trả về danh sách rỗng — trên Vercel dùng khóa thật nên không
  gặp lỗi này).

## 2. Mục "Tập mới cập nhật" trên trang chủ luôn trống

### Nguyên nhân
`src/lib/getLatestEpisodes.ts` join bảng `movies (title, poster)`
nhưng Supabase không có khóa ngoại giữa `episodes.movie_slug` và
`movies.slug` nên câu query luôn lỗi, thử lại 1 lần rồi trả về []
→ mục này không bao giờ hiện (trang chủ chỉ còn mục
"Mới cập nhật" lấy từ danh sách phim).

### Đã sửa
- Bỏ join `movies`: lấy 12 tập mới nhất từ bảng `episodes`
  trước, rồi lấy tên + poster phim bằng 1 câu query riêng theo
  slug (`.in("slug", slugs)`). Kiểu dữ liệu trả về giữ nguyên,
  trang hiển thị không đổi.

## 3. Tối ưu tốc độ tải trang chủ

- `src/components/HeroBanner.tsx`: ảnh nền slide trước đây là
  CSS `background-image` tải nguyên file gốc (2000-3000px,
  ~400KB/ảnh, cả 5 slide đều tải ngay). Đổi sang `next/image`
  (`fill`, slide đầu `priority`, `sizes="100vw"`): ảnh được nén
  đúng cỡ khung hiển thị.
- `src/components/LatestEpisodesSection.tsx`: thumbnail tập mới
  trước đây là thẻ `<img>` thường, tải nguyên file poster gốc.
  Đổi sang `next/image` (`fill`, `sizes` theo lưới): chỉ tải
  đúng cỡ cần hiển thị.
- `src/components/MovieCard.tsx`: đã có `sizes` đúng từ trước
  nên không đổi (trình duyệt đã tự chọn cỡ ảnh phù hợp, không
  phải tải bản 3840px).
- Poster phim "Đám Cưới Đom Đóm - Firefly Wedding"
  (`public/images/firefly-wedding.jpg`, 443KB, JPEG 2000x3000)
  đã có trong repo (bạn upload lên GitHub 21:33) nên sau lần
  deploy thành công này ảnh sẽ hiện lại. Phim này vẫn chưa có
  tập nào trong database — cần thêm tập 1 qua Admin Episode Form
  thì nút "Xem ngay" mới hết 404.

## Lưu ý khác
- Thư mục `public/images/` hiện có 116 ảnh, tổng ~53MB — không
  ảnh hưởng tốc độ tải trang nhưng làm mỗi lần clone/deploy phải
  tải 53MB. Về lâu dài có thể chuyển poster sang host ảnh riêng,
  hiện tại cứ để nguyên.
- Route `/api/stream` và trang `/test-player` của v3 đã được dọn
  sạch; biến `GOOGLE_DRIVE_API_KEY` trên Vercel không còn dùng
  nữa, muốn thì xóa.
