import { NextRequest, NextResponse } from "next/server";

function getStoreTargetBaseUrl(): string {
  if (process.env.BACKEND_STORE_URL) {
    return process.env.BACKEND_STORE_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_STORE_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_STORE_API_BASE_URL.replace(/\/$/, "");
  }
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (apiBase) {
    try {
      const url = new URL(apiBase);
      url.port = "8090";
      return url.origin.replace(/\/$/, "");
    } catch {
      // ignore
    }
  }
  return "http://localhost:8090";
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
      upstreamResponse = await fetch(targetUrl, init);
    } catch {
      upstreamResponse = new Response(null, { status: 502 });
    }

    // If upstream returned 401 or failed, and this is a public settings endpoint,
    // fallback to direct microservice port 8090
    if ((upstreamResponse.status === 401 || !upstreamResponse.ok) && isPublicEndpoint) {
      const fallbacks = [
        `http://192.168.0.138:8090/api/store/settings/public${search}`,
        `http://localhost:8090/api/store/settings/public${search}`,
      ];

      for (const fallbackUrl of fallbacks) {
        if (fallbackUrl === targetUrl) continue;
        try {
          const directHeaders = new Headers(forwardHeaders);
          directHeaders.delete("authorization");
          const fbResponse = await fetch(fallbackUrl, {
            method: "GET",
            headers: directHeaders,
            cache: "no-store",
          });
          if (fbResponse.ok) {
            upstreamResponse = fbResponse;
            break;
          }
        } catch {
          // try next fallback
        }
      }
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
