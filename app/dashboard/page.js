import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Link2,
  BarChart3,
  TrendingUp,
  Flame,
  ArrowRight,
  Plus,
  ExternalLink,
  Shield,
  Layers,
  Users,
} from "lucide-react";
import { verifyAllowedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import QuickShorten from "./QuickShorten";
import CopyButton from "./urls/CopyButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { authorized, userId } = await verifyAllowedUser();

  if (!authorized) {
    redirect(userId ? "/unauthorized" : "/sign-in");
  }

  const userFilter = userId
    ? {
        OR: [{ userId }, { userId: null }, { userId: "" }],
      }
    : {};

  // Fetch metrics
  const totalUrls = await prisma.shortUrl.count({
    where: userFilter,
  });

  const clicksAggregate = await prisma.shortUrl.aggregate({
    where: userFilter,
    _sum: {
      clicks: true,
    },
  });
  const totalClicks = clicksAggregate._sum.clicks || 0;

  // Captured leads total
  const totalLeads = await prisma.verifiedLead.count({
    where: {
      ShortUrl: userFilter,
    },
  });

  // Top performing link
  const topUrl = await prisma.shortUrl.findFirst({
    where: userFilter,
    orderBy: {
      clicks: "desc",
    },
  });

  // Recent URLs
  const recentUrls = await prisma.shortUrl.findMany({
    where: userFilter,
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  const avgClicks = totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : "0";

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            System Overview
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Real-time redirect metrics, short URL performance, and lead capture.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/leads"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/60"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Captured Leads ({totalLeads})</span>
          </Link>
          <Link
            href="/dashboard/urls"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span>All Links</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Link</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Links */}
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-5.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Links
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <Link2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {totalUrls}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            Registered branded redirects
          </p>
        </div>

        {/* Total Clicks */}
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-5.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Clicks
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {totalClicks.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            Global redirect events recorded
          </p>
        </div>

        {/* Captured Leads */}
        <Link
          href="/dashboard/leads"
          className="group rounded-3xl border border-zinc-200/90 bg-white p-5.5 shadow-sm transition-all hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800"
        >
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Captured Leads
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {totalLeads.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400 flex items-center gap-1">
            <span>Verified email submissions</span>
            <span className="text-blue-500">→</span>
          </p>
        </Link>

        {/* Top Performer */}
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-5.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Top Link
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold truncate text-zinc-950 dark:text-white font-mono">
            {topUrl ? `/${topUrl.slug}` : "None"}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            {topUrl ? `${topUrl.clicks.toLocaleString()} clicks recorded` : "Create your first link"}
          </p>
        </div>
      </div>

      {/* Quick Shorten Widget */}
      <QuickShorten />

      {/* Recent URLs Section */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
              Recently Created Links
            </h2>
            <p className="text-[11px] text-zinc-500">
              The latest links created in your shortener.
            </p>
          </div>
          <Link
            href="/dashboard/urls"
            className="text-xs font-semibold text-zinc-900 hover:underline dark:text-white"
          >
            View all →
          </Link>
        </div>

        {recentUrls.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No short links created yet.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {recentUrls.map((url) => (
              <div
                key={url.id}
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-3"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">
                      /{url.slug}
                    </span>
                    <a
                      href={`/r/${url.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-1 text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="truncate font-mono text-[11px] text-zinc-500">
                    {url.targetUrl}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="rounded-xl bg-zinc-100 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {url.clicks} clicks
                  </span>
                  <CopyButton slug={url.slug} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
