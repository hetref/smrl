"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

export default function EditUrlPage() {
  const router = useRouter();
  const params = useParams();
  const urlId = params.id;

  const [url, setUrl] = useState(null);
  const [newSlug, setNewSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch the URL details
    const fetchUrl = async () => {
      try {
        const response = await fetch(`/api/urls/${urlId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch URL");
        }
        const data = await response.json();
        setUrl(data);
        setNewSlug(data.slug);
      } catch (err) {
        setError("Failed to load URL details");
      } finally {
        setLoading(false);
      }
    };

    if (urlId) {
      fetchUrl();
    }
  }, [urlId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/urls/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: urlId,
          newSlug
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update slug");
        return;
      }

      setSuccess(true);
      setUrl(data);
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push("/dashboard/urls");
      }, 1500);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <p className="text-center text-zinc-600 dark:text-zinc-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <p className="text-center text-red-600 dark:text-red-400">
            URL not found
          </p>
          <div className="mt-4 text-center">
            <Link
              href="/dashboard/urls"
              className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              ← Back to URLs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/dashboard/urls"
            className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          >
            ← Back to URLs
          </Link>
        </div>

        <h1 className="mb-8 text-3xl font-bold text-black dark:text-white">
          Edit Short URL
        </h1>

        <div className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 space-y-2">
            <div>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Target URL:
              </span>
              <p className="mt-1 break-all text-sm text-black dark:text-white">
                {url.targetUrl}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Current Slug:
              </span>
              <p className="mt-1 text-sm font-mono text-black dark:text-white">
                {url.slug}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Clicks:
              </span>
              <p className="mt-1 text-sm text-black dark:text-white">
                {url.clicks}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <div>
              <label
                htmlFor="newSlug"
                className="block text-sm font-medium text-black dark:text-white"
              >
                New Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="newSlug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="my-link"
                pattern="[a-zA-Z0-9_-]{4,10}"
                required
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

            {success && (
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Slug updated successfully! Redirecting...
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || success}
                className="flex-1 rounded-lg bg-black px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                {saving ? "Saving..." : "Update Slug"}
              </button>
              <Link
                href="/dashboard/urls"
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-center font-medium text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
