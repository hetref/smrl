"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import CopyButton from "../urls/CopyButton";

export default function NewUrlPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setQrDataUrl("");

    try {
      const response = await fetch("/api/urls/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUrl,
          customSlug: customSlug.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create short URL");
        return;
      }

      setResult(data);

      // Generate QR code for result
      QRCode.toDataURL(data.shortUrl, { width: 240, margin: 2 })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});

      setTargetUrl("");
      setCustomSlug("");
    } catch (err) {
      setError("An error occurred while creating the URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://smrl.app";
  const displaySlug = customSlug.trim() || "random-slug";

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
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
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Overview
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          Create Short Link
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Turn long destination URLs into fast, trackable redirects.
        </p>
      </div>

      {/* Creation Form Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target URL */}
          <div className="space-y-2">
            <label
              htmlFor="targetUrl"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Destination URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="targetUrl"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com/very/long/destination/url"
              required
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-black placeholder-zinc-400 transition-all focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:bg-zinc-800"
            />
            <p className="text-[11px] text-zinc-400">
              Must begin with <code className="font-mono">https://</code>
            </p>
          </div>

          {/* Custom Slug */}
          <div className="space-y-2">
            <label
              htmlFor="customSlug"
              className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              <span>Custom Slug</span>
              <span className="text-[10px] lowercase font-normal text-zinc-400">
                optional
              </span>
            </label>
            <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50/50 overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black dark:border-zinc-800 dark:bg-zinc-800/50 dark:focus-within:border-white dark:focus-within:ring-white">
              <span className="px-3.5 text-xs font-mono text-zinc-400 select-none bg-zinc-100/50 py-3 dark:bg-zinc-800/60 border-r border-zinc-200 dark:border-zinc-800">
                /r/
              </span>
              <input
                type="text"
                id="customSlug"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="my-custom-name"
                pattern="[a-zA-Z0-9_-]{4,200}"
                className="w-full bg-transparent px-3 py-3 text-sm text-black placeholder-zinc-400 focus:outline-none dark:text-white dark:placeholder-zinc-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              4-200 characters (letters, numbers, dashes, and underscores only).
              Leave empty for an auto-generated random slug.
            </p>
          </div>

          {/* Live Link Preview Card */}
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/30">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Link Preview
            </p>
            <p className="font-mono text-xs font-medium text-black dark:text-white truncate">
              {currentOrigin}/r/{displaySlug}
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/80 dark:border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !targetUrl}
            className="w-full rounded-xl bg-black py-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? "Generating Short Link..." : "Create Short Link"}
          </button>
        </form>

        {/* Success Modal / Card */}
        {result && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">
                ✓
              </span>
              <h3 className="text-sm font-semibold text-emerald-950 dark:text-emerald-200">
                Short link ready!
              </h3>
            </div>

            {/* Generated Link Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-emerald-200/80 bg-white p-3 dark:border-emerald-900/40 dark:bg-zinc-900">
              <span className="font-mono text-xs font-semibold text-black dark:text-white truncate">
                {result.shortUrl}
              </span>
              <div className="flex items-center gap-2">
                <CopyButton slug={result.slug} />
                <a
                  href={`/r/${result.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded px-2.5 py-1 text-xs font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                >
                  Visit ↗
                </a>
              </div>
            </div>

            {/* QR Code and Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              {qrDataUrl && (
                <div className="p-2 bg-white rounded-lg border border-zinc-200 shadow-sm shrink-0">
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-24 h-24 object-contain"
                  />
                </div>
              )}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Your short link is now active and ready to share across platforms.
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                  <Link
                    href={`/dashboard/urls`}
                    className="rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    View in All Links
                  </Link>
                  <button
                    onClick={() => setResult(null)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Create Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
