import crypto from "crypto";

const SECRET_KEY = process.env.CLERK_SECRET_KEY || "smrl-fallback-security-token-secret-2026";

/**
 * Hash a password using scrypt with a unique random salt.
 */
export function hashPassword(password) {
  if (!password || typeof password !== "string") return null;
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

/**
 * Verify password against stored hash and salt using timingSafeEqual to prevent timing attacks.
 */
export function verifyPassword(password, hash, salt) {
  if (!password || !hash || !salt) return false;
  try {
    const computedHash = crypto.scryptSync(password, salt, 64).toString("hex");
    const hashBuffer = Buffer.from(hash, "hex");
    const computedBuffer = Buffer.from(computedHash, "hex");

    if (hashBuffer.length !== computedBuffer.length) return false;
    return crypto.timingSafeEqual(hashBuffer, computedBuffer);
  } catch (err) {
    console.error("Password verification error:", err);
    return false;
  }
}

/**
 * Create a signed, tamper-proof access token for password-protected links.
 * Token expires in 15 minutes.
 */
export function createLinkAccessToken(urlId, slug) {
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  const payload = `${urlId}:${slug}:${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

/**
 * Verify a link access token against urlId and slug.
 */
export function verifyLinkAccessToken(token, urlId, slug) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [encodedPayload, providedSignature] = parts;

  try {
    const payload = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(payload)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const providedBuffer = Buffer.from(providedSignature, "hex");

    if (expectedBuffer.length !== providedBuffer.length) return false;
    if (!crypto.timingSafeEqual(expectedBuffer, providedBuffer)) return false;

    const [tokenUrlId, tokenSlug, expStr] = payload.split(":");
    const exp = parseInt(expStr, 10);

    if (Date.now() > exp) return false;
    if (tokenUrlId !== urlId || tokenSlug !== slug) return false;

    return true;
  } catch (err) {
    console.error("Token verification error:", err);
    return false;
  }
}
