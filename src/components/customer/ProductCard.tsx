"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Heart, Check, Star, ChevronDown } from "lucide-react";
import { StoreProduct, ProductWeightVariant } from "@/types";
import { resolveImageUrl } from "@/utils/image-utils";
import { triggerFlyAnimation } from "@/utils/animation-utils";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export interface ProductCardProps {
  product: StoreProduct;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: StoreProduct) => void;
  onAddToCart?: (product: StoreProduct, variant: ProductWeightVariant, quantity: number) => void;
  rating?: number;
  reviewsCount?: number;
}

/**
 * Generates sensible grocery weight/unit variants based on product unit
 * (UNCHANGED from your original file)
 */
export function getProductVariants(product: StoreProduct): ProductWeightVariant[] {
  if (product.variants && product.variants.length > 0) {
    return product.variants;
  }

  const rawUnit = (product.unit || "").trim().toLowerCase();

  if (rawUnit.includes("kg") || rawUnit.includes("kilo")) {
    return [
      { key: "500g", label: "500 g", unit: "500 g", multiplier: 0.5 },
      { key: "1kg", label: "1 kg", unit: "1 kg", multiplier: 1.0 },
      { key: "2kg", label: "2 kg", unit: "2 kg", multiplier: 2.0 },
    ];
  }

  if (rawUnit.includes("250")) {
    return [
      { key: "250g", label: "250 g", unit: "250 g", multiplier: 1.0 },
      { key: "500g", label: "500 g", unit: "500 g", multiplier: 2.0 },
      { key: "1kg", label: "1 kg", unit: "1 kg", multiplier: 4.0 },
    ];
  }

  if (rawUnit.includes("500")) {
    return [
      { key: "500g", label: "500 g", unit: "500 g", multiplier: 1.0 },
      { key: "1kg", label: "1 kg", unit: "1 kg", multiplier: 2.0 },
    ];
  }

  if (rawUnit.includes("g") || rawUnit.includes("gram")) {
    return [
      { key: "100g", label: "100 g", unit: "100 g", multiplier: 1.0 },
      { key: "250g", label: "250 g", unit: "250 g", multiplier: 2.5 },
      { key: "500g", label: "500 g", unit: "500 g", multiplier: 5.0 },
    ];
  }

  if (rawUnit.includes("dozen")) {
    return [
      { key: "half-dozen", label: "6 pcs (1/2 Dozen)", unit: "6 pcs", multiplier: 0.5 },
      { key: "1-dozen", label: "1 Dozen (12 pcs)", unit: "1 Dozen", multiplier: 1.0 },
    ];
  }

  if (rawUnit.includes("piece") || rawUnit.includes("pc")) {
    return [
      { key: "1pc", label: "1 pc", unit: "1 pc", multiplier: 1.0 },
      { key: "2pc", label: "2 pcs", unit: "2 pcs", multiplier: 2.0 },
      { key: "4pc", label: "4 pcs", unit: "4 pcs", multiplier: 4.0 },
    ];
  }

  if (rawUnit.includes("bunch")) {
    return [
      { key: "1bunch", label: "1 bunch", unit: "1 bunch", multiplier: 1.0 },
      { key: "2bunch", label: "2 bunches", unit: "2 bunches", multiplier: 2.0 },
    ];
  }

  if (rawUnit.includes("pack")) {
    return [
      { key: "1pack", label: "1 pack", unit: "1 pack", multiplier: 1.0 },
      { key: "2pack", label: "2 packs", unit: "2 packs", multiplier: 2.0 },
    ];
  }

  if (rawUnit.includes("litre") || rawUnit.includes("l") || rawUnit.includes("bottle") || rawUnit.includes("ml")) {
    return [
      { key: "500ml", label: "500 ml", unit: "500 ml", multiplier: 0.5 },
      { key: "1l", label: "1 Litre", unit: "1 L", multiplier: 1.0 },
    ];
  }

  return [
    { key: "default", label: `1 ${product.unit || "unit"}`, unit: product.unit || "unit", multiplier: 1.0 },
  ];
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted: propIsWishlisted,
  onToggleWishlist,
  onAddToCart,
  rating,
  reviewsCount,
}) => {
  const { isWishlisted: checkIsWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isSubmittingCart, setIsSubmittingCart] = useState<boolean>(false);

  const variants = useMemo(() => getProductVariants(product), [product]);

  // Default to the 1.0 multiplier variant or the first one
  const defaultVariantKey = useMemo(() => {
    const unitOne = variants.find((v) => v.multiplier === 1.0);
    return unitOne ? unitOne.key : variants[0]?.key || "default";
  }, [variants]);

  const [selectedVariantKey, setSelectedVariantKey] = useState<string>(defaultVariantKey);
  const [isVariantMenuOpen, setIsVariantMenuOpen] = useState<boolean>(false);
  const [isAddedFeedback, setIsAddedFeedback] = useState<boolean>(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState<boolean>(false);
  const cardRef = useRef<HTMLElement>(null);

  // Rotate through additional product photos when the product API provides a gallery.
  const productImages = useMemo(() => {
    type ProductWithGallery = StoreProduct & {
      images?: Array<string | { url?: string; imageUrl?: string }>;
      galleryImages?: Array<string | { url?: string; imageUrl?: string }>;
      imageUrls?: string[];
    };

    const galleryProduct = product as ProductWithGallery;
    const gallery = galleryProduct.images ?? galleryProduct.galleryImages ?? galleryProduct.imageUrls ?? [];
    const urls = gallery
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.url || item?.imageUrl || "";
      })
      .filter((url): url is string => Boolean(url));

    const allImages = [product.image, ...urls].filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0
    );
    return Array.from(new Set(allImages));
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  useEffect(() => {
    if (productImages.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % productImages.length);
    }, 2800);

    return () => window.clearInterval(intervalId);
  }, [productImages]);

  // Active variant
  const activeVariant = useMemo(() => {
    return variants.find((v) => v.key === selectedVariantKey) || variants[0] || {
      key: "default",
      label: `1 ${product.unit}`,
      unit: product.unit,
      multiplier: 1.0,
    };
  }, [variants, selectedVariantKey]);

  // Dynamic price calculation (UNCHANGED from your original file)
  const currentSellingPrice = Math.round((product.price || 0) * activeVariant.multiplier);
  const baseOriginal = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice
    : Math.round((product.price || 0) * 1.15);
  const currentOriginalPrice = Math.round(baseOriginal * activeVariant.multiplier);

  // Discount percentage
  const discountPercent =
    currentOriginalPrice > currentSellingPrice
      ? Math.round(((currentOriginalPrice - currentSellingPrice) / currentOriginalPrice) * 100)
      : 0;

  // Availability check
  const isAvailable =
    product.inStock !== false &&
    product.available !== false &&
    product.adminEnabled !== false &&
    product.status !== "Out of Stock" &&
    product.status !== "INACTIVE";

  // Product public ID for wishlist integration
  const productPublicId = product.publicId || String(product.id);

  // Wishlist state: checks prop override first, then backend state from context
  const isWishlisted =
    propIsWishlisted !== undefined ? propIsWishlisted : checkIsWishlisted(productPublicId);

  // Handle wishlist toggle with real backend API integration
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlistLoading) return;

    if (!isWishlisted) {
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

  // Add to cart handler — adds 1 unit of the selected variant
  // (quantity stepper removed to match the target card layout)
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable || isSubmittingCart) return;

    if (onAddToCart) {
      onAddToCart(product, activeVariant, 1);
      return;
    }

    const pPublicId = String(product.publicId || product.id || "").trim();
    const multiplier =
      Number.isFinite(Number(activeVariant.multiplier)) && activeVariant.multiplier > 0
        ? activeVariant.multiplier
        : 1;
    const quantityKg = Number((1 * multiplier).toFixed(3));

    setIsSubmittingCart(true);
    try {
      const success = await addToCart(pPublicId, quantityKg, product.name, {
        productImageUrl: product.image,
        pricePerKg: currentSellingPrice,
        unitOfMeasure: activeVariant.unit,
      });
      if (success) {
        triggerFlyAnimation(cardRef.current, "cart", product.image);
        setIsAddedFeedback(true);
        setTimeout(() => {
          setIsAddedFeedback(false);
        }, 1200);
      }
    } finally {
      setIsSubmittingCart(false);
    }
  };

  const detailsHref = `/products/${product.publicId || product.id}`;

  return (
    <article
      ref={cardRef}
      className="group relative flex flex-col bg-white rounded-xl border border-gray-200/70 hover:border-gray-300 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.09)] transition-all duration-200 overflow-hidden select-none"
    >
      {/* 1. PRODUCT IMAGE — full-bleed, fills the top of the card */}
      <div className="relative w-full aspect-square bg-[#f6f7f6] overflow-hidden">
        {/* Blue stacked discount badge — top-left corner */}
        {discountPercent > 0 && (
          <span className="absolute top-1 left-1 z-20 flex flex-col items-start rounded-lg bg-[#3B82F6] text-white px-1.5 py-1 leading-none shadow-sm">
            <span className="text-[11px] font-bold">{discountPercent}%</span>
            <span className="text-[9px] font-semibold mt-0.5">OFF</span>
          </span>
        )}

        {/* Wishlist heart — top-right (kept for functionality) */}
        <button
          type="button"
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
          className={`absolute top-1.5 right-1.5 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 shadow-sm cursor-pointer disabled:opacity-60 ${
            isWishlisted
              ? "bg-rose-50 text-rose-500 border border-rose-200"
              : "bg-white/95 text-gray-400 border border-gray-100 hover:text-rose-500 hover:bg-rose-50/70"
          }`}
        >
          <Heart
            size={15}
            className={`transition-colors ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`}
          />
        </button>

        {/* Out of Stock Subtle Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-800/85 text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs">
              Out of Stock
            </span>
          </div>
        )}

        {/* Product Image Clickable to Product Details */}
        <Link
          href={detailsHref}
          className="block w-full h-full cursor-pointer overflow-hidden"
          aria-label={`View details for ${product.name}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${product.id}-${activeImageIndex}`}
            src={resolveImageUrl(productImages[activeImageIndex] || product.image, 400)}
            alt={`${product.name}${productImages.length > 1 ? ` - image ${activeImageIndex + 1}` : ""}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        </Link>
      </div>

      {/* 2. NAME + WEIGHT (no delivery time, no category label) */}
      <div className="px-3 pt-2 pb-1.5">
        {/* Product Name */}
        <Link
          href={detailsHref}
          className="block text-[13px] sm:text-[13.5px] font-semibold text-[#1f2937] hover:text-[#00875a] transition-colors line-clamp-2 leading-snug min-h-[34px] cursor-pointer"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Weight + optional rating */}
        <div className="flex items-center justify-between gap-1 mt-0.5">
          {variants.length > 1 ? (
            // Multiple pack sizes: compact dropdown chip (opens upward)
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsVariantMenuOpen((v) => !v);
                }}
                disabled={!isAvailable}
                aria-expanded={isVariantMenuOpen}
                aria-label={`Choose quantity for ${product.name}`}
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[11px] font-medium text-gray-600 hover:border-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {activeVariant.label}
                <ChevronDown
                  size={11}
                  className={`transition-transform ${isVariantMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isVariantMenuOpen && (
                <>
                  {/* Click-away layer */}
                  <div
                    className="fixed inset-0 z-30"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsVariantMenuOpen(false);
                    }}
                  />
                  <div className="absolute left-0 bottom-full mb-1 z-40 w-max min-w-[8rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    {variants.map((variant) => (
                      <button
                        key={variant.key}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedVariantKey(variant.key);
                          setIsVariantMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-emerald-50 cursor-pointer ${
                          variant.key === selectedVariantKey
                            ? "text-[#00875a] font-semibold"
                            : "text-gray-600"
                        }`}
                      >
                        {variant.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            // Single pack size: plain text, exactly like the target design
            <span className="text-[12px] text-gray-500">{activeVariant.label}</span>
          )}

          {rating !== undefined && rating > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1 rounded shrink-0">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. PRICE ROW — divider on top, price + MRP left, outlined ADD right */}
      <div className="mt-auto border-t border-gray-100 px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="text-[15px] sm:text-[16px] font-bold text-gray-900 tracking-tight">
            ₹{currentSellingPrice}
          </span>
          {currentOriginalPrice > currentSellingPrice && (
            <span className="text-[11px] font-normal text-gray-400 line-through">
              ₹{currentOriginalPrice}
            </span>
          )}
        </div>

        {/* Outlined green ADD button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable || isSubmittingCart}
          className={`h-8 min-w-[72px] rounded-lg border text-[12px] font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-1 px-3 shrink-0 ${
            !isAvailable
              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
              : isAddedFeedback
              ? "bg-[#00875a] border-[#00875a] text-white"
              : isSubmittingCart
              ? "border-[#00875a]/40 bg-white text-[#00875a]/50 cursor-wait"
              : "border-[#00875a] bg-white text-[#00875a] hover:bg-[#eaf8f0] active:scale-95 cursor-pointer"
          }`}
          aria-label={!isAvailable ? "Unavailable" : `Add ${product.name} to cart`}
        >
          {isAddedFeedback ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Added</span>
            </>
          ) : !isAvailable ? (
            <span>N/A</span>
          ) : (
            <span>Add</span>
          )}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;