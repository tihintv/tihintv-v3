export type Movie = {
  id: string;
  slug: string;
  title: string;
  description: string;
  year: number;
  genres: string[];
  poster: string;
  banner: string;
  videoUrl: string;
  featured?: boolean;
  updatedAt: string;
  episodes?: {
    id: string;
    title: string;
    videoUrl: string;
  }[];
};

export const movies: Movie[] = [
  {
    id: "1",
    slug: "cosmic-princess-kaguya",
    title: "Công chúa vũ trụ! - Cosmic Princess Kaguya!",
    description: "Trong thế giới ảo Tsukuyomi, hy vọng và trí tưởng tượng đan xen vào nhau. Iroha, một nữ sinh trung học 17 tuổi ở Tokyo, chia sẻ cuộc sống hàng ngày của mình giữa việc học, làm việc và thời gian dành cho không gian kỹ thuật số, nơi cô theo dõi streamer Yachiyo. Một buổi tối, cô phát hiện một em bé xuất hiện từ một cột đèn. Đứa trẻ lớn lên nhanh chóng đến tuổi của cô, tiết lộ một danh tính lấy cảm hứng từ công chúa Kaguya.Kaguya mơ ước trở thành streamer và ca sĩ trong Tsukuyomi. Iroha trở thành nhà sản xuất và nhạc sĩ mặc dù bị đe dọa bởi những thực thể bí ẩn sẵn sàng đưa cô gái trở lại mặt trăng. Hành trình của họ khám phá một phiên bản tương lai của câu chuyện, được thể hiện qua âm nhạc và mối quan hệ dựa trên sự sáng tạo và khám phá bản thân.",
    year: 2026,
    genres: ["Viễn Tưởng", "Khoa Học"],
    poster: "/images/Cosmic-Princess-Kaguya.jpg",
    banner: "/images/Cosmic-Princess-Kaguya.jpg",
    videoUrl: "https://drive.google.com/file/d/1TXrCivkCBKRwbKXrcbl6EdWHNzqtiMlf/preview",
    featured: true,
    updatedAt: "2026-03-11",
  },
  {
    id: "2",
    slug: "100-meters",
    title: "100 Mét - 100 METERS",
    description: "Một tài năng chạy nước rút chỉ dẫn cậu bạn học đầy quyết tâm nhưng thiếu kỹ năng, không hay biết rằng anh đang tạo ra một đối thủ sẽ thách thức mình trên đường chạy nhiều năm tới.",
    year: 2025,
    genres: ["Chính Kịch", "Học đường"],
    poster: "/images/100-meters.jpg",
    banner: "/images/100-meters.jpg",
    videoUrl: "https://drive.google.com/file/d/1DjAOUw3n6dgOKSubetVnM_KYoWm91V6-/preview",
    updatedAt: "2026-03-10",
  },
];

export const featuredMovie = movies.find((movie) => movie.featured) ?? movies[0];