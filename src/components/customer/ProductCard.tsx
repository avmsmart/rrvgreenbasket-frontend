"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Heart, Plus, Minus, ShoppingCart, Check, Star } from "lucide-react";
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
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddedFeedback, setIsAddedFeedback] = useState<boolean>(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState<boolean>(false);
  const cardRef = useRef<HTMLElement>(null);

  // Rotate through additional product photos when the product API provides a gallery.
  // Products with only one image keep a static image and do not animate.
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

  // Dynamic price calculation
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

  // Quantity controls (Minimum 1)
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => prev + 1);
  };

  // Add to cart handler connecting to Spring Boot Cart Service
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable || isSubmittingCart) return;

    if (onAddToCart) {
      onAddToCart(product, activeVariant, quantity);
      return;
    }

    const pPublicId = String(product.publicId || product.id || "").trim();
    const multiplier =
      Number.isFinite(Number(activeVariant.multiplier)) && activeVariant.multiplier > 0
        ? activeVariant.multiplier
        : 1;
    const quantityKg = Number((quantity * multiplier).toFixed(3));

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
          setQuantity(1); // Reset quantity selector back to 1 after addition
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
      className="group relative flex flex-col h-fit min-h-0 self-start bg-white rounded-xl border border-emerald-100/90 hover:border-emerald-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.1)] transition-all duration-200 overflow-hidden p-2 sm:p-2.5 select-none"
    >
      <div>
        {/* =========================================================================
            1. PRODUCT IMAGE + CORNER BADGES (White background, strictly object-contain)
           ========================================================================= */}
        <div className="relative w-full h-24 sm:h-28 lg:h-32 bg-white flex items-center justify-center overflow-hidden mb-1 rounded-lg">
          {/* Discount Badge in Top-Left Corner */}
          {discountPercent > 0 && (
            <span className="absolute top-1.5 left-1.5 z-10 rounded-md bg-[#00875a] text-white text-[10px] font-medium px-1.5 py-0.5 shadow-2xs">
              {discountPercent}% OFF
            </span>
          )}

          {/* Wishlist Heart Icon in Top-Right Corner */}
          <button
            type="button"
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
            className={`absolute top-1.5 right-1.5 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 shadow-2xs cursor-pointer disabled:opacity-60 ${
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
            className="w-full h-full flex items-center justify-center overflow-hidden p-0.5 cursor-pointer"
            aria-label={`View details for ${product.name}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={`${product.id}-${activeImageIndex}`}
              src={resolveImageUrl(productImages[activeImageIndex] || product.image, 400)}
              alt={`${product.name}${productImages.length > 1 ? ` - image ${activeImageIndex + 1}` : ""}`}
              loading="lazy"
              className="w-full h-full object-contain transition-opacity duration-500 ease-in-out"
            />
            {productImages.length > 1 && (
              <span className="pointer-events-none absolute bottom-1.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/85 px-1.5 py-1 shadow-sm">
                {productImages.map((_, index) => (
                  <span
                    key={`${product.id}-image-dot-${index}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeImageIndex ? "w-3 bg-emerald-600" : "w-1.5 bg-gray-300"
                    }`}
                  />
                ))}
              </span>
            )}
          </Link>
        </div>

        {/* =========================================================================
            2. ALL DETAILS BELOW THE IMAGE
           ========================================================================= */}
        
        {/* Category Label & Optional Star Rating */}
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <p className="text-[10px] sm:text-[11px] font-normal text-emerald-700 tracking-wide truncate leading-tight">
            {product.category || "Produce"}
          </p>
          {rating !== undefined && rating > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1 rounded">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
            </span>
          )}
        </div>

        {/* Product Name (13-14px, regular weight, clickable to details) */}
        <Link
          href={detailsHref}
          className="text-[13px] sm:text-[14px] font-normal text-gray-800 hover:text-[#00875a] transition-colors line-clamp-2 leading-tight min-h-0 block mb-1 cursor-pointer"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Weight / Variant choices: all options visible for direct selection */}
        <div className="flex flex-wrap items-center gap-1 mb-1.5" role="group" aria-label={`Choose quantity for ${product.name}`}>
          {variants.map((variant) => {
            const isSelected = selectedVariantKey === variant.key;
            return (
              <button
                key={variant.key}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedVariantKey(variant.key);
                }}
                disabled={!isAvailable}
                aria-pressed={isSelected}
                className={`min-h-7 rounded-md border px-2 py-1 text-[10px] sm:text-[11px] font-normal leading-none transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50"
                }`}
              >
                {variant.label}
              </button>
            );
          })}
        </div>

        {/* Selling Price and Original Price (16-17px, medium weight) */}
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-[16px] sm:text-[17px] font-medium text-gray-900 tracking-tight">
            ₹{currentSellingPrice}
          </span>
          {currentOriginalPrice > currentSellingPrice && (
            <span className="text-[12px] font-normal text-gray-400 line-through">
              ₹{currentOriginalPrice}
            </span>
          )}
        </div>
      </div>

      {/* =========================================================================
          3. QUANTITY SELECTOR AND ADD TO CART BUTTON
         ========================================================================= */}
      <div className="flex items-center gap-1.5 mt-1">
        {/* Quantity Stepper: min 1 */}
        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/80 overflow-hidden shrink-0">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={!isAvailable || quantity <= 1}
            className="w-7 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200/60 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3 stroke-[2.5]" />
          </button>
          <span className="w-6 text-center text-[12px] font-medium text-gray-800 select-none">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={!isAvailable}
            className="w-7 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200/60 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>

        {/* Green Add to Cart Button (12px, medium weight) */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable || isSubmittingCart}
          className={`flex-1 h-8 rounded-lg text-[12px] font-medium transition-all flex items-center justify-center gap-1 px-2 shadow-2xs cursor-pointer ${
            !isAvailable || isSubmittingCart
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : isAddedFeedback
              ? "bg-emerald-700 text-white"
              : "bg-[#00875a] hover:bg-[#00734d] active:scale-95 text-white"
          }`}
          aria-label={!isAvailable ? "Unavailable" : `Add ${product.name} to cart`}
        >
          {isAddedFeedback ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Added</span>
            </>
          ) : !isAvailable ? (
            <span>Unavailable</span>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5 stroke-[2]" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
