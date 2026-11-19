"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext({
  showToast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, variant = "info", duration = 3500 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast = { id, title, description, variant };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (title, description) => showToast({ title, description, variant: "success" }),
    [showToast]
  );

  const error = useCallback(
    (title, description) => showToast({ title, description, variant: "error" }),
    [showToast]
  );

  const info = useCallback(
    (title, description) => showToast({ title, description, variant: "info" }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 py-6 sm:bottom-6 sm:right-6 sm:inset-x-auto sm:items-end"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.variant === "success";
          const isError = toast.variant === "error";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl transition-all duration-300 ease-out animate-in slide-in-from-bottom-5 fade-in ${
                isSuccess
                  ? "border-emerald-200/80 bg-white/95 text-zinc-900 dark:border-emerald-900/60 dark:bg-zinc-900/95 dark:text-zinc-100"
                  : isError
                  ? "border-rose-200/80 bg-white/95 text-zinc-900 dark:border-rose-900/60 dark:bg-zinc-900/95 dark:text-zinc-100"
                  : "border-zinc-200/80 bg-white/95 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/95 dark:text-zinc-100"
              }`}
            >
              <div className="shrink-0 pt-0.5">
                {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />}
                {isError && <AlertCircle className="h-5 w-5 text-rose-500 dark:text-rose-400" />}
                {!isSuccess && !isError && <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />}
              </div>

              <div className="flex-1 space-y-0.5 min-w-0">
                <p className="text-xs font-semibold leading-tight">{toast.title}</p>
                {toast.description && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug break-words">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 -mr-1 -mt-1 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label="Dismiss toast"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
