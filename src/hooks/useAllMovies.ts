"use client";

import { useEffect, useMemo, useState } from "react";
import { movies as defaultMovies, type Movie } from "@/data/movies";
import { getStoredMovies } from "@/lib/movieStorage";

export function useAllMovies() {
  const [storedMovies, setStoredMovies] = useState<Movie[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStoredMovies(getStoredMovies());
    setReady(true);
  }, []);

  const allMovies = useMemo(() => {
    const map = new Map<string, Movie>();

    for (const movie of defaultMovies) {
      map.set(movie.slug, movie);
    }

    for (const movie of storedMovies) {
      map.set(movie.slug, movie);
    }

    return Array.from(map.values()).sort((a, b) =>
      a.updatedAt < b.updatedAt ? 1 : -1
    );
  }, [storedMovies]);

  const featuredMovie =
    allMovies.find((movie) => movie.featured) ?? allMovies[0] ?? null;

  return {
    allMovies,
    featuredMovie,
    ready,
  };
}