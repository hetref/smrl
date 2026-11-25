import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Mail, Download, ArrowLeft, Plus } from "lucide-react";
import { verifyAllowedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import LeadsClientView from "./LeadsClientView";

export const dynamic = "force-dynamic";

export default async function CumulativeLeadsPage() {
  const { authorized, userId } = await verifyAllowedUser();

  if (!authorized) {
    redirect(userId ? "/unauthorized" : "/sign-in");
  }

  const userFilter = userId
    ? {
        OR: [{ userId }, { userId: null }, { userId: "" }],
      }
    : {};

  // Fetch all leads across all links
  const leads = await prisma.verifiedLead.findMany({
    where: {
      ShortUrl: userFilter,
    },
    include: {
      ShortUrl: {
        select: {
          id: true,
          slug: true,
          leadTitle: true,
          targetUrl: true,
          clicks: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch all email-gated links for filter dropdown
  const gatedLinks = await prisma.shortUrl.findMany({
    where: {
      AND: [
        userFilter,
        {
          OR: [
            { requireEmail: true },
            {
              VerifiedLead: {
                some: {},
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      leadTitle: true,
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

  const serializedLeads = leads.map((lead) => ({
    id: lead.id,
    email: lead.email,
    ip: lead.ip,
    userAgent: lead.userAgent,
    createdAt: lead.createdAt.toISOString(),
    shortUrl: {
      id: lead.ShortUrl?.id || "",
      slug: lead.ShortUrl?.slug || "",
      leadTitle: lead.ShortUrl?.leadTitle || "",
      targetUrl: lead.ShortUrl?.targetUrl || "",
    },
  }));

  const serializedLinks = gatedLinks.map((link) => ({
    id: link.id,
    slug: link.slug,
    leadTitle: link.leadTitle || "",
    leadCount: link._count.VerifiedLead,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Captured Leads
            </h1>
            <span className="rounded-xl bg-blue-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              {serializedLeads.length} total
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Cumulative list of all visitors who completed 6-digit OTP verification across all your short links.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/leads/export"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title="Download CSV of all leads across all links"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export All CSV</span>
          </a>

          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Link</span>
          </Link>
        </div>
      </div>

      {/* Interactive Cumulative Leads View */}
      <LeadsClientView initialLeads={serializedLeads} gatedLinks={serializedLinks} />
    </div>
  );
}
