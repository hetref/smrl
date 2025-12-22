import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 py-32 px-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50">
            SMRL
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-lg">
            A simple, fast, and self-hosted URL shortener. Create short links instantly and track their performance.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          {userId ? (
            <Link
              href="/dashboard"
              className="flex h-12 items-center justify-center rounded-lg bg-black px-6 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="flex h-12 items-center justify-center rounded-lg bg-black px-6 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-2 text-sm text-zinc-500 dark:text-zinc-500">
          <p>✓ Fast redirects with edge computing</p>
          <p>✓ Click analytics and tracking</p>
          <p>✓ Custom slug support</p>
        </div>
      </main>
    </div>
  );
}
