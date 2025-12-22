import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  // Fetch statistics
  const totalUrls = await prisma.shortUrl.count();
  
  const clicksAggregate = await prisma.shortUrl.aggregate({
    _sum: {
      clicks: true
    }
  });
  const totalClicks = clicksAggregate._sum.clicks || 0;

  // Fetch recent URLs
  const recentUrls = await prisma.shortUrl.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Dashboard
          </h1>
          <Link
            href="/dashboard/new"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Create Short URL
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total URLs</p>
            <p className="mt-2 text-3xl font-bold text-black dark:text-white">
              {totalUrls}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Clicks</p>
            <p className="mt-2 text-3xl font-bold text-black dark:text-white">
              {totalClicks}
            </p>
          </div>
        </div>

        {/* Recent URLs */}
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black dark:text-white">
                Recent URLs
              </h2>
              <Link
                href="/dashboard/urls"
                className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            {recentUrls.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-zinc-600 dark:text-zinc-400">
                  No URLs yet. Create your first short URL!
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Target URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {recentUrls.map((url) => (
                    <tr key={url.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-black dark:text-white">
                        {url.slug}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="max-w-md truncate">{url.targetUrl}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {url.clicks}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
