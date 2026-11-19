"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Link2, ExternalLink, ArrowRight } from "lucide-react";
import CopyButton from "./urls/CopyButton";
import { useToast } from "@/app/components/ToastContext";

export default function QuickShorten() {
  const [targetUrl, setTargetUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdUrl, setCreatedUrl] = useState(null);
  const router = useRouter();
  const { success } = useToast();

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
      success("Short link created", data.shortUrl);
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to create short URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
            Quick Shorten
          </h2>
          <p className="text-[11px] text-zinc-500">
            Paste any long HTTPS destination to generate a clean branded short link.
          </p>
        </div>
      </div>

      <form onSubmit={handleShorten} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="url"
              required
              placeholder="https://example.com/very/long/destination/url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/60 px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 transition-all focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-white font-mono"
            />
          </div>
          <div className="w-full sm:w-48">
            <input
              type="text"
              placeholder="slug (optional)"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 font-mono transition-all focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !targetUrl}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-black px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 whitespace-nowrap cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Shortening...
              </span>
            ) : (
              <>
                <span>Shorten</span>
                <ArrowRight className="h-3 w-3" />
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
      </form>

      {/* Generated Result Banner */}
      {createdUrl && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-emerald-50/70 p-3.5 border border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-900/40 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-xs">
              ✓
            </span>
            <span className="font-mono text-xs font-semibold text-emerald-950 dark:text-emerald-200 truncate">
              {createdUrl.shortUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <CopyButton slug={createdUrl.slug} fullUrl={createdUrl.shortUrl} />
            <a
              href={`/r/${createdUrl.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-100"
            >
              <span>Visit</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
