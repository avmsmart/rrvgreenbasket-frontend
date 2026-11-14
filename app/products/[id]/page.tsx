"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Leaf,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Check,
  FlaskConical,
  Users,
  Award,
  Home as HomeIcon,
  Loader2,
  X,
  ExternalLink,
  Search,
  MapPin,
  ChevronDown,
} from "lucide-react";
import CustomerNavAuth from "@/components/customer/CustomerNavAuth";
import HomeFooter from "@/components/HomeFooter";
import { StoreProduct, ProductWeightVariant } from "@/types";
import { useWishlist } from "@/context/WishlistContext";
import { productService } from "@/services/product.service";
import { reviewService } from "@/services/review.service";
import { inventoryService } from "@/services/inventory.service";
import { resolveImageUrl, getProductGalleryImages } from "@/utils/image-utils";
import { triggerFlyAnimation } from "@/utils/animation-utils";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useCart } from "@/context/CartContext";
import { ProductReviewsSection } from "@/components/customer/ProductReviewsSection";
import { ProductRatingSummary } from "@/types/review";

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
  sku?: string;
  origin?: string;
  shelfLife?: string;
}

/**
 * Generates sensible grocery weight variants matching the reference layout
 * e.g. 500 g, 1 KG, 2 KG, 5 KG
 */
function generateProduceVariants(basePrice: number, rawUnit: string): ProductWeightVariant[] {
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

function ProductDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id ? String(params.id) : "";

  const { isWishlisted: checkIsWishlisted, toggleWishlist, wishlistCount } = useWishlist();
  const { settings } = useStoreSettings();
  const [headerSearch, setHeaderSearch] = useState<string>("");

  // Product data & loading states
  const [product, setProduct] = useState<DetailProduct | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "similar">("description");

  // Quantity & Variant states
  const [selectedVariantKey, setSelectedVariantKey] = useState<string>("1kg");
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [isBuyingNow, setIsBuyingNow] = useState<boolean>(false);

  // Cart from CartContext
  const { itemCount: cartCount, addToCart } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const imageCardRef = useRef<HTMLDivElement>(null);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<StoreProduct[]>([]);

  // Rating summary state
  const [ratingSummary, setRatingSummary] = useState<ProductRatingSummary | null>(null);

  const productPublicId = product ? product.publicId : "";
  const isWishlisted = checkIsWishlisted(productPublicId);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // 1. Fetch Selected Product by publicId or ID
  useEffect(() => {
    setMounted(true);

    if (!rawId) return;

    let isSubscribed = true;
    setIsLoading(true);

    const loadProductData = async () => {
      try {
        // Public storefront lookup (Never requires admin authentication)
        const backendProduct = await productService.getStorefrontProductById(rawId);

        if (backendProduct && isSubscribed) {
          const catName =
            typeof backendProduct.category === "object" && backendProduct.category?.name
              ? backendProduct.category.name
              : typeof backendProduct.category === "string"
              ? backendProduct.category
              : "Vegetables";

          const gallery = getProductGalleryImages({
            imageUrl: backendProduct.imageUrl,
            images: backendProduct.images,
          });

          const basePrice = Number(backendProduct.pricePerKg ?? backendProduct.totalPrice ?? 40);
          const origPrice = Number(backendProduct.originalPrice ?? Math.round(basePrice * 1.15));

          const mapped: DetailProduct = {
            id: backendProduct.publicId || String(backendProduct.id),
            publicId: backendProduct.publicId || String(backendProduct.id),
            name: backendProduct.name,
            category: catName,
            price: basePrice,
            originalPrice: origPrice,
            unit: backendProduct.quantityUnit || "KG",
            images: gallery,
            description:
              backendProduct.description ||
              backendProduct.shortDescription ||
              `Farm fresh ${backendProduct.name} sourced directly from local agricultural clusters. Naturally ripened, rich in vitamins and dietary nutrition, perfect for your everyday family recipes.`,
            shortDescription:
              backendProduct.shortDescription ||
              `Farm fresh, naturally ripened and high-quality ${backendProduct.name.toLowerCase()}.`,
            inStock: backendProduct.available !== false && backendProduct.stockStatus !== "OUT_OF_STOCK",
            maxStock: 50,
            rating: 4.5,
            reviewsCount: 18,
            sku: backendProduct.slug || backendProduct.publicId,
          };

          setProduct(mapped);
          setActiveImageIndex(0);

          // Default selected variant
          const variants = generateProduceVariants(mapped.price, mapped.unit);
          const defaultVar = variants.find((v) => v.multiplier === 1.0) || variants[0];
          if (defaultVar) setSelectedVariantKey(defaultVar.key);

          // Fetch rating summary from Review Service (API 7)
          try {
            const summary = await reviewService.getProductRatingSummary(mapped.publicId);
            if (summary && isSubscribed) {
              setRatingSummary(summary);
              if (summary.averageRating > 0) {
                mapped.rating = summary.averageRating;
                mapped.reviewsCount = summary.totalActiveReviews;
                setProduct({ ...mapped });
              }
            }
          } catch {
            // ignore
          }
        } else if (isSubscribed) {
          setProduct(null);
        }
      } catch (err) {
        console.warn("[ProductDetails] Failed to load product:", err);
        if (isSubscribed) setProduct(null);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    };

    loadProductData();

    return () => {
      isSubscribed = false;
    };
  }, [rawId]);

  // 2. Fetch Recommended Products (Related produce)
  useEffect(() => {
    let isSubscribed = true;

    const loadRecommendations = async () => {
      try {
        const res = await productService.getStorefrontProducts({ size: 12 });
        if (res && Array.isArray(res.content) && isSubscribed) {
          const filtered = res.content
            .filter((p) => p.publicId !== rawId && String(p.id) !== rawId)
            .map((p) => ({
              id: p.publicId || String(p.id),
              publicId: p.publicId || String(p.id),
              name: p.name,
              category:
                typeof p.category === "object" && p.category?.name
                  ? p.category.name
                  : typeof p.category === "string"
                  ? p.category
                  : "Produce",
              price: Number(p.pricePerKg ?? p.totalPrice ?? 40),
              originalPrice: Number(p.originalPrice ?? Math.round(Number(p.pricePerKg ?? 40) * 1.15)),
              unit: p.quantityUnit || "KG",
              image: p.imageUrl || (p.images && p.images[0]?.imageUrl) || "",
              inStock: p.available !== false && p.stockStatus !== "OUT_OF_STOCK",
              rating: 4.5,
              reviewsCount: 140,
            }));

          setRecommendations(filtered.slice(0, 5));
        }
      } catch (err) {
        console.warn("[ProductDetails] Failed to load recommendations:", err);
      }
    };

    loadRecommendations();

    return () => {
      isSubscribed = false;
    };
  }, [rawId]);

  // Derived variants for the active product
  const variants = useMemo(() => {
    if (!product) return [];
    return generateProduceVariants(product.price, product.unit);
  }, [product]);

  const selectedVariant = useMemo(() => {
    return variants.find((v) => v.key === selectedVariantKey) || variants[0];
  }, [variants, selectedVariantKey]);

  // Dynamic Price Calculations based on selected variant
  const currentPrice = useMemo(() => {
    if (!product || !selectedVariant) return 0;
    // Apply slight volume discount for 2kg / 5kg matching grocery design
    if (selectedVariant.multiplier === 2.0) {
      return Math.round(product.price * 2.0 * 0.97);
    }
    if (selectedVariant.multiplier === 5.0) {
      return Math.round(product.price * 5.0 * 0.94);
    }
    return Math.round(product.price * selectedVariant.multiplier);
  }, [product, selectedVariant]);

  const currentOriginalPrice = useMemo(() => {
    if (!product || !selectedVariant) return 0;
    return Math.round(product.originalPrice * selectedVariant.multiplier);
  }, [product, selectedVariant]);

  const discountPercent = useMemo(() => {
    if (currentOriginalPrice <= currentPrice) return 0;
    return Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100);
  }, [currentPrice, currentOriginalPrice]);

  // Carousel thumbnail navigation
  const handlePrevImage = () => {
    if (!product || product.images.length <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!product || product.images.length <= 1) return;
    setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  // Add to Cart Action
  const handleAddToCart = async () => {
    if (!product || !selectedVariant || isAddingToCart) return;
    setIsAddingToCart(true);

    const pPublicId = product.publicId || product.id;
    const multiplier =
      Number.isFinite(Number(selectedVariant.multiplier)) && selectedVariant.multiplier > 0
        ? selectedVariant.multiplier
        : 1;
    const quantityKg = Number((quantity * multiplier).toFixed(3));

    try {
      const success = await addToCart(pPublicId, quantityKg, product.name);
      if (success) {
        triggerFlyAnimation(
          imageCardRef.current,
          "cart",
          product.images[activeImageIndex] || product.images[0]
        );
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Buy Now Action
  const handleBuyNow = async () => {
    if (!product || !selectedVariant || isBuyingNow) return;
    setIsBuyingNow(true);

    const pPublicId = product.publicId || product.id;
    const multiplier =
      Number.isFinite(Number(selectedVariant.multiplier)) && selectedVariant.multiplier > 0
        ? selectedVariant.multiplier
        : 1;
    const quantityKg = Number((quantity * multiplier).toFixed(3));

    try {
      const success = await addToCart(pPublicId, quantityKg, product.name);
      if (success) {
        router.push("/cart");
      }
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Quick Add for Recommended Product
  const handleQuickAddRecommended = async (e: React.MouseEvent, rec: StoreProduct) => {
    e.preventDefault();
    e.stopPropagation();

    const recPublicId = rec.publicId || String(rec.id);
    const success = await addToCart(recPublicId, 1, rec.name);
    if (success) {
      triggerFlyAnimation(e.currentTarget as HTMLElement, "cart", rec.image);
    }
  };

  // Wishlist toggle
  const handleToggleWishlist = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!product) return;
    if (!isWishlisted) {
      triggerFlyAnimation(imageCardRef.current, "wishlist");
    }
    await toggleWishlist(product.publicId, product.name);
  };

  // Share action
  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: `${product.name} | RRV Green Basket`,
      text: `Buy farm fresh ${product.name} at ₹${product.price}/${product.unit} on RRV Green Basket!`,
      url: window.location.href,
    };

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // fallback
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Product link copied to clipboard! 📋");
    }
  };

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-pulse">
          <div className="h-6 bg-slate-100 rounded-lg w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-6 space-y-4">
              <div className="h-96 bg-slate-100 rounded-3xl" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-20 h-20 bg-slate-100 rounded-2xl" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-6 space-y-6">
              <div className="h-8 bg-slate-100 rounded-lg w-3/4" />
              <div className="h-5 bg-slate-100 rounded-lg w-1/2" />
              <div className="h-10 bg-slate-100 rounded-lg w-1/3" />
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
                ))}
              </div>
              <div className="h-14 bg-slate-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!product) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#00875a] flex items-center justify-center mb-4 border border-emerald-100 shadow-sm">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Product Not Found
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm">
          The requested fresh produce item could not be found or may have been unlisted from our seasonal catalog.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-2xl bg-[#00875a] hover:bg-[#00734d] px-6 py-3 font-extrabold text-xs sm:text-sm text-white shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
        >
          Return to Fresh Store
        </button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          TOP STORE HEADER NAVIGATION (Matches reference design & store branding)
         ========================================================================= */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex min-h-[64px] items-center justify-between gap-3 lg:gap-6">
            {/* Logo & Platform Name */}
            <Link href="/" className="flex shrink-0 items-center gap-2.5 cursor-pointer">
              {settings.logoUrl ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-green-100 p-0.5 shadow-sm overflow-hidden">
                  <img
                    src={settings.logoUrl}
                    alt={settings.storeName}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00875a] text-white shadow-sm shadow-emerald-700/20">
                  <Leaf size={22} />
                </div>
              )}
              <div className="text-left leading-tight">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  {settings.storeName || "RRV Green Basket"}
                </h1>
                <p className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                  {settings.brandTagline || "FARM FRESH DAILY"}
                </p>
              </div>
            </Link>

            {/* Delivering Location Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-[#00875a]" />
              <span>Delivering in <strong className="text-slate-900">Kurnool</strong> (within 5 km)</span>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (headerSearch.trim()) {
                  router.push(`/?search=${encodeURIComponent(headerSearch.trim())}`);
                }
              }}
              className="hidden md:flex flex-1 max-w-sm items-center rounded-full bg-slate-100 px-3.5 py-2 border border-transparent focus-within:border-[#00875a] focus-within:bg-white transition-all"
            >
              <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search for fruits, vegetables and more..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none font-medium"
              />
            </form>

            {/* Right Action Icons: Wishlist, Cart, Account */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Wishlist Link with Live Badge */}
              <Link
                href="/wishlist"
                data-nav-wishlist
                aria-label="Wishlist"
                className="relative flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#00875a] transition-colors"
              >
                <div className="relative">
                  <Heart className={`w-5 h-5 ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-2xs">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Wishlist</span>
              </Link>

              {/* Cart Link with Live Badge */}
              <Link
                href="/cart"
                data-nav-cart
                aria-label="Cart"
                className="relative flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#00875a] transition-colors"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-slate-800" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-black text-white shadow-2xs">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Cart</span>
              </Link>

              {/* Customer Account Auth */}
              <div className="border-l border-slate-200 pl-3">
                <CustomerNavAuth />
              </div>
            </div>
          </div>

          {/* Sub Navigation Bar matching Reference Image */}
          <div className="hidden sm:flex items-center justify-between border-t border-slate-100 py-2 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-1 hover:text-[#00875a]">
                <span>All Categories</span>
                <ChevronDown className="w-3 h-3" />
              </Link>
              <Link href="/?category=Fruits" className="hover:text-[#00875a]">
                Fruits
              </Link>
              <Link href="/?category=Vegetables" className="hover:text-[#00875a]">
                Vegetables
              </Link>
              <Link href="/?category=Leafy%20Greens" className="hover:text-[#00875a]">
                Leafy Greens
              </Link>
              <Link href="/?category=Groceries" className="hover:text-[#00875a]">
                Groceries
              </Link>
              <Link href="/?offers=true" className="hover:text-rose-600 flex items-center gap-1 text-rose-600 font-bold">
                <span>%</span>
                <span>Offers</span>
              </Link>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#00875a] font-bold text-[11px] hover:bg-emerald-100 transition-colors"
            >
              <Leaf className="w-3 h-3" />
              <span>Fresh Today</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-8">
        {/* =========================================================================
            1. BREADCRUMB NAVIGATION (Exact match to reference image)
           ========================================================================= */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500"
        >
          <Link href="/" className="hover:text-[#00875a] flex items-center gap-1">
            <HomeIcon className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Link
            href={`/?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#00875a]"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="font-bold text-slate-900 truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* =========================================================================
            2. PRODUCT HERO SECTION (2 Columns: Left Gallery, Right Details & Actions)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* -----------------------------------------------------------------------
              LEFT COLUMN: PRODUCT IMAGE GALLERY
             ----------------------------------------------------------------------- */}
          <div className="lg:col-span-6 space-y-4 select-none">
            {/* Primary Main Image Card */}
            <div
              ref={imageCardRef}
              className="relative w-full h-80 sm:h-96 md:h-[420px] rounded-3xl bg-[#f8faf7] border border-slate-200/80 flex items-center justify-center p-6 sm:p-8 overflow-hidden shadow-3xs group"
            >
              {/* Wishlist Heart Button in Top Right */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm border ${
                  isWishlisted
                    ? "bg-rose-50 border-rose-200 text-rose-500"
                    : "bg-white/95 border-slate-200/80 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50"
                }`}
              >
                <Heart
                  className={`w-5 h-5 transition-transform active:scale-125 ${
                    isWishlisted ? "fill-rose-500 text-rose-500" : ""
                  }`}
                />
              </button>

              {/* Main Product Image (Object Contain, Transparent Background) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={product.images[activeImageIndex]}
                src={product.images[activeImageIndex] || resolveImageUrl(undefined)}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Thumbnail Carousel underneath main image */}
            {product.images.length > 0 && (
              <div className="flex items-center justify-center gap-2 pt-1">
                {product.images.length > 4 && (
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-3xs"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                  {product.images.map((imgUrl, index) => {
                    const isActive = index === activeImageIndex;
                    return (
                      <button
                        type="button"
                        key={`${imgUrl}-${index}`}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl p-1.5 bg-[#f8faf7] overflow-hidden transition-all cursor-pointer flex-shrink-0 flex items-center justify-center border-2 ${
                          isActive
                            ? "border-[#00875a] ring-2 ring-[#00875a]/20 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                        }`}
                        aria-label={`View image ${index + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`${product.name} thumb ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    );
                  })}
                </div>

                {product.images.length > 4 && (
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-3xs"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* -----------------------------------------------------------------------
              RIGHT COLUMN: PRODUCT DETAILS, PRICING, VARIANTS, ACTIONS
             ----------------------------------------------------------------------- */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title & Short Description */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {product.shortDescription}
              </p>
            </div>

            {/* Rating & Bestseller Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="font-semibold text-slate-400">
                  ({product.reviewsCount} reviews)
                </span>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#00875a] border border-emerald-200 text-xs font-extrabold tracking-wide">
                Bestseller
              </span>
            </div>

            {/* Pricing Row */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                ₹{currentPrice}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                / {selectedVariant.label}
              </span>

              {currentOriginalPrice > currentPrice && (
                <span className="text-sm font-bold text-slate-400 line-through">
                  ₹{currentOriginalPrice}
                </span>
              )}

              {discountPercent > 0 && (
                <span className="px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Select Quantity (Weight Variants Grid) */}
            <div className="space-y-2.5">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Select Quantity
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {variants.map((variant) => {
                  const isSelected = selectedVariantKey === variant.key;
                  const vPrice =
                    variant.multiplier === 2.0
                      ? Math.round(product.price * 2.0 * 0.97)
                      : variant.multiplier === 5.0
                      ? Math.round(product.price * 5.0 * 0.94)
                      : Math.round(product.price * variant.multiplier);

                  const perKgRate =
                    variant.multiplier > 1.0
                      ? Math.round(vPrice / variant.multiplier)
                      : null;

                  return (
                    <button
                      type="button"
                      key={variant.key}
                      onClick={() => setSelectedVariantKey(variant.key)}
                      className={`relative p-3.5 rounded-2xl text-center transition-all cursor-pointer border select-none ${
                        isSelected
                          ? "bg-[#00875a] text-white border-[#00875a] shadow-md shadow-emerald-700/20"
                          : "bg-white text-slate-800 border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      {/* Checkmark indicator on active card */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white text-[#00875a] flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}

                      <div className="text-xs sm:text-sm font-black">{variant.label}</div>
                      <div className="text-sm sm:text-base font-extrabold mt-0.5">
                        ₹{vPrice}
                      </div>
                      {perKgRate && (
                        <div
                          className={`text-[10px] font-semibold mt-0.5 ${
                            isSelected ? "text-emerald-100" : "text-slate-400"
                          }`}
                        >
                          (₹{perKgRate}/KG)
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector + In Stock Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Quantity</span>
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 select-none">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-xl bg-white text-slate-700 hover:bg-slate-50 active:scale-95 disabled:opacity-40 flex items-center justify-center font-bold text-sm shadow-3xs transition-all cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                  <span className="w-10 text-center font-black text-slate-900 text-sm">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.maxStock, q + 1))}
                    disabled={quantity >= product.maxStock}
                    className="w-8 h-8 rounded-xl bg-[#00875a] text-white hover:bg-[#00734d] active:scale-95 disabled:opacity-40 flex items-center justify-center font-bold text-sm shadow-3xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* In Stock Badge */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#00875a] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                    In Stock
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Available for same-day delivery
                  </span>
                </div>
              </div>
            </div>

            {/* Purchase Action Buttons (Add to Cart & Buy Now) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddingToCart || !product.inStock}
                className="py-3.5 px-6 rounded-2xl bg-[#00875a] hover:bg-[#00734d] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isAddingToCart ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
                )}
                <span>{isAddingToCart ? "Adding..." : "Add to Cart"}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isBuyingNow || !product.inStock}
                className="py-3.5 px-6 rounded-2xl bg-white hover:bg-emerald-50/50 active:scale-[0.98] text-[#00875a] border-2 border-[#00875a] font-extrabold text-sm sm:text-base shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isBuyingNow ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#00875a]" />
                ) : (
                  <Zap className="w-5 h-5 fill-[#00875a]" />
                )}
                <span>{isBuyingNow ? "Processing..." : "Buy Now"}</span>
              </button>
            </div>

            {/* Feature Highlights Row (4 columns matching reference) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 rounded-3xl bg-slate-50/80 border border-slate-200/80 text-center">
              {/* Feature 1 */}
              <div className="space-y-1 p-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#00875a] flex items-center justify-center mx-auto">
                  <Leaf className="w-4 h-4" />
                </div>
                <div className="text-xs font-black text-slate-900">Farm Fresh</div>
                <p className="text-[10px] text-slate-400 font-medium">Sourced Daily</p>
              </div>

              {/* Feature 2 */}
              <div className="space-y-1 p-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#00875a] flex items-center justify-center mx-auto">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div className="text-xs font-black text-slate-900">Chemical Free</div>
                <p className="text-[10px] text-slate-400 font-medium">Naturally Grown</p>
              </div>

              {/* Feature 3 */}
              <div className="space-y-1 p-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#00875a] flex items-center justify-center mx-auto">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-xs font-black text-slate-900">Local Farmers</div>
                <p className="text-[10px] text-slate-400 font-medium">Direct from Farms</p>
              </div>

              {/* Feature 4 */}
              <div className="space-y-1 p-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#00875a] flex items-center justify-center mx-auto">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-xs font-black text-slate-900">Fast Delivery</div>
                <p className="text-[10px] text-slate-400 font-medium">Within 5 km</p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. PILL NAVIGATION TABS (Description, Reviews, Similar Products)
           ========================================================================= */}
        <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === "description"
                ? "bg-[#00875a] text-white shadow-md shadow-emerald-700/20"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
            }`}
          >
            Description
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === "reviews"
                ? "bg-[#00875a] text-white shadow-md shadow-emerald-700/20"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
            }`}
          >
            Customer Reviews ({product.reviewsCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("similar")}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === "similar"
                ? "bg-[#00875a] text-white shadow-md shadow-emerald-700/20"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
            }`}
          >
            Similar Products
          </button>
        </div>

        {/* =========================================================================
            4. PRODUCT DESCRIPTION & KEY HIGHLIGHTS CARD
           ========================================================================= */}
        {(activeTab === "description" || activeTab === "reviews" || activeTab === "similar") && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-3xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Full Description */}
            <div className="lg:col-span-8 space-y-3">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Product Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* Right: Key Highlights */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Key Highlights
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00875a] stroke-[3] flex-shrink-0" />
                  <span>Naturally ripened</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00875a] stroke-[3] flex-shrink-0" />
                  <span>Rich in essential vitamins</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00875a] stroke-[3] flex-shrink-0" />
                  <span>Fresh and juicy daily harvest</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00875a] stroke-[3] flex-shrink-0" />
                  <span>Sourced from trusted local farms</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* =========================================================================
            5. CUSTOMER REVIEWS SECTION (Connected to Review Service APIs)
           ========================================================================= */}
        <ProductReviewsSection
          productPublicId={product.publicId}
          productName={product.name}
        />

        {/* =========================================================================
            6. RECOMMENDED FOR YOU SECTION (5 Cards matching reference image)
           ========================================================================= */}
        <section className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Recommended for You
            </h3>
            <Link
              href="/"
              className="text-xs font-bold text-[#00875a] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View More</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-3 shadow-3xs transition-all hover:shadow-md"
              >
                {/* Product Image Link */}
                <Link
                  href={`/products/${rec.publicId || rec.id}`}
                  className="w-full h-28 sm:h-32 flex items-center justify-center p-2 rounded-xl bg-slate-50/60 mb-2 cursor-pointer overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImageUrl(rec.image)}
                    alt={rec.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </Link>

                {/* Details */}
                <div className="space-y-1">
                  <Link
                    href={`/products/${rec.publicId || rec.id}`}
                    className="text-xs font-bold text-slate-800 hover:text-[#00875a] line-clamp-1 block transition-colors cursor-pointer"
                    title={rec.name}
                  >
                    {rec.name}
                  </Link>

                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-slate-900">
                      ₹{rec.price}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      / {rec.unit}
                    </span>
                  </div>

                  {/* Rating + Quick Add Button Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>4.5</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        (140)
                      </span>
                    </div>

                    {/* Circular Green Plus Button matching reference */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickAddRecommended(e, rec)}
                      aria-label={`Add ${rec.name} to cart`}
                      className="w-7 h-7 rounded-full bg-[#00875a] hover:bg-[#00734d] text-white flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Fixed Mobile Bottom Navigation */}
      <nav className="fixed inset-x-3 bottom-2 z-[100] rounded-[26px] border border-white/70 bg-white/85 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_8px_32px_rgba(22,55,35,0.18)] backdrop-blur-2xl md:hidden">
        <div className="mx-auto flex h-[60px] max-w-md items-center justify-around">
          <Link
            href="/"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#00875a]"
          >
            <HomeIcon size={20} />
            <span className="text-[10px] font-semibold">Home</span>
          </Link>

          <Link
            href="/wishlist"
            data-nav-wishlist-mobile
            className="relative flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#00875a]"
          >
            <span className="relative">
              <Heart
                size={20}
                className={wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}
              />
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold">Wishlist</span>
          </Link>

          <Link
            href="/cart"
            data-nav-cart-mobile
            className="relative flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#00875a]"
          >
            <span className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-orange-500 px-1 text-[8px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold">Cart</span>
          </Link>

          <Link
            href="/customer/profile?tab=profile"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#00875a]"
          >
            <Users size={20} />
            <span className="text-[10px] font-semibold">Account</span>
          </Link>
        </div>
      </nav>

      {/* Global Storefront Footer */}
      <HomeFooter />
    </div>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 rounded-full text-[#00875a] animate-spin" />
        </div>
      }
    >
      <ProductDetailsContent />
    </Suspense>
  );
}
