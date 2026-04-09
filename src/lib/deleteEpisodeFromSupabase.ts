import { supabase } from "./supabaseClient";
import { revalidateSiteData } from "./revalidateSiteData";

export async function deleteEpisodeFromSupabase(
  episodeId: string | number
) {
  const { data, error } = await supabase
    .from("episodes")
    .delete()
    .eq("id", episodeId)
    .select();

  if (error) {
    console.error("deleteEpisodeFromSupabase error:", error);
    throw new Error(error.message || "Không thể xóa tập phim");
  }

  if (!data || data.length === 0) {
    throw new Error("Không tìm thấy tập phim để xóa");
  }

  await revalidateSiteData("all");

  return true;
}

export default deleteEpisodeFromSupabase;