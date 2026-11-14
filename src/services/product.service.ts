/**
 * RRV Green Basket - Admin Product Management Service
 *
 * Connects frontend application to Java Spring Boot REST backend APIs:
 * Base URL: http://ff:8082
 * API Path: /api/admin/products
 */

import { getAuthToken, removeAuthToken, ApiError } from "./api-client";
import { categoryService } from "./category.service";
import {
  AdminProduct,
  AdminProductPageData,
  AdminProductListResponse,
  AdminProductDetailsResponse,
  AdminProductCreatePayload,
  AdminProductUpdatePayload,
  AdminProductQueryParams,
  ProductStatus,
  Product,
  BackendCategory,
  CategoryApiResponse,
  StoreProduct,
  toApiProductStatus,
  toUiProductStatus,
} from "@/types";

export class AdminProductService {
  // In-memory cache for categories to prevent redundant fetches across forms
  private categoriesCache: BackendCategory[] | null = null;
  private categoriesPromise: Promise<BackendCategory[]> | null = null;

  /**
   * Resolves dedicated base URL for Product Management backend
   */
  public getBaseUrl(): string {
    const envUrl =
      process.env.NEXT_PUBLIC_ADMIN_PRODUCT_API_BASE_URL ||
      process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl) {
      return envUrl.replace(/\/$/, "");
    }
    return "http://localhost:8080";
  }

  /**
   * Clears the in-memory categories cache (used by Retry button or cache refresh)
   */
  public clearCategoryCache(): void {
    this.categoriesCache = null;
    this.categoriesPromise = null;
  }

  /**
   * Builds Authorization & content headers.
   * Never prints token to console.
   */
  private getHeaders(isMultipart = false, skipAuth = false): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (!isMultipart) {
      headers["Content-Type"] = "application/json";
    }

    if (!skipAuth) {
      const token = getAuthToken();
      if (token) {
        const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
        if (cleanToken) {
          headers["Authorization"] = `Bearer ${cleanToken}`;
        }
      }
    }

    return headers;
  }

  /**
   * Low-level fetch wrapper with error status mapping
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isMultipart = false,
    skipAuth = false
  ): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    let cleanBaseUrl = baseUrl;
    if (cleanBaseUrl.endsWith("/api") && normalizedEndpoint.startsWith("/api/")) {
      cleanBaseUrl = cleanBaseUrl.slice(0, -4);
    }
    const url = `${cleanBaseUrl}${normalizedEndpoint}`;

    const headers = {
      ...this.getHeaders(isMultipart, skipAuth),
      ...((options.headers as Record<string, string>) || {}),
    };

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    // For public endpoints (skipAuth = true), strictly omit session cookies and credentials
    if (skipAuth) {
      fetchOptions.credentials = "omit";
    }

    let response: Response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Network error contacting product service";
      throw new ApiError(
        `Unable to reach Product Management service (${baseUrl}): ${message}`,
        0,
        null,
        true
      );
    }

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      // Handle 401 Unauthorized for authenticated endpoints
      if (response.status === 401 && !skipAuth) {
        removeAuthToken();
        throw new ApiError(
          "Admin session expired or unauthorized. Please sign in again.",
          401,
          errorData
        );
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new ApiError(
          "Access denied. You do not have administrator permissions for products.",
          403,
          errorData
        );
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        throw new ApiError(
          `Product or resource not found: ${endpoint}`,
          404,
          errorData
        );
      }

      const message =
        errorData && typeof errorData === "object" && "message" in errorData
          ? String((errorData as { message: unknown }).message)
          : `Product API request failed with status ${response.status}`;

      throw new ApiError(message, response.status, errorData, false);
    }

    if (response.status === 204) {
      return (null as unknown) as T;
    }

    const json = await response.json();

    // Unwrap standard ApiResponse { success, data, message } if present
    if (json && typeof json === "object" && "data" in json && "success" in json) {
      return json.data as T;
    }

    return json as T;
  }

  /**
   * GET /api/products/categories
   * Public API endpoint that retrieves active categories from the Spring Boot backend.
   * Delegates to CategoryService.getPublicCategories without admin credentials.
   *
   * @param forceRefresh - When true, bypasses in-memory cache and re-queries backend
   */
  async getCategories(forceRefresh = false): Promise<BackendCategory[]> {
    const cats = await categoryService.getPublicCategories(forceRefresh);
    return cats as unknown as BackendCategory[];
  }

  /**
   * GET /api/admin/products or /api/products
   * List products with pagination, search, category, and availability filters.
   * Supports filtering by exact categoryId.
   */
  async getProducts(
    params?: AdminProductQueryParams,
    isStorefront = false
  ): Promise<AdminProductPageData> {
    const searchParams = new URLSearchParams();

    // Page number: Spring Boot uses 0-based page index
    const pageIndex = params?.page !== undefined ? Math.max(0, params.page) : 0;
    searchParams.append("page", String(pageIndex));
    searchParams.append("pageable.page", String(pageIndex));

    // Page size: Admin max 10, storefront default up to 50
    const defaultSize = isStorefront ? 50 : 10;
    const pageSize = params?.size ? params.size : defaultSize;
    searchParams.append("size", String(pageSize));
    searchParams.append("pageable.size", String(pageSize));

    // Send categoryId when selected and not "All"
    if (params?.categoryId && params.categoryId !== "All") {
      searchParams.append("categoryId", params.categoryId);
    } else if (params?.category && params.category !== "All") {
      searchParams.append("category", params.category);
    }

    if (params?.search && params.search.trim()) {
      searchParams.append("search", params.search.trim());
    }

    if (params?.available !== undefined) {
      searchParams.append("available", String(params.available));
    }

    if (params?.status && params.status !== "All") {
      searchParams.append("status", params.status);
    }

    if (params?.sort) {
      searchParams.append("sort", params.sort);
      searchParams.append("pageable.sort", params.sort);
    }

    const queryString = searchParams.toString();
    const primaryEndpoint = isStorefront
      ? `/api/products${queryString ? `?${queryString}` : ""}`
      : `/api/admin/products${queryString ? `?${queryString}` : ""}`;

    try {
      return await this.request<AdminProductPageData>(
        primaryEndpoint,
        {
          method: "GET",
        },
        false,
        isStorefront
      );
    } catch (err: unknown) {
      if (isStorefront && err instanceof ApiError && err.status === 404) {
        // Fallback to /api/admin/products if public storefront endpoint is unmapped
        const fallbackEndpoint = `/api/admin/products${queryString ? `?${queryString}` : ""}`;
        return await this.request<AdminProductPageData>(
          fallbackEndpoint,
          {
            method: "GET",
          },
          false,
          true
        );
      }
      throw err;
    }
  }

  /**
   * Fetch storefront products for the customer home page
   */
  async getStorefrontProducts(params?: AdminProductQueryParams): Promise<AdminProductPageData> {
    return this.getProducts(params, true);
  }

  /**
   * Fetches all products across all pages from Product Service admin API.
   * Reused by Inventory Service for full catalogue synchronization.
   */
  async getAllProducts(params?: AdminProductQueryParams): Promise<AdminProduct[]> {
    try {
      const firstPage = await this.getProducts({ ...params, page: 0, size: 100 });
      let allProducts: AdminProduct[] = [];

      if (Array.isArray(firstPage)) {
        allProducts = firstPage;
      } else if (firstPage && Array.isArray(firstPage.content)) {
        allProducts = [...firstPage.content];
        const totalPages = firstPage.totalPages || 1;
        for (let p = 1; p < totalPages; p++) {
          const nextPage = await this.getProducts({ ...params, page: p, size: 100 });
          if (nextPage && Array.isArray(nextPage.content)) {
            allProducts.push(...nextPage.content);
          } else if (Array.isArray(nextPage)) {
            allProducts.push(...(nextPage as AdminProduct[]));
          }
        }
      } else if (firstPage && typeof firstPage === "object" && Array.isArray((firstPage as any).data)) {
        allProducts = (firstPage as any).data;
      }

      return allProducts;
    } catch (adminErr) {
      // Fallback: try public storefront products if admin products fails
      try {
        const publicPage = await this.getStorefrontProducts({ ...params, size: 100 });
        if (Array.isArray(publicPage)) return publicPage;
        if (publicPage && Array.isArray(publicPage.content)) return publicPage.content;
        if (publicPage && typeof publicPage === "object" && Array.isArray((publicPage as any).data)) {
          return (publicPage as any).data;
        }
      } catch {
        // If storefront also fails, rethrow original admin error
      }
      throw adminErr;
    }
  }

  /**
   * Public storefront product lookup by publicId or ID
   * Strictly unauthenticated - never requires admin login
   */
  async getStorefrontProductById(rawId: string): Promise<AdminProduct | null> {
    if (!rawId?.trim()) return null;

    const needle = decodeURIComponent(rawId).toLowerCase().trim();

    // 1. Try public endpoint directly: GET /api/products/{rawId}
    // Strictly unauthenticated - never requires admin login
    try {
      const res = await this.request<AdminProduct | { data: AdminProduct }>(
        `/api/products/${encodeURIComponent(rawId)}`,
        { method: "GET" },
        false,
        true // skipAuth = true
      );
      if (res && typeof res === "object") {
        if ("data" in res && res.data) {
          return res.data;
        }
        if ("name" in res || "publicId" in res) {
          return res as AdminProduct;
        }
      }
    } catch {
      // Proceed to storefront catalog lookup
    }

    // 2. Fallback: Search in public storefront catalog (matches by publicId, id, slug, or name)
    try {
      const list = await this.getStorefrontProducts({ size: 100 });
      const rawProducts: AdminProduct[] = Array.isArray(list)
        ? list
        : Array.isArray((list as unknown as { content?: AdminProduct[] })?.content)
        ? (list as unknown as { content: AdminProduct[] }).content
        : Array.isArray((list as unknown as { data?: AdminProduct[] })?.data)
        ? (list as unknown as { data: AdminProduct[] }).data
        : [];

      if (rawProducts.length > 0) {
        const found = rawProducts.find((p) => {
          const pId = String(p.id || "").toLowerCase();
          const pPub = (p.publicId || "").toLowerCase();
          const pSlug = (p.slug || "").toLowerCase();
          const pName = (p.name || "").toLowerCase();

          return (
            pPub === needle ||
            pId === needle ||
            pSlug === needle ||
            pSlug.endsWith(`-${needle}`) ||
            needle.endsWith(`-${pSlug}`) ||
            pName === needle ||
            pName.replace(/\s+/g, "-") === needle ||
            needle.replace(/\s+/g, "-") === pName.replace(/\s+/g, "-") ||
            (pSlug && needle.includes(pSlug)) ||
            (needle && pSlug.includes(needle))
          );
        });

        if (found) {
          // If found has a publicId, try to get full details, else return found
          if (found.publicId && found.publicId !== rawId) {
            try {
              const fullRes = await this.request<AdminProduct | { data: AdminProduct }>(
                `/api/products/${encodeURIComponent(found.publicId)}`,
                { method: "GET" },
                false,
                true
              );
              if (fullRes && typeof fullRes === "object") {
                if ("data" in fullRes && fullRes.data) return fullRes.data;
                if ("name" in fullRes) return fullRes as AdminProduct;
              }
            } catch {
              // use found
            }
          }
          return found;
        }
      }
    } catch (catalogErr) {
      console.warn("[getStorefrontProductById] Catalog fallback lookup failed:", catalogErr);
    }

    return null;
  }

  /**
   * GET /api/admin/products/{publicId}
   * Fetch complete product details (ADMIN ONLY)
   */
  async getProductById(publicId: string): Promise<AdminProduct> {
    return this.request<AdminProduct>(
      `/api/admin/products/${encodeURIComponent(publicId)}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * POST /api/admin/products
   * Create a new product with multipart/form-data (product JSON + optional images)
   */
  async createProduct(
    product: AdminProductCreatePayload,
    images?: File[]
  ): Promise<AdminProduct> {
    const formData = new FormData();

    // Clean payload to prevent undefined fields
    const cleanPayload = Object.fromEntries(
      Object.entries(product).filter(([_, v]) => v !== undefined && v !== null)
    );

    // Append JSON blob with filename "product.json" so Spring Boot @RequestPart reliably parses it as application/json
    const productBlob = new Blob([JSON.stringify(cleanPayload)], {
      type: "application/json",
    });
    formData.append("product", productBlob, "product.json");

    // Append multiple image files under part name "images"
    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append("images", file, file.name);
      });
    }

    return this.request<AdminProduct>(
      "/api/admin/products",
      {
        method: "POST",
        body: formData,
      },
      true // isMultipart
    );
  }

  /**
   * PUT /api/admin/products/{publicId}?replaceImages=false
   * Update complete product information and optionally upload/replace images.
   *
   * Intelligently selects transport:
   * - When no images are being uploaded, uses clean application/json (PATCH or PUT)
   *   to avoid Tomcat multipart PUT servlet parsing issues.
   * - When images are uploaded or replaced, uses multipart/form-data with "product.json" and "images".
   */
  async updateProduct(
    publicId: string,
    product: AdminProductUpdatePayload,
    images?: File[],
    replaceImages = false
  ): Promise<AdminProduct> {
    const hasImages = (images && images.length > 0) || replaceImages;

    // Clean payload to remove undefined keys
    const cleanPayload = Object.fromEntries(
      Object.entries(product).filter(([_, v]) => v !== undefined && v !== null)
    );

    // 1. If updating product details without images, try clean application/json first
    if (!hasImages) {
      // Try PATCH first (standard for partial/field updates)
      try {
        return await this.patchProduct(publicId, cleanPayload);
      } catch (patchErr: unknown) {
        console.warn("[AdminProductService] PATCH update attempt failed, trying PUT JSON:", patchErr);
      }

      // Try PUT with application/json
      try {
        return await this.request<AdminProduct>(
          `/api/admin/products/${encodeURIComponent(publicId)}`,
          {
            method: "PUT",
            body: JSON.stringify(cleanPayload),
          }
        );
      } catch (putJsonErr: unknown) {
        console.warn("[AdminProductService] PUT JSON attempt failed, trying multipart PUT:", putJsonErr);
      }
    }

    // 2. Multipart PUT (for image uploads, replacement, or fallback)
    const formData = new FormData();

    const productBlob = new Blob([JSON.stringify(cleanPayload)], {
      type: "application/json",
    });
    formData.append("product", productBlob, "product.json");

    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append("images", file, file.name);
      });
    }

    const endpoint = `/api/admin/products/${encodeURIComponent(
      publicId
    )}?replaceImages=${replaceImages ? "true" : "false"}`;

    return this.request<AdminProduct>(
      endpoint,
      {
        method: "PUT",
        body: formData,
      },
      true // isMultipart
    );
  }

  /**
   * PATCH /api/admin/products/{publicId}
   * Partially update product fields using application/json
   */
  async patchProduct(
    publicId: string,
    payload: Partial<AdminProductUpdatePayload>
  ): Promise<AdminProduct> {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null)
    );

    return this.request<AdminProduct>(
      `/api/admin/products/${encodeURIComponent(publicId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(cleanPayload),
      }
    );
  }

  /**
   * PATCH /api/admin/products/{publicId}/status
   * Update product status (DRAFT, ACTIVE, INACTIVE, ARCHIVED)
   */
  async updateProductStatus(
    publicId: string,
    status: ProductStatus
  ): Promise<AdminProduct> {
    return this.request<AdminProduct>(
      `/api/admin/products/${encodeURIComponent(publicId)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
  }

  /**
   * PATCH /api/admin/products/{publicId}/availability
   * Update manual admin availability toggle (adminEnabled)
   */
  async updateProductAvailability(
    publicId: string,
    adminEnabled: boolean
  ): Promise<AdminProduct> {
    return this.request<AdminProduct>(
      `/api/admin/products/${encodeURIComponent(publicId)}/availability`,
      {
        method: "PATCH",
        body: JSON.stringify({ adminEnabled }),
      }
    );
  }

  /**
   * DELETE /api/admin/products/{publicId}
   * Soft-delete/archive a product
   */
  async archiveProduct(publicId: string): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>(
      `/api/admin/products/${encodeURIComponent(publicId)}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * DELETE /api/admin/products/{publicId}/images/{imagePublicId}
   * Delete a selected product image
   */
 
  async deleteProductImage(
  publicId: string,
  imagePublicId: string
): Promise<{ success: boolean; message?: string }> {
  return this.request(
    `/api/admin/products/${encodeURIComponent(
      publicId
    )}/images/${encodeURIComponent(imagePublicId)}`,
    {
      method: "DELETE",
    }
  );
}

  /**
   * PATCH /api/admin/products/{publicId}/images/{imagePublicId}/primary
   * Set selected image as the primary product image
   */
  async setPrimaryProductImage(
    publicId: string,
    imagePublicId: string
  ): Promise<AdminProduct> {
    return this.request<AdminProduct>(
      `/api/admin/products/${encodeURIComponent(
        publicId
      )}/images/${encodeURIComponent(imagePublicId)}/primary`,
      {
        method: "PATCH",
      }
    );
  }

  // Backward compatibility alias for deleteProduct
  async deleteProduct(publicId: string): Promise<{ success: boolean; id: string }> {
    await this.archiveProduct(publicId);
    return { success: true, id: publicId };
  }

  // Backward compatibility alias for updatePrice
  async updatePrice(
    publicId: string,
    price: number,
    originalPrice?: number
  ): Promise<AdminProduct> {
    return this.patchProduct(publicId, { pricePerKg: price });
  }
}

/**
 * Adapter utility: Converts AdminProduct backend object to UI-compatible Product model
 */
export function mapAdminProductToUIProduct(p: AdminProduct): Product {
  const categoryName =
    typeof p.category === "object" && p.category?.name
      ? p.category.name
      : typeof p.category === "string"
      ? p.category
      : "Vegetables";

  const stockFormatted =
    p.stockStatus === "OUT_OF_STOCK"
      ? 0
      : p.stockStatus === "LOW_STOCK"
      ? 5
      : 50;

  const apiStatus = toApiProductStatus(p.status || (p.available === false ? "INACTIVE" : "ACTIVE"));
  const isEnabled =
    p.adminEnabled !== undefined && p.adminEnabled !== null
      ? Boolean(p.adminEnabled)
      : p.available !== undefined && p.available !== null
      ? Boolean(p.available)
      : true;

  return {
    ...p,
    id: p.publicId,
    publicId: p.publicId,
    erpCode: p.slug || p.publicId,
    name: p.name,
    excelName: p.name,
    category: categoryName,
    categoryId:
      typeof p.category === "object" && p.category?.publicId
        ? p.category.publicId
        : (p as any).categoryId
        ? String((p as any).categoryId)
        : undefined,
    categoryObj: typeof p.category === "object" && p.category !== null ? p.category : undefined,
    price: p.pricePerKg ?? 0,
    pricePerKg: p.pricePerKg ?? 0,
    totalPrice: p.totalPrice ?? (p.pricePerKg ? p.pricePerKg * (p.defaultQuantityKg || 1) : 0),
    originalPrice: p.pricePerKg ?? 0,
    unit: p.quantityUnit || "Kg",
    quantityUnit: p.quantityUnit || "Kg",
    defaultQuantityKg: p.defaultQuantityKg ?? 1,
    hsnCode: "-",
    stock: stockFormatted,
    minStock: 10,
    stockStatus: p.stockStatus || (isEnabled ? "IN_STOCK" : "OUT_OF_STOCK"),
    status: apiStatus,
    apiStatus: apiStatus,
    imageUrl: p.imageUrl || (p.images && p.images[0]?.imageUrl),
    images: p.images || [],
    available: isEnabled,
    adminEnabled: isEnabled,
    isFeatured: p.isFeatured ?? false,
    featured: p.isFeatured ?? false,
  };
}

/**
 * Helper to extract unique category UUID (publicId) for backend filtering & submissions.
 * Strictly returns category.publicId. Never returns names, slugs, or database IDs.
 * Throws a meaningful error if publicId is missing.
 */
export function getCategoryId(cat: BackendCategory | null | undefined): string {
  if (!cat) {
    throw new Error("Category object is missing or null.");
  }
  if (cat.publicId && typeof cat.publicId === "string" && cat.publicId.trim() !== "") {
    return cat.publicId.trim();
  }
  console.error("[getCategoryId] Missing category UUID (publicId):", cat);
  throw new Error(`Category "${cat.name || "Unknown"}" is missing a valid backend publicId (UUID).`);
}

/**
 * Adapter utility: Converts AdminProduct or generic Product to StoreProduct model
 */
export function mapBackendToStoreProduct(p: AdminProduct | Product): StoreProduct {
  const catName =
    typeof p.category === "object" && p.category && "name" in p.category
      ? (p.category as { name: string }).name
      : typeof p.category === "string"
      ? p.category
      : "Produce";

  const catId =
    typeof p.category === "object" && p.category
      ? (p.category as { publicId?: string; categoryId?: string | number; id?: string | number }).publicId ||
        (p.category as { categoryId?: string | number }).categoryId ||
        (p.category as { id?: string | number }).id
      : undefined;

  const rawImage =
    p.imageUrl ||
    (p.images && p.images.length > 0 ? p.images[0].imageUrl : "") ||
    (p as { image?: string }).image ||
    "photo-1546094096-0df4bcaaa337";

  const priceVal =
    p.pricePerKg !== undefined && p.pricePerKg !== null
      ? Number(p.pricePerKg)
      : p.price !== undefined && p.price !== null
      ? Number(p.price)
      : 0;

  const origPrice =
    p.originalPrice !== undefined && p.originalPrice !== null
      ? Number(p.originalPrice)
      : Math.round(priceVal * 1.15);

  const unitVal = p.quantityUnit || p.unit || "kg";
  const idVal = p.publicId || p.id || Math.random().toString();

  const isEnabled = p.adminEnabled !== false && p.available !== false;
  const inStockStatus = p.status !== "Out of Stock" && p.status !== "INACTIVE";

  return {
    id: idVal,
    publicId: p.publicId || String(idVal),
    name: p.name,
    category: catName,
    categoryId: catId,
    price: priceVal,
    originalPrice: origPrice,
    unit: unitVal,
    image: rawImage,
    badge: p.isFeatured ? "Featured" : (p as { badge?: string }).badge,
    inStock: isEnabled && inStockStatus,
    adminEnabled: p.adminEnabled !== false,
    available: p.available !== false,
    status: p.status,
    description: p.description || p.shortDescription,
    pricePerKg: p.pricePerKg,
    quantityUnit: p.quantityUnit,
    defaultQuantityKg: p.defaultQuantityKg,
  };
}

export const adminProductService = new AdminProductService();
export const productService = adminProductService;
export default adminProductService;
