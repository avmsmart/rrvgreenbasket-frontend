import { NextRequest, NextResponse } from "next/server";

/**
 * Backend API Gateway target URL for Spring Boot microservices
 */
const BACKEND_URL = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_WISHLIST_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://192.168.0.138:8080"
).replace(/\/$/, "");

/**
 * Cached product map to enrich wishlist items without redundant network requests
 */
interface CachedProduct {
  publicId: string;
  id?: string | number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  imageUrl?: string;
  images?: Array<{ imageUrl?: string; url?: string }>;
  pricePerKg?: number;
  totalPrice?: number;
  price?: number;
  originalPrice?: number;
  quantityUnit?: string;
  unit?: string;
  category?: { name?: string } | string;
  available?: boolean;
  stockStatus?: string;
}

let cachedProducts: Map<string, CachedProduct> = new Map();
let lastCacheFetchTime = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

async function getProductCatalog(): Promise<Map<string, CachedProduct>> {
  const now = Date.now();
  if (cachedProducts.size > 0 && now - lastCacheFetchTime < CACHE_TTL_MS) {
    return cachedProducts;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/products`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      const list: CachedProduct[] = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.content)
        ? json.content
        : Array.isArray(json)
        ? json
        : [];

      const newMap = new Map<string, CachedProduct>();
      for (const p of list) {
        if (p.publicId) newMap.set(String(p.publicId).toLowerCase(), p);
        if (p.id) newMap.set(String(p.id).toLowerCase(), p);
        if (p.slug) newMap.set(String(p.slug).toLowerCase(), p);
      }

      cachedProducts = newMap;
      lastCacheFetchTime = now;
    }
  } catch (err) {
    console.warn("[WishlistProxy] Failed to fetch product catalog for enrichment:", err);
  }

  return cachedProducts;
}

/**
 * Enriches a raw wishlist item from the backend with actual Product Service records.
 * Completely eliminates "Simulated Fresh Product" and placeholder static images.
 */
function enrichWishlistItem(rawItem: Record<string, unknown>, catalog: Map<string, CachedProduct>) {
  const publicIdKey = String(
    rawItem.productPublicId ||
    rawItem.productId ||
    rawItem.id ||
    (rawItem.product && (rawItem.product as Record<string, unknown>).publicId) ||
    ""
  ).toLowerCase();

  const productMatch = catalog.get(publicIdKey);

  const rawName = String(rawItem.productName || (rawItem.product && (rawItem.product as Record<string, unknown>).name) || "").trim();
  const isSimulatedName =
    !rawName ||
    rawName.toLowerCase().includes("simulated") ||
    rawName.toLowerCase() === "fresh product" ||
    rawName.toLowerCase() === "product name";

  if (productMatch) {
    const primaryImg =
      productMatch.imageUrl ||
      (productMatch.images && productMatch.images.length > 0
        ? productMatch.images[0].imageUrl || productMatch.images[0].url
        : "") ||
      "";

    const catName =
      typeof productMatch.category === "object" && productMatch.category && "name" in productMatch.category
        ? productMatch.category.name
        : typeof productMatch.category === "string"
        ? productMatch.category
        : (rawItem.category as string) || "Vegetables";

    const sellingPrice =
      productMatch.totalPrice ??
      productMatch.pricePerKg ??
      productMatch.price ??
      (Number(rawItem.price) || 0);

    const origPrice =
      productMatch.originalPrice ??
      Math.round(sellingPrice * 1.15);

    const unitVal =
      productMatch.quantityUnit ||
      productMatch.unit ||
      (rawItem.unit as string) ||
      "KG";

    return {
      wishlistItemId: rawItem.wishlistItemId || rawItem.id || `wish-${publicIdKey}`,
      productId: productMatch.id || rawItem.productId,
      productPublicId: productMatch.publicId || rawItem.productPublicId || publicIdKey,
      productName: isSimulatedName ? productMatch.name : rawName || productMatch.name,
      productDescription: productMatch.description || productMatch.shortDescription || (rawItem.productDescription as string),
      productSlug: productMatch.slug || (rawItem.productSlug as string),
      productImage: primaryImg || (rawItem.productImage as string) || "",
      galleryImages: (productMatch.images || []).map((img) => img.imageUrl || img.url).filter(Boolean) as string[],
      category: catName,
      price: sellingPrice,
      originalPrice: origPrice,
      discountPercent: origPrice > sellingPrice ? Math.round(((origPrice - sellingPrice) / origPrice) * 100) : 0,
      unit: unitVal,
      stockQuantity: (rawItem.stockQuantity as number) ?? 100,
      stockStatus: productMatch.stockStatus || (rawItem.stockStatus as string) || "IN_STOCK",
      availabilityStatus: productMatch.available !== false ? "AVAILABLE" : "UNAVAILABLE",
      isAvailable: productMatch.available !== false && productMatch.stockStatus !== "OUT_OF_STOCK",
      addedAt: (rawItem.addedAt as string) || new Date().toISOString(),
    };
  }

  // Fallback if not matched in product catalog but keep data clean
  return {
    wishlistItemId: rawItem.wishlistItemId || rawItem.id,
    productId: rawItem.productId,
    productPublicId: rawItem.productPublicId || publicIdKey,
    productName: isSimulatedName ? "Farm Fresh Produce" : rawName,
    productDescription: rawItem.productDescription as string,
    productSlug: rawItem.productSlug as string,
    productImage: (rawItem.productImage as string) || "",
    category: (rawItem.category as string) || "Vegetables",
    price: Number(rawItem.price) || 0,
    originalPrice: Number(rawItem.originalPrice) || Math.round((Number(rawItem.price) || 0) * 1.15),
    unit: (rawItem.unit as string) || "KG",
    stockStatus: (rawItem.stockStatus as string) || "IN_STOCK",
    isAvailable: rawItem.isAvailable !== false,
    addedAt: (rawItem.addedAt as string) || new Date().toISOString(),
  };
}

/**
 * Handles all Wishlist API proxy requests from client-side browser to Spring Boot backend.
 * Strips conflicting duplicate CORS headers and enriches wishlist items with actual Product records.
 */
async function handleWishlistProxy(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path && path.length > 0 ? path.join("/") : "";
    const search = request.nextUrl.search || "";
    const targetUrl = `${BACKEND_URL}/api/wishlist${subPath ? `/${subPath}` : ""}${search}`;

    // Prepare headers for upstream Spring Boot API Gateway
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

    const init: RequestInit = {
      method: request.method,
      headers: forwardHeaders,
      cache: "no-store",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        const bodyText = await request.text();
        if (bodyText) {
          // Normalize payload to ensure both productPublicId and productId are present
          try {
            const parsed = JSON.parse(bodyText);
            if (parsed && typeof parsed === "object") {
              const pId = parsed.productPublicId || parsed.productId;
              if (pId) {
                parsed.productPublicId = pId;
                parsed.productId = pId;
              }
              init.body = JSON.stringify(parsed);
              forwardHeaders.set("Content-Type", "application/json");
            } else {
              init.body = bodyText;
            }
          } catch {
            init.body = bodyText;
          }
        }
      } catch {
        // Body reading failed or empty
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

    // Check if this is a GET /api/wishlist retrieval that should be enriched with real product catalog
    const isGetWishlist =
      request.method === "GET" && (subPath === "" || subPath === "items");

    if (isGetWishlist && upstreamResponse.ok) {
      try {
        const json = await upstreamResponse.json();
        const catalog = await getProductCatalog();

        let rawItems: Array<Record<string, unknown>> = [];
        let isWrapped = false;

        if (json && typeof json === "object") {
          if (Array.isArray(json.data?.items)) {
            rawItems = json.data.items;
            isWrapped = true;
          } else if (Array.isArray(json.data)) {
            rawItems = json.data;
            isWrapped = true;
          } else if (Array.isArray(json.items)) {
            rawItems = json.items;
          } else if (Array.isArray(json)) {
            rawItems = json;
          }
        }

        if (rawItems.length > 0) {
          const enrichedItems = rawItems.map((item) => enrichWishlistItem(item, catalog));

          if (isWrapped && json.data) {
            if (Array.isArray(json.data.items)) {
              json.data.items = enrichedItems;
              json.data.totalItems = enrichedItems.length;
            } else if (Array.isArray(json.data)) {
              json.data = enrichedItems;
            }
          } else if (Array.isArray(json.items)) {
            json.items = enrichedItems;
            json.totalItems = enrichedItems.length;
          } else if (Array.isArray(json)) {
            return NextResponse.json(enrichedItems, {
              status: upstreamResponse.status,
              headers: responseHeaders,
            });
          }

          return NextResponse.json(json, {
            status: upstreamResponse.status,
            headers: responseHeaders,
          });
        }
      } catch (enrichErr) {
        console.warn("[WishlistProxy] Failed to enrich wishlist response:", enrichErr);
      }
    }

    const bodyBuffer = await upstreamResponse.arrayBuffer();
    return new NextResponse(bodyBuffer, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Wishlist service proxy error";
    return NextResponse.json(
      {
        success: false,
        message: `Wishlist service connection failed: ${errorMessage}`,
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

export const GET = handleWishlistProxy;
export const POST = handleWishlistProxy;
export const PUT = handleWishlistProxy;
export const DELETE = handleWishlistProxy;
export const PATCH = handleWishlistProxy;
export const HEAD = handleWishlistProxy;
