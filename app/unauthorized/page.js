import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";

export default async function UnauthorizedPage() {
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black px-6 py-12 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200/90 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Access Restricted
        </h1>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
          This SMRL instance is private and restricted strictly to the designated administrator account.
        </p>

        {userId && (
          <div className="mt-4 rounded-2xl bg-zinc-50 p-3.5 text-xs font-mono text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400 break-all border border-zinc-200/80 dark:border-zinc-800">
            Current ID: <span className="font-semibold text-zinc-950 dark:text-white">{userId}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          <SignOutButton>
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-sm cursor-pointer">
              <LogOut className="h-3.5 w-3.5" />
              Sign Out & Switch Account
            </button>
          </SignOutButton>
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
