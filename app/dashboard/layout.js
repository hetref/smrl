import Navbar from "@/app/components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50/60 font-sans dark:bg-black text-black dark:text-zinc-100 flex flex-col">
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
      <footer className="border-t border-zinc-200/80 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-500">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} SMRL · Self-Hosted URL Shortener</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
