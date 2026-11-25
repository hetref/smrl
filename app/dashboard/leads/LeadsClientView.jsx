"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Mail,
  Download,
  Copy,
  ExternalLink,
  Filter,
  CheckCircle2,
  Users,
  Link2,
  Calendar,
  Layers,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/app/components/ToastContext";

export default function LeadsClientView({ initialLeads, gatedLinks }) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [selectedLinkId, setSelectedLinkId] = useState("all");
  const [viewMode, setViewMode] = useState("all"); // "all" | "unique"
  const [sortBy, setSortBy] = useState("latest"); // "latest" | "oldest" | "email"
  const [copiedEmail, setCopiedEmail] = useState(null);
  const { success } = useToast();

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    success("Copied to clipboard", email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleCopyAllEmails = () => {
    const emailList = Array.from(new Set(filteredLeads.map((l) => l.email))).join(", ");
    navigator.clipboard.writeText(emailList);
    success("All emails copied!", `${Array.from(new Set(filteredLeads.map((l) => l.email))).length} unique email addresses copied to clipboard.`);
  };

  // Compute unique emails count
  const uniqueEmailsCount = useMemo(() => {
    return new Set(leads.map((l) => l.email.toLowerCase())).size;
  }, [leads]);

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Link filter
    if (selectedLinkId !== "all") {
      result = result.filter((l) => l.shortUrl.id === selectedLinkId);
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.email.toLowerCase().includes(q) ||
          l.shortUrl.slug.toLowerCase().includes(q) ||
          (l.shortUrl.leadTitle && l.shortUrl.leadTitle.toLowerCase().includes(q))
      );
    }

    // Deduplicate if in unique mode
    if (viewMode === "unique") {
      const seen = new Set();
      result = result.filter((l) => {
        const lower = l.email.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "email") {
        return a.email.localeCompare(b.email);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [leads, selectedLinkId, search, viewMode, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Submissions */}
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-5.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Submissions
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Mail className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {leads.length.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            OTP verifications across all links
          </p>
        </div>

        {/* Unique Subscribers */}
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-5.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Unique Contacts
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {uniqueEmailsCount.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            Distinct individual email addresses
          </p>
        </div>

        {/* Gated Links */}
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-5.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Gated Links
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Link2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {gatedLinks.length}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            Active email-gated short links
          </p>
        </div>

        {/* Latest Activity */}
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-5.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Latest Lead
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-lg font-bold truncate text-zinc-950 dark:text-white">
            {leads[0]
              ? new Date(leads[0].createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : "No activity"}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            {leads[0]
              ? new Date(leads[0].createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Awaiting first submission"}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search by email address, short link or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200/90 bg-white pl-10 pr-9 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 shadow-sm transition-all focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-white dark:focus:ring-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Link Dropdown & Sort */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {/* Link Selector */}
            <select
              value={selectedLinkId}
              onChange={(e) => setSelectedLinkId(e.target.value)}
              className="rounded-2xl border border-zinc-200/90 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:ring-white"
            >
              <option value="all">All Short Links ({leads.length})</option>
              {gatedLinks.map((link) => (
                <option key={link.id} value={link.id}>
                  /{link.slug} {link.leadTitle ? `(${link.leadTitle})` : ""} · {link.leadCount} leads
                </option>
              ))}
            </select>

            {/* Sort Menu */}
            <div className="flex items-center gap-1 rounded-2xl border border-zinc-200/90 bg-white p-1 text-xs dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
              <span className="px-2 text-[11px] text-zinc-400 flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" />
                Sort:
              </span>
              <button
                type="button"
                onClick={() => setSortBy("latest")}
                className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-all ${
                  sortBy === "latest"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                Latest
              </button>
              <button
                type="button"
                onClick={() => setSortBy("oldest")}
                className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-all ${
                  sortBy === "oldest"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                Oldest
              </button>
              <button
                type="button"
                onClick={() => setSortBy("email")}
                className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-all ${
                  sortBy === "email"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                A-Z
              </button>
            </div>
          </div>
        </div>

        {/* View Mode Pills & Bulk Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`rounded-xl px-3 py-1 text-xs font-medium transition-all ${
                viewMode === "all"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              All Submissions ({leads.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode("unique")}
              className={`rounded-xl px-3 py-1 text-xs font-medium transition-all ${
                viewMode === "unique"
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              Unique Contacts ({uniqueEmailsCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {filteredLeads.length > 0 && (
              <button
                type="button"
                onClick={handleCopyAllEmails}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                title="Copy comma-separated unique email addresses"
              >
                <Copy className="h-3 w-3" />
                <span>Copy All Emails</span>
              </button>
            )}

            <div className="text-[11px] text-zinc-500">
              Showing <strong className="text-zinc-900 dark:text-white">{filteredLeads.length}</strong> leads
            </div>
          </div>
        </div>
      </div>

      {/* Cumulative Leads Table */}
      {filteredLeads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-white/60 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
            <Mail className="h-6 w-6" />
          </div>
          {search || selectedLinkId !== "all" ? (
            <>
              <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                No matching leads found
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Try clearing your search terms or selecting another link.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedLinkId("all");
                }}
                className="mt-4 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Reset Filters
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                No captured leads yet
              </p>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                Create a short link with the "Require Verified Email" gate enabled to start collecting verified leads.
              </p>
              <Link
                href="/dashboard/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Create Email-Gated Link
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Verified Email</th>
                  <th className="px-6 py-4">Captured Via Link</th>
                  <th className="px-6 py-4">Gate Prompt / Title</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30"
                  >
                    {/* Email Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">
                          {lead.email}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(lead.email)}
                          className="rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                          title="Copy email address"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    {/* Source Link Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/urls/${lead.shortUrl.id}/stats`}
                          className="font-mono text-xs font-medium text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1"
                          title="View link statistics"
                        >
                          <span>/{lead.shortUrl.slug}</span>
                        </Link>
                        <a
                          href={`/r/${lead.shortUrl.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                          title="Open short link in new tab"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </td>

                    {/* Lead Title */}
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">
                      {lead.shortUrl.leadTitle || (
                        <span className="italic text-zinc-400 text-[11px]">
                          Default Gate
                        </span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-[11px] text-zinc-500">
                      {new Date(lead.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Client IP */}
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-[11px] text-zinc-400">
                      {lead.ip ? `${lead.ip.slice(0, 15)}...` : "Anonymized"}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        OTP Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
