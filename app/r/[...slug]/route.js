import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    // Extract slug from params
    const slug = params.slug?.[0];

    if (!slug) {
      notFound();
    }

    // Query database for short URL
    const shortUrl = await prisma.shortUrl.findUnique({
      where: { slug }
    });

    if (!shortUrl) {
      notFound();
    }

    // Fire-and-forget analytics logging
    const referrer = request.headers.get("referer") || "";
    const userAgent = request.headers.get("user-agent") || "";
    
    // Don't await - fire and forget
    fetch(new URL("/api/urls/stats", request.url), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        slug,
        referrer,
        userAgent
      })
    }).catch(() => {}); // Silent failure

    // Immediately redirect
    return NextResponse.redirect(shortUrl.targetUrl, 302);
  } catch (error) {
    console.error("Error in redirect proxy:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
