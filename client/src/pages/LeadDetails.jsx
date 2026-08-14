import React, { useEffect, useState } from "react";
import {
    useParams,
    Link
} from "react-router-dom";
import api from "../services/api";
import {
    ArrowLeft,
    Sparkles,
    Mail,
    ExternalLink,
    RefreshCw
} from "lucide-react";

export default function LeadDetails() {
    const { id } = useParams();

    const [lead, setLead] = useState(null);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");

    /*
     * Load lead data.
     *
     * IMPORTANT:
     * This function is async, but it is NOT passed
     * directly to useEffect.
     */
    const load = async () => {
        try {
            setError("");

            const response = await api.get(`/leads/${id}`);

            setLead(response.data.lead || response.data);
        } catch (e) {
            console.error("Failed to load lead:", e);

            setError(
                e.response?.data?.message ||
                    "Failed to load lead."
            );
        }
    };

    /*
     * Correct useEffect pattern.
     *
     * DO NOT use:
     *
     * useEffect(load, [id]);
     *
     * because load() returns a Promise.
     */
    useEffect(() => {
        load();
    }, [id]);

    const analyze = async () => {
        setBusy(true);
        setMsg("");
        setError("");

        try {
            await api.post(`/leads/${id}/analyze`);

            await load();

            setMsg("Lead analyzed successfully.");
        } catch (e) {
            console.error("Analysis failed:", e);

            setError(
                e.response?.data?.message ||
                    "Analysis failed."
            );
        } finally {
            setBusy(false);
        }
    };

    const generate = async () => {
        setBusy(true);
        setMsg("");
        setError("");

        try {
            await api.post("/ai/generate-email", {
                leadId: id
            });

            setMsg("Email added to review queue.");
        } catch (e) {
            console.error("Email generation failed:", e);

            setError(
                e.response?.data?.message ||
                    "Generation failed."
            );
        } finally {
            setBusy(false);
        }
    };

    if (error && !lead) {
        return (
            <div className="p-6">
                <Link
                    to="/leads"
                    className="text-slate-500 text-sm flex items-center gap-2 hover:text-white"
                >
                    <ArrowLeft size={15} />
                    Back to leads
                </Link>

                <div className="glass rounded-2xl p-6 mt-6 text-red-400">
                    {error}
                </div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="p-6 text-slate-400">
                Loading...
            </div>
        );
    }

    const score = Math.min(
        100,
        Math.max(0, Number(lead.leadScore) || 0)
    );

    return (
        <div>
            {/* Back */}
            <Link
                to="/leads"
                className="text-slate-500 text-sm flex items-center gap-2 hover:text-white"
            >
                <ArrowLeft size={15} />
                Back to leads
            </Link>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mt-5">
                <div>
                    <div className="text-accent text-xs uppercase tracking-widest">
                        {lead.source || "Lead"}
                    </div>

                    <h1 className="text-3xl font-semibold mt-1">
                        {lead.name || "Unknown lead"}
                    </h1>

                    <p className="text-slate-500 mt-1">
                        {lead.company || "Unknown company"}

                        {lead.title && (
                            <>
                                {" "}
                                • {lead.title}
                            </>
                        )}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        disabled={busy}
                        onClick={analyze}
                        className="px-4 py-2 rounded-xl border border-white/10 flex gap-2 items-center disabled:opacity-40"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                busy
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        {busy
                            ? "Working..."
                            : "Analyze"}
                    </button>

                    <button
                        disabled={busy || !lead.email}
                        onClick={generate}
                        className="px-4 py-2 rounded-xl bg-accent flex gap-2 items-center disabled:opacity-40"
                    >
                        <Mail size={16} />

                        Generate Email
                    </button>
                </div>
            </div>

            {/* Messages */}
            {msg && (
                <div className="mt-4 text-sm text-cyan">
                    {msg}
                </div>
            )}

            {error && (
                <div className="mt-4 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Main content */}
            <div className="grid lg:grid-cols-3 gap-4 mt-6">

                {/* Left */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Original requirement */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="font-semibold">
                            Original requirement
                        </h2>

                        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-300 leading-7">
                            {lead.originalContent ||
                                lead.description ||
                                "No public content."}
                        </p>

                        {lead.sourceUrl && (
                            <a
                                href={lead.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-5 inline-flex gap-2 text-sm text-accent hover:underline"
                            >
                                Open source

                                <ExternalLink
                                    size={15}
                                />
                            </a>
                        )}
                    </div>

                    {/* AI analysis */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="font-semibold flex gap-2 items-center">
                            <Sparkles
                                className="text-accent"
                                size={18}
                            />

                            AI analysis
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4 mt-5">

                            {/* Summary */}
                            <div>
                                <div className="text-xs text-slate-500">
                                    SUMMARY
                                </div>

                                <p className="text-sm mt-2 text-slate-300">
                                    {lead.aiSummary ||
                                        "Not analyzed yet."}
                                </p>
                            </div>

                            {/* Reason */}
                            <div>
                                <div className="text-xs text-slate-500">
                                    REASON
                                </div>

                                <p className="text-sm mt-2 text-slate-300">
                                    {lead.aiReason ||
                                        "—"}
                                </p>
                            </div>
                        </div>

                        {/* Services */}
                        <div className="mt-5 flex flex-wrap gap-2">
                            {lead.matchedServices?.map(
                                (service) => (
                                    <span
                                        className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-xs"
                                        key={service}
                                    >
                                        {service}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <aside className="space-y-4">

                    {/* Score */}
                    <div className="glass rounded-2xl p-6">
                        <div className="text-xs text-slate-500">
                            LEAD SCORE
                        </div>

                        <div className="text-5xl font-semibold mt-2">
                            {score}
                        </div>

                        <div className="text-cyan text-sm mt-1">
                            {lead.intent || "Unknown intent"}
                        </div>

                        <div className="mt-5 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-2 bg-gradient-to-r from-accent to-cyan rounded-full transition-all"
                                style={{
                                    width: `${score}%`
                                }}
                            />
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="glass rounded-2xl p-6 text-sm">
                        <div className="text-xs text-slate-500">
                            CONTACT
                        </div>

                        <div className="mt-3">
                            {lead.email || (
                                <span className="text-slate-400">
                                    No public contact email
                                    available.
                                </span>
                            )}
                        </div>

                        <div className="text-slate-500 mt-2">
                            {lead.location ||
                                "Location not provided"}
                        </div>

                        <div className="mt-4 text-xs text-slate-500">
                            The platform never guesses private
                            email addresses.
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}