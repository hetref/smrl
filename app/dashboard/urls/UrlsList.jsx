"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import CopyButton from "./CopyButton";
import DeleteButton from "./DeleteButton";
import QrModal from "./QrModal";

export default function UrlsList({ initialUrls }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "clicks", "oldest"
  const [activeQr, setActiveQr] = useState(null); // { slug, targetUrl }

  const filteredUrls = useMemo(() => {
    let result = [...initialUrls];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.slug.toLowerCase().includes(q) ||
          u.targetUrl.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "clicks") {
        return b.clicks - a.clicks;
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      // default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [initialUrls, search, sortBy]);

  const totalClicksFiltered = useMemo(() => {
    return filteredUrls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  }, [filteredUrls]);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & Sorting */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by slug or target URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-black placeholder-zinc-400 shadow-sm transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:ring-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-zinc-400 hover:text-black dark:hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort Controls & Stats Indicator */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-1 text-xs dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
            <button
              onClick={() => setSortBy("newest")}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                sortBy === "newest"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy("clicks")}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                sortBy === "clicks"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Top Clicks
            </button>
            <button
              onClick={() => setSortBy("oldest")}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                sortBy === "oldest"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Oldest
            </button>
          </div>
        </div>
      </div>

      {/* Results Header / Stats Count */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>
          Showing <strong className="text-black dark:text-white">{filteredUrls.length}</strong> link{filteredUrls.length !== 1 ? "s" : ""}
          {search && ` matching "${search}"`}
        </span>
        <span>
          Total Clicks in view: <strong className="text-black dark:text-white">{totalClicksFiltered.toLocaleString()}</strong>
        </span>
      </div>

      {/* Main Container */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {filteredUrls.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            {search ? (
              <>
                <p className="text-sm font-medium text-black dark:text-white">
                  No short links matching "{search}"
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Try checking for typos or searching by destination URL.
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-4 inline-block text-xs font-semibold text-black underline underline-offset-4 dark:text-white"
                >
                  Clear search filter
                </button>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-black dark:text-white">
                  No short links created yet
                </p>
                <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                  Create your first branded short link to begin tracking visitor analytics and clicks.
                </p>
                <Link
                  href="/dashboard/new"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  Create Your First Link →
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-3.5">Short Link & Slug</th>
                  <th className="px-6 py-3.5">Destination URL</th>
                  <th className="px-6 py-3.5 text-center">Clicks</th>
                  <th className="px-6 py-3.5">Date Created</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-sm">
                {filteredUrls.map((url) => (
                  <tr
                    key={url.id}
                    className="group transition-colors hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40"
                  >
                    {/* Slug & Quick Link */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-black dark:text-white">
                          /{url.slug}
                        </span>
                        <a
                          href={`/r/${url.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-800 dark:hover:text-white"
                          title="Open short link in new tab"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                        <CopyButton slug={url.slug} />
                      </div>
                    </td>

                    {/* Destination URL */}
                    <td className="px-6 py-4">
                      <div className="max-w-xs md:max-w-md truncate text-xs text-zinc-600 dark:text-zinc-400 font-mono" title={url.targetUrl}>
                        {url.targetUrl}
                      </div>
                    </td>

                    {/* Click Count Badge */}
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                        {url.clicks.toLocaleString()}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-zinc-500">
                      {new Date(url.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Actions Toolbar */}
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Stats Button */}
                        <Link
                          href={`/dashboard/urls/${url.id}/stats`}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-black dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                          title="View analytics & click log"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                          </svg>
                          Analytics
                        </Link>

                        {/* QR Code Button */}
                        <button
                          onClick={() => setActiveQr(url)}
                          className="rounded-lg border border-zinc-200 p-1 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-black dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                          title="View QR Code"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                          </svg>
                        </button>

                        {/* Edit Button */}
                        <Link
                          href={`/dashboard/urls/${url.id}/edit`}
                          className="rounded-lg border border-zinc-200 p-1 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-black dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                          title="Edit URL & slug"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Link>

                        {/* Delete Button */}
                        <DeleteButton id={url.id} slug={url.slug} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {activeQr && (
        <QrModal
          isOpen={!!activeQr}
          onClose={() => setActiveQr(null)}
          slug={activeQr.slug}
          targetUrl={activeQr.targetUrl}
        />
      )}
    </div>
  );
}
