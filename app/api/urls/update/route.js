import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAllowedUser } from "@/lib/auth";
import { hashPassword } from "@/lib/security";
import prisma from "@/lib/prisma";

export async function PATCH(request) {
  try {
    // Check authentication and authorization
    const authResult = await verifyAllowedUser();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const { userId } = authResult;

    const body = await request.json();
    const {
      id,
      newSlug,
      newTargetUrl,
      password,
      removePassword,
      expiresAt,
      maxClicks,
      isActive,
      resetClicks,
    } = body;

    // Validate inputs
    if (!id) {
      return NextResponse.json(
        { error: "URL ID is required" },
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

    const host = request.headers.get("host");

    // Validate new target URL if provided
    if (newTargetUrl) {
      if (!newTargetUrl.startsWith("https://")) {
        return NextResponse.json(
          { error: "Target URL must start with https://" },
          { status: 400 }
        );
      }
      let parsedUrl;
      try {
        parsedUrl = new URL(newTargetUrl);
      } catch (e) {
        return NextResponse.json(
          { error: "Invalid target URL format" },
          { status: 400 }
        );
      }
      if (host && parsedUrl.host === host) {
        return NextResponse.json(
          { error: "Target URL cannot point to this domain" },
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

    // Check ownership
    if (existingUrl.userId && existingUrl.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this URL" },
        { status: 403 }
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
    if (!existingUrl.userId) updateData.userId = userId;

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (removePassword) {
      updateData.passwordHash = null;
      updateData.passwordSalt = null;
    } else if (password && password.trim()) {
      const hashed = hashPassword(password.trim());
      if (hashed) {
        updateData.passwordHash = hashed.hash;
        updateData.passwordSalt = hashed.salt;
      }
    }

    if (expiresAt !== undefined) {
      if (expiresAt === null || expiresAt === "") {
        updateData.expiresAt = null;
      } else {
        const d = new Date(expiresAt);
        if (!isNaN(d.getTime())) {
          updateData.expiresAt = d;
        }
      }
    }

    if (maxClicks !== undefined) {
      if (maxClicks === null || maxClicks === "") {
        updateData.maxClicks = null;
      } else {
        const parsed = parseInt(maxClicks, 10);
        updateData.maxClicks = !isNaN(parsed) && parsed > 0 ? parsed : null;
      }
    }

    if (resetClicks) {
      updateData.clicks = 0;
    }

    // Update the URL (with transaction if resetting clicks and logs)
    let updatedUrl;
    if (resetClicks) {
      const [u] = await prisma.$transaction([
        prisma.shortUrl.update({
          where: { id },
          data: updateData,
        }),
        prisma.clickLog.deleteMany({
          where: { shortUrlId: id },
        }),
      ]);
      updatedUrl = u;
    } else {
      updatedUrl = await prisma.shortUrl.update({
        where: { id },
        data: updateData,
      });
    }

    // Build full short URL
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const fullShortUrl = `${protocol}://${host}/r/${updatedUrl.slug}`;

    // Revalidate dashboard pages to show updated URL
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/urls");
    revalidatePath(`/dashboard/urls/${id}/edit`);
    revalidatePath(`/dashboard/urls/${id}/stats`);

    return NextResponse.json(
      {
        id: updatedUrl.id,
        slug: updatedUrl.slug,
        shortUrl: fullShortUrl,
        targetUrl: updatedUrl.targetUrl,
        clicks: updatedUrl.clicks,
        isPasswordProtected: !!updatedUrl.passwordHash,
        expiresAt: updatedUrl.expiresAt ? updatedUrl.expiresAt.toISOString() : null,
        maxClicks: updatedUrl.maxClicks,
        isActive: updatedUrl.isActive,
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
