import axios from "axios";

export async function fetchOpportunityLeads(config) {
  if (!config.apiUrl) throw new Error("Opportunity API URL is required");
  const headers = config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {};
  const method = (config.requestMethod || "GET").toUpperCase();
  const response = method === "POST"
    ? await axios.post(config.apiUrl, config.searchParams || {}, { headers, timeout: 20000 })
    : await axios.get(config.apiUrl, { params: config.searchParams || {}, headers, timeout: 20000 });
  const arr = Array.isArray(response.data) ? response.data : (response.data?.items || response.data?.results || []);
  return arr.map((x, i) => ({
    source: config.type || "Opportunity API",
    sourceId: String(x.id || x.uuid || x.url || i),
    sourceUrl: x.url || x.link || "",
    name: x.name || x.contactName || "",
    company: x.company || x.organization || "",
    email: x.email || x.contactEmail || null,
    title: x.title || x.name || "Opportunity",
    description: x.description || x.summary || "",
    originalContent: x.description || x.summary || JSON.stringify(x),
    location: x.location || "",
    publishedAt: x.publishedAt ? new Date(x.publishedAt) : new Date()
  }));
}
