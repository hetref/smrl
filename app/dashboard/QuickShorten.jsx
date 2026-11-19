"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CopyButton from "./urls/CopyButton";

export default function QuickShorten() {
  const [targetUrl, setTargetUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdUrl, setCreatedUrl] = useState(null);
  const router = useRouter();

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!targetUrl) return;

    setLoading(true);
    setError("");
    setCreatedUrl(null);

    try {
      const res = await fetch("/api/urls/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUrl,
          customSlug: customSlug.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create short link");
      }

      setCreatedUrl(data);
      setTargetUrl("");
      setCustomSlug("");
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to create short URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-black dark:text-white">
          Quick Shorten
        </h2>
        <p className="text-xs text-zinc-500">
          Paste a long HTTPS link to instantly generate a branded short URL.
        </p>
      </div>

      <form onSubmit={handleShorten} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            required
            placeholder="https://example.com/very/long/destination/url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-sm text-black placeholder-zinc-400 transition-all focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:bg-zinc-800"
          />
          <input
            type="text"
            placeholder="custom-slug (optional)"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-sm text-black placeholder-zinc-400 font-mono transition-all focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:bg-zinc-800"
          />
          <button
            type="submit"
            disabled={loading || !targetUrl}
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 whitespace-nowrap"
          >
            {loading ? "Shortening..." : "Shorten URL"}
          </button>
        </div>

        {error && (
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </form>

      {/* Success Banner */}
      {createdUrl && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-900/40">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-xs">
              ✓
            </span>
            <span className="font-mono text-xs font-semibold text-emerald-900 dark:text-emerald-200 truncate">
              {createdUrl.shortUrl}
            </span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <CopyButton slug={createdUrl.slug} />
            <a
              href={`/r/${createdUrl.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-white"
            >
              Test ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
