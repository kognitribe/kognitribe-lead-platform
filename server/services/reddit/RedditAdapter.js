import axios from "axios";

export async function fetchRedditLeads(config) {
  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
    throw new Error("Reddit credentials are not configured");
  }
  const auth = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString("base64");
  const token = await axios.post("https://www.reddit.com/api/v1/access_token",
    new URLSearchParams({ grant_type: "client_credentials" }).toString(),
    { headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" }, timeout: 20000 });
  const headers = { Authorization: `Bearer ${token.data.access_token}`, "User-Agent": "KognitribeLeadPlatform/1.0" };
  const subreddits = config.subreddits?.length ? config.subreddits : ["forhire", "startups"];
  const keywords = config.keywords?.length ? config.keywords : ["react developer"];
  const out = [];
  for (const sub of subreddits.slice(0, 5)) {
    for (const q of keywords.slice(0, 5)) {
      const r = await axios.get(`https://oauth.reddit.com/r/${encodeURIComponent(sub)}/search`, {
        params: { q, restrict_sr: "on", sort: "new", t: "week", limit: 25 },
        headers, timeout: 20000
      });
      for (const x of r.data?.data?.children || []) {
        const d = x.data;
        out.push({
          source: "Reddit", sourceId: d.id, sourceUrl: `https://www.reddit.com${d.permalink}`,
          name: d.author_fullname || d.author || "", username: d.author || "",
          title: d.title, description: d.selftext?.slice(0, 2000) || "",
          originalContent: d.selftext || d.title, publishedAt: new Date(d.created_utc * 1000)
        });
      }
    }
  }
  return out;
}
