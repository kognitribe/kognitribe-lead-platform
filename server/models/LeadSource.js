import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            enum: [
                "RSS",
                "Reddit",
                "GitHub",
                "Hunter B2B",
                "Opportunity API",
                "Custom API",
            ],
            required: true,
        },

        apiUrl: String,

        /*
         * Do not put Hunter's secret in the database.
         * HunterAdapter uses process.env.HUNTER_API_KEY.
         */
        apiKey: String,

        clientId: String,
        clientSecret: String,

        keywords: [String],

        subreddits: [String],

        category: String,

        requestMethod: {
            type: String,
            enum: ["GET", "POST"],
            default: "GET",
        },

        /*
         * Hunter configuration is stored here.
         *
         * Example:
         *
         * searchParams: {
         *   query: "SaaS companies in India",
         *   maxCompanies: 5,
         *   includeContacts: true
         * }
         */
        searchParams:
            mongoose.Schema.Types.Mixed,

        enabled: {
            type: Boolean,
            default: true,
        },

        pollingInterval: {
            type: Number,
            default: 15,
        },

        lastSync: Date,

        lastError: String,

        leadsCollected: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "LeadSource",
    schema
);