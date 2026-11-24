"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import CustomerNavAuth from "@/components/customer/CustomerNavAuth";
import HomeFooter from "@/components/HomeFooter";
import { ImageSlider, MarqueeBar, CategoryGrid } from "@/components/home";
import { LocationNavbar } from "@/components/location";

import {
  Search,
  MapPin,
  LocateFixed,
  Loader2,
  CheckCircle2,
  Heart,
  ShoppingCart,
  Leaf,
  ChevronDown,
  Home as HomeIcon,
  LayoutGrid,
  UserRound,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Plus,
  Minus,
  X,
  Tag,
} from "lucide-react";
import {
  productService,
  getCategoryId,
  mapBackendToStoreProduct,
} from "@/services/product.service";
import { BackendCategory, StoreProduct, ProductWeightVariant } from "@/types";
import { ProductCard } from "@/components/customer";
import { resolveImageUrl } from "@/utils/image-utils";
import { useWishlist } from "@/context/WishlistContext";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useCart } from "@/context/CartContext";

// Category image fallbacks for storefront visual badges
const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  Fruits: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80",
  Vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
  "Leafy Vegetables": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80",
  "Leafy Greens": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80",
  "Root Vegetables": "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=400&q=80",
  Seasonings: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
  Mushrooms: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=400&q=80",
  "Other Items": "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=400&q=80",
  "Exotic & Seasonal": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80",
  Organics: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
  "Dairy Products": "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
  "Snacks & Foods": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80",
  Beverages: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80",
  "Household Items": "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=400&q=80",
};

const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  Fruits: "🍊",
  Vegetables: "🥦",
  "Leafy Vegetables": "🥬",
  "Leafy Greens": "🥬",
  "Root Vegetables": "🥔",
  Seasonings: "🌿",
  Mushrooms: "🍄",
  "Other Items": "📦",
  "Exotic & Seasonal": "🍍",
  Organics: "🌱",
  "Dairy Products": "🥛",
  "Snacks & Foods": "🥜",
  Beverages: "🧃",
  "Household Items": "🧺",
};

/**
 * Category image URLs may be absolute URLs (S3/Cloudinary/etc.) or relative
 * paths served by the backend. Keep absolute URLs unchanged; resolve only
 * relative paths through the application's existing image URL utility.
 */
const getCategoryImageUrl = (imageUrl: unknown, categoryName: string): string => {
  const fallback =
    DEFAULT_CATEGORY_IMAGES[categoryName] || DEFAULT_CATEGORY_IMAGES.Vegetables;

  if (typeof imageUrl !== "string" || !imageUrl.trim()) {
    return fallback;
  }

  const value = imageUrl.trim();

  // Do not pass full URLs through resolveImageUrl: some URL helpers prepend
  // the API base URL and can corrupt an already valid external URL.
  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  try {
    const resolved = resolveImageUrl(value, 400);
    return typeof resolved === "string" && resolved.trim() ? resolved : fallback;
  } catch (error) {
    console.warn("[Storefront] Could not resolve category image URL:", value, error);
    return fallback;
  }
};

const getCategoryVisuals = (cat: BackendCategory) => {
  const name = cat.name || "";
  const img = getCategoryImageUrl(cat.imageUrl, name);
  const icon = cat.icon || DEFAULT_CATEGORY_ICONS[name] || "▦";
  return { img, icon };
};

const getCategoryFallbackImage = (categoryName: string): string =>
  DEFAULT_CATEGORY_IMAGES[categoryName] || DEFAULT_CATEGORY_IMAGES.Vegetables;

export default function Home() {
  // Public Store Branding Settings
  const { settings } = useStoreSettings();

  // Category state (driven dynamically from backend API)
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string>("All Products");

  // Product state (fetched dynamically from backend API)
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [allProducts, setAllProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Wishlist state from centralized context
  const { wishlistCount, isWishlisted, toggleWishlist, checkBulkWishlistStatus } = useWishlist();

  // Cart state from centralized CartContext (connected to Spring Boot Cart Service)
  const { itemCount: cartCount, totalAmount: cartTotal, addToCart } = useCart();

  // Search state
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Favorites (Wishlist) state
  const [showFavorites, setShowFavorites] = useState<boolean>(false);

  // UI state
  const [notice, setNotice] = useState<string>("");
  const [scrolling, setScrolling] = useState<boolean>(false);

  // Fetch categories from backend API
  const loadCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
    try {
      const response = await productService.getCategories();

      // Support common public API response shapes:
      // [ ... ], { content: [ ... ] }, { data: [ ... ] }, or { categories: [ ... ] }.
      const responseRecord =
        response && typeof response === "object"
          ? (response as unknown as Record<string, unknown>)
          : null;

      const categoryList: unknown[] = Array.isArray(response)
        ? response
        : Array.isArray(responseRecord?.content)
          ? responseRecord.content
          : Array.isArray(responseRecord?.data)
            ? responseRecord.data
            : Array.isArray(responseRecord?.categories)
              ? responseRecord.categories
              : [];

      const normalizedCategories = categoryList
        .filter(
          (item): item is BackendCategory =>
            Boolean(item) &&
            typeof item === "object" &&
            typeof (item as BackendCategory).name === "string"
        )
        .map((category) => ({
          ...category,
          // Pass a usable imageUrl to ImageSlider, CategoryGrid, chips and sidebar.
          imageUrl: getCategoryImageUrl(category.imageUrl, category.name),
        }));

      console.info(
        `[Storefront] Loaded ${normalizedCategories.length} public categories`,
        normalizedCategories.map((category) => ({
          name: category.name,
          imageUrl: category.imageUrl,
        }))
      );

      setCategories(normalizedCategories);
    } catch (err: unknown) {
      console.error("[Storefront] Failed to load categories from backend:", err);
      setCategories([]);
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  // Fetch products from backend API sending categoryId and search
  const loadProducts = useCallback(
    async (catId: string | null, searchStr: string) => {
      setIsLoading(true);
      setApiError(null);

      try {
        const params: {
          categoryId?: string;
          search?: string;
          page?: number;
          size?: number;
        } = {
          page: 0,
          size: 50,
        };

        // If specific category selected, send categoryId
        if (catId && catId !== "All") {
          params.categoryId = catId;
        }

        // If search entered, send search query parameter
        if (searchStr.trim()) {
          params.search = searchStr.trim();
        }

        const res = await productService.getStorefrontProducts(params);
        const rawItems = res?.content || (Array.isArray(res) ? res : []);
        const mapped = rawItems.map(mapBackendToStoreProduct);
        setProducts(mapped);
        if (mapped.length > 0) {
          setAllProducts((prev) => {
            const map = new Map<string, StoreProduct>();
            prev.forEach((p) => map.set(String(p.id), p));
            mapped.forEach((p) => map.set(String(p.id), p));
            return Array.from(map.values());
          });
        }
      } catch (err: unknown) {
        console.error("[Storefront] Failed to load products:", err);
        setApiError(
          err instanceof Error
            ? err.message
            : "Unable to load products from server. Please check your backend connection."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounce search input by 300ms to prevent spamming backend requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Initial categories fetch on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Re-fetch products whenever activeCategoryId or debouncedSearch changes
  useEffect(() => {
    loadProducts(activeCategoryId, debouncedSearch);
  }, [activeCategoryId, debouncedSearch, loadProducts]);

  // Bulk check wishlist status for displayed products
  useEffect(() => {
    if (products.length > 0) {
      const ids = products.map((p) => p.publicId || String(p.id)).filter(Boolean);
      checkBulkWishlistStatus(ids);
    }
  }, [products, checkBulkWishlistStatus]);

  // Scroll listener for mobile strip hiding/revealing
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      setScrolling(true);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setScrolling(false), 220);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  // Filter products by search, category, and favorites
  const displayedProducts = useMemo(() => {
    const source = products.length > 0 ? products : allProducts;
    let list = [...source];
    
    // 0. Best-Sellers filter — on the home view (no category selected, no search, no favorites),
    //    show only featured OR discounted products. Falls back to all if none match.
    if (!activeCategoryId && !search && !showFavorites) {
      const best = list.filter(
        (p) =>
          p.badge === "Featured" ||
          (typeof p.originalPrice === "number" &&
            typeof p.price === "number" &&
            p.originalPrice > p.price)
      );
      if (best.length > 0) list = best;
    }

    // 1. Favorites Filter
    if (showFavorites) {
      list = list.filter((p) => isWishlisted(p.publicId || String(p.id)));
    }

    // 2. Category Filter (by categoryId or case-insensitive category name)
    if (activeCategoryId && activeCategoryId !== "All") {
      const activeNameLower = (activeCategoryName || "").toLowerCase().trim();
      list = list.filter((p) => {
        const matchesId = p.categoryId && String(p.categoryId) === String(activeCategoryId);
        const pCatLower = (p.category || "").toLowerCase().trim();
        const matchesName =
          activeNameLower &&
          activeNameLower !== "all products" &&
          (pCatLower === activeNameLower ||
            pCatLower.includes(activeNameLower) ||
            activeNameLower.includes(pCatLower));
        return Boolean(matchesId || matchesName);
      });
    }

    // 3. Search Filter (matches search substring in product name or category)
    const query = (search || debouncedSearch).trim().toLowerCase();
    if (query) {
      list = list.filter((p) => {
        const nameMatch = p.name && p.name.toLowerCase().includes(query);
        const catMatch = p.category && p.category.toLowerCase().includes(query);
        return Boolean(nameMatch || catMatch);
      });
    }

    return list;
  }, [showFavorites, isWishlisted, products, allProducts, activeCategoryId, activeCategoryName, search, debouncedSearch]);

  // Handle category selection using actual categoryId
  function selectCategory(cat: BackendCategory | null) {
    if (cat === null) {
      setActiveCategoryId(null);
      setActiveCategoryName("All Products");
    } else {
      const catId = getCategoryId(cat);
      setActiveCategoryId(catId);
      setActiveCategoryName(cat.name);
    }
    setSearch("");
    setShowFavorites(false);
    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // Cart modification handler connecting to Spring Boot Cart Service
  async function handleAddToCart(p: StoreProduct, variant: ProductWeightVariant, qty: number = 1) {
    const pPublicId = p.publicId || String(p.id);
    const multiplier =
      Number.isFinite(Number(variant.multiplier)) && variant.multiplier > 0
        ? variant.multiplier
        : 1;
    const quantityKg = Number((qty * multiplier).toFixed(3));
    const sellingPrice = Math.round((p.price || 0) * multiplier);
    await addToCart(pPublicId, quantityKg, p.name, {
      productImageUrl: p.image,
      pricePerKg: sellingPrice,
      unitOfMeasure: variant.unit || p.unit || "KG",
    });
  }

  // Wishlist toggle handler
  function toggleFavorite(p: StoreProduct) {
    const publicId = p.publicId || String(p.id);
    toggleWishlist(publicId, p.name);
  }

  return (
    <main className="min-h-screen bg-[#f6f9f3] pb-24 text-[#20392a] md:pb-0">
      
      {/* =========================================================================
          1. HEADER NAVIGATION
         ========================================================================= */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-5 lg:px-6">
          <div className="flex min-h-[68px] items-center gap-3 lg:gap-5">

            {/* Logo */}
            <button
              onClick={() => {
                selectCategory(null);
                setSearch("");
                setShowFavorites(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex shrink-0 items-center gap-2 cursor-pointer"
            >
              {settings.logoUrl ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-green-100 p-0.5 shadow-sm overflow-hidden">
                  <img
                    src={settings.logoUrl}
                    alt={settings.storeName}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-md shadow-emerald-700/20">
                  <Leaf size={23} />
                </div>
              )}

              <div className="text-left leading-tight">
                <h1 className="text-lg font-extrabold tracking-tight text-gray-900">
                  {settings.storeName || "RRV Green Basket"}
                </h1>
                <p className="text-[9px] font-medium tracking-wide text-gray-500 uppercase">
                  {settings.brandTagline || "FRESHNESS DELIVERED DAILY"}
                </p>
              </div>
            </button>

            {/* Mobile Delivery Location Pill */}
            <div className="relative min-w-0 flex-1 md:hidden">
              <LocationNavbar variant="mobile" />
            </div>

            {/* Desktop Search + Category Select (Synced with backend categoryId) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                document.getElementById("products")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="hidden h-[42px] min-w-0 w-full flex-1 overflow-hidden rounded-full border border-gray-200 bg-white focus-within:border-green-500 md:flex transition-all shadow-3xs"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
                <Search size={17} className="shrink-0 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowFavorites(false);
                  }}
                  placeholder="Search fresh fruits, vegetables, mushrooms..."
                  className="w-full min-w-0 bg-transparent text-xs font-medium outline-hidden placeholder:text-gray-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Dropdown in Search Bar */}
              <div className="hidden items-center border-l border-gray-200 px-2 sm:flex">
                <select
                  value={activeCategoryId || "ALL"}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "ALL") {
                      selectCategory(null);
                    } else {
                      const matched = categories.find((c) => getCategoryId(c) === val);
                      if (matched) selectCategory(matched);
                    }
                  }}
                  className="max-w-[135px] cursor-pointer appearance-none bg-transparent pr-4 text-xs font-bold text-slate-700 outline-hidden"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((cat) => {
                    const catId = getCategoryId(cat);
                    return (
                      <option key={catId} value={catId}>
                        {cat.name}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={13} className="-ml-3 text-gray-400 pointer-events-none" />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center bg-green-600 px-4 text-white transition hover:bg-green-700 cursor-pointer"
                aria-label="Submit search"
              >
                <Search size={17} />
              </button>
            </form>

            {/* Desktop Delivery Location Selector */}
            <div className="hidden min-w-[205px] max-w-[245px] shrink-0 lg:block">
              <LocationNavbar variant="desktop" />
            </div>

            {/* Customer Account / Auth Navigation */}
            <div className="hidden shrink-0 border-l border-gray-100 pl-3 lg:block">
              <CustomerNavAuth />
            </div>

            {/* Wishlist Link with Live Backend Count */}
            <Link
              href="/wishlist"
              data-nav-wishlist
              className="hidden shrink-0 items-center gap-1.5 border-l border-gray-100 pl-3 text-gray-700 transition hover:text-green-700 md:flex cursor-pointer"
              aria-label="View Wishlist"
            >
              <div className="relative">
                <Heart size={20} className={wishlistCount > 0 ? "fill-rose-50 text-rose-500" : ""} />
                {wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-2xs">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden text-xs font-medium xl:block">Wishlist</span>
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              data-nav-cart
              className="hidden shrink-0 items-center gap-2 border-l border-gray-100 pl-3 text-gray-800 transition hover:text-green-700 md:flex"
            >
              <div className="relative">
                <ShoppingCart size={21} />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="leading-tight">
                <p className="text-[11px] font-semibold">Cart</p>
                <p className="text-[10px] font-bold text-green-700">₹{cartTotal}</p>
              </div>
            </Link>

          </div>

          {/* Mobile Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mx-1 mb-2.5 flex h-[38px] items-center overflow-hidden rounded-full border border-gray-200 bg-white md:hidden shadow-3xs"
          >
            <Search size={16} className="ml-3 shrink-0 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowFavorites(false);
              }}
              placeholder="Search fruits, vegetables, groceries..."
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent px-2 text-xs font-medium outline-hidden placeholder:text-gray-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-gray-400 p-1"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              className="m-1 rounded-full bg-green-600 px-3.5 py-1 text-xs font-bold text-white cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </header>

      {/* =========================================================================
            ALL CATEGORIES VIEW: SLIDER + EXISTING PRODUCT BROWSE LAYOUT
        ========================================================================= */}
        <div className="rrv-mobile-slider">
          <ImageSlider categories={categories} onSelect={selectCategory} />
        </div>

      {/* =========================================================================
          2. MOBILE HORIZONTALLY SCROLLABLE CATEGORY CHIPS
         ========================================================================= */}
      <section
        className={`hidden border-b border-green-100/70 bg-white/95 px-2.5 py-2 backdrop-blur-xl ${
          scrolling ? "pointer-events-none -translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="flex gap-2.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* "All Products" chip */}
          <button
            type="button"
            onClick={() => selectCategory(null)}
            className={`flex w-[68px] shrink-0 flex-col items-center gap-1 rounded-2xl border px-1.5 py-1.5 text-[10px] font-bold transition-all cursor-pointer active:scale-95 ${
              activeCategoryId === null && !showFavorites
                ? "border-green-700 bg-green-50 text-green-800 shadow-xs ring-2 ring-green-600/20"
                : "border-gray-200 bg-white text-gray-600 hover:bg-green-50/50"
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-sm">
              ▦
            </div>
            <span className="line-clamp-1 w-full text-center">All</span>
          </button>

          {/* Dynamic Backend Categories */}
          {categories.map((c) => {
            const catId = getCategoryId(c);
            const { img } = getCategoryVisuals(c);
            const isActive = activeCategoryId === catId && !showFavorites;

            return (
              <button
                key={catId}
                type="button"
                onClick={() => selectCategory(c)}
                className={`flex w-[68px] shrink-0 flex-col items-center gap-1 rounded-2xl border px-1.5 py-1.5 text-[10px] font-bold transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? "border-green-700 bg-green-50 text-green-800 shadow-xs ring-2 ring-green-600/20"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-green-50/50"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={c.name}
                  loading="lazy"
                  onError={(event) => {
                    const fallback = getCategoryFallbackImage(c.name);
                    if (event.currentTarget.src !== fallback) {
                      event.currentTarget.src = fallback;
                    }
                  }}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-white shadow-2xs"
                />
                <span className="line-clamp-1 w-full text-center">{c.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          3. MAIN CONTENT: MOBILE ZEPTO CATEGORY GRID + DESKTOP SIDEBAR & PRODUCTS
         ========================================================================= */}
      
      {/* Mobile Zepto-Style 4-Column Category Grid */}
      <div className="block sm:hidden px-1 pt-2">
        <CategoryGrid
          categories={categories}
          onSelect={selectCategory}
          selectedCategoryId={activeCategoryId}
          title="All Categories"
          showSeeAll={false}
        />
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-1.5 px-1.5 py-2 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4 sm:px-5 sm:py-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-5">
        {/* Sidebar: Shop Categories — visible on tablet/desktop, replaced by 4-col grid on mobile */}
        <aside
          id="categories"
          className="sticky top-2 hidden max-h-[calc(100vh-110px)] overflow-y-auto bg-white p-1 sm:top-4 sm:block sm:p-2.5 lg:top-[88px]"
        >
          {/* Header — hidden on mobile */}
          <h2 className="mb-2 hidden px-1 text-sm font-extrabold tracking-tight text-slate-900 sm:mb-3 sm:block">
            Shop Categories
          </h2>

          <div className="flex flex-col gap-2 sm:gap-3">
            {/* All Products option */}
            <button
              onClick={() => selectCategory(null)}
              className={`flex w-full flex-col items-center gap-2 rounded-xl pb-2 pt-0.5 px-0.5 transition-all cursor-pointer sm:pb-2.5 sm:pt-1 sm:px-1 lg:flex-row lg:items-center lg:gap-2.5 lg:px-2 lg:py-2 ${
                activeCategoryId === null && !showFavorites
                  ? "bg-emerald-50 ring-2 ring-emerald-600"
                  : "hover:bg-gray-50"
              }`}
            >
              {/* Image tile */}
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base sm:h-12 sm:w-12 sm:text-lg lg:h-10 lg:w-10 lg:text-base ${
                  activeCategoryId === null && !showFavorites
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-emerald-700"
                }`}
              >
                ▦
              </span>
              {/* Text — below image on mobile, beside image on desktop */}
              <span
                className={`line-clamp-2 text-center text-[11px] font-bold leading-tight sm:text-xs lg:text-left lg:text-sm lg:line-clamp-1 ${
                  activeCategoryId === null && !showFavorites
                    ? "text-emerald-700"
                    : "text-gray-700"
                }`}
              >
                All Products
              </span>
            </button>

            {/* Dynamic Backend Categories */}
            {categories.map((c) => {
              const catId = getCategoryId(c);
              const { img } = getCategoryVisuals(c);
              const isActive = activeCategoryId === catId && !showFavorites;

              return (
                <button
                  key={catId}
                  onClick={() => selectCategory(c)}
                  className={`flex w-full flex-col items-center gap-2 rounded-xl pb-2 pt-0.5 px-0.5 transition-all cursor-pointer sm:pb-2.5 sm:pt-1 sm:px-1 lg:flex-row lg:items-center lg:gap-2.5 lg:px-2 lg:py-2 ${
                    isActive
                      ? "bg-emerald-50 ring-2 ring-emerald-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Square image tile with light gray background */}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 p-0.5 sm:h-12 sm:w-12 lg:h-10 lg:w-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={c.name}
                      loading="lazy"
                      onError={(event) => {
                        const fallback = getCategoryFallbackImage(c.name);
                        if (event.currentTarget.src !== fallback) {
                          event.currentTarget.src = fallback;
                        }
                      }}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </span>
                  {/* Text — below on mobile, beside on desktop */}
                  <span
                    className={`line-clamp-2 text-center text-[11px] font-bold leading-tight sm:text-xs lg:text-left lg:text-sm lg:line-clamp-1 ${
                      isActive ? "text-emerald-700" : "text-gray-700"
                    }`}
                  >
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
        {/* Product Listing Main Section */}
        <section className="min-w-0">

          {/* Products Header */}
          <section id="products" className="scroll-mt-28">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight sm:text-2xl">
                  {showFavorites
                    ? "Wishlist Favorites"
                    : search
                    ? `Results for "${search}"`
                    : activeCategoryName}
                </h2>

                <div className="mt-0.5 flex items-center gap-2 text-[10px] font-semibold text-gray-500 sm:mt-1 sm:text-xs">
                  <span>{displayedProducts.length} products available</span>
                  {activeCategoryId && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Tag size={11} />
                        <span>Filter: {activeCategoryName}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {(activeCategoryId !== null || search || showFavorites) && (
                <button
                  onClick={() => {
                    selectCategory(null);
                    setSearch("");
                    setShowFavorites(false);
                  }}
                  className="text-xs sm:text-sm font-bold text-green-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Reset Filters (Show All) &rarr;</span>
                </button>
              )}
            </div>

            {/* Error State with Retry Button */}
            {apiError && (
              <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50/70 p-5 text-rose-800 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold">Unable to fetch products</h3>
                    <p className="text-xs text-rose-600 mt-0.5">{apiError}</p>
                  </div>
                </div>
                <button
                  onClick={() => loadProducts(activeCategoryId, debouncedSearch)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-rose-700 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Loading Skeleton Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4 2xl:grid-cols-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between h-full bg-white rounded-xl border border-emerald-100/80 p-2.5 sm:p-3 shadow-2xs animate-pulse"
                  >
                    <div className="w-full aspect-square rounded-lg bg-slate-100 mb-2" />
                    <div className="space-y-2">
                      <div className="h-3 w-16 bg-slate-100 rounded-md" />
                      <div className="h-4 w-3/4 bg-slate-100 rounded-md" />
                      <div className="h-7 w-full bg-slate-100 rounded-md" />
                      <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <div className="h-7 w-16 bg-slate-100 rounded-lg" />
                      <div className="h-7 flex-1 bg-slate-100 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              /* Empty State */
              <div className="rounded-3xl border border-dashed border-green-200 bg-white px-5 py-14 text-center shadow-xs">
                <div className="text-4xl mb-2">🔎</div>
                <h3 className="text-base font-extrabold text-slate-900">No products found</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  {search
                    ? `No items matching "${search}" in ${activeCategoryName}.`
                    : `No produce items currently listed under ${activeCategoryName}.`}
                </p>
                <button
                  onClick={() => {
                    selectCategory(null);
                    setSearch("");
                    setShowFavorites(false);
                  }}
                  className="mt-5 rounded-2xl bg-[#00875a] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-[#00734d] transition-all cursor-pointer"
                >
                  Show All Products
                </button>
              </div>
            ) : (
              /* Product Grid (Responsive: 2-col mobile, 3-col small, 4-col lg, 6-col 2xl) */
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4 2xl:grid-cols-6">
                {displayedProducts.map((p) => {
                  const isFav = isWishlisted(p.publicId || String(p.id));

                  return (
                    <ProductCard
                      key={p.id}
                      product={p}
                      isWishlisted={isFav}
                      onToggleWishlist={toggleFavorite}
                      onAddToCart={handleAddToCart}
                    />
                  );
                })}
              </div>
            )}
          </section>

         <HomeFooter />
        </section>
      </div>

      {/* =========================================================================
          4. FIXED MOBILE BOTTOM NAVIGATION
         ========================================================================= */}
      <nav
        className={`fixed inset-x-3 bottom-2 z-[100] rounded-[26px] border border-white/70 bg-white/75 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_8px_32px_rgba(22,55,35,0.18)] backdrop-blur-2xl transition-all duration-300 ease-out md:hidden ${
          scrolling ? "pointer-events-none translate-y-[130%] opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="mx-auto flex h-[64px] max-w-md items-center justify-around">
          <button
            type="button"
            onClick={() => {
              selectCategory(null);
              setSearch("");
              setShowFavorites(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-1 flex-col items-center justify-center gap-1 cursor-pointer ${
              !showFavorites && activeCategoryId === null && !search
                ? "text-green-700 font-bold"
                : "text-gray-400 hover:text-green-700"
            }`}
          >
            <HomeIcon size={21} strokeWidth={2} />
            <span className="text-[10px] font-semibold">Home</span>
          </button>

          <Link
            href="/wishlist"
            data-nav-wishlist-mobile
            className="relative flex flex-1 flex-col items-center justify-center gap-1 text-gray-400 hover:text-green-700"
            aria-label="Wishlist"
          >
            <span className="relative">
              <Heart
                size={21}
                strokeWidth={1.8}
                className={wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}
              />
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold">Wishlist</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setShowFavorites(false);
              setSearch("");
              document.getElementById("categories")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-gray-400 transition hover:text-green-700 cursor-pointer"
          >
            <LayoutGrid size={21} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold">Categories</span>
          </button>

          <Link
            href="/cart"
            data-nav-cart-mobile
            className="relative flex flex-1 flex-col items-center justify-center gap-1 text-gray-400 transition hover:text-green-700"
          >
            <span className="relative">
              <ShoppingCart size={21} strokeWidth={1.8} />
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
            aria-label="My Account"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-gray-400 transition hover:text-green-700"
          >
            <UserRound size={21} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold">Account</span>
          </Link>
        </div>
      </nav>

      {/* Toast Notification */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-2xl bg-slate-900/90 backdrop-blur-md px-5 py-3 text-center text-xs font-bold text-white shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3"
        >
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            className="ml-3 text-slate-400 hover:text-white"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Desktop Floating Cart Pill */}
      {cartCount > 0 && (
        <Link
          href="/cart"
          className="fixed bottom-6 right-6 z-30 hidden rounded-2xl bg-[#00875a] hover:bg-[#00734d] px-6 py-4 font-black text-white shadow-2xl shadow-emerald-700/30 md:flex items-center gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ShoppingCart size={20} />
          <span>{cartCount} items · ₹{cartTotal}</span>
        </Link>
      )}
    </main>
    
  );
  
}
