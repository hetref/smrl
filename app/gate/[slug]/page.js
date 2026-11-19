import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, Pause, Clock, Ban, ShieldCheck, ArrowLeft } from "lucide-react";
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
  const isPasswordProtected =
    !!record.passwordHash && !isPaused && !isExpired && !isLimitReached;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black px-6 py-12 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200/90 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-xl transition-all">
        {/* State 1: Password Gate */}
        {isPasswordProtected && (
          <div className="space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/40">
              <Lock className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Password Protected Link
              </h1>
              <p className="text-xs text-zinc-500 font-mono">
                /r/{record.slug}
              </p>
              <p className="pt-1 text-xs text-zinc-500 leading-relaxed">
                The author has protected this short link with an access password. Please authenticate below to access the target destination.
              </p>
            </div>

            <PasswordGateForm slug={record.slug} />
          </div>
        )}

        {/* State 2: Paused */}
        {isPaused && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
              <Pause className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Link Temporarily Paused
              </h1>
              <p className="text-xs text-zinc-500 font-mono">
                /r/{record.slug}
              </p>
              <p className="pt-2 text-xs text-zinc-500 leading-relaxed">
                This short link is currently paused by its owner and is not accepting redirects at this time.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Go to Homepage
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Expired */}
        {isExpired && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
              <Clock className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Short Link Expired
              </h1>
              <p className="text-xs text-zinc-500 font-mono">
                /r/{record.slug}
              </p>
              <p className="pt-2 text-xs text-zinc-500 leading-relaxed">
                This link was set to automatically expire and is no longer available.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Go to Homepage
              </Link>
            </div>
          </div>
        )}

        {/* State 4: Click Limit Reached */}
        {isLimitReached && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
              <Ban className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Click Capacity Reached
              </h1>
              <p className="text-xs text-zinc-500 font-mono">
                /r/{record.slug}
              </p>
              <p className="pt-2 text-xs text-zinc-500 leading-relaxed">
                This link reached its maximum traffic limit ({record.maxClicks} clicks) and has ceased redirecting.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Go to Homepage
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <p className="font-mono text-[10px] text-zinc-400">
            Protected by SMRL Security Engine
          </p>
        </div>
      </div>
    </div>
  );
}
