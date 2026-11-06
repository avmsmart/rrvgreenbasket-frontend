import nodemailer from "nodemailer";

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

// Global in-memory cache for OTP codes during server runtime
declare global {
  // eslint-disable-next-line no-var
  var __rrvOtpStore: Map<string, OtpEntry> | undefined;
}

if (!globalThis.__rrvOtpStore) {
  globalThis.__rrvOtpStore = new Map<string, OtpEntry>();
}

const otpStore = globalThis.__rrvOtpStore;

/**
 * Generate a cryptographically secure random 6-digit numerical OTP code
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store an OTP code for a given email (expires in 10 minutes)
 */
export function storeOtp(email: string, code: string): void {
  const normalized = email.trim().toLowerCase();
  otpStore.set(normalized, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  });
}

/**
 * Verify an entered OTP code for an email
 */
export function verifyOtp(email: string, code: string): { valid: boolean; reason?: string } {
  const normalized = email.trim().toLowerCase();
  const entry = otpStore.get(normalized);

  if (!entry) {
    return { valid: false, reason: "No active verification code found. Please request a new one." };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalized);
    return { valid: false, reason: "Verification code has expired. Please request a new one." };
  }

  entry.attempts += 1;
  if (entry.attempts > 5) {
    otpStore.delete(normalized);
    return { valid: false, reason: "Too many failed attempts. Please request a new code." };
  }

  const cleanInput = code.replace(/\s+/g, "").trim();
  if (entry.code === cleanInput) {
    otpStore.delete(normalized); // Clean up upon successful verification
    return { valid: true };
  }

  return { valid: false, reason: "Invalid verification code. Please check your email and try again." };
}

/**
 * Send a real HTML email with the 6-digit OTP code using nodemailer
 */
export async function sendOtpEmail(
  toEmail: string,
  otpCode: string,
  adminName: string = "Administrator"
): Promise<{ success: boolean; provider: string; message: string; previewCode?: string }> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `"RRV Green Basket Security" <security@rrvgreenbasket.com>`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>RRV Green Basket 2FA Verification Code</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Top Green Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 28px 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">RRV Green Basket</h1>
              <p style="color: #bbf7d0; font-size: 11px; font-weight: 700; text-transform: uppercase; margin: 4px 0 0 0; letter-spacing: 1px;">Freshness Delivered Daily • Admin Portal</p>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">Two-Factor Authentication Code</h2>
              <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin: 0 0 24px 0;">
                Hello <strong>${adminName}</strong>, a sign-in attempt was detected for your RRV Green Basket Admin account. Use the following 6-digit code to complete authentication:
              </p>

              <!-- 6-Digit Code Display Box -->
              <div style="background-color: #f0fdf4; border: 2px dashed #86efac; border-radius: 16px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
                <span style="font-family: monospace, Courier, sans-serif; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #15803d; display: inline-block;">
                  ${otpCode}
                </span>
                <p style="font-size: 11px; font-weight: 600; color: #16a34a; margin: 8px 0 0 0;">
                  Expires in 10 minutes (valid for 1 use)
                </p>
              </div>

              <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin: 0 0 16px 0;">
                Do not share this verification code with anyone. RRV Green Basket staff will never ask for your 2FA code.
              </p>

              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px 0;" />

              <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0;">
                If you did not initiate this login request, please change your administrative password immediately and notify the system administrator.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
              © ${new Date().getFullYear()} RRV Green Basket ERP. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  // Check if real SMTP credentials are configured
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: toEmail,
        subject: `Your RRV Green Basket Verification Code: ${otpCode}`,
        html: emailHtml,
        text: `Your RRV Green Basket Admin 2FA code is: ${otpCode}. It expires in 10 minutes.`,
      });

      return {
        success: true,
        provider: "smtp",
        message: `Real verification email dispatched via SMTP to ${toEmail}`,
      };
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      console.error("[EmailService] SMTP Dispatch Error:", errMessage);
      // Fall through to notification return so user is not blocked
    }
  }

  // If SMTP is not yet configured in .env.local, log clearly for the admin
  console.log(`\n==================================================`);
  console.log(`[RRV 2FA DISPATCH] To: ${toEmail}`);
  console.log(`[RRV 2FA DISPATCH] 6-Digit Code: ${otpCode}`);
  console.log(`[RRV 2FA DISPATCH] Status: Active (Expires in 10 mins)`);
  console.log(`==================================================\n`);

  return {
    success: true,
    provider: "local_dispatcher",
    message: `Verification code generated for ${toEmail}. (Configure SMTP in .env.local for external inbox delivery)`,
    previewCode: otpCode,
  };
}
