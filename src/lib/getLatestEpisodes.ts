import { unstable_cache } from "next/cache";
import { supabase } from "./supabaseClient";

export type LatestEpisode = {
  id?: string;
  movie_slug: string;
  episode_number: number;
  title: string;
  video_url: string;
  created_at?: string;
  movie_title?: string;
  movie_poster?: string;
};

function normalizeEpisode(
  row: any,
  movieInfo?: { title: string; poster: string }
): LatestEpisode {
  return {
    id: row.id,
    movie_slug: row.movie_slug ?? "",
    episode_number: Number(row.episode_number ?? 0),
    title: row.title ?? "",
    video_url: row.video_url ?? "",
    created_at: row.created_at ?? "",
    movie_title: movieInfo?.title ?? "",
    movie_poster: movieInfo?.poster ?? "",
  };
}

async function fetchLatestEpisodesOnce(): Promise<LatestEpisode[]> {
  // KHÔNG join bảng movies nữa: Supabase không có khóa ngoại giữa
  // episodes.movie_slug và movies.slug nên câu join cũ luôn lỗi
  // ("Could not find a relationship"), retry rồi trả về [] khiến
  // mục "Tập mới cập nhật" trên trang chủ luôn trống. Lấy tập trước,
  // rồi lấy tên + poster phim bằng 1 câu query riêng theo slug.
  const { data, error } = await supabase
    .from("episodes")
    .select(
      `
      id,
      movie_slug,
      episode_number,
      title,
      video_url,
      created_at
    `
    )
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const slugs = Array.from(
    new Set(rows.map((row: any) => row.movie_slug).filter(Boolean))
  );

  const movieMap = new Map<string, { title: string; poster: string }>();
  if (slugs.length > 0) {
    const { data: movies, error: moviesError } = await supabase
      .from("movies")
      .select("slug, title, poster")
      .in("slug", slugs);

    if (moviesError) {
      console.error(
        "getLatestEpisodes: không lấy được thông tin phim:",
        moviesError
      );
    } else {
      for (const movie of movies ?? []) {
        movieMap.set(movie.slug, {
          title: movie.title ?? "",
          poster: movie.poster ?? "",
        });
      }
    }
  }

  return rows.map((row: any) =>
    normalizeEpisode(row, movieMap.get(row.movie_slug))
  );
}

async function fetchLatestEpisodesWithRetry(): Promise<LatestEpisode[]> {
  try {
    return await fetchLatestEpisodesOnce();
  } catch (error) {
    console.error("getLatestEpisodes lần 1 lỗi:", error);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      return await fetchLatestEpisodesOnce();
    } catch (retryError) {
      console.error("getLatestEpisodes retry vẫn lỗi:", retryError);
      return [];
    }
  }
}

const getLatestEpisodesCached = unstable_cache(
  async () => {
    return await fetchLatestEpisodesWithRetry();
  },
  ["tihintv-get-latest-episodes"],
  {
    revalidate: 60,
    tags: ["latest-episodes"],
  }
);

export async function getLatestEpisodes(): Promise<LatestEpisode[]> {
  return await getLatestEpisodesCached();
}