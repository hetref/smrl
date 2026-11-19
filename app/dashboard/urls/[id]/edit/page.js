"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Globe,
  Lock,
  Clock,
  Ban,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import Switch from "@/app/components/Switch";
import ConfirmModal from "@/app/components/ConfirmModal";
import { useToast } from "@/app/components/ToastContext";

export default function EditUrlPage() {
  const router = useRouter();
  const params = useParams();
  const urlId = params.id;

  const [url, setUrl] = useState(null);
  const [newSlug, setNewSlug] = useState("");
  const [newTargetUrl, setNewTargetUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [removePassword, setRemovePassword] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [maxClicks, setMaxClicks] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState("");
  const { success, error: toastError } = useToast();

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
        setIsActive(typeof data.isActive === "boolean" ? data.isActive : true);
        setMaxClicks(data.maxClicks ? String(data.maxClicks) : "");
        if (data.expiresAt) {
          const d = new Date(data.expiresAt);
          const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setExpiresAt(localIso);
        }
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

  const handleDelete = async () => {
    if (!url) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/urls/${urlId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete link");
      }
      success("Link deleted", `/${url.slug} was permanently removed.`);
      router.push("/dashboard/urls");
    } catch (err) {
      toastError("Delete failed", err.message || "Could not delete URL.");
      setDeleting(false);
    }
  };

  const handleResetClicks = async () => {
    if (!url) return;
    setIsResetting(true);
    try {
      const res = await fetch("/api/urls/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: urlId,
          resetClicks: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to reset clicks");
      }

      setUrl((prev) => ({ ...prev, clicks: 0 }));
      success("Clicks counter reset", `Click count for /${url.slug} was reset to 0.`);
      setIsResetModalOpen(false);
    } catch (err) {
      toastError("Reset failed", err.message || "Could not reset clicks.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

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
          isActive,
          password: password.trim() || undefined,
          removePassword,
          expiresAt: expiresAt || null,
          maxClicks: maxClicks ? parseInt(maxClicks, 10) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update URL");
      }

      setUrl(data);
      setPassword("");
      setRemovePassword(false);
      success("Settings saved", `/${data.slug} has been updated.`);

      setTimeout(() => {
        router.push("/dashboard/urls");
      }, 800);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
      toastError("Save failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-white dark:border-t-transparent" />
        <p className="mt-3 text-xs text-zinc-500">Loading link parameters...</p>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
          URL not found or access restricted.
        </p>
        <Link
          href="/dashboard/urls"
          className="mt-4 inline-block text-xs font-medium text-zinc-900 dark:text-white underline underline-offset-4"
        >
          Return to All Links
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/urls"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to All Links
        </Link>

        <Link
          href={`/dashboard/urls/${url.id}/stats`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Analytics
        </Link>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Edit Link Settings
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Modify destination, slug, password protection, and automated gates.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        {/* Status Quick Ribbon */}
        <div className="flex items-center justify-between rounded-2xl bg-zinc-50/80 p-4 border border-zinc-200/80 dark:border-zinc-800 dark:bg-zinc-800/30">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                isActive
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
              }`}
            >
              {isActive ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-950 dark:text-white">
                {isActive ? "Link Active" : "Link Paused"}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {isActive
                  ? "Redirects are currently operational"
                  : "Redirects are stopped with a paused interstitial"}
              </p>
            </div>
          </div>
          <Switch
            checked={isActive}
            onChange={setIsActive}
            ariaLabel="Toggle active status"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target URL */}
          <div className="space-y-2">
            <label
              htmlFor="targetUrl"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Destination URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              id="targetUrl"
              value={newTargetUrl}
              onChange={(e) => setNewTargetUrl(e.target.value)}
              required
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-100 dark:focus:border-white font-mono"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label
              htmlFor="slug"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Custom Slug <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center rounded-2xl border border-zinc-200 bg-zinc-50/60 overflow-hidden focus-within:border-zinc-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/40 dark:focus-within:border-white font-mono">
              <span className="px-3.5 py-3 text-xs font-mono text-zinc-400 select-none bg-zinc-100/70 dark:bg-zinc-800/80 border-r border-zinc-200 dark:border-zinc-800">
                /r/
              </span>
              <input
                type="text"
                id="slug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                required
                pattern="[a-zA-Z0-9_-]{4,200}"
                className="w-full bg-transparent px-3.5 py-3 text-xs text-zinc-900 focus:outline-none dark:text-zinc-100 font-mono"
              />
            </div>
          </div>

          {/* Security & Gate Controls */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <ShieldCheck className="h-4 w-4" />
              <span>Security & Capacity Gates</span>
            </div>

            {/* Password Gate */}
            <div className="rounded-2xl border border-zinc-200/80 p-4.5 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-950 dark:text-white">
                      Password Protection
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {url.isPasswordProtected
                        ? "Currently password-protected"
                        : "No password protection active"}
                    </p>
                  </div>
                </div>

                {url.isPasswordProtected && (
                  <button
                    type="button"
                    onClick={() => setRemovePassword(!removePassword)}
                    className={`rounded-xl px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      removePassword
                        ? "bg-rose-600 text-white"
                        : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {removePassword ? "Will Remove Password" : "Remove Password"}
                  </button>
                )}
              </div>

              {!removePassword && (
                <div className="pt-2">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        url.isPasswordProtected
                          ? "Enter new password to change..."
                          : "Set access password..."
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>
              )}
            </div>

            {/* Expiration Gate */}
            <div className="rounded-2xl border border-zinc-200/80 p-4.5 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-950 dark:text-white">
                      Time Expiration
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Link becomes inactive after this date
                    </p>
                  </div>
                </div>

                {expiresAt && (
                  <button
                    type="button"
                    onClick={() => setExpiresAt("")}
                    className="rounded-xl border border-zinc-200 px-2 py-1 text-[11px] text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    Clear Expiry
                  </button>
                )}
              </div>

              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            {/* Max Clicks */}
            <div className="rounded-2xl border border-zinc-200/80 p-4.5 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <Ban className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-950 dark:text-white">
                      Click Capacity Limit
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Current clicks: <strong>{url.clicks}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {url.clicks > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(true)}
                      className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50/60 px-2.5 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50 transition-colors"
                      title="Reset click count to 0"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset to 0</span>
                    </button>
                  )}
                  {maxClicks && (
                    <button
                      type="button"
                      onClick={() => setMaxClicks("")}
                      className="rounded-xl border border-zinc-200 px-2 py-1 text-[11px] text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      Remove Cap
                    </button>
                  )}
                </div>
              </div>

              <input
                type="number"
                min="1"
                placeholder="Leave blank for unlimited clicks"
                value={maxClicks}
                onChange={(e) => setMaxClicks(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={saving}
              className="flex w-full sm:flex-1 items-center justify-center gap-2 rounded-2xl bg-black py-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 cursor-pointer"
            >
              {saving ? "Saving Changes..." : "Save Link Settings"}
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={saving}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-100/80 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors w-full sm:w-auto cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Delete Link
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete this short link?"
        description={`This will permanently remove "/${url.slug}" and its click history. This cannot be undone.`}
        confirmText="Permanently Delete"
      />

      {/* Reset Clicks Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetClicks}
        isLoading={isResetting}
        title="Reset click count to 0?"
        description={`This will reset clicks for "/${url.slug}" to 0 and permanently delete all visitor click logs for this link.`}
        confirmText="Reset to 0"
        variant="warning"
        icon={RotateCcw}
      />
    </div>
  );
}
