"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewUrlPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/urls/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetUrl,
          customSlug: customSlug || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create short URL");
        return;
      }

      setResult(data);
      setTargetUrl("");
      setCustomSlug("");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.shortUrl) {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="mb-8 text-3xl font-bold text-black dark:text-white">
          Create Short URL
        </h1>

        <div className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="targetUrl"
                className="block text-sm font-medium text-black dark:text-white"
              >
                Long URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="targetUrl"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com/very/long/url"
                required
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-black placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:ring-white"
              />
            </div>

            <div>
              <label
                htmlFor="customSlug"
                className="block text-sm font-medium text-black dark:text-white"
              >
                Custom Slug <span className="text-zinc-500">(optional)</span>
              </label>
              <input
                type="text"
                id="customSlug"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="my-link"
                pattern="[a-zA-Z0-9_-]{4,10}"
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-black placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:ring-white"
              />
              <p className="mt-1 text-xs text-zinc-500">
                4-10 characters, letters, numbers, dashes, and underscores only
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {loading ? "Creating..." : "Create Short URL"}
            </button>
          </form>

          {result && (
            <div className="mt-8 space-y-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Success! Your short URL is ready
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={result.shortUrl}
                  readOnly
                  className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <button
                  onClick={handleCopy}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                <Link
                  href="/dashboard/urls"
                  className="hover:text-black dark:hover:text-white"
                >
                  View all URLs →
                </Link>
                <button
                  onClick={() => setResult(null)}
                  className="hover:text-black dark:hover:text-white"
                >
                  Create another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}