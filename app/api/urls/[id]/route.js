import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAllowedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "URL ID is required" },
        { status: 400 }
      );
    }

    // Fetch the URL
    const url = await prisma.shortUrl.findUnique({
      where: { id }
    });

    if (!url) {
      return NextResponse.json(
        { error: "URL not found" },
        { status: 404 }
      );
    }

    // Check ownership if URL is associated with a user
    if (url.userId && url.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this URL" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        id: url.id,
        slug: url.slug,
        targetUrl: url.targetUrl,
        clicks: url.clicks,
        isPasswordProtected: !!url.passwordHash,
        expiresAt: url.expiresAt ? url.expiresAt.toISOString() : null,
        maxClicks: url.maxClicks,
        isActive: url.isActive,
        createdAt: url.createdAt.toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "URL ID is required" },
        { status: 400 }
      );
    }

    // Check existing URL
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

    // Delete ClickLogs and ShortUrl in a transaction
    await prisma.$transaction([
      prisma.clickLog.deleteMany({
        where: { shortUrlId: id }
      }),
      prisma.shortUrl.delete({
        where: { id }
      })
    ]);

    // Revalidate dashboard pages
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/urls");

    return NextResponse.json(
      { message: "URL deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
