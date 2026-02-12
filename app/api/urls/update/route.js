import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
    const { id, newSlug, newTargetUrl } = body;

    // Validate inputs
    if (!id) {
      return NextResponse.json(
        { error: "URL ID is required" },
        { status: 400 }
      );
    }

    if (!newSlug && !newTargetUrl) {
      return NextResponse.json(
        { error: "At least one field (slug or target URL) must be provided" },
        { status: 400 }
      );
    }

    // Validate new slug format if provided
    if (newSlug) {
      const slugRegex = /^[a-zA-Z0-9_-]{4,200}$/;
      if (!slugRegex.test(newSlug)) {
        return NextResponse.json(
          { error: "Slug must be 4-200 characters and contain only letters, numbers, dashes, and underscores" },
          { status: 400 }
        );
      }
    }

    // Validate new target URL if provided
    if (newTargetUrl) {
      try {
        new URL(newTargetUrl);
      } catch (e) {
        return NextResponse.json(
          { error: "Invalid target URL format" },
          { status: 400 }
        );
      }
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
    if (newSlug) {
      const slugInUse = await prisma.shortUrl.findUnique({
        where: { slug: newSlug }
      });

      if (slugInUse && slugInUse.id !== id) {
        return NextResponse.json(
          { error: `Slug '${newSlug}' is already in use` },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData = {};
    if (newSlug) updateData.slug = newSlug;
    if (newTargetUrl) updateData.targetUrl = newTargetUrl;

    // Update the URL
    const updatedUrl = await prisma.shortUrl.update({
      where: { id },
      data: updateData
    });

    // Build full short URL
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host");
    const fullShortUrl = `${protocol}://${host}/r/${updatedUrl.slug}`;

    // Revalidate dashboard pages to show updated URL
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/urls");
    revalidatePath(`/dashboard/urls/${id}/edit`);

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
