import Link from "next/link";
import { redirect } from "next/navigation";
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

  // Fetch statistics
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            System Overview
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Real-time redirect metrics and short URL performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/urls"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Manage All Links
          </Link>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Link
          </Link>
        </div>
      </div>

      {/* Bento Grid KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Links
            </span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-black dark:text-white">
            {totalUrls}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            Active short URLs
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Clicks
            </span>
            <svg
              width="18"
              height="18"
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
          <p className="mt-3 text-3xl font-bold tracking-tight text-black dark:text-white">
            {totalClicks.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            Redirect events logged
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Top Link
            </span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <p className="mt-3 text-2xl font-bold truncate text-black dark:text-white">
            {topUrl ? `/${topUrl.slug}` : "None"}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            {topUrl ? `${topUrl.clicks} total clicks` : "Create your first link"}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Avg Clicks / Link
            </span>
            <svg
              width="18"
              height="18"
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
          <p className="mt-3 text-3xl font-bold tracking-tight text-black dark:text-white">
            {avgClicks}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            Average engagement rate
          </p>
        </div>
      </div>

      {/* Quick Shorten Section */}
      <QuickShorten />

      {/* Recent URLs Section */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-black dark:text-white">
              Recent Links
            </h2>
            <p className="text-xs text-zinc-500">
              The last 5 shortened links generated on this instance.
            </p>
          </div>
          <Link
            href="/dashboard/urls"
            className="text-xs font-semibold text-black hover:opacity-75 dark:text-white"
          >
            View all links →
          </Link>
        </div>

        {recentUrls.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-black dark:text-white">
              No short links yet
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Use the quick creator above or create your first short URL.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-6 py-3.5">Destination URL</th>
                  <th className="px-6 py-3.5 text-center">Clicks</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {recentUrls.map((url) => (
                  <tr
                    key={url.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-black dark:text-white">
                          /{url.slug}
                        </span>
                        <a
                          href={`/r/${url.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1 text-zinc-400 hover:text-black dark:hover:text-white"
                          title="Open short link"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                        <CopyButton slug={url.slug} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs md:max-w-sm truncate text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                        {url.targetUrl}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                        {url.clicks.toLocaleString()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-zinc-500">
                      {new Date(url.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/urls/${url.id}/stats`}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-black dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
                      >
                        Analytics →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
