import Link from "next/link";
import { ArrowLeft, LayoutDashboard, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black px-6 py-12 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200/90 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-mono text-xl font-bold border border-zinc-200/80 dark:border-zinc-700/80">
          404
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Short Link Not Found
        </h1>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
          The requested slug does not exist on this domain, or the link has been removed.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-black px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-sm"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
