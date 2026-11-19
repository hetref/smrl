import Navbar from "@/app/components/Navbar";
import { ToastProvider } from "@/app/components/ToastContext";

export default function DashboardLayout({ children }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-zinc-50/70 font-sans dark:bg-black text-black dark:text-zinc-100 flex flex-col selection:bg-zinc-200 dark:selection:bg-zinc-800">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <footer className="border-t border-zinc-200/80 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-500">
          <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-mono text-[11px] text-zinc-400">
              SMRL · Modern Self-Hosted URL Infrastructure
            </p>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                System Active
              </span>
            </div>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
