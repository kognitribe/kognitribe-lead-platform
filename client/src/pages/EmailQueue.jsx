import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Check, Send, RefreshCw, Edit3, Eye } from "lucide-react";

export default function EmailQueue() {
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({
        subject: "",
        body: "",
    });

    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    /*
     * Load emails from backend.
     */
    const load = async () => {
        try {
            setLoading(true);

            const response = await api.get("/emails");

            setItems(response.data.items || response.data || []);
        } catch (error) {
            console.error("Failed to load emails:", error);

            setMsg(
                error.response?.data?.message ||
                    "Failed to load email queue."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
     * IMPORTANT:
     *
     * Do NOT do:
     *
     * useEffect(load, []);
     *
     * because load() returns a Promise.
     */
    useEffect(() => {
        load();
    }, []);

    /*
     * Open email review modal.
     */
    const open = (email) => {
        setSelected(email);

        setForm({
            subject: email.subject || "",
            body: email.body || "",
        });

        setMsg("");
    };

    /*
     * Save edited email.
     */
    const save = async () => {
        if (!selected) return;

        try {
            setActionLoading(true);
            setMsg("");

            await api.put(`/emails/${selected._id}`, form);

            setMsg("Email saved successfully.");

            await load();

            setSelected(null);
        } catch (error) {
            console.error("Save failed:", error);

            setMsg(
                error.response?.data?.message ||
                    "Failed to save email."
            );
        } finally {
            setActionLoading(false);
        }
    };

    /*
     * Approve / reject / regenerate / send.
     */
    const action = async (path) => {
        if (!selected) return;

        try {
            setActionLoading(true);
            setMsg("");

            await api.post(
                `/emails/${selected._id}/${path}`
            );

            if (path === "send") {
                setMsg("Email sent successfully.");

                await load();

                setSelected(null);
                return;
            }

            if (path === "approve") {
                setMsg("Email approved successfully.");
            } else if (path === "reject") {
                setMsg("Email rejected.");
            } else if (path === "regenerate") {
                setMsg("Email regenerated.");
            } else {
                setMsg("Updated successfully.");
            }

            await load();

            /*
             * Reload the currently selected email
             * after regenerate/approve/reject.
             */
            try {
                const response = await api.get(
                    `/emails/${selected._id}`
                );

                const updatedEmail =
                    response.data.email ||
                    response.data;

                setSelected(updatedEmail);

                setForm({
                    subject: updatedEmail.subject || "",
                    body: updatedEmail.body || "",
                });
            } catch (error) {
                /*
                 * If the email no longer exists after reject,
                 * close the modal instead of breaking the UI.
                 */
                if (path === "reject") {
                    setSelected(null);
                }
            }
        } catch (error) {
            console.error(
                `Email action "${path}" failed:`,
                error
            );

            setMsg(
                error.response?.data?.message ||
                    "Action failed."
            );
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div>
                <div className="text-accent text-xs uppercase tracking-widest">
                    Outreach
                </div>

                <h1 className="text-3xl font-semibold mt-1">
                    Email Queue
                </h1>

                <p className="text-sm text-slate-500 mt-2">
                    Every generated email must be reviewed before
                    sending.
                </p>
            </div>

            {/* Message */}
            {msg && (
                <div className="mt-4 text-sm text-cyan">
                    {msg}
                </div>
            )}

            {/* Email table */}
            <div className="glass rounded-2xl mt-6 overflow-auto">
                <table className="w-full text-sm">
                    <thead className="bg-white/[.03] text-slate-500">
                        <tr>
                            {[
                                "Lead",
                                "Subject",
                                "Status",
                                "Created",
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
                        {items.map((email) => (
                            <tr
                                className="border-t border-white/5"
                                key={email._id}
                            >
                                {/* Lead */}
                                <td className="px-4 py-4">
                                    <div className="font-medium">
                                        {email.leadId?.name ||
                                            "Unknown"}

                                        {email.leadId?.company && (
                                            <span className="text-slate-500">
                                                {" "}
                                                •{" "}
                                                {
                                                    email
                                                        .leadId
                                                        .company
                                                }
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-xs text-slate-500">
                                        {email.leadId?.email ||
                                            "No public email"}
                                    </div>
                                </td>

                                {/* Subject */}
                                <td className="px-4 max-w-[320px] truncate">
                                    {email.subject || "—"}
                                </td>

                                {/* Status */}
                                <td className="px-4">
                                    <span className="px-2 py-1 rounded-lg bg-white/5 text-xs">
                                        {email.status ||
                                            "Draft"}
                                    </span>
                                </td>

                                {/* Created */}
                                <td className="px-4 text-slate-500">
                                    {email.createdAt
                                        ? new Date(
                                              email.createdAt
                                          ).toLocaleDateString()
                                        : "—"}
                                </td>

                                {/* Actions */}
                                <td className="px-4">
                                    <button
                                        onClick={() =>
                                            open(email)
                                        }
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Loading */}
                {loading && (
                    <div className="p-10 text-center text-slate-500">
                        Loading email queue...
                    </div>
                )}

                {/* Empty */}
                {!loading && !items.length && (
                    <div className="p-10 text-center text-slate-500">
                        No generated emails yet. Open a lead and
                        generate one.
                    </div>
                )}
            </div>

            {/* Review modal */}
            {selected && (
                <div className="fixed inset-0 z-50 bg-black/70 grid place-items-center p-4">
                    <div className="glass w-full max-w-3xl rounded-2xl p-6 max-h-[90vh] overflow-auto">

                        {/* Modal header */}
                        <div className="flex justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Review email
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    {selected.leadId?.name ||
                                        "Unknown"}

                                    {" • "}

                                    {selected.leadId?.email ||
                                        "No public email"}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setSelected(null)
                                }
                                className="text-slate-400 hover:text-white text-xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Subject */}
                        <label className="block mt-6 text-sm">
                            Subject

                            <input
                                value={form.subject}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        subject:
                                            e.target.value,
                                    })
                                }
                                disabled={actionLoading}
                                className="mt-2 w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 outline-none focus:border-accent"
                            />
                        </label>

                        {/* Body */}
                        <label className="block mt-4 text-sm">
                            Body

                            <textarea
                                rows="12"
                                value={form.body}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        body: e.target.value,
                                    })
                                }
                                disabled={actionLoading}
                                className="mt-2 w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 outline-none focus:border-accent"
                            />
                        </label>

                        {/* Warning */}
                        <div className="mt-5 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-xs text-yellow-200">
                            Verify factual claims and recipient
                            suitability before approval. The
                            backend will repeat suppression and
                            sending-limit checks.
                        </div>

                        {/* Actions */}
                        <div className="mt-5 flex flex-wrap justify-end gap-2">

                            {/* Save */}
                            <button
                                onClick={save}
                                disabled={actionLoading}
                                className="px-4 py-2 rounded-xl border border-white/10 flex gap-2 items-center disabled:opacity-40"
                            >
                                <Edit3 size={16} />

                                Save
                            </button>

                            {/* Regenerate */}
                            <button
                                onClick={() =>
                                    action("regenerate")
                                }
                                disabled={actionLoading}
                                className="px-4 py-2 rounded-xl border border-white/10 flex gap-2 items-center disabled:opacity-40"
                            >
                                <RefreshCw
                                    size={16}
                                    className={
                                        actionLoading
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                Regenerate
                            </button>

                            {/* Reject */}
                            <button
                                onClick={() =>
                                    action("reject")
                                }
                                disabled={actionLoading}
                                className="px-4 py-2 rounded-xl border border-red-500/20 text-red-300 disabled:opacity-40"
                            >
                                Reject
                            </button>

                            {/* Approve / Send */}
                            {selected.status ===
                            "Approved" ? (
                                <button
                                    onClick={() =>
                                        action("send")
                                    }
                                    disabled={actionLoading}
                                    className="px-4 py-2 rounded-xl bg-accent flex gap-2 items-center disabled:opacity-40"
                                >
                                    <Send size={16} />

                                    Send
                                </button>
                            ) : (
                                <button
                                    onClick={() =>
                                        action("approve")
                                    }
                                    disabled={actionLoading}
                                    className="px-4 py-2 rounded-xl bg-cyan text-ink font-semibold flex gap-2 items-center disabled:opacity-40"
                                >
                                    <Check size={16} />

                                    Approve
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}