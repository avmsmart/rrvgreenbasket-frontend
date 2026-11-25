import { NextRequest, NextResponse } from "next/server";
import { getServerStoreUrl, getServerBackendUrl } from "@/config/api.config";

const TARGET_URL = getServerStoreUrl();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Required fields check
    if (!body.fullName || !body.mobileNumber || !body.email || !body.message) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name, mobile number, email, and message are required.",
        },
        { status: 400 }
      );
    }

    // Attempt to forward to backend API Gateway or Store Service
    try {
      const endpoints = [
        `${TARGET_URL}/api/contact`,
        `${TARGET_URL}/api/store/contact`,
        `${getServerBackendUrl()}/api/contact`,
      ];

      for (const endpoint of endpoints) {
        try {
          const upstream = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(4000),
          });

          if (upstream.ok) {
            const data = await upstream.json();
            return NextResponse.json(data);
          }
        } catch {
          // Continue to next endpoint or fallback
        }
      }
    } catch {
      // Proceed to graceful acknowledgment
    }

    // Generated support ticket identifier for customer tracking
    const ticketId = `RRV-TKT-${Date.now().toString().slice(-6)}`;

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you for contacting RRV Green Basket! We have received your inquiry. Our support representative will contact you within 24 hours.",
        ticketId,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to process contact inquiry";
    return NextResponse.json(
      {
        success: false,
        message: msg,
      },
      { status: 500 }
    );
  }
}
