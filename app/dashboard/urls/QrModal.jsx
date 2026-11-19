"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Copy, Check, X, ExternalLink, QrCode as QrIcon } from "lucide-react";
import { useToast } from "@/app/components/ToastContext";

export default function QrModal({ isOpen, onClose, slug, targetUrl }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    if (isOpen && slug) {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const fullUrl = `${origin}/r/${slug}`;

      QRCode.toDataURL(fullUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#0a0a0a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Error generating QR:", err));
    }
  }, [isOpen, slug]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/r/${slug}`
      : `/r/${slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      success("Link copied to clipboard", fullUrl);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `smrl-${slug}-qrcode.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    success("QR Code downloaded", `smrl-${slug}-qrcode.png`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Frosted Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              <QrIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                Branded QR Code
              </h3>
              <p className="text-[11px] font-mono text-zinc-500">/r/{slug}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* QR Image Frame */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for /r/${slug}`}
                className="h-48 w-48 object-contain rounded-lg"
              />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center text-zinc-400">
                <span className="text-xs">Generating QR...</span>
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-[11px] text-zinc-500 max-w-xs">
            Scan with any smartphone camera to test instant redirection.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <Download className="h-3.5 w-3.5" />
            Download High-Res PNG
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-zinc-400" />
                  Copy Link
                </>
              )}
            </button>
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-800"
              title="Open short link in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
