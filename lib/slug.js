import crypto from "crypto";

/**
 * Generate a random URL-safe slug
 * @param {number} length - Length of slug (default: 6, range: 4-10)
 * @returns {string} Base64url-encoded slug
 */
export function generateSlug(length = 6) {
  return crypto
    .randomBytes(length)
    .toString("base64url")
    .slice(0, length);
}
