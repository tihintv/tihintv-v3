export type CachedMovie = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  year: number;
  genres: string[];
  poster: string;
  banner: string;
  featured?: boolean;
  updated_at?: string;
  content_type?: string;
  episode_count?: number;
  latest_episode_number?: number | null;
};

type MovieCachePayload = {
  data: CachedMovie[];
  cachedAt: number;
};

const MOVIE_CACHE_KEY = "tihintv_movies_cache";
const MOVIE_CACHE_TTL = 1000 * 60 * 10; // 10 phút

export function saveMoviesToCache(movies: CachedMovie[]) {
  if (typeof window === "undefined") return;

  try {
    const payload: MovieCachePayload = {
      data: movies,
      cachedAt: Date.now(),
    };

    localStorage.setItem(MOVIE_CACHE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("saveMoviesToCache error:", error);
  }
}

export function getMoviesFromCache(): CachedMovie[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(MOVIE_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as MovieCachePayload;

    if (!parsed || !Array.isArray(parsed.data)) {
      return [];
    }

    const isExpired = Date.now() - parsed.cachedAt > MOVIE_CACHE_TTL;
    if (isExpired) {
      localStorage.removeItem(MOVIE_CACHE_KEY);
      return [];
    }

    return parsed.data;
  } catch (error) {
    console.error("getMoviesFromCache error:", error);
    return [];
  }
}

export function clearMoviesCache() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(MOVIE_CACHE_KEY);
  } catch (error) {
    console.error("clearMoviesCache error:", error);
  }
}