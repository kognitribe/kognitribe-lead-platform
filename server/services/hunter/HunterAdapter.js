import axios from "axios";

const HUNTER_BASE_URL = "https://api.hunter.io/v2";

function getApiKey(config = {}) {
    const key =
        process.env.HUNTER_API_KEY ||
        config.apiKey;

    if (!key) {
        throw new Error(
            "HUNTER_API_KEY is not configured in server/.env"
        );
    }

    return key;
}

function cleanDomain(domain) {
    if (!domain) return "";

    return String(domain)
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .split("/")[0]
        .trim();
}

function firstNonEmpty(...values) {
    return (
        values.find(
            (value) =>
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
        ) || ""
    );
}

/*
 * Read Hunter source configuration.
 */
function getSearchConfig(config = {}) {
    const searchParams =
        config.searchParams &&
        typeof config.searchParams === "object"
            ? config.searchParams
            : {};

    const query = firstNonEmpty(
        searchParams.query,
        config.category,
        "SaaS companies in India"
    );

    const maxCompanies = Math.max(
        1,
        Math.min(
            10,
            Number(searchParams.maxCompanies || 5)
        )
    );

    const includeContacts =
        searchParams.includeContacts !== false;

    return {
        query,
        maxCompanies,
        includeContacts,
    };
}

/*
 * Hunter Discover
 *
 * IMPORTANT:
 * Discover is POST.
 */
async function discoverCompanies(
    apiKey,
    query,
    maxCompanies
) {
    const response = await axios.post(
        `${HUNTER_BASE_URL}/discover`,
        {
            query,
        },
        {
            params: {
                api_key: apiKey,
            },
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 30000,
        }
    );

    const data = response.data?.data;

    /*
     * Hunter may return the company collection
     * inside different response structures.
     */
    if (Array.isArray(data)) {
        return data.slice(0, maxCompanies);
    }

    if (Array.isArray(data?.companies)) {
        return data.companies.slice(
            0,
            maxCompanies
        );
    }

    if (Array.isArray(response.data?.companies)) {
        return response.data.companies.slice(
            0,
            maxCompanies
        );
    }

    return [];
}

/*
 * Find a decision maker for a company domain.
 *
 * Domain Search consumes Hunter search credits
 * when emails are revealed.
 */
async function findDecisionMaker(
    apiKey,
    domain
) {
    if (!domain) return null;

    const response = await axios.get(
        `${HUNTER_BASE_URL}/domain-search`,
        {
            params: {
                domain,
                api_key: apiKey,
                type: "personal",
                decision_maker: true,
                required_field:
                    "full_name,position",
                limit: 10,
                offset: 0,
            },
            timeout: 30000,
        }
    );

    const emails =
        response.data?.data?.emails || [];

    if (!emails.length) {
        return null;
    }

    /*
     * Prefer:
     * 1. Decision makers
     * 2. Executives
     * 3. Senior people
     * 4. Higher confidence
     */
    const ranked = [...emails].sort(
        (a, b) => {
            const aScore =
                (a.decision_maker ? 100 : 0) +
                (a.seniority === "executive"
                    ? 30
                    : a.seniority === "senior"
                    ? 15
                    : 0) +
                Number(a.confidence || 0);

            const bScore =
                (b.decision_maker ? 100 : 0) +
                (b.seniority === "executive"
                    ? 30
                    : b.seniority === "senior"
                    ? 15
                    : 0) +
                Number(b.confidence || 0);

            return bScore - aScore;
        }
    );

    return ranked[0];
}

/*
 * Main Hunter source adapter.
 */
export async function fetchHunterLeads(
    config = {}
) {
    const apiKey = getApiKey(config);

    const {
        query,
        maxCompanies,
        includeContacts,
    } = getSearchConfig(config);

    /*
     * 1. Find B2B companies
     */
    const companies =
        await discoverCompanies(
            apiKey,
            query,
            maxCompanies
        );

    if (!companies.length) {
        return [];
    }

    const leads = [];

    /*
     * 2. Process companies one by one.
     */
    for (const company of companies) {
        const domain = cleanDomain(
            company.domain ||
                company.website ||
                company.url
        );

        if (!domain) {
            continue;
        }

        let contact = null;

        /*
         * 3. Find decision maker.
         */
        if (includeContacts) {
            try {
                contact =
                    await findDecisionMaker(
                        apiKey,
                        domain
                    );
            } catch (error) {
                console.error(
                    `Hunter Domain Search failed for ${domain}:`,
                    error.response?.data ||
                        error.message
                );

                /*
                 * Don't stop the entire sync
                 * because one domain failed.
                 */
                contact = null;
            }
        }

        const companyName =
            firstNonEmpty(
                company.organization,
                company.company,
                company.name,
                domain
            );

        const fullName =
            contact?.first_name &&
            contact?.last_name
                ? `${contact.first_name} ${contact.last_name}`
                : firstNonEmpty(
                      contact?.full_name,
                      companyName
                  );

        const email =
            contact?.value || "";

        const position =
            firstNonEmpty(
                contact?.position,
                contact?.job_title,
                "Decision Maker"
            );

        const location =
            firstNonEmpty(
                company.country,
                company.location,
                company.city,
                ""
            );

        const industry =
            firstNonEmpty(
                company.industry,
                company.category,
                ""
            );

        const companySize =
            firstNonEmpty(
                company.headcount,
                company.company_size,
                ""
            );

        const description = [
            `${companyName} was discovered through Hunter.`,
            `Search: "${query}".`,
            `Website: https://${domain}.`,
            industry
                ? `Industry: ${industry}.`
                : "",
            companySize
                ? `Company size: ${companySize}.`
                : "",
            position
                ? `Decision maker: ${position}.`
                : "",
            email
                ? `Professional email found: ${email}.`
                : "No professional email returned.",
        ]
            .filter(Boolean)
            .join(" ");

        leads.push({
            source: "Hunter B2B",

            /*
             * Important for duplicate prevention.
             */
            sourceId:
                `hunter:${domain}:${email || "company"}`,

            sourceUrl:
                `https://${domain}`,

            name: fullName,

            company: companyName,

            email,

            title: position,

            location,

            website: domain,

            linkedinUrl:
                contact?.linkedin ||
                contact?.linkedin_url ||
                "",

            industry,

            companySize,

            countryCode:
                company.country_code || "",

            emailConfidence:
                contact?.confidence !== undefined
                    ? Number(
                          contact.confidence
                      )
                    : undefined,

            emailType:
                contact?.type || "",

            emailVerificationStatus:
                contact?.verification
                    ?.status ||
                contact?.verification_status ||
                "",

            description,

            originalContent:
                description,

            hunterQuery: query,

            publishedAt: new Date(),
        });
    }

    return leads;
}