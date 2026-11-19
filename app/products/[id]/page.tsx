"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart, Star, Plus, Minus, ShoppingCart, CheckCircle2, Truck,
  ChevronRight, ShoppingBag, Check, Loader2, ShoppingBasket, X, ArrowLeft,
} from "lucide-react";
import HomeFooter from "@/components/HomeFooter";
import { StoreProduct, ProductWeightVariant } from "@/types";
import { useWishlist } from "@/context/WishlistContext";
import { productService } from "@/services/product.service";
import { reviewService } from "@/services/review.service";
import { resolveImageUrl, getProductGalleryImages } from "@/utils/image-utils";
import { triggerFlyAnimation } from "@/utils/animation-utils";
import { useCart } from "@/context/CartContext";
import { ProductReviewsSection } from "@/components/customer/ProductReviewsSection";

interface DetailProduct {
  id: string;
  publicId: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  unit: string;
  images: string[];
  description: string;
  shortDescription?: string;
  inStock: boolean;
  maxStock: number;
  rating: number;
  reviewsCount: number;
}

function generateProduceVariants(rawUnit: string): ProductWeightVariant[] {
  const u = (rawUnit || "kg").toLowerCase().trim();
  if (u.includes("kg") || u.includes("kilo")) {
    return [
      { key: "500g", label: "500 g", unit: "500 g", multiplier: 0.5 },
      { key: "1kg", label: "1 KG", unit: "1 KG", multiplier: 1.0 },
      { key: "2kg", label: "2 KG", unit: "2 KG", multiplier: 2.0 },
      { key: "5kg", label: "5 KG", unit: "5 KG", multiplier: 5.0 },
    ];
  }
  if (u.includes("dozen")) {
    return [
      { key: "half-dozen", label: "6 pcs", unit: "6 pcs", multiplier: 0.5 },
      { key: "1-dozen", label: "1 Dozen", unit: "1 Dozen", multiplier: 1.0 },
      { key: "2-dozen", label: "2 Dozen", unit: "2 Dozen", multiplier: 2.0 },
    ];
  }
  if (u.includes("piece") || u.includes("pc")) {
    return [
      { key: "1pc", label: "1 Pc", unit: "1 Pc", multiplier: 1.0 },
      { key: "2pc", label: "2 Pcs", unit: "2 Pcs", multiplier: 2.0 },
      { key: "4pc", label: "4 Pcs", unit: "4 Pcs", multiplier: 4.0 },
    ];
  }
  if (u.includes("bunch")) {
    return [
      { key: "1bunch", label: "1 Bunch", unit: "1 Bunch", multiplier: 1.0 },
      { key: "2bunch", label: "2 Bunches", unit: "2 Bunches", multiplier: 2.0 },
      { key: "3bunch", label: "3 Bunches", unit: "3 Bunches", multiplier: 3.0 },
    ];
  }
  return [
    { key: "1unit", label: `1 ${rawUnit || "unit"}`, unit: rawUnit || "unit", multiplier: 1.0 },
    { key: "2unit", label: `2 ${rawUnit || "units"}`, unit: rawUnit || "units", multiplier: 2.0 },
  ];
}

// Small volume discount on bigger packs
function variantPrice(base: number, multiplier: number) {
  if (multiplier === 2.0) return Math.round(base * 2.0 * 0.97);
  if (multiplier === 5.0) return Math.round(base * 5.0 * 0.94);
  return Math.round(base * multiplier);
}



function ProductDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id ? String(params.id) : "";

  const { isWishlisted: checkIsWishlisted, toggleWishlist } = useWishlist();
  // updateQuantity / removeFromCart are optional: rename to match your CartContext
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cart = useCart() as any;
  const { addToCart, updateQuantity, removeFromCart } = cart;
  const [product, setProduct] = useState<DetailProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariantKey, setSelectedVariantKey] = useState("1kg");
  const [busy, setBusy] = useState(false);
  // How many packs of each variant are in the cart (this session)
  const [cartQty, setCartQty] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [pinMsg, setPinMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [recommendations, setRecommendations] = useState<StoreProduct[]>([]);

  // Review form state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const imageCardRef = useRef<HTMLDivElement>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const isWishlisted = checkIsWishlisted(product?.publicId || "");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Load product
  useEffect(() => {
    if (!rawId) return;
    let alive = true;
    setIsLoading(true);
    setCartQty({});

    (async () => {
      try {
        const bp = await productService.getStorefrontProductById(rawId);
        if (!bp || !alive) {
          if (alive) setProduct(null);
          return;
        }
        const category =
          typeof bp.category === "object" && bp.category?.name
            ? bp.category.name
            : typeof bp.category === "string" ? bp.category : "Vegetables";
        const basePrice = Number(bp.pricePerKg ?? bp.totalPrice ?? 40);

        const mapped: DetailProduct = {
          id: bp.publicId || String(bp.id),
          publicId: bp.publicId || String(bp.id),
          name: bp.name,
          category,
          price: basePrice,
          originalPrice: Number(bp.originalPrice ?? Math.round(basePrice * 1.15)),
          unit: bp.quantityUnit || "KG",
          images: getProductGalleryImages({ imageUrl: bp.imageUrl, images: bp.images }),
          description:
            bp.description || bp.shortDescription ||
            `Farm fresh ${bp.name} sourced directly from local farms. Naturally ripened and rich in vitamins, perfect for everyday family recipes.`,
          shortDescription:
            bp.shortDescription || `Farm fresh, naturally ripened ${bp.name.toLowerCase()}.`,
          inStock: bp.available !== false && bp.stockStatus !== "OUT_OF_STOCK",
          maxStock: 50,
          rating: 4.5,
          reviewsCount: 18,
        };

        try {
          const s = await reviewService.getProductRatingSummary(mapped.publicId);
          if (s && s.averageRating > 0) {
            mapped.rating = s.averageRating;
            mapped.reviewsCount = s.totalActiveReviews;
          }
        } catch { /* keep defaults */ }

        if (!alive) return;
        const vs = generateProduceVariants(mapped.unit);
        setSelectedVariantKey((vs.find((v) => v.multiplier === 1.0) || vs[0]).key);
        setActiveImageIndex(0);
        setProduct(mapped);
      } catch (err) {
        console.warn("[ProductDetails] Failed to load product:", err);
        if (alive) setProduct(null);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [rawId]);

  // Automatically rotate through the product gallery every 4 seconds.
  useEffect(() => {
    const imageCount = product?.images?.length ?? 0;
    if (imageCount <= 1) {
      setActiveImageIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % imageCount);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [product?.publicId, product?.images?.length]);

  // 2. Recommendations
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await productService.getStorefrontProducts({ size: 12 });
        if (!res || !Array.isArray(res.content) || !alive) return;
        const list = res.content
          .filter((p) => p.publicId !== rawId && String(p.id) !== rawId)
          .map((p) => ({
            id: p.publicId || String(p.id),
            publicId: p.publicId || String(p.id),
            name: p.name,
            category:
              typeof p.category === "object" && p.category?.name ? p.category.name
                : typeof p.category === "string" ? p.category : "Produce",
            price: Number(p.pricePerKg ?? p.totalPrice ?? 40),
            originalPrice: Number(p.originalPrice ?? Math.round(Number(p.pricePerKg ?? 40) * 1.15)),
            unit: p.quantityUnit || "KG",
            image: p.imageUrl || (p.images && p.images[0]?.imageUrl) || "",
            inStock: p.available !== false && p.stockStatus !== "OUT_OF_STOCK",
            rating: 4.5,
            reviewsCount: 140,
          }));
        setRecommendations(list.slice(0, 5));
      } catch (err) {
        console.warn("[ProductDetails] Failed to load recommendations:", err);
      }
    })();
    return () => { alive = false; };
  }, [rawId]);

  const variants = useMemo(() => (product ? generateProduceVariants(product.unit) : []), [product]);
  const selectedVariant = useMemo(
    () => variants.find((v) => v.key === selectedVariantKey) || variants[0],
    [variants, selectedVariantKey]
  );

  const currentPrice = product && selectedVariant ? variantPrice(product.price, selectedVariant.multiplier) : 0;
  const currentMrp = product && selectedVariant ? Math.round(product.originalPrice * selectedVariant.multiplier) : 0;
  const discount = currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;
  const qtyInCart = cartQty[selectedVariantKey] || 0;

  const setQty = (n: number) => setCartQty((m) => ({ ...m, [selectedVariantKey]: n }));

  // Add first pack
  const handleAdd = async () => {
    if (!product || !selectedVariant || busy) return;
    setBusy(true);
    try {
      const ok = await addToCart(product.publicId, Number(selectedVariant.multiplier.toFixed(3)), product.name);
      if (ok) {
        setQty(1);
        triggerFlyAnimation(imageCardRef.current, "cart", product.images[0]);
      }
    } finally {
      setBusy(false);
    }
  };

  // Increase / decrease packs already in the cart
  const handleChangeQty = async (next: number) => {
    if (!product || !selectedVariant || busy) return;
    if (next > product.maxStock) return;
    setBusy(true);
    try {
      const pid = product.publicId;
      const kg = Number((next * selectedVariant.multiplier).toFixed(3));
      if (next <= 0) {
        if (typeof removeFromCart === "function") await removeFromCart(pid);
        else if (typeof updateQuantity === "function") await updateQuantity(pid, 0);
        setQty(0);
      } else if (typeof updateQuantity === "function") {
        await updateQuantity(pid, kg);
        setQty(next);
      } else if (next > qtyInCart) {
        const ok = await addToCart(pid, selectedVariant.multiplier, product.name);
        if (ok) setQty(next);
      } else {
        showToast("Open your cart to reduce the quantity");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleQuickAddRecommended = async (e: React.MouseEvent, rec: StoreProduct) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await addToCart(rec.publicId || String(rec.id), 1, rec.name);
    if (ok) triggerFlyAnimation(e.currentTarget as HTMLElement, "cart", rec.image);
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    if (!isWishlisted) triggerFlyAnimation(imageCardRef.current, "wishlist");
    await toggleWishlist(product.publicId, product.name);
  };

  const checkPincode = () => {
    if (!/^\d{6}$/.test(pincode)) return setPinMsg({ ok: false, text: "Enter a valid 6-digit pincode" });
    setPinMsg(
      pincode.startsWith("518")
        ? { ok: true, text: "Delivery available. Same-day delivery within 5 km." }
        : { ok: false, text: "Sorry, we currently deliver only in Kurnool." }
    );
  };

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product || reviewSubmitting) return;

    const comment = reviewComment.trim();
    if (!comment) {
      setReviewError("Please enter your review.");
      return;
    }

    setReviewSubmitting(true);
    setReviewError(null);

    try {
      await reviewService.submitReview({
        productPublicId: product.publicId,
        rating: reviewRating,
        reviewTitle: reviewTitle.trim(),
        reviewComment: comment,
      });

      setShowReviewModal(false);
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
      setReviewRefreshKey((current) => current + 1);
      showToast("Your review was submitted successfully.");
    } catch (error) {
      console.error("[ProductDetails] Failed to submit review:", error);
      setReviewError(
        error instanceof Error
          ? error.message
          : "Unable to submit your review. Please try again."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl animate-pulse px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-[4/5] rounded-xl bg-slate-100" />
              <div className="aspect-[4/5] rounded-xl bg-slate-100" />
            </div>
            <div className="space-y-5">
              <div className="h-8 w-2/3 rounded bg-slate-100" />
              <div className="h-5 w-1/2 rounded bg-slate-100" />
              <div className="h-10 w-1/3 rounded bg-slate-100" />
              <div className="h-14 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-white p-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-[#00875a]">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          This item may have been removed from our catalog.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-lg bg-[#00875a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#00734d]"
        >
          Back to store
        </button>
      </main>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {toastMessage && (
        <div className="fixed left-1/2 top-16 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* ---------- Write review modal ---------- */}
      {showReviewModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !reviewSubmitting) {
              setShowReviewModal(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="write-review-heading"
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="write-review-heading" className="text-xl font-bold text-[#24594b]">
                  Write a review
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Share your experience with {product.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                disabled={reviewSubmitting}
                aria-label="Close review form"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Your rating
                </label>
                <div className="mt-2 flex items-center gap-2" role="radiogroup" aria-label="Your rating">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      role="radio"
                      aria-checked={reviewRating === rating}
                      aria-label={`${rating} ${rating === 1 ? "star" : "stars"}`}
                      onClick={() => setReviewRating(rating)}
                      className="rounded-md p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#00875a]"
                    >
                      <Star className={`h-8 w-8 ${rating <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-slate-600">
                    {reviewRating}/5
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="review-title" className="block text-sm font-semibold text-slate-700">
                  Review title <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="review-title"
                  type="text"
                  maxLength={120}
                  value={reviewTitle}
                  onChange={(event) => setReviewTitle(event.target.value)}
                  placeholder="Summarise your experience"
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[#00875a] focus:ring-2 focus:ring-[#00875a]/10"
                />
              </div>

              <div>
                <label htmlFor="review-comment" className="block text-sm font-semibold text-slate-700">
                  Your review
                </label>
                <textarea
                  id="review-comment"
                  required
                  minLength={3}
                  maxLength={2000}
                  rows={5}
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="Tell others about the freshness, quality and your experience..."
                  className="mt-2 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm outline-none transition focus:border-[#00875a] focus:ring-2 focus:ring-[#00875a]/10"
                />
                <p className="mt-1 text-right text-xs text-slate-400">
                  {reviewComment.length}/2000
                </p>
              </div>

              {reviewError && (
                <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                  {reviewError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  disabled={reviewSubmitting}
                  className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting || !reviewComment.trim()}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00875a] px-6 text-sm font-bold text-white transition hover:bg-[#00734d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reviewSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {reviewSubmitting ? "Submitting..." : "Submit review"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* ---------- Product page back navigation ---------- */}
      <div className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back to previous page"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-[#24594b] transition hover:border-[#00875a] hover:bg-emerald-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm font-semibold text-[#24594b]">Product details</span>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6">
        <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
          {/* ---------- Product image gallery ---------- */}
          <div className="min-w-0">
            {(() => {
              const galleryImages = product.images.length
                ? product.images
                : [resolveImageUrl(undefined)];
              const activeImage = galleryImages[
                Math.min(activeImageIndex, galleryImages.length - 1)
              ];

              return (
                <div
                  className={`grid grid-cols-1 gap-3 lg:gap-4 ${
                    galleryImages.length > 1
                      ? "lg:grid-cols-[76px_minmax(0,1fr)]"
                      : "lg:grid-cols-1"
                  }`}
                >
                  {/* Desktop thumbnail rail */}
                  {galleryImages.length > 1 && (
                    <div className="hidden max-h-[620px] flex-col gap-3 overflow-y-auto lg:flex">
                      {galleryImages.map((src, index) => (
                        <button
                          key={`${src}-thumb-${index}`}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          aria-label={`Show product image ${index + 1}`}
                          aria-pressed={activeImageIndex === index}
                          className={`relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-lg border bg-[#f6f8f5] p-1.5 transition ${
                            activeImageIndex === index
                              ? "border-[#00875a] ring-2 ring-[#00875a]/15"
                              : "border-slate-200 hover:border-[#00875a]/60"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`${product.name} thumbnail ${index + 1}`} className="h-full w-full object-contain" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Main image */}
                  <div
                    ref={imageCardRef}
                    className="relative aspect-[4/5] min-w-0 overflow-hidden rounded-xl border border-slate-200/80 bg-[#f6f8f5] p-5 sm:aspect-[5/4] lg:aspect-[4/5] lg:max-h-[620px]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={activeImage}
                      src={activeImage}
                      alt={`${product.name} image ${activeImageIndex + 1}`}
                      className="h-full w-full object-contain transition-opacity duration-500"
                    />
                    <button
                      type="button"
                      onClick={handleToggleWishlist}
                      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm"
                    >
                      <Heart className={`h-5 w-5 ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-500"}`} />
                    </button>
                    {galleryImages.length > 1 && (
                      <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/65 px-2.5 py-1 text-[11px] font-semibold text-white">
                        {activeImageIndex + 1} / {galleryImages.length}
                      </span>
                    )}
                  </div>

                  {/* Mobile thumbnail selector */}
                  {galleryImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                      {galleryImages.map((src, index) => (
                        <button
                          key={`${src}-mobile-thumb-${index}`}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          aria-label={`Show product image ${index + 1}`}
                          aria-pressed={activeImageIndex === index}
                          className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-[#f6f8f5] p-1 transition ${
                            activeImageIndex === index
                              ? "border-[#00875a] ring-2 ring-[#00875a]/15"
                              : "border-slate-200"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`${product.name} thumbnail ${index + 1}`} className="h-full w-full object-contain" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* ---------- Details ---------- */}
          <div className="lg:sticky lg:top-32">
            <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{product.name}</h1>
            <p className="mt-1 text-base text-slate-500 sm:text-lg">{product.shortDescription}</p>

            <div className="mt-3 inline-flex items-center gap-2 rounded border border-slate-200 px-3 py-1.5 text-sm">
              <span className="font-bold">{product.rating.toFixed(1)}</span>
              <Star className="h-4 w-4 fill-[#00875a] text-[#00875a]" />
              <span className="h-4 w-px bg-slate-200" />
              <span className="text-slate-500">{product.reviewsCount} Ratings</span>
            </div>

            <hr className="my-4 border-slate-200" />

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-bold">₹{currentPrice}</span>
              {currentMrp > currentPrice && (
                <span className="text-lg text-slate-500">
                  MRP <span className="line-through">₹{currentMrp}</span>
                </span>
              )}
              {discount > 0 && <span className="text-lg font-bold text-orange-500">({discount}% OFF)</span>}
            </div>
            <p className="mt-1.5 text-sm font-semibold text-[#00875a]">inclusive of all taxes</p>

            {/* Select quantity (round chips, like the size selector) */}
            <div className="mt-6">
              <h2 className="text-base font-bold">Select quantity</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {variants.map((v) => {
                  const active = v.key === selectedVariantKey;
                  const inBag = cartQty[v.key] > 0;
                  return (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => setSelectedVariantKey(v.key)}
                      aria-pressed={active}
                      className={`relative flex h-14 min-w-14 flex-col items-center justify-center rounded-full border px-4 transition-colors ${
                        active
                          ? "border-[#00875a] text-[#00875a] ring-1 ring-[#00875a]"
                          : "border-slate-300 text-slate-800 hover:border-[#00875a]"
                      }`}
                    >
                      <span className="text-sm font-bold leading-none">{v.label}</span>
                      <span className="mt-1 text-[10px] font-medium leading-none text-slate-500">
                        ₹{variantPrice(product.price, v.multiplier)}
                      </span>
                      {inBag && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00875a] px-1 text-[10px] font-bold text-white">
                          {cartQty[v.key]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add to cart  ->  quantity stepper */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {!product.inStock ? (
                <button disabled className="h-14 w-full rounded-md sm:w-auto sm:flex-1 sm:max-w-[360px] bg-slate-200 text-sm font-bold text-slate-500">
                  Out of stock
                </button>
              ) : qtyInCart === 0 ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={busy}
                  className="flex h-14 w-full items-center justify-center gap-2.5 rounded-md bg-[#00875a] text-base font-bold text-white transition-colors hover:bg-[#00734d] active:bg-[#006244] disabled:opacity-60 sm:w-auto sm:min-w-[240px] sm:flex-1 sm:max-w-[360px]"
                >
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingBasket className="h-5 w-5" />}
                  Add to cart
                </button>
              ) : (
                <div className="flex w-full gap-3 sm:flex-1 sm:max-w-[360px]">
                  <div className="flex h-14 flex-1 items-center justify-between rounded-md bg-[#00875a] px-2 text-white">
                    <button
                      type="button"
                      onClick={() => handleChangeQty(qtyInCart - 1)}
                      disabled={busy}
                      aria-label="Decrease quantity"
                      className="flex h-10 w-12 items-center justify-center rounded hover:bg-white/15 active:bg-white/25 disabled:opacity-50"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <div className="text-center leading-tight">
                      <div className="text-lg font-bold">{qtyInCart}</div>
                      <div className="text-[10px] text-emerald-100">in cart</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChangeQty(qtyInCart + 1)}
                      disabled={busy || qtyInCart >= product.maxStock}
                      aria-label="Increase quantity"
                      className="flex h-10 w-12 items-center justify-center rounded hover:bg-white/15 active:bg-white/25 disabled:opacity-50"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {qtyInCart > 0 ? (
                <Link
                  href="/cart"
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-md border border-[#00875a] px-6 text-sm font-bold text-[#00875a] hover:bg-emerald-50 sm:w-auto sm:min-w-[170px]"
                >
                  <ShoppingCart className="h-4 w-4" /> Go to cart
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className="hidden h-14 items-center justify-center gap-2 rounded-md border border-slate-300 px-6 text-sm font-bold hover:border-slate-500 sm:flex sm:min-w-[170px]"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                  {isWishlisted ? "Wishlisted" : "Wishlist"}
                </button>
              )}
            </div>

            <hr className="my-6 border-slate-200" />

            {/* Delivery options */}
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold">
                Delivery options <Truck className="h-5 w-5 text-slate-500" />
              </h2>
              <div className="mt-3 flex h-12 max-w-xs items-center rounded-md border border-slate-300 pl-3 pr-2 focus-within:border-[#00875a]">
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "")); setPinMsg(null); }}
                  onKeyDown={(e) => e.key === "Enter" && checkPincode()}
                  placeholder="Enter pincode"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <button type="button" onClick={checkPincode} className="px-2 text-sm font-bold text-[#00875a]">
                  Check
                </button>
              </div>
              {pinMsg && (
                <p className={`mt-2 text-xs font-semibold ${pinMsg.ok ? "text-[#00875a]" : "text-rose-600"}`}>
                  {pinMsg.text}
                </p>
              )}
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {["Farm fresh, sourced daily", "Naturally grown, chemical free", "Direct from local farmers"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 stroke-[3] text-[#00875a]" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <hr className="my-6 border-slate-200" />

            <div>
              <h2 className="text-base font-bold">Product details</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{product.description}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-8">
          <ProductReviewsSection
            key={`${product.publicId}-${reviewRefreshKey}`}
            productPublicId={product.publicId}
            productName={product.name}
            onWriteReview={() => {
              setReviewError(null);
              setShowReviewModal(true);
            }}
          />
        </div>

        {/* ---------- Recommended ---------- */}
        {recommendations.length > 0 && (
        <section className="mt-10 border-t border-slate-200 pt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold sm:text-xl">Recommended for you</h3>
            <Link href="/" className="flex items-center gap-1 text-xs font-bold text-[#00875a] hover:underline">
              View more <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 md:grid md:grid-cols-5 md:overflow-visible">
            {recommendations.map((rec) => (
              <div key={rec.id} className="group flex w-40 shrink-0 snap-start flex-col rounded-xl border border-slate-200 p-3 transition-shadow hover:border-emerald-300 hover:shadow-md md:w-auto">
                <Link href={`/products/${rec.publicId || rec.id}`}
                  className="mb-2 flex h-28 items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-2 sm:h-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveImageUrl(rec.image)} alt={rec.name}
                    className="h-full w-full object-contain transition-transform group-hover:scale-105" />
                </Link>
                <Link href={`/products/${rec.publicId || rec.id}`} title={rec.name}
                  className="line-clamp-1 text-xs font-semibold hover:text-[#00875a]">
                  {rec.name}
                </Link>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-sm font-bold">₹{rec.price}</span>
                  <span className="text-[10px] text-slate-400">/ {rec.unit}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.5
                  </span>
                  <button type="button" onClick={(e) => handleQuickAddRecommended(e, rec)}
                    aria-label={`Add ${rec.name} to cart`}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00875a] text-white hover:bg-[#00734d] active:scale-90">
                    <Plus className="h-4 w-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#00875a]" />
        </div>
      }
    >
      <ProductDetailsContent />
    </Suspense>
  );
}