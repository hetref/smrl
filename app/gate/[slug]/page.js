import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PasswordGateForm from "./PasswordGateForm";

export const dynamic = "force-dynamic";

export default async function GatePage({ params, searchParams }) {
  const { slug } = await params;
  const { status } = await searchParams;

  if (!slug) {
    notFound();
  }

  // Look up record metadata
  const record = await prisma.shortUrl.findUnique({
    where: { slug },
    select: {
      slug: true,
      passwordHash: true,
      isActive: true,
      expiresAt: true,
      maxClicks: true,
      clicks: true,
    },
  });

  if (!record) {
    notFound();
  }

  // Determine state
  const isPaused = !record.isActive || status === "paused";
  const isExpired =
    (record.expiresAt && new Date() > new Date(record.expiresAt)) ||
    status === "expired";
  const isLimitReached =
    (record.maxClicks !== null && record.clicks >= record.maxClicks) ||
    status === "limit_reached";
  const isPasswordProtected = !!record.passwordHash && !isPaused && !isExpired && !isLimitReached;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        {/* State 1: Password Gate */}
        {isPasswordProtected && (
          <div className="space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white border border-zinc-200/80 dark:border-zinc-700/80">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">
                Password Protected Link
              </h1>
              <p className="mt-1.5 text-xs text-zinc-500 font-mono">
                /r/{record.slug}
              </p>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                The creator has protected this short link with a password. Please enter the password below to access the destination.
              </p>
            </div>

            <PasswordGateForm slug={record.slug} />
          </div>
        )}

        {/* State 2: Paused */}
        {isPaused && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="10" y1="15" x2="10" y2="9" />
                <line x1="14" y1="15" x2="14" y2="9" />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">
                Short Link Paused
              </h1>
              <p className="mt-1.5 text-xs text-zinc-500 font-mono">
                /r/{record.slug}
              </p>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                This short link has been temporarily paused by its owner and is currently not accepting redirects.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-block rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Go to SMRL Home
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Expired */}
        {isExpired && !isPaused && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200/60 dark:border-red-900/40">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">
                Short Link Expired
              </h1>
              <p className="mt-1.5 text-xs text-zinc-500 font-mono">
                /r/{record.slug}
              </p>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                This link was configured with an expiration date and is no longer available.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-block rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Go to SMRL Home
              </Link>
            </div>
          </div>
        )}

        {/* State 4: Click Limit Reached */}
        {isLimitReached && !isPaused && !isExpired && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">
                Click Limit Reached
              </h1>
              <p className="mt-1.5 text-xs text-zinc-500 font-mono">
                /r/{record.slug}
              </p>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                This short link has reached its maximum configured number of clicks ({record.maxClicks}) and cannot accept further redirects.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-block rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Go to SMRL Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
