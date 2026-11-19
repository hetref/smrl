import Link from "next/link";
import { redirect } from "next/navigation";
import { verifyAllowedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import UrlsList from "./UrlsList";

export const dynamic = "force-dynamic";

export default async function UrlsPage() {
  const { authorized, userId } = await verifyAllowedUser();

  if (!authorized) {
    redirect(userId ? "/unauthorized" : "/sign-in");
  }

  const userFilter = userId
    ? {
        OR: [{ userId }, { userId: null }, { userId: "" }],
      }
    : {};

  // Fetch all URLs ordered by creation date
  const urls = await prisma.shortUrl.findMany({
    where: userFilter,
    orderBy: {
      createdAt: "desc",
    },
  });

  const serializedUrls = urls.map((u) => ({
    id: u.id,
    slug: u.slug,
    targetUrl: u.targetUrl,
    clicks: u.clicks,
    isPasswordProtected: !!u.passwordHash,
    isActive: typeof u.isActive === "boolean" ? u.isActive : true,
    expiresAt: u.expiresAt ? u.expiresAt.toISOString() : null,
    maxClicks: u.maxClicks,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Page Title */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            All Short Links
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Manage your branded slugs, monitor click counters, and access analytics.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
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
          Create Short URL
        </Link>
      </div>

      {/* Interactive List */}
      <UrlsList initialUrls={serializedUrls} />
    </div>
  );
}
