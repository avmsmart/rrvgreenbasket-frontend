"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  WishlistProductItem,
  WishlistResponse,
} from "@/types/wishlist";
import { ProductWeightVariant } from "@/types";
import { wishlistService, WishlistApiError } from "@/services/wishlist.service";
import { cartService, CartApiError } from "@/services/cart.service";
import { productService } from "@/services/product.service";
import { customerTokenStorage } from "@/services/customer-auth.service";


type AnyRecord = Record<string, any>;

const asRecord = (value: unknown): AnyRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as AnyRecord)
    : {};

const firstNonEmpty = (...values: unknown[]): unknown =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeId = (value: unknown): string =>
  value === undefined || value === null ? "" : String(value).trim().toLowerCase();

function unwrapApiPayload(value: unknown): AnyRecord {
  let current: unknown = value;
  for (let depth = 0; depth < 3; depth += 1) {
    const record = asRecord(current);
    if (record.data && typeof record.data === "object") {
      current = record.data;
      continue;
    }
    if (record.result && typeof record.result === "object") {
      current = record.result;
      continue;
    }
    return record;
  }
  return asRecord(current);
}

function extractWishlistItems(response: unknown): WishlistProductItem[] {
  if (Array.isArray(response)) return response as WishlistProductItem[];
  const payload = unwrapApiPayload(response);
  const nestedWishlist = asRecord(payload.wishlist);
  const candidates = [
    payload.items,
    payload.wishlistItems,
    payload.products,
    payload.content,
    nestedWishlist.items,
  ];
  const items = candidates.find(Array.isArray);
  return (items || []) as WishlistProductItem[];
}

function extractCatalogProducts(response: unknown): AnyRecord[] {
  if (Array.isArray(response)) return response.map(asRecord);
  const payload = unwrapApiPayload(response);
  const candidates = [
    payload.content,
    payload.products,
    payload.items,
    payload.data,
    asRecord(payload.productPage).content,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate.map(asRecord);
    const nested = asRecord(candidate);
    if (Array.isArray(nested.content)) return nested.content.map(asRecord);
    if (Array.isArray(nested.items)) return nested.items.map(asRecord);
    if (Array.isArray(nested.products)) return nested.products.map(asRecord);
  }
  return [];
}

function getNestedProduct(item: AnyRecord): AnyRecord {
  return asRecord(
    firstNonEmpty(
      item.product,
      item.productDetails,
      item.productInfo,
      item.productResponse,
      item.storefrontProduct,
      item.productDto
    )
  );
}

function getCatalogKeys(product: AnyRecord): string[] {
  return [
    product.publicId,
    product.productPublicId,
    product.product_public_id,
    product.productId,
    product.product_id,
    product.id,
    product.slug,
    product.productSlug,
  ].map(normalizeId).filter(Boolean);
}

function getWishlistKeys(item: AnyRecord): string[] {
  const nested = getNestedProduct(item);
  return [
    item.productPublicId,
    item.product_public_id,
    item.productId,
    item.product_id,
    item.productSlug,
    nested.publicId,
    nested.productPublicId,
    nested.product_public_id,
    nested.productId,
    nested.product_id,
    nested.id,
    nested.slug,
  ].map(normalizeId).filter(Boolean);
}

function getProductImage(product: AnyRecord): string {
  const images = Array.isArray(product.images) ? product.images : [];
  const firstImage = images[0];
  const firstImageObject = asRecord(firstImage);
  const candidates = [
    product.imageUrl,
    product.imageURL,
    product.image,
    product.image_url,
    product.thumbnail,
    product.primaryImage,
    product.mainImage,
    firstImageObject.imageUrl,
    firstImageObject.url,
    firstImageObject.src,
    firstImageObject.path,
    typeof firstImage === "string" ? firstImage : undefined,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    const imageObject = asRecord(candidate);
    const url = firstNonEmpty(
      imageObject.imageUrl,
      imageObject.url,
      imageObject.src,
      imageObject.path
    );
    if (typeof url === "string" && url.trim()) return url.trim();
  }
  return "";
}

function getCategoryName(product: AnyRecord): string | undefined {
  const category = product.category ?? product.categoryName;
  if (typeof category === "string") return category;
  const record = asRecord(category);
  return typeof record.name === "string"
    ? record.name
    : typeof record.categoryName === "string"
      ? record.categoryName
      : undefined;
}

/**
 * Keep the real variant options supplied by the product API.
 * WishlistCard expects key/label/unit/multiplier. Preserve extra backend
 * fields such as price, sellingPrice, originalPrice and stock information.
 */
function normalizeProductVariants(value: unknown): ProductWeightVariant[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((rawVariant, index) => {
      const variant = asRecord(rawVariant);

      const rawKey = firstNonEmpty(
        variant.key,
        variant.variantKey,
        variant.publicId,
        variant.id,
        variant.value,
        variant.unit
      );

      const rawLabel = firstNonEmpty(
        variant.label,
        variant.displayName,
        variant.name,
        variant.weight,
        variant.quantity,
        variant.value
      );

      const rawUnit = firstNonEmpty(
        variant.unit,
        variant.quantityUnit,
        variant.measurementUnit,
        variant.weightUnit
      );

      const rawMultiplier = firstNonEmpty(
        variant.multiplier,
        variant.quantityMultiplier,
        variant.factor
      );

      // Do not invent a multiplier from a label. Use 1 only when the backend
      // does not provide one; a backend-specific variant price takes priority.
      const multiplier =
        rawMultiplier !== undefined && Number.isFinite(Number(rawMultiplier))
          ? Number(rawMultiplier)
          : 1;

      const key =
        rawKey !== undefined && String(rawKey).trim()
          ? String(rawKey)
          : `variant-${index}`;

      const label =
        rawLabel !== undefined && String(rawLabel).trim()
          ? String(rawLabel)
          : String(rawUnit || "Option");

      const unit =
        rawUnit !== undefined && String(rawUnit).trim()
          ? String(rawUnit)
          : label;

      return {
        ...variant,
        key,
        label,
        unit,
        multiplier,
      } as ProductWeightVariant;
    })
    .filter((variant) => Boolean(variant.key && variant.label));
}

function mergeActualProduct(
  wishlistItem: WishlistProductItem,
  catalogueProduct?: AnyRecord
): WishlistProductItem {
  const item = wishlistItem as WishlistProductItem & AnyRecord;
  const nested = getNestedProduct(item);
  const product = catalogueProduct ?? nested;

  const name = firstNonEmpty(
    product.name,
    product.productName,
    product.title,
    nested.name,
    nested.productName,
    item.productName
  );
  const image =
    getProductImage(product) ||
    getProductImage(nested) ||
    (typeof item.productImage === "string" ? item.productImage : "");

  const price = firstNonEmpty(
    product.sellingPrice,
    product.totalPrice,
    product.pricePerKg,
    product.price,
    nested.sellingPrice,
    nested.totalPrice,
    nested.price,
    item.price
  );
  const originalPrice = firstNonEmpty(
    product.originalPrice,
    product.mrp,
    product.compareAtPrice,
    nested.originalPrice,
    nested.mrp,
    item.originalPrice
  );
  const unit = firstNonEmpty(
    product.quantityUnit,
    product.unit,
    nested.quantityUnit,
    nested.unit,
    item.unit
  );
  const variants = firstNonEmpty(
    product.variants,
    product.weightVariants,
    product.weightOptions,
    product.availableVariants,
    product.productVariants,
    product.quantityOptions,
    nested.variants,
    nested.weightVariants,
    nested.weightOptions,
    nested.availableVariants,
    nested.productVariants,
    nested.quantityOptions,
    item.variants
  );
  const publicId = firstNonEmpty(
    product.publicId,
    product.productPublicId,
    nested.publicId,
    nested.productPublicId,
    item.productPublicId
  );
  const id = firstNonEmpty(
    product.id,
    product.productId,
    nested.id,
    nested.productId,
    item.productId
  );

  return {
    ...item,
    ...(publicId !== undefined ? { productPublicId: String(publicId) } : {}),
    ...(id !== undefined ? { productId: String(id) } : {}),
    ...(typeof name === "string" ? { productName: name } : {}),
    ...(image ? { productImage: image } : {}),
    ...(typeof (product.slug ?? product.productSlug) === "string"
      ? { productSlug: product.slug ?? product.productSlug }
      : {}),
    ...(typeof (product.description ?? product.shortDescription) === "string"
      ? { productDescription: product.description ?? product.shortDescription }
      : {}),
    ...(getCategoryName(product) || getCategoryName(nested)
      ? { category: getCategoryName(product) || getCategoryName(nested) }
      : {}),
    ...(price !== undefined && Number.isFinite(Number(price))
      ? { price: Number(price) }
      : {}),
    ...(originalPrice !== undefined && Number.isFinite(Number(originalPrice))
      ? { originalPrice: Number(originalPrice) }
      : {}),
    ...(typeof unit === "string" ? { unit } : {}),
    ...(Array.isArray(variants)
      ? { variants: normalizeProductVariants(variants) }
      : {}),
    ...(typeof product.stockStatus === "string"
      ? { stockStatus: product.stockStatus }
      : {}),
    ...(typeof product.available === "boolean"
      ? { isAvailable: product.available }
      : {}),
  } as WishlistProductItem;
}

export interface WishlistToast {
  type: "success" | "error" | "info";
  text: string;
}

export interface WishlistContextType {
  wishlistItems: WishlistProductItem[];
  wishlistCount: number;
  statusMap: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
  toastMessage: WishlistToast | null;
  fetchWishlist: () => Promise<WishlistResponse | null>;
  fetchWishlistCount: () => Promise<number>;
  addToWishlist: (productPublicId: string, productName?: string) => Promise<boolean>;
  removeFromWishlist: (productPublicId: string, productName?: string) => Promise<boolean>;
  toggleWishlist: (productPublicId: string, productName?: string) => Promise<boolean>;
  moveToCart: (
    item: WishlistProductItem,
    variant?: ProductWeightVariant,
    quantity?: number
  ) => Promise<boolean>;
  clearWishlist: () => Promise<boolean>;
  checkWishlistStatus: (productPublicId: string) => Promise<boolean>;
  checkBulkWishlistStatus: (productPublicIds: string[]) => Promise<Record<string, boolean>>;
  isWishlisted: (productPublicId: string) => boolean;
  clearError: () => void;
  showToast: (text: string, type?: "success" | "error" | "info") => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistProductItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<WishlistToast | null>(null);

  const pendingRequestsRef = useRef<Set<string>>(new Set());
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((text: string, type: "success" | "error" | "info" = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage({ type, text });
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isCustomerLoggedIn = useCallback((): boolean => {
    return Boolean(customerTokenStorage.getAccessToken());
  }, []);

  /**
   * Fetch total items count from backend
   */
  const fetchWishlistCount = useCallback(async (): Promise<number> => {
    if (!isCustomerLoggedIn()) {
      setWishlistCount(0);
      return 0;
    }

    try {
      const res = await wishlistService.getWishlistCount();
      const count = Number(res?.totalItems ?? res?.count) || 0;
      setWishlistCount(count);
      return count;
    } catch (err) {
      if (err instanceof WishlistApiError && err.statusCode === 401) {
        setWishlistCount(0);
      }
      return 0;
    }
  }, [isCustomerLoggedIn]);

  /**
   * Fetch complete customer wishlist with real product details
   */
  const fetchWishlist = useCallback(async (): Promise<WishlistResponse | null> => {
    if (!isCustomerLoggedIn()) {
      setWishlistItems([]);
      setWishlistCount(0);
      setStatusMap({});
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await wishlistService.getWishlist();
      const rawItems = extractWishlistItems(res);
      let items: WishlistProductItem[] = rawItems.map((raw) =>
        mergeActualProduct(raw)
      );

      const needsEnrichment = items.some((item) => {
        const name = String(item.productName || "").trim().toLowerCase();
        return (
          !name ||
          name.includes("simulated") ||
          name === "fresh product" ||
          name === "product details unavailable" ||
          !item.productImage
        );
      });

      if (needsEnrichment && items.length > 0) {
        try {
          const productResponse = await productService.getStorefrontProducts({
            size: 500,
          });
          const catalogue = extractCatalogProducts(productResponse);
          const catalogueMap = new Map<string, AnyRecord>();

          catalogue.forEach((product) => {
            getCatalogKeys(product).forEach((key) => {
              if (!catalogueMap.has(key)) catalogueMap.set(key, product);
            });
          });

          console.info("[WishlistContext] Product matching diagnostics", {
            wishlistItems: items.length,
            catalogueProducts: catalogue.length,
            catalogueKeys: catalogueMap.size,
          });

          items = items.map((item) => {
            const keys = getWishlistKeys(item as WishlistProductItem & AnyRecord);
            const matched = keys
              .map((key) => catalogueMap.get(key))
              .find(Boolean);

            if (!matched) {
              console.warn("[WishlistContext] No product match for wishlist row", {
                productPublicId: item.productPublicId,
                productId: item.productId,
                attemptedKeys: keys,
              });
              return item;
            }

            return mergeActualProduct(item, matched);
          });
        } catch (catalogueError) {
          console.error(
            "[WishlistContext] Could not load catalogue for wishlist enrichment:",
            catalogueError
          );
        }
      }

      setWishlistItems(items);
      setWishlistCount(Number(res?.totalItems) || items.length);

      // Populate status map
      const newStatusMap: Record<string, boolean> = {};
      items.forEach((item) => {
        if (item.productPublicId) {
          newStatusMap[item.productPublicId] = true;
        }
      });
      setStatusMap(newStatusMap);

      return {
        wishlistPublicId: res?.wishlistPublicId,
        customerPublicId: res?.customerPublicId,
        totalItems: items.length,
        items,
      };
    } catch (err: unknown) {
      const message =
        err instanceof WishlistApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to load wishlist";

      if (err instanceof WishlistApiError && err.statusCode === 401) {
        setWishlistItems([]);
        setWishlistCount(0);
        setStatusMap({});
      } else {
        setError(message);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isCustomerLoggedIn]);

  /**
   * Check bulk wishlist status for up to 50 products per batch
   */
  const checkBulkWishlistStatus = useCallback(
    async (productPublicIds: string[]): Promise<Record<string, boolean>> => {
      if (!isCustomerLoggedIn() || !productPublicIds || productPublicIds.length === 0) {
        return {};
      }

      const unknownIds = productPublicIds.filter(
        (id) => Boolean(id) && statusMap[id] === undefined
      );

      if (unknownIds.length === 0) {
        return statusMap;
      }

      try {
        const res = await wishlistService.checkBulkWishlistStatus(unknownIds);
        const map = res?.statusMap || {};

        setStatusMap((prev) => ({
          ...prev,
          ...map,
        }));

        return map;
      } catch (err) {
        console.warn("[WishlistContext] checkBulkWishlistStatus error:", err);
        return {};
      }
    },
    [isCustomerLoggedIn, statusMap]
  );

  /**
   * Check individual product wishlist status
   */
  const checkWishlistStatus = useCallback(
    async (productPublicId: string): Promise<boolean> => {
      if (!isCustomerLoggedIn() || !productPublicId) return false;

      if (statusMap[productPublicId] !== undefined) {
        return statusMap[productPublicId];
      }

      try {
        const res = await wishlistService.checkWishlistStatus(productPublicId);
        const isWishlistedVal = Boolean(res?.isWishlisted);

        setStatusMap((prev) => ({
          ...prev,
          [productPublicId]: isWishlistedVal,
        }));

        return isWishlistedVal;
      } catch {
        return false;
      }
    },
    [isCustomerLoggedIn, statusMap]
  );

  /**
   * Fast sync lookup: is product wishlisted?
   */
  const isWishlisted = useCallback(
    (productPublicId: string): boolean => {
      return Boolean(statusMap[productPublicId]);
    },
    [statusMap]
  );

  /**
   * Add product to wishlist
   */
  const addToWishlist = useCallback(
    async (productPublicId: string, productName?: string): Promise<boolean> => {
      if (!isCustomerLoggedIn()) {
        showToast("Please sign in to save products to your wishlist", "info");
        router.push("/mobile-auth");
        return false;
      }

      if (!productPublicId || pendingRequestsRef.current.has(productPublicId)) {
        return false;
      }

      pendingRequestsRef.current.add(productPublicId);

      // Optimistic update without double-counting an already saved product.
      const previousState = Boolean(statusMap[productPublicId]);
      setStatusMap((prev) => ({ ...prev, [productPublicId]: true }));
      if (!previousState) setWishlistCount((prev) => prev + 1);

      try {
        await wishlistService.addToWishlist(productPublicId);
        await fetchWishlist();
        showToast(
          productName
            ? `Added "${productName}" to wishlist ❤️`
            : "Product added to wishlist ❤️",
          "success"
        );
        window.dispatchEvent(new CustomEvent("rrv:wishlist:changed"));
        return true;
      } catch (err) {
        // Rollback on failure
        setStatusMap((prev) => ({ ...prev, [productPublicId]: previousState }));
        if (!previousState) {
          setWishlistCount((prev) => Math.max(0, prev - 1));
        }

        const msg =
          err instanceof WishlistApiError
            ? err.message
            : "Failed to add product to wishlist";
        showToast(msg, "error");
        return false;
      } finally {
        pendingRequestsRef.current.delete(productPublicId);
      }
    },
    [isCustomerLoggedIn, statusMap, showToast, router, fetchWishlist]
  );

  /**
   * Remove product from wishlist
   */
  const removeFromWishlist = useCallback(
    async (productPublicId: string, productName?: string): Promise<boolean> => {
      if (!isCustomerLoggedIn()) {
        return false;
      }

      if (!productPublicId || pendingRequestsRef.current.has(productPublicId)) {
        return false;
      }

      pendingRequestsRef.current.add(productPublicId);

      // Optimistic state update
      const previousState = Boolean(statusMap[productPublicId]);
      const previousItems = [...wishlistItems];

      setStatusMap((prev) => ({ ...prev, [productPublicId]: false }));
      setWishlistCount((prev) => Math.max(0, prev - 1));
      setWishlistItems((prev) =>
        prev.filter((item) => item.productPublicId !== productPublicId)
      );

      try {
        await wishlistService.removeFromWishlist(productPublicId);
        showToast(
          productName
            ? `Removed "${productName}" from wishlist`
            : "Product removed from wishlist",
          "info"
        );
        window.dispatchEvent(new CustomEvent("rrv:wishlist:changed"));
        return true;
      } catch (err) {
        // Rollback on failure
        setStatusMap((prev) => ({ ...prev, [productPublicId]: previousState }));
        setWishlistCount((prev) => prev + 1);
        setWishlistItems(previousItems);

        const msg =
          err instanceof WishlistApiError
            ? err.message
            : "Failed to remove product from wishlist";
        showToast(msg, "error");
        return false;
      } finally {
        pendingRequestsRef.current.delete(productPublicId);
      }
    },
    [isCustomerLoggedIn, statusMap, wishlistItems, showToast]
  );

  /**
   * Move to Cart Workflow (PART 6)
   * 1. Add item & selected variant to customer's cart
   * 2. Confirm cart addition succeeded
   * 3. Remove that item from wishlist via backend API
   * 4. Update wishlist count & state immediately
   * 5. Show success notification: "Product moved to cart successfully!"
   */
  const moveToCart = useCallback(
    async (
      item: WishlistProductItem,
      variant?: ProductWeightVariant,
      quantity = 1
    ): Promise<boolean> => {
      if (!item || !item.productPublicId) {
        showToast("Invalid product", "error");
        return false;
      }

      const isAvailable =
        item.isAvailable !== false &&
        item.availabilityStatus !== "UNAVAILABLE" &&
        item.stockStatus !== "OUT_OF_STOCK";

      if (!isAvailable) {
        showToast("This product is currently out of stock", "error");
        return false;
      }

      const selectedVariant = (variant || undefined) as
        | (ProductWeightVariant & {
            price?: number;
            sellingPrice?: number;
            originalPrice?: number;
            stockQuantity?: number;
            available?: boolean;
          })
        | undefined;

      const multiplier =
        selectedVariant?.multiplier != null &&
        Number.isFinite(Number(selectedVariant.multiplier))
          ? Number(selectedVariant.multiplier)
          : 1;

      const unitLabel = selectedVariant?.unit || item.unit || "KG";
      const variantKey = selectedVariant?.key || "default";
      const variantLabel = selectedVariant?.label || `1 ${unitLabel}`;

      // Use the exact backend variant price when supplied. Only calculate
      // from the product's base price when the API provides no variant price.
      const explicitVariantPrice =
        selectedVariant?.sellingPrice ?? selectedVariant?.price;
      const itemPrice =
        explicitVariantPrice != null &&
        Number.isFinite(Number(explicitVariantPrice))
          ? Math.round(Number(explicitVariantPrice))
          : Math.round((Number(item.price) || 0) * multiplier);

      if (
        selectedVariant?.available === false ||
        (selectedVariant?.stockQuantity != null &&
          Number(selectedVariant.stockQuantity) <= 0)
      ) {
        showToast("This selected quantity is currently unavailable", "error");
        return false;
      }

      try {
        // Compute canonical quantity based on variant multiplier
        const quantityKg =
          Number.isFinite(Number(multiplier)) && multiplier > 0
            ? Number((quantity * multiplier).toFixed(3))
            : quantity;

        // 1. Call the existing Spring Boot Cart Add Item API with product metadata
        const targetId = String(item.productPublicId || item.productId || "").trim();
        await cartService.addItem({
          productPublicId: targetId,
          quantityKg,
          productName: item.productName,
          productImageUrl: item.productImage,
          pricePerKg: Number(explicitVariantPrice || item.price) || 0,
          unitOfMeasure: selectedVariant?.unit || item.unit || "KG",
        });

        // 2. Only after successful backend cart addition, remove from wishlist
        const removed = await removeFromWishlist(targetId);
        if (!removed) {
          showToast(
            "Item added to your cart, but could not be removed from your wishlist.",
            "info"
          );
          return true;
        }

        showToast("Product moved to cart successfully! 🛒", "success");
        return true;
      } catch (err: unknown) {
        console.error("[WishlistContext] moveToCart failed:", err);
        const errorMsg =
          err instanceof CartApiError
            ? err.message
            : "Failed to move item to cart. Please check availability.";
        showToast(errorMsg, "error");
        // If Cart API fails: Keep product in wishlist!
        return false;
      }
    },
    [removeFromWishlist, showToast]
  );

  /**
   * Toggle product wishlist status
   */
  const toggleWishlist = useCallback(
    async (productPublicId: string, productName?: string): Promise<boolean> => {
      const current = Boolean(statusMap[productPublicId]);
      if (current) {
        return removeFromWishlist(productPublicId, productName);
      } else {
        return addToWishlist(productPublicId, productName);
      }
    },
    [statusMap, removeFromWishlist, addToWishlist]
  );

  /**
   * Clear complete customer wishlist
   */
  const clearWishlist = useCallback(async (): Promise<boolean> => {
    if (!isCustomerLoggedIn()) return false;

    setIsLoading(true);
    const previousItems = [...wishlistItems];
    const previousCount = wishlistCount;
    const previousMap = { ...statusMap };

    // Optimistic clear
    setWishlistItems([]);
    setWishlistCount(0);
    setStatusMap({});

    try {
      await wishlistService.clearWishlist();
      showToast("Wishlist cleared successfully", "success");
      window.dispatchEvent(new CustomEvent("rrv:wishlist:changed"));
      return true;
    } catch (err) {
      // Rollback on failure
      setWishlistItems(previousItems);
      setWishlistCount(previousCount);
      setStatusMap(previousMap);

      const msg =
        err instanceof WishlistApiError
          ? err.message
          : "Failed to clear wishlist";
      showToast(msg, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isCustomerLoggedIn, wishlistItems, wishlistCount, statusMap, showToast]);

  // Initial load and customer authentication change listener
  useEffect(() => {
    if (isCustomerLoggedIn()) {
      fetchWishlistCount();
    } else {
      setWishlistItems([]);
      setWishlistCount(0);
      setStatusMap({});
    }

    const handleAuthChange = () => {
      if (isCustomerLoggedIn()) {
        fetchWishlistCount();
      } else {
        setWishlistItems([]);
        setWishlistCount(0);
        setStatusMap({});
      }
    };

    const handleExternalWishlistChange = () => {
      if (isCustomerLoggedIn()) {
        fetchWishlistCount();
      }
    };

    window.addEventListener("rrv:customer:auth:changed", handleAuthChange);
    window.addEventListener("rrv:wishlist:changed", handleExternalWishlistChange);

    return () => {
      window.removeEventListener("rrv:customer:auth:changed", handleAuthChange);
      window.removeEventListener("rrv:wishlist:changed", handleExternalWishlistChange);
    };
  }, [isCustomerLoggedIn, fetchWishlistCount]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        statusMap,
        isLoading,
        error,
        toastMessage,
        fetchWishlist,
        fetchWishlistCount,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        moveToCart,
        clearWishlist,
        checkWishlistStatus,
        checkBulkWishlistStatus,
        isWishlisted,
        clearError,
        showToast,
      }}
    >
      {children}

      {/* Non-intrusive floating toast notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-gray-900/95 px-4 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <span>{toastMessage.text}</span>
        </div>
      )}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export default WishlistContext;
