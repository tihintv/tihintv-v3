# TihinTV v3

TihinTV v3 là một website xem phim xây bằng **Next.js + Supabase**, hỗ trợ cả **phim lẻ** và **phim bộ nhiều tập**.

## Mục tiêu dự án

- Giao diện kiểu Netflix / web anime
- Quản lý phim bằng trang admin
- Lưu dữ liệu bằng Supabase
- Xem phim từ Google Drive preview URL
- Hỗ trợ phim bộ với nhiều tập
- Dễ mở rộng sang Android app sau này

---

## Công nghệ đang dùng

- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **Supabase**
- **Google Drive preview iframe**
- **Vercel** để deploy

---

## Chức năng hiện có

### Phần người xem
- Trang chủ
- Banner phim nổi bật
- Tìm kiếm phim
- Badge phim lẻ / phim bộ
- Hiển thị số tập hoặc tập mới nhất
- Trang tất cả phim
- Trang chi tiết phim
- Trang xem phim lẻ
- Trang xem từng tập phim bộ
- Nút tập trước / tập sau
- Khu vực tập mới cập nhật

### Phần admin
- Thêm phim
- Sửa phim
- Xóa phim
- Thêm tập
- Sửa tập
- Xóa tập
- Tìm kiếm phim trong admin

---

## Cấu trúc project

```text
tihintv-v3
├─ .env.local
├─ package.json
├─ public
│  └─ images
├─ src
│  ├─ app
│  │  ├─ admin
│  │  │  └─ page.tsx
│  │  ├─ movie
│  │  │  └─ [slug]
│  │  │     └─ page.tsx
│  │  ├─ movies
│  │  │  └─ page.tsx
│  │  ├─ watch
│  │  │  └─ [slug]
│  │  │     ├─ page.tsx
│  │  │     └─ [episode]
│  │  │        └─ page.tsx
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components
│  │  ├─ HeroBanner.tsx
│  │  ├─ HomeClient.tsx
│  │  ├─ LatestEpisodesSection.tsx
│  │  ├─ MovieCard.tsx
│  │  ├─ SectionGrid.tsx
│  │  ├─ SiteFooter.tsx
│  │  └─ SiteHeader.tsx
│  ├─ data
│  │  └─ movies.ts
│  ├─ hooks
│  │  └─ useAllMovies.ts
│  └─ lib
│     ├─ addEpisodeToSupabase.ts
│     ├─ addMovieToSupabase.ts
│     ├─ deleteEpisodeFromSupabase.ts
│     ├─ deleteMovieFromSupabase.ts
│     ├─ getEpisodes.ts
│     ├─ getLatestEpisodes.ts
│     ├─ getMovies.ts
│     ├─ getMoviesWithEpisodeCount.ts
│     ├─ getMoviesWithEpisodeMeta.ts
│     ├─ supabaseClient.ts
│     ├─ updateEpisodeInSupabase.ts
│     └─ updateMovieInSupabase.ts
└─ README.md
```

---

## Ý nghĩa từng phần

### `src/app`
Chứa các route chính của website.

- `page.tsx`: trang chủ
- `movies/page.tsx`: tất cả phim
- `movie/[slug]/page.tsx`: chi tiết phim
- `watch/[slug]/page.tsx`: xem phim lẻ hoặc chuyển sang tập 1 của phim bộ
- `watch/[slug]/[episode]/page.tsx`: xem từng tập phim bộ
- `admin/page.tsx`: trang quản trị

### `src/components`
Chứa các component giao diện dùng lại.

- `HeroBanner.tsx`: banner lớn đầu trang
- `MovieCard.tsx`: card phim
- `SectionGrid.tsx`: lưới phim theo section
- `HomeClient.tsx`: xử lý tìm kiếm và hiển thị section ở trang chủ
- `LatestEpisodesSection.tsx`: khu vực tập mới cập nhật
- `SiteHeader.tsx`: thanh điều hướng
- `SiteFooter.tsx`: footer

### `src/lib`
Chứa logic làm việc với Supabase và các helper.

#### Movies
- `getMovies.ts`: lấy danh sách phim
- `getMoviesWithEpisodeCount.ts`: lấy phim kèm số tập
- `getMoviesWithEpisodeMeta.ts`: lấy phim kèm metadata tập mới nhất
- `addMovieToSupabase.ts`: thêm phim
- `updateMovieInSupabase.ts`: sửa phim
- `deleteMovieFromSupabase.ts`: xóa phim

#### Episodes
- `getEpisodes.ts`: lấy danh sách tập theo phim
- `getLatestEpisodes.ts`: lấy các tập mới cập nhật
- `addEpisodeToSupabase.ts`: thêm tập
- `updateEpisodeInSupabase.ts`: sửa tập
- `deleteEpisodeFromSupabase.ts`: xóa tập

#### Supabase
- `supabaseClient.ts`: khởi tạo kết nối Supabase

---

## Database Supabase

Dự án đang dùng 2 bảng chính:

### `movies`
Các cột quan trọng:

- `slug`
- `title`
- `description`
- `year`
- `genres`
- `poster`
- `banner`
- `video_url`
- `featured`
- `updated_at`
- `content_type`

### `episodes`
Các cột quan trọng:

- `movie_slug`
- `episode_number`
- `title`
- `video_url`
- `created_at`

---

## Quy ước nội dung

### Phim lẻ
- `content_type = movie`
- dùng `video_url` trong bảng `movies`

### Phim bộ
- `content_type = series`
- không cần `video_url` ở `movies`
- mỗi tập lưu trong bảng `episodes`

---

## Quy ước slug

Slug nên viết theo kiểu:

- chữ thường
- không dấu
- dùng dấu `-`

Ví dụ đúng:

```text
naruto
dead-account
chainsaw-man-the-movie-chuong-reze
```

Không nên dùng:

```text
naruto tập 1
chainsaw-man-chương-rềze
```

---

## Biến môi trường

Tạo file `.env.local` ở thư mục gốc:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

---

## Cài đặt local

```bash
npm install
npm run dev
```

Mở:

```text
http://localhost:3000
```

---

## Deploy

Dự án có thể deploy lên:

- **Vercel** (khuyên dùng)
- hoặc nền tảng khác hỗ trợ Next.js

Quy trình cơ bản:

```bash
git add .
git commit -m "update project"
git push origin main
```

Vercel sẽ tự deploy lại nếu repo đã kết nối.

---

## Luồng hoạt động chính

### Người dùng
1. Vào trang chủ
2. Chọn phim
3. Nếu là phim lẻ → xem ngay
4. Nếu là phim bộ → vào trang chi tiết hoặc tập mới nhất
5. Chọn tập để xem

### Admin
1. Vào `/admin`
2. Thêm / sửa / xóa phim
3. Thêm / sửa / xóa tập
4. Dữ liệu lưu vào Supabase
5. Website đọc trực tiếp từ Supabase

---

## Việc nên làm tiếp

Các hướng nâng cấp tiếp theo:

- lưu lịch sử xem / tiếp tục xem
- tự động chuyển tập tiếp theo
- tìm kiếm tập trong admin
- upload ảnh bằng Supabase Storage
- phân quyền admin tốt hơn
- đóng gói Android app bằng Capacitor

---

## Ghi chú quan trọng

- Google Drive preview phù hợp để làm MVP / dự án cá nhân
- Với lượng người dùng lớn, nên cân nhắc storage / streaming tốt hơn
- Admin hiện tại cần tiếp tục bảo vệ tốt hơn nếu đưa lên public

---

## Tóm tắt

TihinTV v3 hiện đã là một **web phim hoàn chỉnh mức MVP mạnh**:

- có database thật
- có admin thật
- có phim lẻ
- có phim bộ nhiều tập
- có giao diện đẹp
- có thể tiếp tục nâng lên thành app Android

