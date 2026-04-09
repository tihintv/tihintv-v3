export type CachedLatestEpisode = {
  id?: string;
  movie_slug: string;
  episode_number: number;
  title: string;
  video_url: string;
  created_at?: string;
  movie_title?: string;
  movie_poster?: string;
};

type LatestEpisodeCachePayload = {
  data: CachedLatestEpisode[];
  cachedAt: number;
};

const LATEST_EPISODES_CACHE_KEY = "tihintv_latest_episodes_cache";
const LATEST_EPISODES_CACHE_TTL = 1000 * 60 * 10; // 10 phút

export function saveLatestEpisodesToCache(episodes: CachedLatestEpisode[]) {
  if (typeof window === "undefined") return;

  try {
    const payload: LatestEpisodeCachePayload = {
      data: episodes,
      cachedAt: Date.now(),
    };

    localStorage.setItem(
      LATEST_EPISODES_CACHE_KEY,
      JSON.stringify(payload)
    );
  } catch (error) {
    console.error("saveLatestEpisodesToCache error:", error);
  }
}

export function getLatestEpisodesFromCache(): CachedLatestEpisode[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(LATEST_EPISODES_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as LatestEpisodeCachePayload;

    if (!parsed || !Array.isArray(parsed.data)) {
      return [];
    }

    const isExpired =
      Date.now() - parsed.cachedAt > LATEST_EPISODES_CACHE_TTL;

    if (isExpired) {
      localStorage.removeItem(LATEST_EPISODES_CACHE_KEY);
      return [];
    }

    return parsed.data;
  } catch (error) {
    console.error("getLatestEpisodesFromCache error:", error);
    return [];
  }
}

export function clearLatestEpisodesCache() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(LATEST_EPISODES_CACHE_KEY);
  } catch (error) {
    console.error("clearLatestEpisodesCache error:", error);
  }
}