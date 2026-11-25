import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
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

  // Fetch all URLs with lead counts ordered by creation date
  const urls = await prisma.shortUrl.findMany({
    where: userFilter,
    include: {
      _count: {
        select: {
          VerifiedLead: true,
        },
      },
    },
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
    requireEmail: !!u.requireEmail,
    leadTitle: u.leadTitle || "",
    totalLeads: u._count.VerifiedLead,
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            All Short Links
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Manage your branded slugs, monitor click counters, lead capture gates, and access analytics.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Link</span>
        </Link>
      </div>

      {/* Interactive List */}
      <UrlsList initialUrls={serializedUrls} />
    </div>
  );
}
