import QRCode from "qrcode";

/**
 * Standard RFC 6238 Time-based One-Time Password (TOTP) implementation
 * Compatible with Google Authenticator, Microsoft Authenticator, Authy, and 1Password.
 */

// Default standard Base32 secret for the single predefined admin
export const PREDEFINED_ADMIN_TOTP_SECRET = "JBSWY3DPEHPK3PXP"; // Decodes to standard test secret

// Base32 Alphabet (RFC 4648)
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Decodes a Base32 string to Uint8Array
 */
export function base32Decode(base32: string): Uint8Array {
  const cleaned = base32.toUpperCase().replace(/=+$/, "").replace(/[\s-]/g, "");
  let bits = "";
  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

/**
 * Formats a Base32 secret into human-readable 4-character chunks
 * e.g. "JBSW Y3DP EHPK 3PXP"
 */
export function formatSecretKey(secret: string): string {
  const clean = secret.replace(/\s+/g, "").toUpperCase();
  return clean.match(/.{1,4}/g)?.join(" ") || clean;
}

/**
 * Generates an RFC 6238 6-digit TOTP code for a given timestamp
 */
export async function generateTotpCode(
  secret: string = PREDEFINED_ADMIN_TOTP_SECRET,
  timestampMs: number = Date.now(),
  periodSeconds: number = 30
): Promise<string> {
  const keyBytes = base32Decode(secret);
  const counter = Math.floor(timestampMs / 1000 / periodSeconds);

  // Pack 64-bit integer big-endian counter into 8 bytes
  const buffer = new ArrayBuffer(8);
  const dataView = new DataView(buffer);
  const high = Math.floor(counter / 0x100000000);
  const low = counter % 0x100000000;
  dataView.setUint32(0, high, false);
  dataView.setUint32(4, low, false);

  // Compute HMAC-SHA1 using Web Crypto API
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes as BufferSource,
    { name: "HMAC", hash: { name: "SHA-1" } },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, buffer);
  const hmac = new Uint8Array(signature);

  // Dynamic truncation (RFC 4226)
  const offset = hmac[19] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, "0");
  return otp;
}

/**
 * Verifies a 6-digit code against standard Google Authenticator TOTP
 * Allows +/- window (default 1 step = +/- 30s) to absorb client/server clock drift
 */
export async function verifyTotpCode(
  inputCode: string,
  secret: string = PREDEFINED_ADMIN_TOTP_SECRET,
  windowSteps: number = 1
): Promise<boolean> {
  const clean = inputCode.replace(/[\s-]/g, "").trim();
  if (!/^\d{6}$/.test(clean)) return false;

  const now = Date.now();
  for (let step = -windowSteps; step <= windowSteps; step++) {
    const validCode = await generateTotpCode(secret, now + step * 30 * 1000);
    if (validCode === clean) {
      return true;
    }
  }
  return false;
}

/**
 * Returns the number of seconds remaining in the current 30-second TOTP cycle
 */
export function getTotpSecondsRemaining(): number {
  const seconds = Math.floor(Date.now() / 1000);
  return 30 - (seconds % 30);
}

/**
 * Generates the standard otpauth:// URI for Google Authenticator
 */
export function getTotpUri(
  email: string = "admin@rrvgreenbasket.com",
  secret: string = PREDEFINED_ADMIN_TOTP_SECRET,
  issuer: string = "RRV Green Basket"
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generates a high-resolution QR Code base64 Data URL for Google Authenticator pairing
 */
export async function generateTotpQrDataUrl(
  otpauthUri: string
): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthUri, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 256,
      color: {
        dark: "#0f172a", // Slate-900 for high-contrast scanning
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Failed to generate TOTP QR Code Data URL:", err);
    return "";
  }
}
