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
 * Generate a cryptographically secure 6-digit numeric OTP code.
 */
export function generateNumericOtp() {
  const otpNumber = crypto.randomInt(100000, 1000000);
  return otpNumber.toString();
}

/**
 * Hash an OTP code using scrypt with a unique random salt.
 */
export function hashOtp(otp) {
  if (!otp || typeof otp !== "string") return null;
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(otp.trim(), salt, 64).toString("hex");
  return { hash, salt };
}

/**
 * Verify an OTP code against stored hash and salt using timingSafeEqual.
 */
export function verifyOtp(otp, hash, salt) {
  if (!otp || !hash || !salt) return false;
  try {
    const computedHash = crypto.scryptSync(otp.trim(), salt, 64).toString("hex");
    const hashBuffer = Buffer.from(hash, "hex");
    const computedBuffer = Buffer.from(computedHash, "hex");

    if (hashBuffer.length !== computedBuffer.length) return false;
    return crypto.timingSafeEqual(hashBuffer, computedBuffer);
  } catch (err) {
    console.error("OTP verification error:", err);
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

/**
 * Create a signed lead access token for email-verified visitors.
 * Persists for 30 days so users don't have to re-enter email on every click.
 */
export function createLeadAccessToken(urlId, email) {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const payload = `lead:${urlId}:${email.toLowerCase().trim()}:${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

/**
 * Verify a lead access token against urlId.
 */
export function verifyLeadAccessToken(token, urlId) {
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

    const [prefix, tokenUrlId, tokenEmail, expStr] = payload.split(":");
    if (prefix !== "lead") return false;
    const exp = parseInt(expStr, 10);

    if (Date.now() > exp) return false;
    if (tokenUrlId !== urlId) return false;

    return true;
  } catch (err) {
    console.error("Lead token verification error:", err);
    return false;
  }
}
