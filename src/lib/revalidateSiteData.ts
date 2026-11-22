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

    if (response.ok) {
      return await response.json();
    }

    // POST lỗi (vd: mạng chập chờn) thì thử lại bằng GET — route
    // /api/revalidate nhận cả 2 cách và làm cùng một việc.
    console.error(
      "revalidateSiteData POST failed:",
      response.status,
      "— retrying with GET"
    );
    const retry = await fetch(
      `/api/revalidate?target=${encodeURIComponent(target)}`
    );
    return await retry.json();
  } catch (error) {
    console.error("revalidateSiteData error:", error);
    return {
      ok: false,
      message: "Không gọi được API revalidate",
    };
  }
}