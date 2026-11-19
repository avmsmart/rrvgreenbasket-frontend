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
      className="group relative mb-4 flex min-w-0 flex-col select-none border-r border-slate-200 pr-2 pb-3"
    >
      <style jsx>{`
        @keyframes productGalleryFade {
          from { opacity: 0.35; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .product-gallery-fade {
          animation: productGalleryFade 650ms ease-in-out;
        }
      `}</style>
      {/* PRODUCT IMAGE — only the image has a bordered container */}
      <div className="relative aspect-square w-full overflow-hidden bg-transparent">
        {discountPercent > 0 && (
          <span className="absolute left-1.5 top-1.5 z-20 flex flex-col leading-none text-blue-600 drop-shadow-sm">
            <span className="text-[12px] font-extrabold">{discountPercent}%</span>
            <span className="mt-0.5 text-[9px] font-bold tracking-wide">OFF</span>
          </span>
        )}

        <button
          type="button"
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
          className={`absolute right-1.5 top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-all duration-150 disabled:opacity-60 ${
            isWishlisted
              ? "border border-rose-200 bg-rose-50 text-rose-500"
              : "border border-gray-100 bg-white/95 text-gray-400 hover:bg-rose-50/70 hover:text-rose-500"
          }`}
        >
          <Heart
            size={15}
            className={`transition-colors ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`}
          />
        </button>

        {!isAvailable && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <span className="rounded-md bg-gray-800/85 px-2 py-0.5 text-[10px] font-medium text-white shadow-xs">
              Out of Stock
            </span>
          </div>
        )}

        <Link
          href={detailsHref}
          className="block h-full w-full cursor-pointer overflow-hidden"
          aria-label={`View details for ${product.name}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${product.id}-${activeImageIndex}`}
            src={resolveImageUrl(productImages[activeImageIndex] || product.image, 400)}
            alt={`${product.name}${productImages.length > 1 ? ` - image ${activeImageIndex + 1}` : ""}`}
            loading="lazy"
            className="product-gallery-fade h-full w-full object-contain p-2.5 transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Small gallery indicators appear only when extra product photos exist */}
        {productImages.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 left-2 z-10 flex items-center gap-1">
            {productImages.map((_, index) => (
              <span
                key={`${product.id}-image-dot-${index}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === activeImageIndex ? "w-3 bg-emerald-600" : "w-1 bg-slate-300"
                }`}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable || isSubmittingCart}
          className={`absolute bottom-1.5 right-1.5 z-20 flex h-7 min-w-[54px] shrink-0 items-center justify-center gap-1 rounded-lg border px-2 text-[11px] font-bold uppercase tracking-wide text-white transition-all ${
            !isAvailable
              ? "cursor-not-allowed border-gray-300 bg-gray-300 text-gray-500"
              : isAddedFeedback
              ? "border-emerald-700 bg-emerald-700"
              : isSubmittingCart
              ? "cursor-wait border-emerald-600 bg-emerald-600 opacity-60"
              : "cursor-pointer border-emerald-600 bg-emerald-600 hover:bg-emerald-700 active:scale-95"
          }`}
          aria-label={!isAvailable ? "Unavailable" : `Add ${product.name} to cart`}
        >
          {isAddedFeedback ? (
            <>
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Added</span>
            </>
          ) : !isAvailable ? (
            <span>N/A</span>
          ) : (
            <span>Add</span>
          )}
        </button>
      </div>

      {/* PRODUCT DETAILS — title, price, quantity, then one-line description */}
      <div className="min-w-0 pt-1.5">
        {/* Product title */}
        <Link
          href={detailsHref}
          className="block line-clamp-1 cursor-pointer text-[13px] font-semibold leading-[18px] text-slate-900 transition-colors hover:text-emerald-700"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Price and MRP */}
        <div className="mt-1 flex min-w-0 items-baseline gap-1.5">
          <span className="text-[15px] font-extrabold leading-5 tracking-tight text-slate-900">
            ₹{currentSellingPrice}
          </span>
          {currentOriginalPrice > currentSellingPrice && (
            <span className="text-[11px] font-normal text-gray-400 line-through">
              ₹{currentOriginalPrice}
            </span>
          )}
        </div>

        
          <p className="mt-0.5 text-[10px] font-bold leading-4 text-emerald-700">
                {activeVariant.label}
          </p>
      

        {/* Quantity and optional rating */}
        <div className="mt-1 flex min-w-0 items-center justify-between gap-1">
          
          {rating !== undefined && rating > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 rounded bg-amber-50 px-1 text-[9px] font-bold text-amber-700">
              <Star className="h-2 w-2 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Backend-provided short description — one line only */}
        {(() => {
          const productWithDescription = product as StoreProduct & {
            shortDescription?: string;
          };
          const description = productWithDescription.description || productWithDescription.shortDescription;
          return description ? (
            <p className="mt-1 truncate text-[10px] leading-4 text-slate-500" title={description}>
              {description}
            </p>
          ) : null;
        })()}
      </div>
    </article>
  );
};

export default ProductCard;