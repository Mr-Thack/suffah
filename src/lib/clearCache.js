const ZONE_ID = "83f10d6ec6be147f67ac55484ba6a169";
const API_TOKEN = "a3ba4acdcc34dc91d296e352174423f2";

async function purgeCache() {
  console.log("🧹 Sending purge request to Cloudflare...");

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purge_everything: true,
        }),
      },
    );

    const data = await response.json();

    if (data.success) {
      console.log("✅ Cache successfully purged!");
    } else {
      console.error("❌ Failed to purge cache:", data.errors);
    }
  } catch (error) {
    console.error("❌ Network error:", error);
  }
}
