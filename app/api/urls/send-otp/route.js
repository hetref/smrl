import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateNumericOtp, hashOtp } from "@/lib/security";
import { sendOtpEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { slug, email } = body;

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

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Look up short link
    const link = await prisma.shortUrl.findUnique({
      where: { slug: slug.trim() },
      select: {
        id: true,
        slug: true,
        requireEmail: true,
        leadTitle: true,
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

    if (!link.requireEmail) {
      return NextResponse.json(
        { error: "This link does not require email verification" },
        { status: 400 }
      );
    }

    // Rate limiting: Max 3 OTP requests per 10 minutes per link + email
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentRequestsCount = await prisma.emailOtp.count({
      where: {
        shortUrlId: link.id,
        email: normalizedEmail,
        createdAt: { gte: tenMinutesAgo },
      },
    });

    if (recentRequestsCount >= 3) {
      return NextResponse.json(
        { error: "Too many verification requests. Please wait 10 minutes before requesting another code." },
        { status: 429 }
      );
    }

    // Generate numeric 6-digit OTP
    const otp = generateNumericOtp();
    const hashed = hashOtp(otp);
    if (!hashed) {
      return NextResponse.json(
        { error: "Failed to generate security token" },
        { status: 500 }
      );
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean up older unverified codes for this email and link
    await prisma.emailOtp.deleteMany({
      where: {
        shortUrlId: link.id,
        email: normalizedEmail,
        verified: false,
      },
    });

    // Save new OTP record
    await prisma.emailOtp.create({
      data: {
        shortUrlId: link.id,
        email: normalizedEmail,
        otpHash: hashed.hash,
        otpSalt: hashed.salt,
        expiresAt,
      },
    });

    // Send email via SMTP (or fallback in dev)
    await sendOtpEmail({
      toEmail: normalizedEmail,
      otp,
      slug: link.slug,
      leadTitle: link.leadTitle,
    });

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
    });
  } catch (error) {
    console.error("Error in send-otp:", error);
    let errorMessage = "Failed to send verification code. Please try again.";

    if (
      error?.code === "EAUTH" ||
      error?.responseCode === 535 ||
      error?.message?.includes("535") ||
      error?.message?.includes("BadCredentials")
    ) {
      errorMessage =
        "SMTP Authentication Error (535): Username and password not accepted by Google. Please ensure you are using a 16-character Google App Password (not your personal account password) with 2-Step Verification enabled.";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
