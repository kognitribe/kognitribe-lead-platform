import axios from "axios";

const GITHUB_API =
    "https://api.github.com";

function getHeaders() {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        throw new Error(
            "GITHUB_TOKEN is not configured in server/.env"
        );
    }

    return {
        Accept:
            "application/vnd.github+json",

        Authorization:
            `Bearer ${token}`,

        "X-GitHub-Api-Version":
            "2022-11-28",

        "User-Agent":
            "Kognitribe-Lead-Platform",
    };
}

export async function fetchGitHubLeads(config = {}) {
    const headers = getHeaders();

    /*
     * Keywords come from the Lead Source UI.
     *
     * Example:
     * need developer,react,node.js
     */
    const keywords =
        Array.isArray(config.keywords) &&
        config.keywords.length
            ? config.keywords
            : [
                  "need developer",
                  "looking for developer",
                  "hire developer",
              ];

    const out = [];

    /*
     * Limit searches so we don't
     * unnecessarily consume GitHub API rate limits.
     */
    const searchKeywords =
        keywords.slice(0, 5);

    for (const keyword of searchKeywords) {
        try {
            /*
             * GitHub issue search query.
             *
             * IMPORTANT:
             * Do NOT use:
             *
             * is:public
             *
             * We use:
             *
             * is:issue
             */
            const query =
                `"${keyword}" is:issue`;

            console.log(
                `GitHub search: ${query}`
            );

            const response =
                await axios.get(
                    `${GITHUB_API}/search/issues`,
                    {
                        params: {
                            q: query,

                            sort: "updated",

                            order: "desc",

                            per_page: 20,
                        },

                        headers,

                        timeout: 20000,
                    }
                );

            const items =
                response.data?.items || [];

            console.log(
                `GitHub returned ${items.length} issues for "${keyword}"`
            );

            for (const item of items) {
                /*
                 * Ignore pull requests.
                 *
                 * GitHub's issue API also
                 * returns pull requests.
                 */
                if (item.pull_request) {
                    continue;
                }

                const repositoryUrl =
                    item.repository_url || "";

                const repositoryName =
                    repositoryUrl
                        .split("/")
                        .pop() || "";

                const owner =
                    repositoryUrl
                        .split("/")
                        .slice(-2, -1)[0] ||
                    item.user?.login ||
                    "";

                const sourceId =
                    `github:${item.id}`;

                /*
                 * Extract organization/company
                 * information when available.
                 */
                const organization =
                    item.repository?.owner
                        ?.login ||
                    owner ||
                    "";

                /*
                 * Build a useful description.
                 */
                const description =
                    item.body?.slice(
                        0,
                        4000
                    ) ||
                    item.title ||
                    "";

                out.push({
                    source: "GitHub",

                    sourceId,

                    sourceUrl:
                        item.html_url || "",

                    name:
                        organization ||
                        item.user?.login ||
                        "",

                    username:
                        item.user?.login ||
                        "",

                    company:
                        repositoryName ||
                        organization ||
                        "",

                    title:
                        item.title || "",

                    description,

                    originalContent:
                        item.body ||
                        item.title ||
                        "",

                    location: "",

                    email: "",

                    phone: "",

                    website: "",

                    linkedinUrl: "",

                    industry: "",

                    companySize: "",

                    countryCode: "",

                    /*
                     * This is an opportunity
                     * signal, not a verified
                     * business contact.
                     */
                    intent:
                        "Medium Intent",

                    publishedAt:
                        item.created_at
                            ? new Date(
                                  item.created_at
                              )
                            : new Date(),

                    githubKeyword:
                        keyword,

                    githubRepository:
                        repositoryName,

                    githubOwner:
                        organization,

                    githubComments:
                        item.comments || 0,

                    githubState:
                        item.state || "open",
                });
            }
        } catch (error) {
            /*
             * IMPORTANT:
             * Print GitHub's actual error.
             * This will make debugging much easier.
             */
            console.error(
                `GitHub search failed for "${keyword}"`
            );

            console.error(
                "Status:",
                error.response?.status
            );

            console.error(
                "Response:",
                error.response?.data
            );

            console.error(
                "Message:",
                error.message
            );

            /*
             * Don't silently continue if
             * authentication is broken.
             */
            if (
                error.response?.status ===
                    401 ||
                error.response?.status ===
                    403
            ) {
                throw new Error(
                    `GitHub API authentication/rate-limit error: ${
                        error.response?.data
                            ?.message ||
                        error.message
                    }`
                );
            }

            /*
             * Continue with the next keyword
             * for other search errors.
             */
        }
    }

    /*
     * Remove duplicate GitHub issues.
     */
    const unique = Array.from(
        new Map(
            out.map((lead) => [
                lead.sourceId,
                lead,
            ])
        ).values()
    );

    console.log(
        `GitHub total unique leads: ${unique.length}`
    );

    return unique;
}