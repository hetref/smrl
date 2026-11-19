import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";

export default async function UnauthorizedPage() {
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black px-6">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          Access Restricted
        </h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          This SMRL instance is private and configured to allow only the designated administrator.
        </p>

        {userId && (
          <div className="mt-4 rounded-lg bg-zinc-100 p-3 text-xs font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 break-all">
            Signed in as: <span className="font-semibold">{userId}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <SignOutButton>
            <button className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
              Sign Out & Switch Account
            </button>
          </SignOutButton>
          <Link
            href="/"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
