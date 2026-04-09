export async function revalidateSiteData(
  target: "movies" | "episodes" | "all" = "all"
) {
  try {
    const response = await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("revalidateSiteData error:", error);
    return {
      ok: false,
      message: "Không gọi được API revalidate",
    };
  }
}