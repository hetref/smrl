"use client";

import { useState } from "react";

export default function CopyButton({ slug }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    const shortUrl = `${window.location.origin}/r/${slug}`;

    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded px-2 py-1 text-xs font-medium transition-colors bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      title="Copy short URL"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
