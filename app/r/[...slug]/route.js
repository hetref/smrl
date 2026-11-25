import { after } from "next/server";
import prisma from "@/lib/prisma";
import { verifyLinkAccessToken, verifyLeadAccessToken } from "@/lib/security";

// Keep dynamic for real-time redirects
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    // Next.js 16: params is a Promise and must be awaited
    const { slug: slugArray } = await params;
    const slug = slugArray?.[0];

    if (!slug) {
      return new Response("Not Found", { status: 404 });
    }

    const requestUrl = new URL(request.url);

    // Query record with all security and gate attributes
    const record = await prisma.shortUrl.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        targetUrl: true,
        clicks: true,
        maxClicks: true,
        expiresAt: true,
        passwordHash: true,
        requireEmail: true,
        leadTitle: true,
        isActive: true,
      },
    });

    if (!record) {
      return new Response("Not Found", { status: 404 });
    }

    // Security Gate 1: Link Paused Check
    if (!record.isActive) {
      return Response.redirect(new URL(`/gate/${slug}?status=paused`, request.url), 307);
    }

    // Security Gate 2: Expiration Date Check
    if (record.expiresAt && new Date() > new Date(record.expiresAt)) {
      return Response.redirect(new URL(`/gate/${slug}?status=expired`, request.url), 307);
    }

    // Security Gate 3: Max Clicks Limit Check
    if (record.maxClicks !== null && record.clicks >= record.maxClicks) {
      return Response.redirect(new URL(`/gate/${slug}?status=limit_reached`, request.url), 307);
    }

    const cookieHeader = request.headers.get("cookie") || "";

    // Security Gate 4: Email Verification Gate (Lead Capture)
    if (record.requireEmail) {
      const leadCookieMatch = cookieHeader.match(new RegExp(`(?:^|; )smrl_lead_${record.id}=([^;]*)`));
      const leadToken = leadCookieMatch ? decodeURIComponent(leadCookieMatch[1]) : null;
      const hasVerifiedEmail = verifyLeadAccessToken(leadToken, record.id);

      if (!hasVerifiedEmail) {
        // Redirect to email verification gate. Target URL remains confidential.
        return Response.redirect(new URL(`/gate/${slug}?status=email`, request.url), 307);
      }
    }

    // Security Gate 5: Password Protection Check
    if (record.passwordHash) {
      const match = cookieHeader.match(new RegExp(`(?:^|; )smrl_token_${record.id}=([^;]*)`));
      const token = match ? decodeURIComponent(match[1]) : null;

      const hasValidAccess = verifyLinkAccessToken(token, record.id, record.slug);

      if (!hasValidAccess) {
        // Redirect to password gate. NEVER expose targetUrl!
        return Response.redirect(new URL(`/gate/${slug}?status=password`, request.url), 307);
      }
    }

    // Safely forward incoming query parameters (UTM tags, tracking, query strings)
    let destinationUrl = record.targetUrl;
    try {
      const parsedDestination = new URL(record.targetUrl);
      requestUrl.searchParams.forEach((val, key) => {
        parsedDestination.searchParams.set(key, val);
      });
      destinationUrl = parsedDestination.toString();
    } catch (e) {
      console.error("Error merging query parameters:", e);
    }

    const referrer = request.headers.get("referer");
    const userAgent = request.headers.get("user-agent");

    // Native Next.js background task: increments click count and logs analytics
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
    return Response.redirect(destinationUrl, 302);
  } catch (error) {
    console.error("Redirect error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
