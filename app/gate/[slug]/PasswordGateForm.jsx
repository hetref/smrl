"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, ArrowRight } from "lucide-react";

export default function PasswordGateForm({ slug }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/urls/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Incorrect password");
      }

      // Navigate to destination via short URL redirect now that session cookie is set
      window.location.href = data.redirectUrl || `/r/${slug}`;
    } catch (err) {
      setError(err.message || "Failed to verify password");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="password"
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter link password..."
            required
            autoFocus
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 pr-10 text-xs text-zinc-900 placeholder-zinc-400 transition-all focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-white font-mono"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50/80 p-3.5 text-xs font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/50 text-left">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !password}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 cursor-pointer"
      >
        {loading ? (
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Verifying Password...
          </span>
        ) : (
          <>
            <span>Unlock Destination</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
