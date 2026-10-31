import { NextResponse } from "next/server";
import { generateOtpCode, storeOtp, sendOtpEmail } from "@/lib/email-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }

    const code = generateOtpCode();
    storeOtp(email, code);

    const emailResult = await sendOtpEmail(email, code, name || "Administrator");

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${email}.`,
      provider: emailResult.provider,
      previewCode: process.env.NODE_ENV !== "production" ? emailResult.previewCode : undefined,
    });
  } catch (error: unknown) {
    console.error("Error sending 2FA OTP:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to dispatch verification email. Please try again.",
      },
      { status: 500 }
    );
  }
}
