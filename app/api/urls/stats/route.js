import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { slug, referrer, userAgent } = body;

    if (!slug) {
      return NextResponse.json({ success: true });
    }

    // Find short URL
    const shortUrl = await prisma.shortUrl.findUnique({
      where: { slug }
    });

    // Silently fail if not found
    if (!shortUrl) {
      return NextResponse.json({ success: true });
    }

    // Increment clicks and create log entry in a transaction
    await prisma.$transaction([
      prisma.shortUrl.update({
        where: { id: shortUrl.id },
        data: {
          clicks: {
            increment: 1
          }
        }
      }),
      prisma.clickLog.create({
        data: {
          shortUrlId: shortUrl.id,
          referrer: referrer || null,
          userAgent: userAgent || null
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Silent failure - don't expose errors
    console.error("Error logging analytics:", error);
    return NextResponse.json({ success: true });
  }
}
