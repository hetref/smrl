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
  const [newTargetUrl, setNewTargetUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    if (!url) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete the short URL "/${url.slug}"?\nThis will remove the link and all its click logs permanently.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/urls/${urlId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete URL");
      }
      router.push("/dashboard/urls");
    } catch (err) {
      setError(err.message || "Failed to delete URL");
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const response = await fetch(`/api/urls/${urlId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch URL details");
        }
        const data = await response.json();
        setUrl(data);
        setNewSlug(data.slug);
        setNewTargetUrl(data.targetUrl);
      } catch (err) {
        setError(err.message || "Failed to load URL details");
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: urlId,
          newSlug,
          newTargetUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update URL");
        return;
      }

      setSuccess(true);
      setUrl(data);

      setTimeout(() => {
        router.push("/dashboard/urls");
      }, 1200);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center text-xs text-zinc-500">
        Loading link parameters...
      </div>
    );
  }

  if (!url) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          URL not found or access restricted.
        </p>
        <Link
          href="/dashboard/urls"
          className="mt-4 inline-block text-xs font-medium text-black dark:text-white underline underline-offset-4"
        >
          ← Return to All Links
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/urls"
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
          Back to All Links
        </Link>

        <Link
          href={`/dashboard/urls/${url.id}/stats`}
          className="text-xs font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
        >
          View Analytics →
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          Edit Short Link
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Update the destination target or custom slug without changing click history.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        {/* Current Info Ribbon */}
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-zinc-50/70 p-4 dark:bg-zinc-800/30 border border-zinc-200/80 dark:border-zinc-800 text-xs">
          <div>
            <span className="text-zinc-400">Current Slug:</span>
            <p className="mt-0.5 font-mono font-semibold text-black dark:text-white">
              /{url.slug}
            </p>
          </div>
          <div>
            <span className="text-zinc-400">Total Clicks Recorded:</span>
            <p className="mt-0.5 font-semibold text-black dark:text-white">
              {url.clicks.toLocaleString()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination URL */}
          <div className="space-y-2">
            <label
              htmlFor="newTargetUrl"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Destination Target URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="newTargetUrl"
              value={newTargetUrl}
              onChange={(e) => setNewTargetUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-black placeholder-zinc-400 transition-all focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:bg-zinc-800"
            />
            <p className="text-[11px] text-zinc-400">
              Where visitors will be immediately redirected upon accessing the short link.
            </p>
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label
              htmlFor="newSlug"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Slug Identifier <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50/50 overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black dark:border-zinc-800 dark:bg-zinc-800/50 dark:focus-within:border-white dark:focus-within:ring-white">
              <span className="px-3.5 text-xs font-mono text-zinc-400 select-none bg-zinc-100/50 py-3 dark:bg-zinc-800/60 border-r border-zinc-200 dark:border-zinc-800">
                /r/
              </span>
              <input
                type="text"
                id="newSlug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="slug-name"
                pattern="[a-zA-Z0-9_-]{4,200}"
                required
                className="w-full bg-transparent px-3 py-3 text-sm text-black placeholder-zinc-400 focus:outline-none dark:text-white dark:placeholder-zinc-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              4-200 alphanumeric characters, dashes, and underscores only.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/80 dark:border-red-900/50">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
              ✓ Link updated successfully! Redirecting to All Links...
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || deleting || success}
              className="flex-1 rounded-xl bg-black py-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting || success}
              className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              {deleting ? "Deleting..." : "Delete Link"}
            </button>
            <Link
              href="/dashboard/urls"
              className="rounded-xl border border-zinc-200 px-4 py-3 text-center text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
