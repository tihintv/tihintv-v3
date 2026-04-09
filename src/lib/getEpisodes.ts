import { supabase } from "./supabaseClient";

export async function getEpisodes(movieSlug: string) {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("movie_slug", movieSlug)
    .order("episode_number", { ascending: true });

  if (error) {
    console.error("Supabase episodes error:", error);
    return [];
  }

  return data;
}