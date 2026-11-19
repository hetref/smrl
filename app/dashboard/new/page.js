"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  ArrowLeft,
  Link2,
  Lock,
  Clock,
  Ban,
  Tag,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  QrCode as QrIcon,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";
import Switch from "@/app/components/Switch";
import CopyButton from "../urls/CopyButton";
import { useToast } from "@/app/components/ToastContext";

export default function NewUrlPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [enableExpires, setEnableExpires] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [enableMaxClicks, setEnableMaxClicks] = useState(false);
  const [maxClicks, setMaxClicks] = useState("");
  const [showUtmBuilder, setShowUtmBuilder] = useState(false);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const { success } = useToast();

  const handlePresetExpiry = (hours) => {
    const d = new Date();
    d.setHours(d.getHours() + hours);
    // Format to YYYY-MM-DDTHH:mm
    const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setExpiresAt(localIso);
  };

  const handlePresetClicks = (num) => {
    setMaxClicks(String(num));
  };

  const handleUtmPreset = (source, medium) => {
    setUtmSource(source);
    setUtmMedium(medium);
  };

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
      success("Short link created!", data.shortUrl);

      QRCode.toDataURL(data.shortUrl, { width: 300, margin: 2 })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});

      // Reset fields
      setTargetUrl("");
      setCustomSlug("");
      setPassword("");
      setExpiresAt("");
      setMaxClicks("");
      setUtmSource("");
      setUtmMedium("");
      setUtmCampaign("");
      setEnablePassword(false);
      setEnableExpires(false);
      setEnableMaxClicks(false);
      setShowUtmBuilder(false);
    } catch (err) {
      setError("An error occurred while creating the link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://smrl.app";
  const displaySlug = customSlug.trim() || "slug";

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Header & Back Link */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Overview
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Create Short Link
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Turn long destination URLs into secure, trackable redirects with custom gates.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination URL Input */}
          <div className="space-y-2">
            <label
              htmlFor="targetUrl"
              className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              <span>Destination URL</span>
              <span className="text-[10px] font-normal text-rose-500">required</span>
            </label>
            <div className="relative">
              <input
                type="url"
                id="targetUrl"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com/very/long/destination/url"
                required
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 text-xs text-zinc-900 placeholder-zinc-400 transition-all focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-white dark:focus:bg-zinc-800 font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Must start with <code className="font-mono text-zinc-600 dark:text-zinc-300">https://</code>
            </p>
          </div>

          {/* Custom Slug Input */}
          <div className="space-y-2">
            <label
              htmlFor="customSlug"
              className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              <span>Custom Slug</span>
              <span className="text-[10px] lowercase font-normal text-zinc-400">
                optional · 4-200 chars
              </span>
            </label>
            <div className="flex items-center rounded-2xl border border-zinc-200 bg-zinc-50/60 overflow-hidden focus-within:border-zinc-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/40 dark:focus-within:border-white dark:focus-within:ring-white">
              <span className="px-3.5 py-3 text-xs font-mono text-zinc-400 select-none bg-zinc-100/70 dark:bg-zinc-800/80 border-r border-zinc-200 dark:border-zinc-800">
                /r/
              </span>
              <input
                type="text"
                id="customSlug"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="my-campaign"
                pattern="[a-zA-Z0-9_-]{4,200}"
                className="w-full bg-transparent px-3.5 py-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder-zinc-500 font-mono"
              />
            </div>
          </div>

          {/* Live Link Preview Pill */}
          <div className="flex items-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800/60 dark:bg-zinc-800/20">
            <Link2 className="h-4 w-4 shrink-0 text-zinc-400" />
            <div className="flex-1 truncate">
              <span className="text-[11px] text-zinc-400">Short URL preview: </span>
              <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {currentOrigin}/r/{displaySlug}
              </span>
            </div>
          </div>

          {/* Security & Access Controls */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <ShieldCheck className="h-4 w-4" />
              <span>Security & Access Rules</span>
            </div>

            {/* Password Protection */}
            <div className="rounded-2xl border border-zinc-200/80 p-4.5 dark:border-zinc-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                      Password Protection
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Require visitors to authenticate before redirecting
                    </p>
                  </div>
                </div>
                <Switch
                  checked={enablePassword}
                  onChange={setEnablePassword}
                  ariaLabel="Toggle password protection"
                />
              </div>

              {enablePassword && (
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 animate-in fade-in duration-200">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Set access password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={enablePassword}
                      className="w-full rounded-xl border border-zinc-200 bg-white pl-3.5 pr-10 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Hashed securely using scrypt with unique salt. The destination URL remains undisclosed until unlocked.
                  </p>
                </div>
              )}
            </div>

            {/* Expiration Date Gate */}
            <div className="rounded-2xl border border-zinc-200/80 p-4.5 dark:border-zinc-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                      Time Expiration
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Automatically shut down redirect after a given date
                    </p>
                  </div>
                </div>
                <Switch
                  checked={enableExpires}
                  onChange={setEnableExpires}
                  ariaLabel="Toggle expiration date"
                />
              </div>

              {enableExpires && (
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400">Presets:</span>
                    <button
                      type="button"
                      onClick={() => handlePresetExpiry(24)}
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      24 Hours
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetExpiry(168)}
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetExpiry(720)}
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      30 Days
                    </button>
                  </div>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    required={enableExpires}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Click Capacity Limit */}
            <div className="rounded-2xl border border-zinc-200/80 p-4.5 dark:border-zinc-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <Ban className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                      Click Capacity Limit
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Cap total redirects to prevent traffic overuse
                    </p>
                  </div>
                </div>
                <Switch
                  checked={enableMaxClicks}
                  onChange={setEnableMaxClicks}
                  ariaLabel="Toggle click capacity limit"
                />
              </div>

              {enableMaxClicks && (
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400">Presets:</span>
                    <button
                      type="button"
                      onClick={() => handlePresetClicks(50)}
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      50
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetClicks(250)}
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      250
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetClicks(1000)}
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      1,000
                    </button>
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Maximum allowed clicks..."
                    value={maxClicks}
                    onChange={(e) => setMaxClicks(e.target.value)}
                    required={enableMaxClicks}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* UTM Campaign Builder */}
            <div className="rounded-2xl border border-zinc-200/80 p-4.5 dark:border-zinc-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                      UTM Campaign Tracking
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Append tracking parameters forwarded on redirection
                    </p>
                  </div>
                </div>
                <Switch
                  checked={showUtmBuilder}
                  onChange={setShowUtmBuilder}
                  ariaLabel="Toggle UTM builder"
                />
              </div>

              {showUtmBuilder && (
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400">Quick fill:</span>
                    <button
                      type="button"
                      onClick={() => handleUtmPreset("twitter", "social")}
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-0.5 text-[10px] text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      Twitter/X
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUtmPreset("linkedin", "social")}
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-0.5 text-[10px] text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      LinkedIn
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUtmPreset("newsletter", "email")}
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-0.5 text-[10px] text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      Newsletter
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                        utm_source
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. twitter"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                        utm_medium
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. social"
                        value={utmMedium}
                        onChange={(e) => setUtmMedium(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                        utm_campaign
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. launch"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !targetUrl}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-3.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 cursor-pointer"
          >
            {loading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating Short Link...
              </>
            ) : (
              "Generate Short Link"
            )}
          </button>
        </form>

        {/* Success Card */}
        {result && (
          <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/40 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold text-emerald-950 dark:text-emerald-200">
                Short link ready to share!
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200/60 bg-white p-3.5 dark:border-emerald-900/40 dark:bg-zinc-900">
              <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white truncate">
                {result.shortUrl}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <CopyButton slug={result.slug} fullUrl={result.shortUrl} />
                <a
                  href={`/r/${result.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
              {qrDataUrl && (
                <div className="p-2.5 bg-white rounded-2xl border border-zinc-200/80 shadow-sm shrink-0">
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-24 h-24 object-contain rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Your short link is live and will respect your custom active, password, expiration, and UTM configuration.
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Link
                    href="/dashboard/urls"
                    className="rounded-xl bg-black px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
                  >
                    View in All Links
                  </Link>
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 transition-colors"
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
