import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-black dark:text-white">404</h1>
        <p className="mt-4 text-xl text-zinc-600 dark:text-zinc-400">
          Page not found
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
          The short URL you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
