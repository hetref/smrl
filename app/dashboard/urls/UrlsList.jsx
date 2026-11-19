"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ExternalLink,
  BarChart3,
  Edit3,
  QrCode as QrIcon,
  Pause,
  Play,
  Lock,
  Clock,
  Ban,
  Globe,
  SlidersHorizontal,
  ArrowUpDown,
  Plus,
  RotateCcw,
} from "lucide-react";
import CopyButton from "./CopyButton";
import DeleteButton from "./DeleteButton";
import QrModal from "./QrModal";
import ConfirmModal from "@/app/components/ConfirmModal";
import { useToast } from "@/app/components/ToastContext";

export default function UrlsList({ initialUrls }) {
  const [urls, setUrls] = useState(initialUrls);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "active", "paused", "protected"
  const [sortBy, setSortBy] = useState("newest"); // "newest", "clicks", "oldest"
  const [activeQr, setActiveQr] = useState(null); // { slug, targetUrl }
  const [togglingId, setTogglingId] = useState(null);
  const [confirmResetUrl, setConfirmResetUrl] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const { success, error } = useToast();

  const handleToggleActive = async (url) => {
    const nextActive = !url.isActive;
    setTogglingId(url.id);

    // Optimistic update
    setUrls((prev) =>
      prev.map((u) => (u.id === url.id ? { ...u, isActive: nextActive } : u))
    );

    try {
      const res = await fetch("/api/urls/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: url.id,
          isActive: nextActive,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      success(
        nextActive ? "Link resumed" : "Link paused",
        `Redirects for /${url.slug} are now ${nextActive ? "active" : "paused"}.`
      );
    } catch (err) {
      // Rollback
      setUrls((prev) =>
        prev.map((u) => (u.id === url.id ? { ...u, isActive: url.isActive } : u))
      );
      error("Status update failed", "Could not save your changes. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleResetClicks = async () => {
    if (!confirmResetUrl) return;
    const url = confirmResetUrl;
    setIsResetting(true);

    // Optimistic update
    setUrls((prev) =>
      prev.map((u) => (u.id === url.id ? { ...u, clicks: 0 } : u))
    );

    try {
      const res = await fetch("/api/urls/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: url.id,
          resetClicks: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to reset clicks");
      }

      success("Clicks counter reset", `Click count for /${url.slug} is now 0.`);
      setConfirmResetUrl(null);
    } catch (err) {
      // Rollback
      setUrls((prev) =>
        prev.map((u) => (u.id === url.id ? { ...u, clicks: url.clicks } : u))
      );
      error("Reset failed", err.message || "Could not reset clicks. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleted = (id) => {
    setUrls((prev) => prev.filter((u) => u.id !== id));
  };

  const filteredUrls = useMemo(() => {
    let result = [...urls];

    // Status filter
    if (filterStatus === "active") {
      result = result.filter((u) => u.isActive);
    } else if (filterStatus === "paused") {
      result = result.filter((u) => !u.isActive);
    } else if (filterStatus === "protected") {
      result = result.filter((u) => u.isPasswordProtected);
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.slug.toLowerCase().includes(q) ||
          u.targetUrl.toLowerCase().includes(q)
      );
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === "clicks") {
        return b.clicks - a.clicks;
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [urls, search, filterStatus, sortBy]);

  const totalClicksFiltered = useMemo(() => {
    return filteredUrls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  }, [filteredUrls]);

  return (
    <div className="space-y-6">
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
              placeholder="Search by slug or destination URL..."
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

          {/* Sort Menu */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1 rounded-2xl border border-zinc-200/90 bg-white p-1 text-xs dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
              <span className="px-2 text-[11px] text-zinc-400 flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" />
                Sort:
              </span>
              <button
                type="button"
                onClick={() => setSortBy("newest")}
                className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-all ${
                  sortBy === "newest"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                Latest
              </button>
              <button
                type="button"
                onClick={() => setSortBy("clicks")}
                className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-all ${
                  sortBy === "clicks"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                Top Clicks
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
            </div>
          </div>
        </div>

        {/* Filter Pills & Summary Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`rounded-xl px-3 py-1 text-xs font-medium transition-all ${
                filterStatus === "all"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              All ({urls.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("active")}
              className={`rounded-xl px-3 py-1 text-xs font-medium transition-all ${
                filterStatus === "active"
                  ? "bg-emerald-600 text-white dark:bg-emerald-500"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              Active ({urls.filter((u) => u.isActive).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("paused")}
              className={`rounded-xl px-3 py-1 text-xs font-medium transition-all ${
                filterStatus === "paused"
                  ? "bg-amber-600 text-white dark:bg-amber-500"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              Paused ({urls.filter((u) => !u.isActive).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("protected")}
              className={`rounded-xl px-3 py-1 text-xs font-medium transition-all ${
                filterStatus === "protected"
                  ? "bg-purple-600 text-white dark:bg-purple-500"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              Protected ({urls.filter((u) => u.isPasswordProtected).length})
            </button>
          </div>

          <div className="text-[11px] text-zinc-500">
            Showing <strong className="text-zinc-900 dark:text-white">{filteredUrls.length}</strong> links ·{" "}
            <strong className="text-zinc-900 dark:text-white">{totalClicksFiltered.toLocaleString()}</strong> clicks
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredUrls.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-white/60 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
            <Search className="h-6 w-6" />
          </div>
          {search || filterStatus !== "all" ? (
            <>
              <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                No matching short links
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Try adjusting your search terms or filter criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilterStatus("all");
                }}
                className="mt-4 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Reset Filters
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                No links created yet
              </p>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                Create your first trackable short link to begin collecting analytics and managing security rules.
              </p>
              <Link
                href="/dashboard/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Create First Link
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block rounded-3xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left">
                <thead className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:text-zinc-400">
                  <tr>
                    <th className="px-6 py-4 min-w-[260px]">Short Link</th>
                    <th className="px-6 py-4 min-w-[260px]">Destination</th>
                    <th className="px-6 py-4 text-center min-w-[90px]">Clicks</th>
                    <th className="px-6 py-4 min-w-[120px]">Created</th>
                    <th className="px-6 py-4 text-right min-w-[230px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                {filteredUrls.map((url) => {
                  const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);
                  const isCapped = url.maxClicks && url.clicks >= url.maxClicks;

                  return (
                    <tr
                      key={url.id}
                      className="group transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30"
                    >
                      {/* Short Link Column */}
                      <td className="px-6 py-4 whitespace-nowrap min-w-[260px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">
                              /{url.slug}
                            </span>
                            <a
                              href={`/r/${url.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                              title="Open link in new tab"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <CopyButton slug={url.slug} />
                          </div>

                          {/* Status Indicators */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {url.isActive ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                <Pause className="h-2.5 w-2.5" />
                                Paused
                              </span>
                            )}

                            {url.isPasswordProtected && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                                <Lock className="h-2.5 w-2.5" />
                                Protected
                              </span>
                            )}

                            {isExpired && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                                <Clock className="h-2.5 w-2.5" />
                                Expired
                              </span>
                            )}

                            {isCapped && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                                <Ban className="h-2.5 w-2.5" />
                                Capped
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Destination Column */}
                      <td className="px-6 py-4 min-w-[260px]">
                        <div className="flex items-center gap-2 max-w-sm">
                          <Globe className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                          <span
                            className="truncate font-mono text-[11px] text-zinc-600 dark:text-zinc-400"
                            title={url.targetUrl}
                          >
                            {url.targetUrl}
                          </span>
                        </div>
                      </td>

                      {/* Clicks Column */}
                      <td className="px-6 py-4 text-center whitespace-nowrap min-w-[90px]">
                        <span className="inline-flex items-center rounded-xl bg-zinc-100 px-3 py-1 font-mono text-xs font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200">
                          {url.clicks.toLocaleString()}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-500 text-[11px] min-w-[120px]">
                        {new Date(url.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-right whitespace-nowrap min-w-[230px]">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Analytics */}
                          <Link
                            href={`/dashboard/urls/${url.id}/stats`}
                            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                            title="Analytics & Logs"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Link>

                          {/* Edit */}
                          <Link
                            href={`/dashboard/urls/${url.id}/edit`}
                            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                            title="Edit Link Configuration"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>

                          {/* Reset Clicks */}
                          <button
                            type="button"
                            onClick={() => setConfirmResetUrl(url)}
                            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:text-zinc-400 dark:hover:bg-amber-950/40 dark:hover:text-amber-400"
                            title="Reset clicks counter to 0"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>

                          {/* QR Code */}
                          <button
                            type="button"
                            onClick={() => setActiveQr(url)}
                            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                            title="View QR Code"
                          >
                            <QrIcon className="h-4 w-4" />
                          </button>

                          {/* Toggle Active / Pause */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(url)}
                            disabled={togglingId === url.id}
                            className={`rounded-lg p-1.5 transition-all ${
                              url.isActive
                                ? "text-zinc-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 dark:hover:text-amber-400"
                                : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400"
                            }`}
                            title={url.isActive ? "Pause redirects" : "Resume redirects"}
                          >
                            {url.isActive ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>

                          {/* Delete */}
                          <DeleteButton
                            id={url.id}
                            slug={url.slug}
                            onDeleted={handleDeleted}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Mobile Card View (Shown on screens < 768px) */}
          <div className="grid gap-3 md:hidden">
            {filteredUrls.map((url) => {
              const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);
              const isCapped = url.maxClicks && url.clicks >= url.maxClicks;

              return (
                <div
                  key={url.id}
                  className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-zinc-950 dark:text-white">
                        /{url.slug}
                      </span>
                      <a
                        href={`/r/${url.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1 text-zinc-400 hover:text-black dark:hover:text-white"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <span className="rounded-xl bg-zinc-100 px-2.5 py-0.5 font-mono text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                      {url.clicks} clicks
                    </span>
                  </div>

                  <div className="truncate text-xs font-mono text-zinc-500">
                    {url.targetUrl}
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {url.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        <Pause className="h-2.5 w-2.5" />
                        Paused
                      </span>
                    )}
                    {url.isPasswordProtected && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                        <Lock className="h-2.5 w-2.5" />
                        Protected
                      </span>
                    )}
                    {isExpired && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                        <Clock className="h-2.5 w-2.5" />
                        Expired
                      </span>
                    )}
                    {isCapped && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                        <Ban className="h-2.5 w-2.5" />
                        Capped
                      </span>
                    )}
                  </div>

                  {/* Mobile Actions Bar */}
                  <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <CopyButton slug={url.slug} />
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/urls/${url.id}/stats`}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Analytics"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/urls/${url.id}/edit`}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmResetUrl(url)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 dark:hover:text-amber-400"
                        title="Reset Clicks"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveQr(url)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="QR Code"
                      >
                        <QrIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(url)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title={url.isActive ? "Pause" : "Resume"}
                      >
                        {url.isActive ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <DeleteButton
                        id={url.id}
                        slug={url.slug}
                        onDeleted={handleDeleted}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* QR Code Modal */}
      {activeQr && (
        <QrModal
          isOpen={!!activeQr}
          onClose={() => setActiveQr(null)}
          slug={activeQr.slug}
          targetUrl={activeQr.targetUrl}
        />
      )}

      {/* Reset Clicks Confirmation Modal */}
      {confirmResetUrl && (
        <ConfirmModal
          isOpen={!!confirmResetUrl}
          onClose={() => setConfirmResetUrl(null)}
          onConfirm={handleResetClicks}
          isLoading={isResetting}
          title="Reset click count to 0?"
          description={`Are you sure you want to reset clicks for "/${confirmResetUrl.slug}"? The counter will be set to 0 and all visitor click logs for this link will be permanently cleared.`}
          confirmText="Reset to 0"
          variant="warning"
          icon={RotateCcw}
        />
      )}
    </div>
  );
}
