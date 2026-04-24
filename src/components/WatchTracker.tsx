"use client";

import { useEffect } from "react";
import { saveContinueWatching } from "@/lib/continueWatching";

type Props = {
  movieSlug: string;
  movieTitle: string;
  moviePoster: string;
  contentType: "movie" | "series";
  watchHref: string;
  episodeNumber?: number | null;
  episodeTitle?: string | null;
  totalEpisodes?: number | null;
};

export default function WatchTracker({
  movieSlug,
  movieTitle,
  moviePoster,
  contentType,
  watchHref,
  episodeNumber = null,
  episodeTitle = null,
  totalEpisodes = null,
}: Props) {
  useEffect(() => {
    saveContinueWatching({
      movieSlug,
      movieTitle,
      moviePoster,
      contentType,
      watchHref,
      episodeNumber,
      episodeTitle,
      totalEpisodes,
      updatedAt: Date.now(),
    });
  }, [
    movieSlug,
    movieTitle,
    moviePoster,
    contentType,
    watchHref,
    episodeNumber,
    episodeTitle,
    totalEpisodes,
  ]);

  return null;
}