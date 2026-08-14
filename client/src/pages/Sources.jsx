import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
    Plus,
    RefreshCw,
    Power,
    Trash2,
} from "lucide-react";

const blank = {
    name: "",
    type: "RSS",
    apiUrl: "",
    keywords: "",
    subreddits: "",
    enabled: true,
    pollingInterval: 15,

    // Hunter B2B
    searchQuery: "SaaS companies in India",
    maxCompanies: 5,
    includeContacts: true,
};

export default function Sources() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(blank);
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [syncingId, setSyncingId] = useState(null);

    // Load sources
    const load = async () => {
        try {
            setLoading(true);

            const response = await api.get("/sources");

            setItems(
                response.data.items ||
                    response.data ||
                    []
            );
        } catch (error) {
            console.error(
                "Failed to load sources:",
                error
            );

            setMsg(
                error.response?.data?.message ||
                    "Failed to load sources."
            );
        } finally {
            setLoading(false);
        }
    };

    // IMPORTANT: keep async work inside the effect.
    useEffect(() => {
        load();
    }, []);

    // Save source
    const save = async () => {
        try {
            setSaving(true);
            setMsg("");

            const payload = {
                name: form.name.trim(),
                type: form.type,
                apiUrl: form.apiUrl.trim(),
                enabled: form.enabled,
                pollingInterval:
                    Number(form.pollingInterval) || 15,

                keywords: form.keywords
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),

                subreddits: form.subreddits
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
            };

            // Hunter-specific configuration
            if (form.type === "Hunter B2B") {
                payload.searchParams = {
                    query:
                        form.searchQuery.trim() ||
                        "SaaS companies in India",

                    maxCompanies: Math.min(
                        10,
                        Math.max(
                            1,
                            Number(form.maxCompanies) || 5
                        )
                    ),

                    includeContacts:
                        form.includeContacts !== false,
                };
            }

            console.log(
                "Creating source:",
                payload
            );

            await api.post("/sources", payload);

            setMsg("Source added successfully.");
            setOpen(false);

            setForm({
                ...blank,
            });

            await load();
        } catch (error) {
            console.error(
                "Failed to save source:",
                error
            );

            setMsg(
                error.response?.data?.message ||
                    "Failed to save source."
            );
        } finally {
            setSaving(false);
        }
    };

    // Sync source
    const sync = async (id) => {
        try {
            setSyncingId(id);
            setMsg("Syncing source...");

            const response = await api.post(
                `/sources/${id}/sync`
            );

            setMsg(
                `${response.data.message || "Sync completed"}: ${
                    response.data.created || 0
                } new leads, ${
                    response.data.updated || 0
                } updated.`
            );

            await load();
        } catch (error) {
            console.error(
                "Source sync failed:",
                error
            );

            setMsg(
                error.response?.data?.message ||
                    "Sync failed."
            );
        } finally {
            setSyncingId(null);
        }
    };

    // Enable / disable source
    const toggle = async (source) => {
        try {
            setMsg("");

            await api.put(
                `/sources/${source._id}`,
                {
                    enabled: !source.enabled,
                }
            );

            setMsg(
                source.enabled
                    ? "Source disabled."
                    : "Source enabled."
            );

            await load();
        } catch (error) {
            console.error(
                "Failed to toggle source:",
                error
            );

            setMsg(
                error.response?.data?.message ||
                    "Failed to update source."
            );
        }
    };

    // Delete source
    const del = async (id) => {
        if (!window.confirm("Delete source?")) {
            return;
        }

        try {
            setMsg("");

            await api.delete(`/sources/${id}`);

            setMsg(
                "Source deleted successfully."
            );

            await load();
        } catch (error) {
            console.error(
                "Failed to delete source:",
                error
            );

            setMsg(
                error.response?.data?.message ||
                    "Failed to delete source."
            );
        }
    };

    const resetForm = () => {
        setForm({
            ...blank,
        });
        setMsg("");
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-end gap-4">
                <div>
                    <div className="text-accent text-xs uppercase tracking-widest">
                        Collection
                    </div>

                    <h1 className="text-3xl font-semibold mt-1">
                        Lead Sources
                    </h1>

                    <p className="text-sm text-slate-500 mt-2">
                        Collect public opportunities
                        and B2B prospects.
                    </p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-accent flex gap-2 text-sm"
                >
                    <Plus size={16} />
                    Add Source
                </button>
            </div>

            {/* Message */}
            {msg && (
                <div className="mt-4 text-sm text-cyan">
                    {msg}
                </div>
            )}

            {/* Sources table */}
            <div className="glass rounded-2xl mt-6 overflow-auto">
                <table className="w-full text-sm">
                    <thead className="bg-white/[.03] text-slate-500">
                        <tr>
                            {[
                                "Source",
                                "Type",
                                "Status",
                                "Last Sync",
                                "Leads",
                                "Actions",
                            ].map((heading) => (
                                <th
                                    className="text-left px-4 py-3"
                                    key={heading}
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {items.map((source) => (
                            <tr
                                className="border-t border-white/5"
                                key={source._id}
                            >
                                {/* Name */}
                                <td className="px-4 py-4 font-medium">
                                    <div>{source.name}</div>

                                    {source.type ===
                                        "Hunter B2B" && (
                                        <div className="text-xs text-slate-500 mt-1 max-w-[360px] truncate">
                                            {source.searchParams?.query ||
                                                "Hunter B2B"}
                                        </div>
                                    )}
                                </td>

                                {/* Type */}
                                <td className="px-4 text-slate-400">
                                    {source.type}
                                </td>

                                {/* Status */}
                                <td className="px-4">
                                    <span
                                        className={
                                            source.enabled
                                                ? "text-cyan"
                                                : "text-slate-600"
                                        }
                                    >
                                        {source.enabled
                                            ? "Active"
                                            : "Disabled"}
                                    </span>
                                </td>

                                {/* Last sync */}
                                <td className="px-4 text-slate-500">
                                    {source.lastSync
                                        ? new Date(
                                              source.lastSync
                                          ).toLocaleString()
                                        : "Never"}
                                </td>

                                {/* Leads */}
                                <td className="px-4">
                                    {source.leadsCollected || 0}
                                </td>

                                {/* Actions */}
                                <td className="px-4">
                                    <div className="flex gap-2 py-3">
                                        <button
                                            title="Sync"
                                            disabled={
                                                syncingId ===
                                                source._id
                                            }
                                            onClick={() =>
                                                sync(
                                                    source._id
                                                )
                                            }
                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40"
                                        >
                                            <RefreshCw
                                                size={15}
                                                className={
                                                    syncingId ===
                                                    source._id
                                                        ? "animate-spin"
                                                        : ""
                                                }
                                            />
                                        </button>

                                        <button
                                            title={
                                                source.enabled
                                                    ? "Disable"
                                                    : "Enable"
                                            }
                                            onClick={() =>
                                                toggle(
                                                    source
                                                )
                                            }
                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                                        >
                                            <Power size={15} />
                                        </button>

                                        <button
                                            title="Delete"
                                            onClick={() =>
                                                del(
                                                    source._id
                                                )
                                            }
                                            className="p-2 rounded-lg bg-white/5 text-red-300 hover:bg-white/10"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {loading && (
                    <div className="p-10 text-center text-slate-500">
                        Loading sources...
                    </div>
                )}

                {!loading && !items.length && (
                    <div className="p-10 text-center text-slate-500">
                        No sources. Add RSS, Reddit, GitHub,
                        Hunter B2B, or a permitted public API.
                    </div>
                )}
            </div>

            {/* Add source modal */}
            {open && (
                <div className="fixed inset-0 z-50 bg-black/70 grid place-items-center p-4">
                    <div className="glass rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-auto">
                        {/* Modal header */}
                        <div className="flex justify-between">
                            <h2 className="text-xl font-semibold">
                                Add lead source
                            </h2>

                            <button
                                onClick={() =>
                                    setOpen(false)
                                }
                                className="text-slate-400 hover:text-white text-xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Form */}
                        <div className="grid md:grid-cols-2 gap-4 mt-5">
                            {/* Name */}
                            <label className="text-sm">
                                Name

                                <input
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    className="field"
                                    placeholder="Kognitribe SaaS India"
                                />
                            </label>

                            {/* Type */}
                            <label className="text-sm">
                                Type

                                <select
                                    value={form.type}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            type: e.target.value,
                                        })
                                    }
                                    className="field"
                                >
                                    <option value="RSS">
                                        RSS
                                    </option>

                                    <option value="Reddit">
                                        Reddit
                                    </option>

                                    <option value="GitHub">
                                        GitHub
                                    </option>

                                    {/* NEW */}
                                    <option value="Hunter B2B">
                                        Hunter B2B
                                    </option>

                                    <option value="Opportunity API">
                                        Opportunity API
                                    </option>

                                    <option value="Custom API">
                                        Custom API
                                    </option>
                                </select>
                            </label>

                            {/* Hunter B2B fields */}
                            {form.type === "Hunter B2B" && (
                                <>
                                    <div className="md:col-span-2 p-4 rounded-xl border border-accent/20 bg-accent/5">
                                        <div className="text-sm font-semibold">
                                            Hunter B2B Discovery
                                        </div>

                                        <div className="text-xs text-slate-500 mt-1">
                                            Find B2B companies and,
                                            optionally, professional
                                            decision-maker emails.
                                        </div>
                                    </div>

                                    <label className="text-sm md:col-span-2">
                                        B2B Search Query

                                        <input
                                            value={
                                                form.searchQuery
                                            }
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    searchQuery:
                                                        e.target.value,
                                                })
                                            }
                                            className="field"
                                            placeholder="SaaS companies in India"
                                        />

                                        <span className="text-xs text-slate-500">
                                            Example: SaaS companies in
                                            India
                                        </span>
                                    </label>

                                    <label className="text-sm">
                                        Companies per sync

                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={
                                                form.maxCompanies
                                            }
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    maxCompanies:
                                                        Number(
                                                            e.target.value
                                                        ),
                                                })
                                            }
                                            className="field"
                                        />

                                        <span className="text-xs text-slate-500">
                                            Start with 5 while testing.
                                        </span>
                                    </label>

                                    <label className="text-sm flex items-center gap-3 mt-6">
                                        <input
                                            type="checkbox"
                                            checked={
                                                form.includeContacts
                                            }
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    includeContacts:
                                                        e.target.checked,
                                                })
                                            }
                                        />

                                        Find decision-maker emails
                                    </label>
                                </>
                            )}

                            {/* URL - not required for Hunter */}
                            {form.type !== "Hunter B2B" && (
                                <label className="text-sm md:col-span-2">
                                    API/RSS URL

                                    <input
                                        value={form.apiUrl}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                apiUrl: e.target.value,
                                            })
                                        }
                                        className="field"
                                        placeholder="https://..."
                                    />
                                </label>
                            )}

                            {/* Keywords */}
                            {form.type !== "Hunter B2B" && (
                                <label className="text-sm md:col-span-2">
                                    Keywords

                                    <input
                                        value={form.keywords}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                keywords:
                                                    e.target.value,
                                            })
                                        }
                                        className="field"
                                        placeholder="react, developer, startup"
                                    />
                                </label>
                            )}

                            {/* Subreddits */}
                            {form.type === "Reddit" && (
                                <label className="text-sm md:col-span-2">
                                    Subreddits (Reddit only)

                                    <input
                                        value={
                                            form.subreddits
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                subreddits:
                                                    e.target.value,
                                            })
                                        }
                                        className="field"
                                        placeholder="forhire, startups"
                                    />
                                </label>
                            )}

                            {/* Polling */}
                            <label className="text-sm">
                                Polling minutes

                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        form.pollingInterval
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            pollingInterval:
                                                Number(
                                                    e.target.value
                                                ),
                                        })
                                    }
                                    className="field"
                                />
                            </label>
                        </div>

                        {/* Save */}
                        <button
                            onClick={save}
                            disabled={
                                saving ||
                                !form.name.trim()
                            }
                            className="mt-5 w-full py-3 rounded-xl bg-accent disabled:opacity-40"
                        >
                            {saving
                                ? "Saving..."
                                : "Save Source"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}