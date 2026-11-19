import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-mono text-xl font-bold">
          404
        </div>
        <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">
          Short Link Not Found
        </h1>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
          The requested slug does not exist on this domain, or the short link has been removed.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/"
            className="w-full rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-sm"
          >
            Return to Home
          </Link>
          <Link
            href="/dashboard"
            className="w-full rounded-xl border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
