import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { verifyAllowedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CopyButton from "../../CopyButton";
import StatsClientView from "./StatsClientView";

export const dynamic = "force-dynamic";

export default async function UrlStatsPage({ params }) {
  const { authorized, userId } = await verifyAllowedUser();

  if (!authorized) {
    redirect(userId ? "/unauthorized" : "/sign-in");
  }

  const { id: urlId } = await params;

  if (!urlId) {
    notFound();
  }

  const url = await prisma.shortUrl.findUnique({
    where: { id: urlId },
    include: {
      ClickLog: {
        orderBy: { createdAt: "desc" },
        take: 300,
      },
      VerifiedLead: {
        orderBy: { createdAt: "desc" },
        take: 300,
      },
    },
  });

  if (!url) {
    notFound();
  }

  if (url.userId && url.userId !== userId) {
    redirect("/unauthorized");
  }

  const serializedUrl = {
    id: url.id,
    slug: url.slug,
    targetUrl: url.targetUrl,
    clicks: url.clicks,
    isPasswordProtected: !!url.passwordHash,
    requireEmail: !!url.requireEmail,
    leadTitle: url.leadTitle || "",
    isActive: typeof url.isActive === "boolean" ? url.isActive : true,
    expiresAt: url.expiresAt ? url.expiresAt.toISOString() : null,
    maxClicks: url.maxClicks,
    createdAt: url.createdAt.toISOString(),
  };

  const serializedLogs = url.ClickLog.map((log) => ({
    id: log.id,
    referrer: log.referrer,
    userAgent: log.userAgent,
    createdAt: log.createdAt.toISOString(),
  }));

  const serializedLeads = url.VerifiedLead.map((lead) => ({
    id: lead.id,
    email: lead.email,
    ip: lead.ip,
    userAgent: lead.userAgent,
    createdAt: lead.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Navigation Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/urls"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
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
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to All Links
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/urls/${url.id}/edit`}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-black dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            Edit Destination / Slug
          </Link>
        </div>
      </div>

      {/* Main Stats Presentation Component */}
      <StatsClientView url={serializedUrl} logs={serializedLogs} leads={serializedLeads} />
    </div>
  );
}
