"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import ConfirmModal from "@/app/components/ConfirmModal";
import { useToast } from "@/app/components/ToastContext";

export default function DeleteButton({ id, slug, onDeleted }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { success, error } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/urls/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete link");
      }

      success("Link deleted", `/${slug} has been permanently removed.`);
      setIsOpen(false);
      if (onDeleted) {
        onDeleted(id);
      }
    } catch (err) {
      console.error("Error deleting URL:", err);
      error("Delete failed", err.message || "An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
        title="Delete short link"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete this short link?"
        description={`This will permanently remove "/${slug}" and erase all associated click history and analytics. This action cannot be reversed.`}
        confirmText="Delete Link"
      />
    </>
  );
}
