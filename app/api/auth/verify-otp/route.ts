import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/email-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email and verification code are required." },
        { status: 400 }
      );
    }

    const result = verifyOtp(email, code);

    if (result.valid) {
      return NextResponse.json({
        success: true,
        message: "Two-Factor Authentication successful.",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: result.reason || "Invalid verification code. Please check your email.",
      },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Error verifying 2FA OTP:", error);
    return NextResponse.json(
      { success: false, message: "Internal verification error." },
      { status: 500 }
    );
  }
}
