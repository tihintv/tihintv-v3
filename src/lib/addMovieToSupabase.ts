import { supabase } from "./supabaseClient";
import { revalidateSiteData } from "./revalidateSiteData";

type AddMovieInput = {
  slug: string;
  title: string;
  description: string;
  year: number;
  genres: string[];
  poster: string;
  banner: string;
  video_url?: string | null;
  featured?: boolean;
  content_type?: string;
  total_episodes?: number | null;
};

export async function addMovieToSupabase(movie: AddMovieInput) {
  const payload = {
    ...movie,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("movies")
    .insert([payload])
    .select();

  if (error) {
    console.error("addMovieToSupabase error:", error);
    throw new Error(error.message);
  }

  await revalidateSiteData("all");

  return data;
}