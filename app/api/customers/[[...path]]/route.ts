import { NextRequest, NextResponse } from "next/server";
import { getServerCustomerUrl } from "@/config/api.config";

/**
 * Backend API target URL for Spring Boot Customer Microservice (Port 8082 or Gateway Port 8080)
 */
const BACKEND_URL = getServerCustomerUrl();

async function handleCustomerProxy(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path && path.length > 0 ? path.join("/") : "";
    const search = request.nextUrl.search || "";
    const targetUrl = `${BACKEND_URL}/api/customers${subPath ? `/${subPath}` : ""}${search}`;

    const forwardHeaders = new Headers();
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        lower !== "host" &&
        lower !== "connection" &&
        lower !== "content-length" &&
        lower !== "transfer-encoding" &&
        lower !== "cookie" &&
        lower !== "set-cookie"
      ) {
        forwardHeaders.set(key, value);
      }
    });

    forwardHeaders.delete("cookie");
    forwardHeaders.delete("set-cookie");

    if (!forwardHeaders.has("accept")) {
      forwardHeaders.set("accept", "application/json");
    }

    const init: RequestInit = {
      method: request.method,
      headers: forwardHeaders,
      cache: "no-store",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      const bodyBuffer = await request.arrayBuffer();
      if (bodyBuffer.byteLength > 0) {
        init.body = bodyBuffer;
      }
    }

    const response = await fetch(targetUrl, init);

    const resHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower !== "transfer-encoding" && lower !== "content-encoding") {
        resHeaders.set(key, value);
      }
    });

    resHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate");

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json") || contentType.includes("text/")) {
      const data = await response.text();
      return new NextResponse(data, {
        status: response.status,
        statusText: response.statusText,
        headers: resHeaders,
      });
    }

    // Binary / CSV / streaming body
    const blob = await response.blob();
    return new NextResponse(blob, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Customer Service is currently unavailable",
        error: error?.message || "Connection refused",
      },
      { status: 503 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleCustomerProxy(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleCustomerProxy(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleCustomerProxy(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleCustomerProxy(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleCustomerProxy(request, context);
}
