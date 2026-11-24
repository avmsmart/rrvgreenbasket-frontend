import { NextRequest, NextResponse } from "next/server";
import { getServerStoreUrl } from "@/config/api.config";

function getStoreTargetBaseUrl(): string {
  return getServerStoreUrl();
}

async function handleStoreProxy(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path && path.length > 0 ? path.join("/") : "";
    const search = request.nextUrl.search || "";
    const isPublicEndpoint = subPath === "settings/public";

    const targetBase = getStoreTargetBaseUrl();
    const targetUrl = `${targetBase}/api/store${subPath ? `/${subPath}` : ""}${search}`;
    console.log("[StoreProxy] targetUrl is:", targetUrl, "subPath:", subPath);

    const forwardHeaders = new Headers();
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        lower !== "host" &&
        lower !== "connection" &&
        lower !== "content-length" &&
        lower !== "transfer-encoding"
      ) {
        if (isPublicEndpoint && lower === "authorization") {
          // Public store settings must NEVER require or be blocked by an authorization header
          const trimmed = value.trim();
          if (trimmed && !trimmed.toLowerCase().includes("undefined") && !trimmed.toLowerCase().includes("null")) {
            forwardHeaders.set(key, value);
          }
        } else {
          forwardHeaders.set(key, value);
        }
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
      upstreamResponse = await fetch(targetUrl, {
        ...init,
        signal: AbortSignal.timeout(6000),
      });
    } catch (fetchErr: unknown) {
      const errMsg = fetchErr instanceof Error ? fetchErr.message : "Service connection failed";
      return NextResponse.json(
        {
          success: false,
          status: 502,
          error: "Bad Gateway",
          message: `Store service connection to ${targetUrl} failed: ${errMsg}`,
          path: `/api/store${subPath ? `/${subPath}` : ""}`,
        },
        { status: 502 }
      );
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
    const msg = error instanceof Error ? error.message : "Store service proxy error";
    return NextResponse.json(
      {
        success: false,
        message: `Store service connection error: ${msg}`,
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

export const GET = handleStoreProxy;
export const POST = handleStoreProxy;
export const PUT = handleStoreProxy;
export const DELETE = handleStoreProxy;
export const PATCH = handleStoreProxy;
export const HEAD = handleStoreProxy;
