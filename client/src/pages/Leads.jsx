import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Leads() {
    const [data, setData] = useState({
        items: [],
        pages: 1,
    });

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [source, setSource] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const load = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/leads", {
                params: {
                    page,
                    limit: 10,
                    search,
                    source,
                },
            });

            setData({
                items: response.data.items || [],
                pages: response.data.pages || 1,
            });
        } catch (err) {
            console.error("Failed to load leads:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to load leads. Please try again."
            );

            setData({
                items: [],
                pages: 1,
            });
        } finally {
            setLoading(false);
        }
    };

    /*
     * IMPORTANT:
     * Do NOT write:
     *
     * useEffect(load, [page, source]);
     *
     * because load() is async and returns a Promise.
     */
    useEffect(() => {
        load();
    }, [page, source]);

    const handleSearch = () => {
        setPage(1);
        load();
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleSourceChange = (e) => {
        setSource(e.target.value);
        setPage(1);
    };

    const handlePreviousPage = () => {
        setPage((currentPage) => Math.max(1, currentPage - 1));
    };

    const handleNextPage = () => {
        setPage((currentPage) =>
            Math.min(data.pages || 1, currentPage + 1)
        );
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap justify-between gap-4">
                <div>
                    <div className="text-accent text-xs uppercase tracking-widest">
                        Pipeline
                    </div>

                    <h1 className="text-3xl font-semibold mt-1">
                        Leads
                    </h1>
                </div>
            </div>

            {/* Search / Filters */}
            <div className="glass rounded-2xl p-4 mt-6 flex flex-wrap gap-3">
                {/* Search input */}
                <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-3 flex-1 min-w-[220px]">
                    <Search
                        size={16}
                        className="text-slate-500"
                    />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search name, company, title..."
                        className="bg-transparent py-2.5 outline-none w-full text-sm"
                    />
                </div>

                {/* Source */}
                <select
                    value={source}
                    onChange={handleSourceChange}
                    className="bg-black/20 border border-white/10 rounded-xl px-3 text-sm"
                >
                    <option value="">All sources</option>
                    <option value="Reddit">Reddit</option>
                    <option value="RSS">RSS</option>
                    <option value="GitHub">GitHub</option>
                    <option value="Opportunity API">
                        Opportunity API
                    </option>
                </select>

                {/* Search button */}
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-4 rounded-xl bg-accent text-sm disabled:opacity-50"
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="glass rounded-2xl mt-4 p-4 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Leads table */}
            <div className="glass rounded-2xl mt-4 overflow-auto">
                <table className="w-full text-sm">
                    <thead className="bg-white/[.03] text-slate-500">
                        <tr>
                            {[
                                "Lead",
                                "Source",
                                "Service",
                                "Score",
                                "Intent",
                                "Status",
                                "",
                            ].map((heading) => (
                                <th
                                    className="text-left px-4 py-3 font-medium"
                                    key={heading}
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {data.items.map((lead) => (
                            <tr
                                className="border-t border-white/5"
                                key={lead._id}
                            >
                                {/* Lead */}
                                <td className="px-4 py-4 min-w-[220px]">
                                    <Link
                                        className="font-medium hover:text-accent"
                                        to={`/leads/${lead._id}`}
                                    >
                                        {lead.name || "Unknown"}

                                        {lead.company && (
                                            <span className="text-slate-500">
                                                {" "}
                                                • {lead.company}
                                            </span>
                                        )}
                                    </Link>

                                    <div className="text-xs text-slate-500 mt-1">
                                        {lead.title || "—"}
                                    </div>
                                </td>

                                {/* Source */}
                                <td className="px-4 text-slate-400">
                                    {lead.source || "—"}
                                </td>

                                {/* Service */}
                                <td className="px-4 text-slate-400">
                                    {lead.matchedServices?.[0] || "—"}
                                </td>

                                {/* Score */}
                                <td className="px-4">
                                    <span
                                        className={`font-semibold ${
                                            lead.leadScore >= 75
                                                ? "text-cyan"
                                                : lead.leadScore >= 50
                                                ? "text-yellow-300"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        {lead.leadScore ?? 0}
                                    </span>
                                </td>

                                {/* Intent */}
                                <td className="px-4 text-slate-400">
                                    {lead.intent || "—"}
                                </td>

                                {/* Status */}
                                <td className="px-4">
                                    <span className="px-2 py-1 rounded-lg bg-white/5 text-xs">
                                        {lead.status || "New"}
                                    </span>
                                </td>

                                {/* Details */}
                                <td className="px-4">
                                    <Link
                                        to={`/leads/${lead._id}`}
                                        className="hover:text-accent"
                                    >
                                        <ExternalLink size={16} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Loading */}
                {loading && (
                    <div className="p-10 text-center text-slate-500">
                        Loading leads...
                    </div>
                )}

                {/* Empty */}
                {!loading && data.items.length === 0 && !error && (
                    <div className="p-10 text-center text-slate-500">
                        No leads found.
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-end items-center gap-3 mt-4 text-sm">
                <button
                    disabled={page <= 1 || loading}
                    onClick={handlePreviousPage}
                    className="p-2 rounded-lg bg-white/5 disabled:opacity-30"
                >
                    <ChevronLeft size={17} />
                </button>

                <span className="text-slate-500">
                    Page {page} / {Math.max(1, data.pages)}
                </span>

                <button
                    disabled={
                        page >= Math.max(1, data.pages) || loading
                    }
                    onClick={handleNextPage}
                    className="p-2 rounded-lg bg-white/5 disabled:opacity-30"
                >
                    <ChevronRight size={17} />
                </button>
            </div>
        </div>
    );
}