import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(request) {
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
    const { id, newSlug } = body;

    // Validate inputs
    if (!id) {
      return NextResponse.json(
        { error: "URL ID is required" },
        { status: 400 }
      );
    }

    if (!newSlug) {
      return NextResponse.json(
        { error: "New slug is required" },
        { status: 400 }
      );
    }

    // Validate new slug format
    const slugRegex = /^[a-zA-Z0-9_-]{4,10}$/;
    if (!slugRegex.test(newSlug)) {
      return NextResponse.json(
        { error: "Slug must be 4-10 characters and contain only letters, numbers, dashes, and underscores" },
        { status: 400 }
      );
    }

    // Check if the URL exists
    const existingUrl = await prisma.shortUrl.findUnique({
      where: { id }
    });

    if (!existingUrl) {
      return NextResponse.json(
        { error: "URL not found" },
        { status: 404 }
      );
    }

    // Check if new slug is already in use (by a different URL)
    const slugInUse = await prisma.shortUrl.findUnique({
      where: { slug: newSlug }
    });

    if (slugInUse && slugInUse.id !== id) {
      return NextResponse.json(
        { error: `Slug '${newSlug}' is already in use` },
        { status: 409 }
      );
    }

    // Update the slug
    const updatedUrl = await prisma.shortUrl.update({
      where: { id },
      data: { slug: newSlug }
    });

    // Build full short URL
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host");
    const fullShortUrl = `${protocol}://${host}/r/${newSlug}`;

    return NextResponse.json(
      {
        id: updatedUrl.id,
        slug: updatedUrl.slug,
        shortUrl: fullShortUrl,
        targetUrl: updatedUrl.targetUrl,
        clicks: updatedUrl.clicks,
        createdAt: updatedUrl.createdAt.toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating short URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
