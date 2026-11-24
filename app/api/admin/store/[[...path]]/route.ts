import { NextRequest, NextResponse } from "next/server";
import { getServerStoreUrl } from "@/config/api.config";

function getStoreTargetBaseUrl(): string {
  return getServerStoreUrl();
}

async function handleAdminStoreProxy(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path && path.length > 0 ? path.join("/") : "";
    const search = request.nextUrl.search || "";
    const targetBase = getStoreTargetBaseUrl();
    const targetUrl = `${targetBase}/api/admin/store${subPath ? `/${subPath}` : ""}${search}`;

    const forwardHeaders = new Headers();
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        lower !== "host" &&
        lower !== "connection" &&
        lower !== "content-length" &&
        lower !== "transfer-encoding"
      ) {
        forwardHeaders.set(key, value);
      }
    });

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

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(targetUrl, init);
    } catch {
      // Fallback attempt to alternate port 8090 if needed
      const directUrl = `${getServerStoreUrl()}/api/admin/store${subPath ? `/${subPath}` : ""}${search}`;
      upstreamResponse = await fetch(directUrl, init);
    }

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

    const responseBody = await upstreamResponse.arrayBuffer();
    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Admin store service proxy error";
    return NextResponse.json(
      {
        success: false,
        message: `Admin store service connection error: ${msg}`,
        data: null,
      },
      { status: 502 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export const GET = handleAdminStoreProxy;
export const POST = handleAdminStoreProxy;
export const PUT = handleAdminStoreProxy;
export const DELETE = handleAdminStoreProxy;
export const PATCH = handleAdminStoreProxy;
export const HEAD = handleAdminStoreProxy;
