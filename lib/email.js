import nodemailer from "nodemailer";

/**
 * Configure SMTP transporter using standard environment variables with automatic
 * Gmail service support and whitespace/quote sanitization.
 */
function getTransporter() {
  const rawHost = process.env.SMTP_HOST;
  const rawPort = process.env.SMTP_PORT;
  const rawSecure = process.env.SMTP_SECURE;
  const rawUser = process.env.SMTP_USER || process.env.SMTP_USERNAME;
  const rawPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

  if (!rawHost || !rawUser || !rawPass) {
    return null;
  }

  // Clean host, user, and password from accidental surrounding quotes and whitespace
  const host = rawHost.trim().replace(/^["']|["']$/g, "");
  const user = rawUser.trim().replace(/^["']|["']$/g, "");
  // Crucial: Google App Passwords are shown as 'xxxx xxxx xxxx xxxx' (with spaces).
  // Stripping spaces ensures authentication succeeds even if copied directly from Google.
  const pass = rawPass.trim().replace(/^["']|["']$/g, "").replace(/\s+/g, "");
  const port = parseInt(rawPort || "587", 10);
  const secure = rawSecure === "true" || port === 465;

  const isGmail =
    host.toLowerCase().includes("gmail") || user.toLowerCase().endsWith("@gmail.com");

  if (isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Send 6-digit OTP verification email for email-gated links.
 *
 * @param {Object} options
 * @param {string} options.toEmail
 * @param {string} options.otp
 * @param {string} options.slug
 * @param {string} [options.leadTitle]
 */
export async function sendOtpEmail({ toEmail, otp, slug, leadTitle }) {
  const transporter = getTransporter();
  const title = leadTitle ? `"${leadTitle}"` : `/${slug}`;

  const cleanUser = (process.env.SMTP_USER || process.env.SMTP_USERNAME || "")
    .trim()
    .replace(/^["']|["']$/g, "");

  const fromAddress = process.env.SMTP_FROM
    ? process.env.SMTP_FROM.trim().replace(/^["']|["']$/g, "")
    : cleanUser
    ? `"SMRL" <${cleanUser}>`
    : '"SMRL Security" <noreply@smrl.app>';

  // If SMTP is not yet configured in environment, log gracefully
  if (!transporter) {
    console.log("-----------------------------------------");
    console.log(`[SMRL DEV OTP] To: ${toEmail}`);
    console.log(`[SMRL DEV OTP] Link: /${slug} (${leadTitle || "Lead Gate"})`);
    console.log(`[SMRL DEV OTP] Code: ${otp}`);
    console.log("-----------------------------------------");
    return { success: true, simulated: true };
  }

  const subject = `Your verification code for ${leadTitle || `link /${slug}`}: ${otp}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #09090b; width: 100%; min-height: 100vh; padding: 40px 20px;">
    <tr>
      <td align="center" valign="middle">
        <table role="presentation" width="100%" style="max-width: 460px; background-color: #18181b; border: 1px solid #27272a; border-radius: 24px; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; background-color: #27272a; border: 1px solid #3f3f46; border-radius: 12px; padding: 8px 16px;">
                <span style="font-size: 14px; font-weight: 800; letter-spacing: 2px; color: #ffffff;">SMRL</span>
                <span style="font-size: 11px; color: #a1a1aa; margin-left: 6px;">VERIFICATION GATE</span>
              </div>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                Access Verification Code
              </h1>
            </td>
          </tr>

          <!-- Subtitle -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #a1a1aa;">
                You requested access to ${title}. Please enter the one-time passcode below to verify your email and proceed.
              </p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <div style="background-color: #09090b; border: 1px solid #3f3f46; border-radius: 18px; padding: 20px 24px; text-align: center;">
                <div style="font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #ffffff; text-indent: 10px;">
                  ${otp}
                </div>
              </div>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 12px; color: #71717a;">
                ⏱ This verification code is valid for <strong>10 minutes</strong>.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom: 20px;">
              <div style="height: 1px; background-color: #27272a; width: 100%;"></div>
            </td>
          </tr>

          <!-- Footer Security Notice -->
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 11px; line-height: 16px; color: #52525b;">
                If you did not request this link access, you can safely ignore this email. No access will be granted without entering this verification code.
              </p>
              <p style="margin: 12px 0 0 0; font-size: 10px; color: #3f3f46; font-family: monospace;">
                Secured by SMRL Engine
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const info = await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject,
    text: `Your SMRL verification code for ${leadTitle || `/${slug}`} is: ${otp}. It will expire in 10 minutes.`,
    html,
  });

  return { success: true, messageId: info.messageId };
}
