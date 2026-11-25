/**
 * Centralized API & LAN Configuration for RRV Green Basket
 * 
 * Automatically handles:
 * 1. Localhost development on laptop (localhost:3000 -> localhost:8080)
 * 2. Mobile device / LAN access (192.168.x.x:3000 -> 192.168.x.x:8080)
 * 3. Server-side Next.js route proxies & SSR (local loopback 127.0.0.1:8080)
 * 4. Production deployments via environment variables
 */

function sanitizeUrl(url?: string | null): string {
  if (!url) return "";
  return url.trim().replace(/\/$/, "");
}

function isLoopback(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "0.0.0.0"
  );
}

/**
 * Resolves the host to connect to for backend services when running in the browser.
 * If accessed over a LAN IP (e.g. mobile phone visiting 192.168.0.107:3000),
 * this dynamically points backend requests to the laptop's LAN IP at the given port.
 */
function resolveBrowserHost(
  envUrl: string | undefined,
  defaultPort: number = 8080
): string {
  if (typeof window === "undefined") {
    // Server-side default
    const sanitizedEnv = sanitizeUrl(envUrl);
    if (sanitizedEnv) return sanitizedEnv;
    return `http://127.0.0.1:${defaultPort}`;
  }

  const currentHostname = window.location.hostname;
  const isClientLoopback = isLoopback(currentHostname);
  const sanitizedEnv = sanitizeUrl(envUrl);

  // If env var is explicitly provided
  if (sanitizedEnv) {
    try {
      const parsed = new URL(sanitizedEnv);
      // If we are on mobile/LAN, but the env var points to localhost/127.0.0.1,
      // redirect it to the actual laptop LAN hostname that served this page.
      if (!isClientLoopback && isLoopback(parsed.hostname)) {
        parsed.hostname = currentHostname;
        return sanitizeUrl(parsed.origin);
      }
      return sanitizedEnv;
    } catch {
      return sanitizedEnv;
    }
  }

  // No env var set: construct from window.location.hostname
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  return `${protocol}//${currentHostname}:${defaultPort}`;
}

/**
 * Main API Gateway Base URL (Port 8080 by default)
 */
export function getApiBaseUrl(): string {
  return resolveBrowserHost(
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL,
    8080
  );
}

/**
 * Admin Product & Category API Base URL
 */
export function getProductApiBaseUrl(): string {
  return resolveBrowserHost(
    process.env.NEXT_PUBLIC_ADMIN_PRODUCT_API_BASE_URL ||
    process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL,
    8080
  );
}

/**
 * Customer Auth API Base URL
 */
export function getCustomerAuthApiBaseUrl(): string {
  return resolveBrowserHost(
    process.env.NEXT_PUBLIC_CUSTOMER_AUTH_API_BASE_URL ||
    process.env.NEXT_PUBLIC_CUSTOMER_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL,
    8080
  );
}

/**
 * Customer Service Base URL (Port 8082 or Gateway Port 8080)
 */
export function getCustomerApiBaseUrl(): string {
  return resolveBrowserHost(
    process.env.NEXT_PUBLIC_CUSTOMER_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL,
    8080
  );
}

/**
 * Cart API Base URL
 */
export function getCartApiBaseUrl(): string {
  return resolveBrowserHost(
    process.env.NEXT_PUBLIC_CART_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL,
    8080
  );
}

/**
 * Order API Base URL
 */
export function getOrderApiBaseUrl(): string {
  return resolveBrowserHost(
    process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ||
    process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL,
    8080
  );
}

/**
 * Delivery API Base URL
 */
export function getDeliveryApiBaseUrl(): string {
  return resolveBrowserHost(
    process.env.NEXT_PUBLIC_DELIVERY_API_BASE_URL ||
    process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL,
    8080
  );
}

/**
 * Inventory API Base URL
 */
export function getInventoryApiBaseUrl(): string {
  return resolveBrowserHost(
    process.env.NEXT_PUBLIC_INVENTORY_API_BASE_URL ||
    process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL,
    8080
  );
}

/**
 * Wishlist API Base URL
 */
export function getWishlistApiBaseUrl(): string {
  return resolveBrowserHost(
    process.env.NEXT_PUBLIC_WISHLIST_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL,
    8080
  );
}

/**
 * Store Microservice Base URL (Port 8090 by default)
 */
export function getStoreApiBaseUrl(): string {
  return resolveBrowserHost(
    process.env.NEXT_PUBLIC_STORE_API_BASE_URL ||
    process.env.BACKEND_STORE_URL,
    8090
  );
}

/**
 * Customer Address Microservice Base URL (Port 8082 by default, or routed via 8080)
 */
export function getCustomerAddressApiBaseUrl(): string {
  return resolveBrowserHost(
    process.env.NEXT_PUBLIC_CUSTOMER_ADDRESS_API_BASE_URL ||
    process.env.NEXT_PUBLIC_CUSTOMER_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL,
    8082
  );
}

/**
 * Review Microservice Base URL (Port 8088 by default, or routed via 8080)
 */
export function getReviewApiBaseUrl(): string {
  return resolveBrowserHost(
    process.env.NEXT_PUBLIC_REVIEW_API_BASE_URL ||
    process.env.BACKEND_REVIEW_URL,
    8088
  );
}

/**
 * Server-Side Backend Target URL for Next.js Route Handlers (app/api/**)
 * When running inside Next.js server on the laptop, defaults to 127.0.0.1:8080 loopback
 * to ensure maximum speed and resilience against network changes.
 */
export function getServerBackendUrl(): string {
  const env =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;
  const sanitized = sanitizeUrl(env);
  if (sanitized) return sanitized;
  return "http://127.0.0.1:8080";
}

/**
 * Server-Side Customer Service Target URL for Next.js Route Handlers (app/api/customers/**)
 * Defaults to Gateway Port 8080 or direct Customer Service on Port 8082
 */
export function getServerCustomerUrl(): string {
  const env =
    process.env.BACKEND_CUSTOMER_URL ||
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_CUSTOMER_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;
  const sanitized = sanitizeUrl(env);
  if (sanitized) return sanitized;
  return "http://127.0.0.1:8080";
}

/**
 * Server-Side Store Target URL for Next.js Route Handlers (app/api/store/**)
 */
export function getServerStoreUrl(): string {
  const env =
    process.env.BACKEND_STORE_URL ||
    process.env.NEXT_PUBLIC_STORE_API_BASE_URL;
  const sanitized = sanitizeUrl(env);
  if (sanitized) return sanitized;
  return "http://127.0.0.1:8090";
}

/**
 * Server-Side Review Target URL for Next.js Route Handlers (app/api/reviews/**)
 */
export function getServerReviewUrl(): string {
  const env =
    process.env.BACKEND_REVIEW_URL ||
    process.env.NEXT_PUBLIC_REVIEW_API_BASE_URL;
  const sanitized = sanitizeUrl(env);
  if (sanitized) return sanitized;
  return "http://127.0.0.1:8088";
}
