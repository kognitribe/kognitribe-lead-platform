import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        source: {
            type: String,
            required: true,
        },

        sourceId: String,

        sourceUrl: String,

        name: String,

        username: String,

        company: String,

        email: String,

        phone: String,

        /*
         * B2B / Hunter fields
         */
        website: String,

        linkedinUrl: String,

        industry: String,

        companySize: String,

        countryCode: String,

        emailConfidence: {
            type: Number,
            min: 0,
            max: 100,
        },

        emailType: String,

        emailVerificationStatus: String,

        location: String,

        title: String,

        description: String,

        originalContent: String,

        /*
         * AI qualification
         */
        matchedServices: [String],

        leadScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        intent: {
            type: String,
            enum: [
                "High Intent",
                "Medium Intent",
                "Low Intent",
                "Not Relevant",
            ],
            default: "Not Relevant",
        },

        aiSummary: String,

        aiReason: String,

        status: {
            type: String,
            enum: [
                "New",
                "Qualified",
                "Contacted",
                "Converted",
                "Archived",
            ],
            default: "New",
        },

        contactStatus: {
            type: String,
            enum: [
                "Public Email",
                "No Public Email",
                "Suppressed",
            ],
            default: "No Public Email",
        },

        isSuppressed: {
            type: Boolean,
            default: false,
        },

        isDemo: {
            type: Boolean,
            default: false,
        },

        publishedAt: Date,
    },
    {
        timestamps: true,
    }
);

/*
 * Prevent duplicate source records.
 */
schema.index(
    {
        source: 1,
        sourceId: 1,
    },
    {
        unique: true,
        sparse: true,
    }
);

/*
 * Prevent duplicate source URLs.
 */
schema.index(
    {
        sourceUrl: 1,
    },
    {
        unique: true,
        sparse: true,
    }
);

/*
 * Lead dashboard sorting.
 */
schema.index({
    leadScore: -1,
    createdAt: -1,
});

export default mongoose.model(
    "Lead",
    schema
);