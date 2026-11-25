"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { Heart, Plus, Minus, Star, Loader2 } from "lucide-react";
import { StoreProduct, ProductWeightVariant } from "@/types";
import { resolveImageUrl } from "@/utils/image-utils";
import { triggerFlyAnimation } from "@/utils/animation-utils";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { getProductVariants } from "@/components/customer/ProductCard";

export interface ZeptoProductCardProps {
  product: StoreProduct;
  variant?: ProductWeightVariant;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: StoreProduct) => void;
  onAddToCart?: (
    product: StoreProduct,
    variant: ProductWeightVariant,
    quantity: number
  ) => void;
  rating?: number;
  reviewsCount?: number;
  /**
   * When true the card fills its grid cell instead of using the fixed
   * carousel widths. Default (false) keeps the existing carousel look.
   */
  fluid?: boolean;
}

export const ZeptoProductCard: React.FC<ZeptoProductCardProps> = ({
  product,
  variant: propVariant,
  isWishlisted: propIsWishlisted,
  onToggleWishlist,
  onAddToCart,
  rating,
  reviewsCount,
  fluid = false,
}) => {
  const { isWishlisted: checkIsWishlisted, toggleWishlist } = useWishlist();
  const { addToCart, updateQuantity, removeItem, getCartItemForProduct } =
    useCart();

  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isMutatingCart, setIsMutatingCart] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const activeVariant = useMemo(() => {
    if (propVariant) return propVariant;

    const variants = getProductVariants(product);
    const unitOne = variants.find((v) => v.multiplier === 1.0);

    return (
      unitOne ||
      variants[0] || {
        key: "default",
        label: `1 ${product.unit || "unit"}`,
        unit: product.unit || "unit",
        multiplier: 1.0,
      }
    );
  }, [product, propVariant]);

  const multiplier =
    Number.isFinite(Number(activeVariant.multiplier)) &&
    activeVariant.multiplier > 0
      ? activeVariant.multiplier
      : 1.0;

  const currentSellingPrice = Math.round(
    (product.price || 0) * multiplier
  );

  const baseOriginal =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice
      : Math.round((product.price || 0) * 1.18);

  const currentOriginalPrice = Math.round(baseOriginal * multiplier);

  const discountAmount =
    currentOriginalPrice > currentSellingPrice
      ? currentOriginalPrice - currentSellingPrice
      : 0;

  const discountPercent =
    currentOriginalPrice > currentSellingPrice
      ? Math.round(
          ((currentOriginalPrice - currentSellingPrice) /
            currentOriginalPrice) *
            100
        )
      : 0;

  const isAvailable =
    product.inStock !== false &&
    product.available !== false &&
    product.adminEnabled !== false &&
    product.status !== "Out of Stock" &&
    product.status !== "INACTIVE";

  const productPublicId = String(
    product.publicId || product.id || ""
  ).trim();

  const isFav =
    propIsWishlisted !== undefined
      ? propIsWishlisted
      : checkIsWishlisted(productPublicId);

  const cartItem = getCartItemForProduct(productPublicId);

  const countInCart = useMemo(() => {
    if (!cartItem || !cartItem.quantityKg) return 0;

    return Math.max(
      1,
      Math.round(cartItem.quantityKg / multiplier)
    );
  }, [cartItem, multiplier]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlistLoading) return;

    if (!isFav) {
      triggerFlyAnimation(cardRef.current, "wishlist");
    }

    if (onToggleWishlist) {
      onToggleWishlist(product);
      return;
    }

    setIsWishlistLoading(true);

    try {
      await toggleWishlist(productPublicId, product.name);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable || isMutatingCart) return;

    setIsMutatingCart(true);

    try {
      if (!cartItem) {
        if (onAddToCart) {
          onAddToCart(product, activeVariant, 1);
        } else {
          const quantityKg = Number((1 * multiplier).toFixed(3));

          await addToCart(
            productPublicId,
            quantityKg,
            product.name,
            {
              productImageUrl: product.image,
              pricePerKg: currentSellingPrice,
              unitOfMeasure: activeVariant.unit,
            }
          );
        }

        triggerFlyAnimation(cardRef.current, "cart", product.image);
      } else {
        const nextQty = countInCart + 1;
        const nextQuantityKg = Number(
          (nextQty * multiplier).toFixed(3)
        );

        await updateQuantity(cartItem.publicId, nextQuantityKg);
      }
    } finally {
      setIsMutatingCart(false);
    }
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItem || isMutatingCart) return;

    setIsMutatingCart(true);

    try {
      if (countInCart <= 1) {
        await removeItem(cartItem.publicId, product.name);
      } else {
        const nextQty = countInCart - 1;
        const nextQuantityKg = Number(
          (nextQty * multiplier).toFixed(3)
        );

        await updateQuantity(cartItem.publicId, nextQuantityKg);
      }
    } finally {
      setIsMutatingCart(false);
    }
  };

  const detailsHref = `/products/${product.publicId || product.id}`;

  const shortDescription = product.description?.trim() || "";

  return (
    <div
      ref={cardRef}
      className={`group relative flex flex-col rounded-xl bg-white p-1.5 transition-all select-none border border-slate-100/90 shadow-2xs hover:shadow-xs ${
        fluid
          ? "w-full min-w-0"
          : "w-[114px] min-w-[114px] sm:w-[136px] sm:min-w-[136px] lg:w-[170px] shrink-0"
      }`}
    >
      {/* Product image container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#f8f9fa] p-1 flex items-center justify-center">
        {/* Wishlist button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
          aria-label={
            isFav ? "Remove from wishlist" : "Add to wishlist"
          }
          className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-2xs transition active:scale-90 disabled:opacity-50"
        >
          <Heart
            size={12}
            className={
              isFav
                ? "fill-rose-500 text-rose-500"
                : "text-slate-400 hover:text-slate-600"
            }
          />
        </button>

        {!isAvailable && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75 backdrop-blur-2xs">
            <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[8.5px] font-bold text-white uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        <Link href={detailsHref} className="block h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveImageUrl(product.image, 300)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Add / Quantity control (Zepto-style positioned at the bottom of the image container) */}
        <div className="absolute bottom-1 right-1 z-20">
          {!isAvailable ? (
            <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 text-[9.5px] font-bold text-gray-400">
              N/A
            </span>
          ) : countInCart === 0 ? (
            <button
              type="button"
              onClick={handleIncrement}
              disabled={isMutatingCart}
              className="flex h-6 sm:h-7 min-w-[50px] sm:min-w-[56px] items-center justify-center rounded-lg border-2 border-[#ff3269] bg-white px-2 text-[10.5px] font-black uppercase text-[#ff3269] shadow-2xs transition hover:bg-rose-50 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isMutatingCart ? (
                <Loader2 size={11} className="animate-spin text-[#ff3269]" />
              ) : (
                "ADD"
              )}
            </button>
          ) : (
            <div className="flex h-6 sm:h-7 min-w-[62px] items-center justify-between rounded-lg bg-[#00875a] px-1 text-white shadow-xs">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={isMutatingCart}
                className="flex h-5 w-5 items-center justify-center rounded active:scale-90 disabled:opacity-50"
                aria-label="Decrease quantity"
              >
                <Minus size={10} strokeWidth={3} />
              </button>

              <span className="px-1 text-[10.5px] font-black">
                {countInCart}
              </span>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={isMutatingCart}
                className="flex h-5 w-5 items-center justify-center rounded active:scale-90 disabled:opacity-50"
                aria-label="Increase quantity"
              >
                <Plus size={10} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pricing: Green badge for selling price + Strikethrough MRP (Matching Zepto reference screenshot) */}
      <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
        <span className="rounded-md bg-[#00875a] px-1.5 py-0.5 text-[11px] font-black leading-tight text-white shadow-2xs">
          ₹{currentSellingPrice}
        </span>

        {currentOriginalPrice > currentSellingPrice && (
          <span className="truncate text-[10px] text-slate-400 line-through">
            ₹{currentOriginalPrice}
          </span>
        )}
      </div>

      {/* Rupee discount label with dashed bottom border (Matching Zepto reference: ₹26 OFF) */}
      {discountAmount > 0 && (
        <div className="mt-0.5 border-b border-dashed border-slate-200 pb-0.5">
          <span className="text-[10px] font-extrabold text-[#00875a]">
            ₹{discountAmount} OFF
          </span>
        </div>
      )}

      {/* Product title (2 lines max, clean Zepto font weight) */}
      <Link
        href={detailsHref}
        className="mt-1 line-clamp-2 min-h-[28px] text-[11px] font-bold leading-[14px] text-slate-900 transition-colors hover:text-[#00875a]"
        title={product.name}
      >
        {product.name}
      </Link>

      {/* Weight / Variant label (e.g. 100 g, 500 g, 1 kg) */}
      <p className="mt-0.5 text-[9.5px] font-semibold text-slate-500">
        {activeVariant.label || product.unit || "1 unit"}
      </p>

      {/* Rating if present */}
      {rating !== undefined && rating > 0 && (
        <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-emerald-700">
          <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1 py-0.5">
            <Star
              size={9}
              className="fill-emerald-600 text-emerald-600"
            />
            {rating.toFixed(1)}
          </span>

          {reviewsCount ? (
            <span className="text-gray-400">
              ({reviewsCount})
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ZeptoProductCard;