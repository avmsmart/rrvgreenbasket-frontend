"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { WishlistProductItem } from "@/types/wishlist";
import { ProductWeightVariant } from "@/types";
import { resolveImageUrl } from "@/utils/image-utils";


type WishlistRaw = WishlistProductItem & Record<string, any>;

function getNestedProduct(item: WishlistRaw): Record<string, any> {
  const candidates = [
    item.product,
    item.productDetails,
    item.productResponse,
    item.productInfo,
  ];
  return (
    candidates.find(
      (value) => value && typeof value === "object" && !Array.isArray(value)
    ) || {}
  );
}

function getActualProductName(item: WishlistRaw): string {
  const product = getNestedProduct(item);
  const candidates = [
    product.name,
    product.productName,
    product.title,
    item.productName,
    item.name,
  ];
  const name = candidates.find(
    (value) =>
      typeof value === "string" &&
      value.trim() &&
      value.trim().toLowerCase() !== "simulated fresh product"
  );
  return typeof name === "string" ? name.trim() : "Product details unavailable";
}

function getActualProductId(item: WishlistRaw): string {
  const product = getNestedProduct(item);
  const value =
    product.id ??
    product.productId ??
    item.productId ??
    product.publicId ??
    product.productPublicId ??
    item.productPublicId;
  return value == null ? "" : String(value);
}

function getActualProductPublicId(item: WishlistRaw): string {
  const product = getNestedProduct(item);
  const value =
    product.publicId ??
    product.productPublicId ??
    item.productPublicId ??
    // Fall back only if the API uses its ID as the public identifier.
    product.id ??
    item.productId;
  return value == null ? "" : String(value);
}

function getActualImage(item: WishlistRaw): string {
  const product = getNestedProduct(item);
  const imageList = [
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(item.images) ? item.images : []),
  ];

  const candidates = [
    product.imageUrl,
    product.imageURL,
    product.image,
    product.image_url,
    product.thumbnail,
    item.productImage,
    item.imageUrl,
    item.imageURL,
    item.image,
    item.image_url,
    item.thumbnail,
    ...imageList,
  ];

  for (const candidate of candidates) {
    let value: unknown = candidate;
    if (value && typeof value === "object") {
      const image = value as Record<string, unknown>;
      value = image.url ?? image.imageUrl ?? image.src ?? image.path;
    }
    if (typeof value === "string" && value.trim()) {
      try {
        const resolved = resolveImageUrl(value.trim(), 400);
        if (resolved) return resolved;
      } catch {
        // Continue to the next actual image field.
      }
    }
  }
  return "";
}

function getActualPrice(item: WishlistRaw): number {
  const product = getNestedProduct(item);
  const candidates = [
    product.sellingPrice,
    product.price,
    product.currentPrice,
    item.price,
  ];
  const value = candidates.find(
    (candidate) =>
      candidate !== null &&
      candidate !== undefined &&
      Number.isFinite(Number(candidate)) &&
      Number(candidate) >= 0
  );
  return value === undefined ? 0 : Number(value);
}

function getActualOriginalPrice(item: WishlistRaw): number | null {
  const product = getNestedProduct(item);
  const candidates = [
    product.originalPrice,
    product.mrp,
    product.compareAtPrice,
    item.originalPrice,
  ];
  const value = candidates.find(
    (candidate) =>
      candidate !== null &&
      candidate !== undefined &&
      Number.isFinite(Number(candidate)) &&
      Number(candidate) > 0
  );
  return value === undefined ? null : Number(value);
}

function getActualVariants(item: WishlistRaw): ProductWeightVariant[] {
  const product = getNestedProduct(item);
  const value = product.variants ?? product.weightVariants ?? item.variants;
  return Array.isArray(value) ? (value as ProductWeightVariant[]) : [];
}

function getActualCategory(item: WishlistRaw): string {
  const product = getNestedProduct(item);
  const category = product.category ?? product.categoryName ?? item.category;
  if (typeof category === "string") return category;
  if (category && typeof category === "object") {
    return String(category.name ?? category.categoryName ?? "");
  }
  return "";
}


export interface WishlistCardProps {
  item: WishlistProductItem;
  onMoveToCart: (item: WishlistProductItem, variant: ProductWeightVariant) => Promise<boolean>;
  onRemove: (productPublicId: string, productName?: string) => Promise<boolean>;
  isRemoving?: boolean;
}

export const WishlistCard: React.FC<WishlistCardProps> = ({
  item,
  onMoveToCart,
  onRemove,
  isRemoving = false,
}) => {
  const [isMoving, setIsMoving] = useState(false);

  const rawItem = item as WishlistRaw;
  const productName = useMemo(() => getActualProductName(rawItem), [item]);
  const productId = useMemo(() => getActualProductId(rawItem), [item]);
  const productPublicId = useMemo(() => getActualProductPublicId(rawItem), [item]);
  const categoryName = useMemo(() => getActualCategory(rawItem), [item]);
  const variants = useMemo(() => getActualVariants(rawItem), [item]);

  const defaultKey = useMemo(() => {
    const oneUnit = variants.find((variant) => variant.multiplier === 1);
    return oneUnit?.key ?? variants[0]?.key ?? "";
  }, [variants]);

  const [selectedVariantKey, setSelectedVariantKey] = useState<string>(defaultKey);

  // Keep the selected variant valid if refreshed backend data changes.
  React.useEffect(() => {
    if (!variants.some((variant) => variant.key === selectedVariantKey)) {
      setSelectedVariantKey(defaultKey);
    }
  }, [variants, selectedVariantKey, defaultKey]);

  const activeVariant = useMemo(() => {
    return variants.find((variant) => variant.key === selectedVariantKey) ?? variants[0] ?? {
      key: "default",
      label: item.unit || "Unit",
      unit: item.unit || "",
      multiplier: 1,
    };
  }, [variants, selectedVariantKey, item.unit]);

  const basePrice = useMemo(() => getActualPrice(rawItem), [item]);
  const originalPrice = useMemo(() => getActualOriginalPrice(rawItem), [item]);

  // Prefer a backend-supplied variant price. If absent, use the backend base
  // price and the backend-provided multiplier only when one exists.
  const variantWithPrices = activeVariant as ProductWeightVariant & {
    price?: number;
    sellingPrice?: number;
    originalPrice?: number;
  };
  const variantSellingPrice =
    Number.isFinite(Number(variantWithPrices.sellingPrice))
      ? Number(variantWithPrices.sellingPrice)
      : Number.isFinite(Number(variantWithPrices.price))
        ? Number(variantWithPrices.price)
        : basePrice * (Number.isFinite(Number(activeVariant.multiplier)) ? activeVariant.multiplier : 1);

  const currentSellingPrice = Math.round(variantSellingPrice);
  const variantOriginalPrice =
    Number.isFinite(Number(variantWithPrices.originalPrice))
      ? Number(variantWithPrices.originalPrice)
      : originalPrice === null
        ? null
        : originalPrice * (Number.isFinite(Number(activeVariant.multiplier)) ? activeVariant.multiplier : 1);

  const currentOriginalPrice =
    variantOriginalPrice !== null && variantOriginalPrice > currentSellingPrice
      ? Math.round(variantOriginalPrice)
      : null;

  const discountPercent =
    currentOriginalPrice !== null
      ? Math.round(((currentOriginalPrice - currentSellingPrice) / currentOriginalPrice) * 100)
      : 0;

  const isAvailable =
    item.isAvailable !== false &&
    item.availabilityStatus !== "UNAVAILABLE" &&
    item.stockStatus !== "OUT_OF_STOCK";

  const resolvedImage = useMemo(() => getActualImage(rawItem), [item]);
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [resolvedImage]);

  // Move to Cart handler
  const handleMove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable || isMoving || isRemoving) return;

    setIsMoving(true);
    try {
      await onMoveToCart(item, activeVariant);
    } finally {
      setIsMoving(false);
    }
  };

  // Remove handler
  const handleRemoveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRemoving || isMoving || !productPublicId) return;
    await onRemove(productPublicId, productName);
  };

  const productSlugOrId = rawItem.productSlug || getNestedProduct(rawItem).slug || productId;
  const productLink = productSlugOrId ? `/products/${productSlugOrId}` : "/";

  return (
    <article
      className="group relative flex w-full flex-row items-start gap-3 rounded-xl border border-emerald-100/90 bg-white p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-emerald-300 hover:shadow-[0_6px_18px_rgba(16,185,129,0.09)] md:flex-col md:justify-between md:gap-0 md:rounded-2xl md:p-3"
    >
      <div className="flex min-w-0 flex-1 flex-row items-start gap-3 md:block">
        {/* Product image: compact thumbnail on mobile, full card image on desktop */}
        <div className="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-lg bg-white p-1 md:mb-2 md:h-[152px] md:w-full md:rounded-xl md:p-2">
          <Link
            href={productLink}
            className="block h-full w-full cursor-pointer"
            aria-label={`View details for ${productName}`}
          >
            {resolvedImage && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedImage}
                alt={productName}
                loading="lazy"
                onError={() => setImageError(true)}
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-emerald-50/40 text-emerald-600 rounded-lg">
                <span className="px-3 text-center text-[11px] font-normal text-emerald-700">Image unavailable</span>
              </div>
            )}
          </Link>

          {/* Top-Left: Availability & Discount Badges */}
          <div className="absolute left-1.5 top-1.5 flex flex-col items-start gap-1 z-10 pointer-events-none">
            <span
              className={`rounded-md px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium tracking-tight ${
                isAvailable
                  ? "bg-emerald-50 border border-emerald-200/80 text-emerald-800"
                  : "bg-slate-700 text-white"
              }`}
            >
              {isAvailable ? "In Stock" : "Out of Stock"}
            </span>

            {discountPercent > 0 && isAvailable && (
              <span className="rounded-md bg-emerald-700 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-white shadow-2xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Top-Right: Remove Wishlist Button */}
          <button
            type="button"
            onClick={handleRemoveClick}
            disabled={isRemoving || isMoving}
            aria-label={`Remove ${productName} from wishlist`}
            className="absolute right-1.5 top-1.5 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-gray-100 bg-white/95 text-gray-400 shadow-2xs transition-colors hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 disabled:opacity-50 cursor-pointer"
          >
            {isRemoving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
            ) : (
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col md:block">
        {/* Product details: category, name, variants and price */}
        {/* Category Label (10–11px, regular weight) */}
        {categoryName && (
          <p className="text-[10px] sm:text-[11px] font-normal uppercase tracking-wider text-emerald-700 line-clamp-1 mb-0.5">
            {categoryName}
          </p>
        )}

        {/* Product Name (13–14px desktop, 12–13px mobile, regular weight) */}
        <Link
          href={productLink}
          className="mb-1 block line-clamp-2 text-[13px] font-normal leading-4 text-gray-800 transition-colors hover:text-[#00875a] cursor-pointer md:mb-1.5 md:min-h-[2.4rem] md:text-[14px] md:leading-5"
          title={productName}
        >
          {productName}
        </Link>

        {/* Weight / Variant Choice Pills (PART 7) */}
        {variants.length > 1 ? (
          <div className="mb-1.5 flex flex-wrap gap-1 md:mb-2">
            {variants.slice(0, 3).map((v) => {
              const isSelected = v.key === activeVariant.key;
              return (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setSelectedVariantKey(v.key)}
                  className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors cursor-pointer md:px-1.5 md:py-0.5 md:text-[11px] ${
                    isSelected
                      ? "bg-[#00875a] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mb-1 text-[11px] text-gray-400 font-normal">
            Unit: {activeVariant.label}
          </p>
        )}

        {/* Selling Price, Original Price and Unit */}
        <div className="mb-1.5 flex flex-wrap items-baseline gap-1.5 md:mb-3">
          <span className="text-[15px] font-semibold tracking-tight text-gray-900 md:text-[17px]">
            ₹{currentSellingPrice}
          </span>

          {currentOriginalPrice !== null && currentOriginalPrice > currentSellingPrice && (
            <span className="text-[11px] sm:text-[12px] text-gray-400 line-through font-normal">
              ₹{currentOriginalPrice}
            </span>
          )}

          <span className="text-[10px] sm:text-[11px] text-gray-400 font-normal">
            / {activeVariant.unit}
          </span>
        </div>
        {/* Move selected variant to cart */}
        <button
        type="button"
        onClick={handleMove}
        disabled={!isAvailable || isMoving || isRemoving}
        className={`mt-1 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg font-medium transition-all shadow-xs cursor-pointer md:mt-0 md:h-[38px] md:rounded-xl ${
          isAvailable
            ? "bg-[#00875a] hover:bg-[#00734d] text-white active:scale-[0.98]"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        } text-[11px] md:text-xs`}
      >
        {isMoving ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Moving...</span>
          </>
        ) : isAvailable ? (
          <>
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Move to Cart</span>
          </>
        ) : (
          <span>Out of Stock</span>
        )}
      </button>
        </div>
      </div>
    </article>
  );
};
