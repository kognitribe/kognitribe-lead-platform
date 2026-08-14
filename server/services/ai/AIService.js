import axios from "axios";

const SERVICES = [
  "Web Development", "Cloud Solutions", "Data Engineering",
  "AI & Machine Learning", "3D Design", "Frontend Development", "Backend Development"
];

function localAnalyze(lead) {
  const text = `${lead.title || ""} ${lead.description || ""} ${lead.originalContent || ""}`.toLowerCase();
  const matched = [];
  const map = [
    [["react", "frontend", "ui"], "Frontend Development"],
    [["node", "api", "backend", "express"], "Backend Development"],
    [["website", "web app", "web application", "mern"], "Web Development"],
    [["aws", "azure", "cloud", "migration", "devops"], "Cloud Solutions"],
    [["etl", "data pipeline", "data engineering", "warehouse"], "Data Engineering"],
    [["ai", "machine learning", "ml", "chatbot", "llm"], "AI & Machine Learning"],
    [["3d", "blender", "visualization"], "3D Design"]
  ];
  for (const [words, service] of map) if (words.some(w => text.includes(w))) matched.push(service);
  const intentWords = ["need", "looking for", "hire", "developer", "build", "migration", "project", "mvp"];
  const hits = intentWords.filter(w => text.includes(w)).length;
  const score = Math.min(98, 30 + hits * 8 + matched.length * 8);
  const intent = score >= 75 ? "High Intent" : score >= 50 ? "Medium Intent" : score >= 25 ? "Low Intent" : "Not Relevant";
  return {
    summary: lead.description || lead.originalContent?.slice(0, 220) || "Public opportunity detected.",
    requirement: lead.title || "Technology requirement",
    intent,
    leadScore: score,
    reason: `Detected ${hits} business-intent signals and ${matched.length} relevant Kognitribe service area(s).`,
    matchedServices: matched.length ? [...new Set(matched)] : ["Web Development"]
  };
}

async function providerRequest(payload, settings) {
  const base = (settings.baseUrl || process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const key = settings.apiKey || process.env.AI_API_KEY;
  if (!key) return null;
  const model = settings.model || process.env.AI_MODEL || "gpt-4o-mini";
  const response = await axios.post(`${base}/chat/completions`, {
    model,
    temperature: settings.temperature ?? 0.4,
    messages: [
      { role: "system", content: settings.systemPrompt || "Return valid JSON only. Never invent facts." },
      { role: "user", content: JSON.stringify(payload) }
    ],
    response_format: { type: "json_object" }
  }, { headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, timeout: 30000 });
  return response.data?.choices?.[0]?.message?.content;
}

export async function analyzeLead(lead, settings = {}) {
  const fallback = localAnalyze(lead);
  try {
    const content = await providerRequest({
      task: "Analyze a public business opportunity. Use only supplied facts.",
      lead: {
        title: lead.title, description: lead.description,
        originalContent: lead.originalContent, company: lead.company, source: lead.source
      },
      allowedServices: SERVICES,
      output: { summary: "string", requirement: "string", intent: "High Intent|Medium Intent|Low Intent|Not Relevant", leadScore: "0-100", reason: "string", matchedServices: "array" }
    }, settings);
    if (!content) return fallback;
    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary || fallback.summary,
      requirement: parsed.requirement || fallback.requirement,
      intent: parsed.intent || fallback.intent,
      leadScore: Math.max(0, Math.min(100, Number(parsed.leadScore ?? fallback.leadScore))),
      reason: parsed.reason || fallback.reason,
      matchedServices: Array.isArray(parsed.matchedServices) ? parsed.matchedServices.filter(s => SERVICES.includes(s)) : fallback.matchedServices
    };
  } catch {
    return fallback;
  }
}

export async function generateEmail(lead, company, settings = {}) {
  const name = lead.name || "there";
  const services = (lead.matchedServices || []).join(", ") || "technology services";
  const fallback = {
    subject: `Regarding your ${lead.title || "technology requirement"}`,
    body: `Hi ${name},\n\nI came across your public post regarding ${lead.title || "your technology requirement"}.\n\nAt ${company.companyName}, we provide ${services.toLowerCase()} for businesses building modern digital products.\n\nBased on the requirement you shared, our team may be able to help. If you're still evaluating options, we'd be happy to understand the project and discuss next steps.\n\nRegards,\n${company.companyName}\n${company.contactEmail || ""}\n\nIf you prefer not to receive future outreach, please reply with "unsubscribe".`
  };
  try {
    const content = await providerRequest({
      task: "Write one concise personalized B2B outreach email using only the supplied facts. Do not invent relationships, clients, statistics, certifications, case studies or experience.",
      lead: {
        name: lead.name, company: lead.company, title: lead.title,
        description: lead.description, originalContent: lead.originalContent,
        sourceUrl: lead.sourceUrl, matchedServices: lead.matchedServices
      },
      company: {
        name: company.companyName, description: company.description,
        services: company.services, website: company.website,
        contactEmail: company.contactEmail, signature: company.emailSignature
      },
      output: { subject: "string", body: "string" }
    }, settings);
    if (!content) return fallback;
    const parsed = JSON.parse(content);
    return { subject: parsed.subject || fallback.subject, body: parsed.body || fallback.body };
  } catch {
    return fallback;
  }
}

export { SERVICES };
