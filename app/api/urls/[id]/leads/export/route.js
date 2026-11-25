import { verifyAllowedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const authResult = await verifyAllowedUser();
    if (!authResult.authorized) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { userId } = authResult;

    const { id } = await params;
    if (!id) {
      return new Response(JSON.stringify({ error: "URL ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = await prisma.shortUrl.findUnique({
      where: { id },
      include: {
        VerifiedLead: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!url) {
      return new Response(JSON.stringify({ error: "URL not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.userId && url.userId !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Format CSV
    const rows = [
      ["Email", "Verified At", "IP Address", "User Agent"],
      ...url.VerifiedLead.map((lead) => [
        `"${lead.email.replace(/"/g, '""')}"`,
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
        "Content-Disposition": `attachment; filename="smrl-leads-${url.slug}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting leads CSV:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
