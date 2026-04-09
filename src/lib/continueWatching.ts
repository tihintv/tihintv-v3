export type ContinueWatchingItem = {
  movieSlug: string;
  movieTitle: string;
  moviePoster: string;
  contentType: "movie" | "series";
  watchHref: string;
  episodeNumber?: number | null;
  episodeTitle?: string | null;
  totalEpisodes?: number | null;
  updatedAt: number;
};

const CONTINUE_WATCHING_KEY = "tihintv_continue_watching";
const MAX_ITEMS = 20;

export function getContinueWatching(): ContinueWatchingItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(CONTINUE_WATCHING_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error("getContinueWatching error:", error);
    return [];
  }
}

export function saveContinueWatching(item: ContinueWatchingItem) {
  if (typeof window === "undefined") return;

  try {
    const current = getContinueWatching();

    const filtered = current.filter(
      (entry) => entry.movieSlug !== item.movieSlug
    );

    const next = [item, ...filtered].slice(0, MAX_ITEMS);

    localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(next));
  } catch (error) {
    console.error("saveContinueWatching error:", error);
  }
}

export function removeContinueWatching(movieSlug: string) {
  if (typeof window === "undefined") return;

  try {
    const current = getContinueWatching();
    const next = current.filter((item) => item.movieSlug !== movieSlug);
    localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(next));
  } catch (error) {
    console.error("removeContinueWatching error:", error);
  }
}

export function clearContinueWatching() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CONTINUE_WATCHING_KEY);
  } catch (error) {
    console.error("clearContinueWatching error:", error);
  }
}