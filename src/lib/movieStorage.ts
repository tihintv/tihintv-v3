import type { Movie } from "@/data/movies";

const STORAGE_KEY = "tihintv_movies";

export function getStoredMovies(): Movie[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredMovies(movies: Movie[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

export function addStoredMovie(movie: Movie) {
  const current = getStoredMovies();
  saveStoredMovies([movie, ...current]);
}

export function updateStoredMovie(updatedMovie: Movie) {
  const current = getStoredMovies();
  const next = current.map((movie) =>
    movie.slug === updatedMovie.slug ? updatedMovie : movie
  );
  saveStoredMovies(next);
}

export function deleteStoredMovie(slug: string) {
  const current = getStoredMovies();
  const next = current.filter((movie) => movie.slug !== slug);
  saveStoredMovies(next);
}