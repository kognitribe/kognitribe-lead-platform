import Parser from "rss-parser";
const parser = new Parser();

export async function fetchRSSLeads(config) {
  if (!config.apiUrl) throw new Error("RSS URL is required");
  const feed = await parser.parseURL(config.apiUrl);
  const keywords = (config.keywords || []).map(k => k.toLowerCase()).filter(Boolean);
  return (feed.items || []).filter(item => {
    const text = `${item.title || ""} ${item.contentSnippet || item.content || ""}`.toLowerCase();
    return !keywords.length || keywords.some(k => text.includes(k));
  }).map((item, i) => ({
    source: "RSS", sourceId: item.guid || item.id || item.link || `${feed.title}-${i}`,
    sourceUrl: item.link, name: "", company: "",
    title: item.title || "RSS opportunity",
    description: item.contentSnippet || item.content || "",
    originalContent: item.content || item.contentSnippet || item.title || "",
    publishedAt: item.isoDate ? new Date(item.isoDate) : new Date()
  }));
}
