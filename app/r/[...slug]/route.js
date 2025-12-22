import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    // Next.js 16: params is a Promise and must be awaited
    const { slug: slugArray } = await params;
    const slug = slugArray?.[0];
    
    if (!slug) {
      return new Response("Not Found", { status: 404 });
    }
    
    const record = await prisma.shortUrl.findUnique({
      where: { slug },
      select: { targetUrl: true },
    });
    
    if (!record) {
      return new Response("Not Found", { status: 404 });
    }
    
    // Fire-and-forget analytics (DO NOT await)
    const url = new URL(request.url);
    fetch(`${url.origin}/api/urls/stats`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug,
        referrer: request.headers.get("referer"),
        userAgent: request.headers.get("user-agent"),
      }),
    }).catch(() => {});
    
    // Use Response.redirect (not NextResponse.redirect)
    return Response.redirect(record.targetUrl, 302);
  } catch (error) {
    console.error("Redirect error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
