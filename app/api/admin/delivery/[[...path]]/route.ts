import { NextRequest, NextResponse } from "next/server";

/**
 * Backend API Gateway target URL for Spring Boot Admin Delivery Microservice
 */
const BACKEND_URL = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_DELIVERY_API_BASE_URL ||
  process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://192.168.0.138:8080"
).replace(/\/$/, "");

async function handleAdminDeliveryProxy(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path && path.length > 0 ? path.join("/") : "";
    const search = request.nextUrl.search || "";
    const targetUrl = `${BACKEND_URL}/api/admin/delivery${subPath ? `/${subPath}` : ""}${search}`;

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
        if (!forwardHeaders.has("content-type")) {
          forwardHeaders.set("content-type", "application/json");
        }
      }
    }

    const upstreamResponse = await fetch(targetUrl, init);

    const responseHeaders = new Headers();
    upstreamResponse.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        !lower.startsWith("access-control-") &&
        lower !== "content-encoding" &&
        lower !== "content-length" &&
        lower !== "transfer-encoding"
      ) {
        responseHeaders.set(key, value);
      }
    });

    const bodyBuffer = await upstreamResponse.arrayBuffer();
    return new NextResponse(bodyBuffer, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Admin delivery service proxy error";
    return NextResponse.json(
      {
        status: 502,
        error: "Bad Gateway",
        message: `Admin delivery service connection failed: ${errorMessage}`,
        path: "/api/admin/delivery",
      },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminDeliveryProxy(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminDeliveryProxy(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminDeliveryProxy(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminDeliveryProxy(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminDeliveryProxy(request, context);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
