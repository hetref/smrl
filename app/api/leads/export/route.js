import { verifyAllowedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const authResult = await verifyAllowedUser();
    if (!authResult.authorized) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { userId } = authResult;

    const { searchParams } = new URL(request.url);
    const linkFilter = searchParams.get("linkId");

    const whereClause = {
      ShortUrl: userId
        ? {
            OR: [{ userId }, { userId: null }, { userId: "" }],
          }
        : {},
    };

    if (linkFilter) {
      whereClause.shortUrlId = linkFilter;
    }

    const leads = await prisma.verifiedLead.findMany({
      where: whereClause,
      include: {
        ShortUrl: {
          select: {
            slug: true,
            leadTitle: true,
            targetUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format CSV
    const rows = [
      ["Email", "Short Link Slug", "Lead Title", "Destination URL", "Verified At", "IP Address", "User Agent"],
      ...leads.map((lead) => [
        `"${lead.email.replace(/"/g, '""')}"`,
        `"/${lead.ShortUrl?.slug || ""}"`,
        `"${(lead.ShortUrl?.leadTitle || "Default").replace(/"/g, '""')}"`,
        `"${(lead.ShortUrl?.targetUrl || "").replace(/"/g, '""')}"`,
        `"${new Date(lead.createdAt).toISOString()}"`,
        `"${(lead.ip || "Unknown").replace(/"/g, '""')}"`,
        `"${(lead.userAgent || "Unknown").replace(/"/g, '""')}"`,
      ]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\r\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="smrl-all-verified-leads.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting cumulative leads CSV:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
