import Lead from "../models/Lead.js";
import AISettings from "../models/AISettings.js";
import { analyzeLead } from "./ai/AIService.js";

export async function processLeads(
    items,
    sourceName
) {
    const settings =
        (await AISettings.findOne().lean()) || {};

    let created = 0;
    let updated = 0;

    for (const raw of items) {
        const normalized = {
            source:
                raw.source ||
                sourceName,

            sourceId:
                raw.sourceId,

            sourceUrl:
                raw.sourceUrl,

            name:
                raw.name || "",

            username:
                raw.username || "",

            company:
                raw.company || "",

            email:
                raw.email || null,

            phone:
                raw.phone || "",

            website:
                raw.website || "",

            linkedinUrl:
                raw.linkedinUrl || "",

            industry:
                raw.industry || "",

            companySize:
                raw.companySize || "",

            countryCode:
                raw.countryCode || "",

            emailConfidence:
                raw.emailConfidence ??
                undefined,

            emailType:
                raw.emailType || "",

            emailVerificationStatus:
                raw.emailVerificationStatus || "",

            location:
                raw.location || "",

            title:
                raw.title || "",

            description:
                raw.description || "",

            originalContent:
                raw.originalContent ||
                raw.description ||
                "",

            publishedAt:
                raw.publishedAt ||
                new Date(),

            contactStatus:
                raw.email
                    ? "Public Email"
                    : "No Public Email",
        };

        let lead = null;

        /*
         * First duplicate check:
         * source + sourceId
         */
        if (normalized.sourceId) {
            lead = await Lead.findOne({
                source:
                    normalized.source,

                sourceId:
                    normalized.sourceId,
            });
        }

        /*
         * Second duplicate check:
         * source URL
         */
        if (
            !lead &&
            normalized.sourceUrl
        ) {
            lead = await Lead.findOne({
                sourceUrl:
                    normalized.sourceUrl,
            });
        }

        /*
         * Existing lead
         */
        if (lead) {
            await Lead.updateOne(
                {
                    _id: lead._id,
                },
                {
                    $set: normalized,
                }
            );

            updated++;
            continue;
        }

        /*
         * AI qualification
         */
        const analysis =
            await analyzeLead(
                normalized,
                settings
            );

        /*
         * Create lead
         */
        lead = await Lead.create({
            ...normalized,
            ...analysis,

            status:
                analysis.leadScore >= 50
                    ? "Qualified"
                    : "New",
        });

        created++;
    }

    return {
        created,
        updated,
    };
}