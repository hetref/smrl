"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id, slug }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm(
      `Are you sure you want to delete the short URL for "${slug}"? This action cannot be undone.`
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
      className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
      title="Delete short URL"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
