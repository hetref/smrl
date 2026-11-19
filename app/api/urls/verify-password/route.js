import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createLinkAccessToken } from "@/lib/security";

// In-memory rate limiting map: key = `${ip}:${slug}`, value = { count, resetTime }
const rateLimitMap = new Map();

function isRateLimited(key) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry) return false;

  if (now > entry.resetTime) {
    rateLimitMap.delete(key);
    return false;
  }

  return entry.count >= 5;
}

function recordAttempt(key, success) {
  const now = Date.now();
  if (success) {
    rateLimitMap.delete(key);
    return;
  }

  const entry = rateLimitMap.get(key) || { count: 0, resetTime: now + 5 * 60 * 1000 };
  entry.count += 1;
  rateLimitMap.set(key, entry);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { slug, password } = body;

    if (!slug || !password) {
      return NextResponse.json(
        { error: "Slug and password are required" },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
    const rateLimitKey = `${ip}:${slug}`;

    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please wait 5 minutes before trying again." },
        { status: 429 }
      );
    }

    const record = await prisma.shortUrl.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        passwordHash: true,
        passwordSalt: true,
        isActive: true,
        expiresAt: true,
        maxClicks: true,
        clicks: true,
      },
    });

    if (!record || !record.passwordHash) {
      return NextResponse.json(
        { error: "This link does not exist or does not require a password" },
        { status: 404 }
      );
    }

    if (!record.isActive) {
      return NextResponse.json(
        { error: "This link has been paused by the owner" },
        { status: 403 }
      );
    }

    if (record.expiresAt && new Date() > new Date(record.expiresAt)) {
      return NextResponse.json(
        { error: "This link has expired" },
        { status: 410 }
      );
    }

    if (record.maxClicks !== null && record.clicks >= record.maxClicks) {
      return NextResponse.json(
        { error: "This link has reached its maximum click limit" },
        { status: 410 }
      );
    }

    const isValid = verifyPassword(password, record.passwordHash, record.passwordSalt);

    if (!isValid) {
      recordAttempt(rateLimitKey, false);
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    // Success: clear rate limit counter and generate signed token
    recordAttempt(rateLimitKey, true);
    const token = createLinkAccessToken(record.id, record.slug);

    const response = NextResponse.json({
      success: true,
      redirectUrl: `/r/${record.slug}`,
    });

    // Set secure, HTTP-only cookie valid for 15 minutes
    response.cookies.set({
      name: `smrl_token_${record.id}`,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Password verification error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
