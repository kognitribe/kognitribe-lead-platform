import { fetchRedditLeads } from "../reddit/RedditAdapter.js";
import { fetchRSSLeads } from "../rss/RSSAdapter.js";
import { fetchGitHubLeads } from "../github/GitHubAdapter.js";
import { fetchOpportunityLeads } from "../opportunity/OpportunityAdapter.js";
import { fetchHunterLeads } from "../hunter/HunterAdapter.js";

export async function fetchFromSource(source) {
    if (source.type === "Reddit") {
        return fetchRedditLeads(source);
    }

    if (source.type === "RSS") {
        return fetchRSSLeads(source);
    }

    if (source.type === "GitHub") {
        return fetchGitHubLeads(source);
    }

    if (source.type === "Hunter B2B") {
        return fetchHunterLeads(source);
    }

    if (
        source.type === "Opportunity API" ||
        source.type === "Custom API"
    ) {
        return fetchOpportunityLeads(source);
    }

    throw new Error(
        `Unsupported source type: ${source.type}`
    );
}