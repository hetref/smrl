"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id, slug }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = window.confirm(
      `Are you sure you want to delete the short URL for "/${slug}"?\nThis will remove the link and all its click logs permanently.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/urls/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete URL");
        return;
      }

      router.refresh();
    } catch (err) {
      console.error("Error deleting URL:", err);
      alert("An error occurred while deleting the URL.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-lg border border-transparent p-1 text-zinc-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:border-red-900/50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
      title="Delete short link"
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
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    </button>
  );
}
