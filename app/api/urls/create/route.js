import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";

export async function POST(request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetUrl, customSlug } = body;

    // Validate targetUrl
    if (!targetUrl) {
      return NextResponse.json(
        { error: "Target URL is required" },
        { status: 400 }
      );
    }

    if (!targetUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "Target URL must start with https://" },
        { status: 400 }
      );
    }

    // Validate or generate slug
    let slug = customSlug;
    
    if (customSlug) {
      // Validate custom slug
      const slugRegex = /^[a-zA-Z0-9_-]{4,200}$/;
      if (!slugRegex.test(customSlug)) {
        return NextResponse.json(
          { error: "Custom slug must be 4-200 characters and contain only letters, numbers, dashes, and underscores" },
          { status: 400 }
        );
      }

      // Check if slug already exists
      const existing = await prisma.shortUrl.findUnique({
        where: { slug: customSlug }
      });

      if (existing) {
        return NextResponse.json(
          { error: `Slug '${customSlug}' is already in use` },
          { status: 409 }
        );
      }
    } else {
      // Generate unique slug
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        slug = generateSlug(6);
        const existing = await prisma.shortUrl.findUnique({
          where: { slug }
        });
        
        if (!existing) {
          break;
        }
        attempts++;
      }

      if (attempts === maxAttempts) {
        return NextResponse.json(
          { error: "Failed to generate unique slug. Please try again." },
          { status: 500 }
        );
      }
    }

    // Create short URL
    const shortUrl = await prisma.shortUrl.create({
      data: {
        slug,
        targetUrl
      }
    });

    // Build full short URL
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host");
    const fullShortUrl = `${protocol}://${host}/r/${slug}`;

    return NextResponse.json(
      {
        slug: shortUrl.slug,
        shortUrl: fullShortUrl,
        targetUrl: shortUrl.targetUrl,
        createdAt: shortUrl.createdAt.toISOString()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating short URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
