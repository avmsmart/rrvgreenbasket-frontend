import { NextRequest, NextResponse } from "next/server";

/**
 * Resolves Backend API Gateway target URL for Spring Boot Cart microservice
 */
function getBackendUrl(): string {
  const envUrl =
    process.env.BACKEND_CART_URL ||
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_CART_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (envUrl && !envUrl.includes("192.168.0.107")) {
    return envUrl.replace(/\/$/, "");
  }
  return "http://192.168.0.138:8080";
}

async function handleCartProxy(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path && path.length > 0 ? path.join("/") : "";
    const search = request.nextUrl.search || "";
    const backendBase = getBackendUrl();
    const targetUrl = `${backendBase}/api/cart${subPath ? `/${subPath}` : ""}${search}`;

    const forwardHeaders = new Headers();

    // Selectively forward only safe REST headers from incoming request
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      // Skip connection headers, host, cookies, and transfer encodings
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

    // Ensure Accept and Content-Type defaults
    if (!forwardHeaders.has("accept")) {
      forwardHeaders.set("accept", "application/json");
    }

    // Resolve Authorization: Bearer token
    let authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader) {
      // Check customer cookie fallback
      const cookieToken =
        request.cookies.get("rrv_customer_access_token")?.value ||
        request.cookies.get("CUSTOMER_ACCESS_TOKEN_KEY")?.value;
      if (cookieToken) {
        const clean = decodeURIComponent(cookieToken)
          .replace(/^Bearer\s+/i, "")
          .replace(/^["']|["']$/g, "")
          .trim();
        if (clean && clean !== "undefined" && clean !== "null") {
          authHeader = `Bearer ${clean}`;
        }
      }
    }

    if (authHeader) {
      const cleanAuth = authHeader
        .replace(/^Bearer\s+/i, "")
        .replace(/^["']|["']$/g, "")
        .trim();
      forwardHeaders.set("Authorization", `Bearer ${cleanAuth}`);
      forwardHeaders.set("authorization", `Bearer ${cleanAuth}`);
    }

    // Explicitly delete any forwarded cookie headers to prevent Spring Security session revocation errors
    forwardHeaders.delete("cookie");
    forwardHeaders.delete("set-cookie");

    const init: RequestInit = {
      method: request.method,
      headers: forwardHeaders,
      cache: "no-store",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        const bodyText = await request.text();
        if (bodyText) {
          try {
            const parsed = JSON.parse(bodyText);
            if (parsed && typeof parsed === "object") {
              const pId = parsed.productPublicId || parsed.productId;
              const qty = Number(parsed.quantityKg ?? parsed.quantity) || 1;
              const cleanPayload: Record<string, any> = {};
              if (pId) {
                cleanPayload.productPublicId = pId;
              }
              cleanPayload.quantityKg = qty;
              init.body = JSON.stringify(cleanPayload);
              forwardHeaders.set("Content-Type", "application/json");
            } else {
              init.body = bodyText;
            }
          } catch {
            init.body = bodyText;
          }
        }
      } catch {
        // empty body
      }
    }

    const upstreamResponse = await fetch(targetUrl, init);

    // Prepare clean response headers, completely stripping upstream duplicate CORS headers
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

    if (!upstreamResponse.ok) {
      console.warn(
        `[CartProxy ${request.method}] ${targetUrl} responded with status ${upstreamResponse.status}: ${upstreamResponse.statusText}`
      );
    }

    const bodyBuffer = await upstreamResponse.arrayBuffer();
    return new NextResponse(bodyBuffer, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Cart service proxy error";
    console.error("[CartProxy Error]:", errorMessage);
    return NextResponse.json(
      {
        status: 502,
        error: "Bad Gateway",
        message: `Cart service connection failed: ${errorMessage}`,
        path: "/api/cart",
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

export const GET = handleCartProxy;
export const POST = handleCartProxy;
export const PUT = handleCartProxy;
export const DELETE = handleCartProxy;
export const PATCH = handleCartProxy;
export const HEAD = handleCartProxy;
