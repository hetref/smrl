import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";

export default async function UnauthorizedPage() {
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200/60 dark:border-red-900/40">
          <svg
            className="h-6 w-6"
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

        <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">
          Access Restricted
        </h1>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
          This SMRL instance is private and restricted exclusively to the authorized administrator account.
        </p>

        {userId && (
          <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-xs font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 break-all border border-zinc-200/80 dark:border-zinc-800">
            Account: <span className="font-semibold text-black dark:text-white">{userId}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          <SignOutButton>
            <button className="w-full rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-sm">
              Sign Out & Switch Account
            </button>
          </SignOutButton>
          <Link
            href="/"
            className="w-full rounded-xl border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
