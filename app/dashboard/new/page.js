"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import CopyButton from "../urls/CopyButton";

export default function NewUrlPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [password, setPassword] = useState("");
  const [enablePassword, setEnablePassword] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [enableExpires, setEnableExpires] = useState(false);
  const [maxClicks, setMaxClicks] = useState("");
  const [enableMaxClicks, setEnableMaxClicks] = useState(false);
  const [showUtmBuilder, setShowUtmBuilder] = useState(false);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
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
          password: enablePassword && password.trim() ? password.trim() : undefined,
          expiresAt: enableExpires && expiresAt ? expiresAt : undefined,
          maxClicks: enableMaxClicks && maxClicks ? maxClicks : undefined,
          utmSource: showUtmBuilder && utmSource.trim() ? utmSource.trim() : undefined,
          utmMedium: showUtmBuilder && utmMedium.trim() ? utmMedium.trim() : undefined,
          utmCampaign: showUtmBuilder && utmCampaign.trim() ? utmCampaign.trim() : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create short URL");
        return;
      }

      setResult(data);

      QRCode.toDataURL(data.shortUrl, { width: 240, margin: 2 })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});

      setTargetUrl("");
      setCustomSlug("");
      setPassword("");
      setExpiresAt("");
      setMaxClicks("");
      setUtmSource("");
      setUtmMedium("");
      setUtmCampaign("");
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
          Turn long destination URLs into secure, trackable redirects with advanced gates.
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

          {/* Advanced Protection & Gates Collapsible Sections */}
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Security & Controls
            </p>

            {/* Password Protection Gate */}
            <div className="rounded-xl border border-zinc-200/80 p-4 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-zinc-600 dark:text-zinc-400"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="text-xs font-semibold text-black dark:text-white">
                    Password Protection
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enablePassword}
                  onChange={(e) => setEnablePassword(e.target.checked)}
                  className="h-4 w-4 rounded accent-black"
                />
              </div>

              {enablePassword && (
                <div className="pt-2">
                  <input
                    type="password"
                    placeholder="Set link access password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={enablePassword}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2 text-xs text-black placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                  />
                  <p className="mt-1.5 text-[10px] text-zinc-400">
                    Visitors must enter this password before being redirected. Destination URL is never leaked.
                  </p>
                </div>
              )}
            </div>

            {/* Expiration Date Gate */}
            <div className="rounded-xl border border-zinc-200/80 p-4 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-zinc-600 dark:text-zinc-400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-xs font-semibold text-black dark:text-white">
                    Expiration Date
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableExpires}
                  onChange={(e) => setEnableExpires(e.target.checked)}
                  className="h-4 w-4 rounded accent-black"
                />
              </div>

              {enableExpires && (
                <div className="pt-2">
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    required={enableExpires}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2 text-xs text-black placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                  />
                  <p className="mt-1.5 text-[10px] text-zinc-400">
                    The short link will automatically stop redirecting after this timestamp.
                  </p>
                </div>
              )}
            </div>

            {/* Click Capacity Gate */}
            <div className="rounded-xl border border-zinc-200/80 p-4 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-zinc-600 dark:text-zinc-400"
                  >
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  <span className="text-xs font-semibold text-black dark:text-white">
                    Click Limit Cap
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableMaxClicks}
                  onChange={(e) => setEnableMaxClicks(e.target.checked)}
                  className="h-4 w-4 rounded accent-black"
                />
              </div>

              {enableMaxClicks && (
                <div className="pt-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50 (maximum clicks allowed)"
                    value={maxClicks}
                    onChange={(e) => setMaxClicks(e.target.value)}
                    required={enableMaxClicks}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2 text-xs text-black placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                  />
                  <p className="mt-1.5 text-[10px] text-zinc-400">
                    The link will automatically deactivate after reaching this number of clicks.
                  </p>
                </div>
              )}
            </div>

            {/* UTM Campaign Builder */}
            <div className="rounded-xl border border-zinc-200/80 p-4 dark:border-zinc-800 space-y-3">
              <button
                type="button"
                onClick={() => setShowUtmBuilder(!showUtmBuilder)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-zinc-600 dark:text-zinc-400"
                  >
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  <span className="text-xs font-semibold text-black dark:text-white">
                    UTM Campaign Builder
                  </span>
                </div>
                <span className="text-xs text-zinc-400 font-mono">
                  {showUtmBuilder ? "−" : "+"}
                </span>
              </button>

              {showUtmBuilder && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-zinc-500 mb-1">
                      utm_source
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. twitter"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-black focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-zinc-500 mb-1">
                      utm_medium
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. social"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-black focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-zinc-500 mb-1">
                      utm_campaign
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. launch2026"
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-black focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
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
            {loading ? "Generating Protected Short Link..." : "Create Short Link"}
          </button>
        </form>

        {/* Success Card */}
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
                  Your short link is now active and protected according to your security configuration.
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                  <Link
                    href="/dashboard/urls"
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
