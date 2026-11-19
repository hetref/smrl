"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/app/components/ToastContext";

export default function CopyButton({ slug, fullUrl, label, className = "" }) {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const urlToCopy = fullUrl || `${window.location.origin}/r/${slug}`;

    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      success("Copied to clipboard", urlToCopy);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150 active:scale-95 ${
        copied
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-500/25"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700/80"
      } ${className}`}
      title="Copy short link"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{label || "Copied"}</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
          <span>{label || "Copy"}</span>
        </>
      )}
    </button>
  );
}
