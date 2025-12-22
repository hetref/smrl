import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function UrlsPage() {
  // Fetch all URLs ordered by creation date
  const urls = await prisma.shortUrl.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            All URLs
          </h1>
          <Link
            href="/dashboard/new"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Create Short URL
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {urls.length === 0 ? (
            <div className="p-12 text-center">
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                No URLs yet. Create your first short URL!
              </p>
              <Link
                href="/dashboard/new"
                className="inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Create Short URL
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {urls.map((url) => (
                    <tr key={url.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-black dark:text-white">
                            {url.slug}
                          </span>
                          <a
                            href={`/r/${url.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-zinc-500 hover:text-black dark:hover:text-white"
                          >
                            ↗
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-md truncate text-sm text-zinc-600 dark:text-zinc-400">
                          {url.targetUrl}
                        </div>
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
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-zinc-500">
          Total: {urls.length} URL{urls.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
