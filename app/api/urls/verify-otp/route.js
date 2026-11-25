import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyOtp, createLeadAccessToken, verifyLinkAccessToken } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { slug, email, otp } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Link slug is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== "string") {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // Look up short link
    const link = await prisma.shortUrl.findUnique({
      where: { slug: slug.trim() },
      select: {
        id: true,
        slug: true,
        targetUrl: true,
        passwordHash: true,
        requireEmail: true,
        isActive: true,
        expiresAt: true,
        maxClicks: true,
        clicks: true,
      },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Short link not found" },
        { status: 404 }
      );
    }

    if (!link.isActive) {
      return NextResponse.json(
        { error: "This link is currently paused" },
        { status: 403 }
      );
    }

    if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
      return NextResponse.json(
        { error: "This link has expired" },
        { status: 410 }
      );
    }

    if (link.maxClicks !== null && link.clicks >= link.maxClicks) {
      return NextResponse.json(
        { error: "This link has reached its maximum traffic limit" },
        { status: 410 }
      );
    }

    // Find latest active OTP for this email
    const otpRecord = await prisma.emailOtp.findFirst({
      where: {
        shortUrlId: link.id,
        email: normalizedEmail,
        verified: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No pending verification code found. Please request a new code." },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check attempts limit (max 5)
    if (otpRecord.attempts >= 5) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new code." },
        { status: 429 }
      );
    }

    // Verify OTP using timing-safe scrypt comparison
    const isValid = verifyOtp(cleanOtp, otpRecord.otpHash, otpRecord.otpSalt);

    if (!isValid) {
      // Increment failed attempts
      await prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });

      const remainingAttempts = 4 - otpRecord.attempts;
      return NextResponse.json(
        {
          error:
            remainingAttempts > 0
              ? `Invalid code. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.`
              : "Invalid code. Please request a new code.",
        },
        { status: 400 }
      );
    }

    // Extract visitor metadata
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;
    const userAgent = request.headers.get("user-agent") || null;

    // Mark OTP as verified and record VerifiedLead in database
    await prisma.$transaction([
      prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      }),
      prisma.verifiedLead.create({
        data: {
          shortUrlId: link.id,
          email: normalizedEmail,
          ip,
          userAgent,
        },
      }),
    ]);

    // Create 30-day signed lead token
    const leadToken = createLeadAccessToken(link.id, normalizedEmail);

    // Determine destination redirect
    let destinationUrl = `/r/${link.slug}`;

    // If password is also required, check if user has password token cookie
    if (link.passwordHash) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(new RegExp(`(?:^|; )smrl_token_${link.id}=([^;]*)`));
      const passwordToken = match ? decodeURIComponent(match[1]) : null;
      const hasPasswordAccess = verifyLinkAccessToken(passwordToken, link.id, link.slug);

      if (!hasPasswordAccess) {
        destinationUrl = `/gate/${link.slug}?status=password`;
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully!",
      destinationUrl,
    });

    // Set HTTP-only secure cookie for 30 days
    response.cookies.set(`smrl_lead_${link.id}`, leadToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return NextResponse.json(
      { error: "An error occurred during verification. Please try again." },
      { status: 500 }
    );
  }
}
