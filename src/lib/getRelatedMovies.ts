type Movie = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  year: number;
  genres: string[];
  poster: string;
  banner: string;
  video_url?: string | null;
  featured?: boolean;
  updated_at?: string;
  content_type?: string;
  episode_count?: number;
  latest_episode_number?: number | null;
  total_episodes?: number | null;
};

function normalizeGenres(genres: unknown): string[] {
  if (Array.isArray(genres)) {
    return genres
      .map((item) => String(item).trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof genres === "string") {
    return genres
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
}

function calculateRelatedScore(targetMovie: Movie, candidateMovie: Movie): number {
  let score = 0;

  // Ưu tiên cùng loại nội dung
  if (targetMovie.content_type === candidateMovie.content_type) {
    score += 3;
  }

  // Ưu tiên trùng thể loại
  const targetGenres = normalizeGenres(targetMovie.genres);
  const candidateGenres = normalizeGenres(candidateMovie.genres);

  const matchedGenres = candidateGenres.filter((genre) =>
    targetGenres.includes(genre)
  ).length;

  score += matchedGenres * 2;

  // Ưu tiên năm gần nhau
  if (targetMovie.year && candidateMovie.year) {
    const diff = Math.abs(targetMovie.year - candidateMovie.year);

    if (diff === 0) {
      score += 2;
    } else if (diff <= 2) {
      score += 1.5;
    } else if (diff <= 5) {
      score += 1;
    }
  }

  // Ưu tiên nhẹ phim nổi bật
  if (candidateMovie.featured) {
    score += 0.5;
  }

  return score;
}

export function getRelatedMovies(
  targetMovie: Movie,
  allMovies: Movie[],
  limit = 6
): Movie[] {
  const scoredMovies = allMovies
    .filter((movie) => movie.slug !== targetMovie.slug)
    .map((movie) => ({
      movie,
      score: calculateRelatedScore(targetMovie, movie),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      // sort theo điểm trước
      if (b.score !== a.score) return b.score - a.score;

      // nếu bằng điểm thì ưu tiên mới cập nhật hơn
      const aTime = a.movie.updated_at ? new Date(a.movie.updated_at).getTime() : 0;
      const bTime = b.movie.updated_at ? new Date(b.movie.updated_at).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit)
    .map((item) => item.movie);

  return scoredMovies;
}