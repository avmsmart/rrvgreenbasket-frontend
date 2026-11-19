
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
      (value) =>
        value && typeof value === "object" && !Array.isArray(value)
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

  return typeof name === "string"
    ? name.trim()
    : "Product details unavailable";
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
        // Try the next available image field.
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

  return Array.isArray(value)
    ? (value as ProductWeightVariant[])
    : [];
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
  onMoveToCart: (
    item: WishlistProductItem,
    variant: ProductWeightVariant
  ) => Promise<boolean>;
  onRemove: (
    productPublicId: string,
    productName?: string
  ) => Promise<boolean>;
  isRemoving?: boolean;
}

export const WishlistCard: React.FC<WishlistCardProps> = ({
  item,
  onMoveToCart,
  onRemove,
  isRemoving = false,
}) => {
  const [isMoving, setIsMoving] = useState(false);
  const [imageError, setImageError] = useState(false);

  const rawItem = item as WishlistRaw;

  const productName = useMemo(
    () => getActualProductName(rawItem),
    [item]
  );

  const productId = useMemo(
    () => getActualProductId(rawItem),
    [item]
  );

  const productPublicId = useMemo(
    () => getActualProductPublicId(rawItem),
    [item]
  );

  const categoryName = useMemo(
    () => getActualCategory(rawItem),
    [item]
  );

  const variants = useMemo(
    () => getActualVariants(rawItem),
    [item]
  );

  const defaultKey = useMemo(() => {
    const oneUnit = variants.find((variant) => variant.multiplier === 1);
    return oneUnit?.key ?? variants[0]?.key ?? "";
  }, [variants]);

  const [selectedVariantKey, setSelectedVariantKey] =
    useState<string>(defaultKey);

  React.useEffect(() => {
    if (!variants.some((variant) => variant.key === selectedVariantKey)) {
      setSelectedVariantKey(defaultKey);
    }
  }, [variants, selectedVariantKey, defaultKey]);

  const activeVariant = useMemo(() => {
    return (
      variants.find((variant) => variant.key === selectedVariantKey) ??
      variants[0] ?? {
        key: "default",
        label: item.unit || "Unit",
        unit: item.unit || "",
        multiplier: 1,
      }
    );
  }, [variants, selectedVariantKey, item.unit]);

  const basePrice = useMemo(
    () => getActualPrice(rawItem),
    [item]
  );

  const originalPrice = useMemo(
    () => getActualOriginalPrice(rawItem),
    [item]
  );

  const variantWithPrices = activeVariant as ProductWeightVariant & {
    price?: number;
    sellingPrice?: number;
    originalPrice?: number;
  };

  const multiplier = Number.isFinite(Number(activeVariant.multiplier))
    ? Number(activeVariant.multiplier)
    : 1;

  const variantSellingPrice =
    Number.isFinite(Number(variantWithPrices.sellingPrice))
      ? Number(variantWithPrices.sellingPrice)
      : Number.isFinite(Number(variantWithPrices.price))
        ? Number(variantWithPrices.price)
        : basePrice * multiplier;

  const currentSellingPrice = Math.round(variantSellingPrice);

  const variantOriginalPrice =
    Number.isFinite(Number(variantWithPrices.originalPrice))
      ? Number(variantWithPrices.originalPrice)
      : originalPrice === null
        ? null
        : originalPrice * multiplier;

  const currentOriginalPrice =
    variantOriginalPrice !== null &&
    variantOriginalPrice > currentSellingPrice
      ? Math.round(variantOriginalPrice)
      : null;

  const discountPercent =
    currentOriginalPrice !== null
      ? Math.round(
          ((currentOriginalPrice - currentSellingPrice) /
            currentOriginalPrice) *
            100
        )
      : 0;

  const isAvailable =
    item.isAvailable !== false &&
    item.availabilityStatus !== "UNAVAILABLE" &&
    item.stockStatus !== "OUT_OF_STOCK";

  const resolvedImage = useMemo(
    () => getActualImage(rawItem),
    [item]
  );

  React.useEffect(() => {
    setImageError(false);
  }, [resolvedImage]);

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

  const handleRemoveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRemoving || isMoving || !productPublicId) return;

    await onRemove(productPublicId, productName);
  };

  const productSlugOrId =
    rawItem.productSlug ||
    getNestedProduct(rawItem).slug ||
    productId;

  const productLink = productSlugOrId
    ? `/products/${productSlugOrId}`
    : "/";

  return (
    

<article className="group relative flex w-full items-center gap-3 border-b border-slate-200 py-5 sm:gap-5 lg:min-w-0 lg:items-start lg:gap-3 lg:border lg:border-slate-200 lg:p-4">

  {/* PRODUCT IMAGE */}
  <div className="flex h-[100px] w-[100px] shrink-0 items-center justify-center sm:h-[115px] sm:w-[115px] lg:h-[115px] lg:w-[115px]">
    <Link
      href={productLink}
      className="flex h-full w-full items-center justify-center"
      aria-label={`View ${productName}`}
    >
      {resolvedImage && !imageError ? (
        <img
          src={resolvedImage}
          alt={productName}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-emerald-50/40 text-xs text-slate-500">
          Image unavailable
        </div>
      )}
    </Link>
  </div>

  {/* PRODUCT DETAILS */}
  <div className="min-w-0 flex-1 pr-8 lg:pr-0">

    {categoryName && (
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-emerald-700">
        {categoryName}
      </p>
    )}

    <Link
      href={productLink}
      title={productName}
      className="block line-clamp-2 text-sm font-semibold leading-5 text-slate-900 transition-colors hover:text-[#2f6f5e]"
    >
      {productName}
    </Link>

    {variants.length > 1 ? (
      <div className="mt-2 flex flex-wrap gap-2">
        {variants.slice(0, 3).map((variant) => (
          <button
            key={variant.key}
            type="button"
            onClick={() => setSelectedVariantKey(variant.key)}
            className={`border px-2 py-1 text-[10px] ${
              variant.key === activeVariant.key
                ? "border-[#2f6f5e] bg-emerald-50 text-[#24594b]"
                : "border-slate-200 text-slate-600"
            }`}
          >
            {variant.label}
          </button>
        ))}
      </div>
    ) : (
      <p className="mt-1.5 text-xs text-slate-500">
        Unit: {activeVariant.label}
      </p>
    )}

    {/* PRICE */}
    <div className="mt-2 flex flex-wrap items-baseline gap-2">
      <span className="text-base font-semibold text-slate-900">
        ₹{currentSellingPrice}
      </span>

      {currentOriginalPrice !== null && (
        <span className="text-xs text-slate-400 line-through">
          ₹{currentOriginalPrice}
        </span>
      )}

      <span className="text-xs text-slate-500">
        / {activeVariant.unit || activeVariant.label}
      </span>
    </div>

    {/* MOVE TO CART */}
    <button
      type="button"
      onClick={handleMove}
      disabled={!isAvailable || isMoving || isRemoving}
      className="mt-3 inline-flex min-h-10 min-w-[130px] items-center justify-center border border-[#2f6f5e] px-4 py-2 text-xs font-semibold tracking-wide text-[#2f6f5e] transition-colors hover:bg-[#2f6f5e] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isMoving
        ? "MOVING..."
        : isAvailable
          ? "MOVE TO CART"
          : "OUT OF STOCK"}
    </button>
  </div>

  {/* DELETE BUTTON - CLOSE TO PRODUCT */}
  <button
    type="button"
    onClick={handleRemoveClick}
    disabled={isRemoving || isMoving}
    aria-label={`Remove ${productName} from wishlist`}
    className="absolute right-2 top-3 flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50 lg:right-2 lg:top-2"
  >
    {isRemoving ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Trash2 className="h-4 w-4" />
    )}
  </button>
</article>

  );
};
