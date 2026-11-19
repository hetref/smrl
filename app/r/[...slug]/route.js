import { after } from "next/server";
import prisma from "@/lib/prisma";

// Keep dynamic for real-time redirects
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    // Next.js 16: params is a Promise and must be awaited
    const { slug: slugArray } = await params;
    const slug = slugArray?.[0];

    if (!slug) {
      return new Response("Not Found", { status: 404 });
    }

    // Query with connection pooling optimization
    const record = await prisma.shortUrl.findUnique({
      where: { slug },
      select: { targetUrl: true, id: true },
    });

    if (!record) {
      return new Response("Not Found", { status: 404 });
    }

    const referrer = request.headers.get("referer");
    const userAgent = request.headers.get("user-agent");

    // Native Next.js background task: ensures analytics finish without delaying redirect
    after(async () => {
      try {
        await prisma.$transaction([
          prisma.shortUrl.update({
            where: { id: record.id },
            data: {
              clicks: {
                increment: 1,
              },
            },
          }),
          prisma.clickLog.create({
            data: {
              shortUrlId: record.id,
              referrer: referrer || null,
              userAgent: userAgent || null,
            },
          }),
        ]);
      } catch (analyticsError) {
        console.error("Background analytics error:", analyticsError);
      }
    });

    // Use Response.redirect with 302 temporary redirect
    return Response.redirect(record.targetUrl, 302);
  } catch (error) {
    console.error("Redirect error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
