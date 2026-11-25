"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import HomeFooter from "@/components/HomeFooter";
import {
  CategoriesTopBar,
  CategoryBanner,
  CategoryProductGrid,
  CategoryRail,
  CustomerBottomNav,
} from "@/components/categories/storefront";
import {
  getCategoryId,
  mapBackendToStoreProduct,
  productService,
} from "@/services/product.service";
import { BackendCategory, StoreProduct } from "@/types";
import { getCategorySlug } from "@/utils/category-visuals";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

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
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  // undefined = the shopper hasn't picked anything yet (fall back to ?category=)
  const [pickedId, setPickedId] = useState<string | null | undefined>(undefined);

  // ---- Search -------------------------------------------------------------
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ---- Products -----------------------------------------------------------
  const [list, setList] = useState<ProductListState>(EMPTY_LIST);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string, ProductListState>>(new Map());
  const requestIdRef = useRef(0);
  const paneRef = useRef<HTMLElement>(null);

  // Load categories once. Categories without a publicId cannot be queried,
  // so they are dropped here instead of crashing the rail.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await productService.getCategories();
        if (cancelled) return;
        const usable = (Array.isArray(data) ? data : []).filter(
          (c) => c && c.publicId && c.isActive !== false
        );
        usable.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setCategories(usable);
      } catch (err) {
        console.error("[Categories] Failed to load categories:", err);
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Category named in the URL (?category=<slug|publicId>), once categories are known
  const urlCategoryId = useMemo(() => {
    if (!urlCategory) return null;
    const match = categories.find(
      (c) => getCategorySlug(c) === urlCategory || c.publicId === urlCategory
    );
    return match ? getCategoryId(match) : null;
  }, [categories, urlCategory]);

  const selectedId = pickedId !== undefined ? pickedId : urlCategoryId;
  const ready = !categoriesLoading; // wait for categories so a deep link loads only once

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const activeCategory = useMemo(
    () => categories.find((c) => getCategoryId(c) === selectedId) ?? null,
    [categories, selectedId]
  );

  // ---- Fetching -----------------------------------------------------------
  const fetchPage = useCallback(
    async (categoryId: string | null, query: string, page: number) => {
      const res = await productService.getStorefrontProducts({
        page,
        size: PAGE_SIZE,
        ...(categoryId ? { categoryId } : {}),
        ...(query ? { search: query } : {}),
      });

      // The API normally returns a Spring page; tolerate a bare array too.
      const rawList = ((res as unknown as { content?: unknown[] })?.content ??
        (Array.isArray(res) ? res : [])) as Record<string, unknown>[];

      let items = rawList.map((raw) => ({
        product: mapBackendToStoreProduct(raw as unknown as Parameters<typeof mapBackendToStoreProduct>[0]),
        discount: realDiscountPercent(raw),
      }));

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

      const last = (res as unknown as { last?: boolean })?.last;
      const hasMore = typeof last === "boolean" ? !last : rawList.length === PAGE_SIZE;

      return {
        products: items.map((i) => i.product),
        hasMore,
        maxDiscount: items.reduce((best, i) => Math.max(best, i.discount), 0),
      };
    },
    [categories]
  );

  const loadFirstPage = useCallback(
    async (categoryId: string | null, query: string) => {
      const cacheKey = `${categoryId ?? "all"}|${query}`;
      const requestId = ++requestIdRef.current;

      // Show cached results instantly, then refresh quietly in the background
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        setList(cached);
        setIsLoading(false);
      } else {
        // Don't leave the previous category's products on screen while loading
        setList(EMPTY_LIST);
        setIsLoading(true);
      }
      setError(null);

      try {
        const { products, hasMore, maxDiscount } = await fetchPage(categoryId, query, 0);
        if (requestId !== requestIdRef.current) return; // a newer request won
        const next = { products, page: 0, hasMore, maxDiscount };
        cacheRef.current.set(cacheKey, next);
        setList(next);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("[Categories] Failed to load products:", err);
        if (!cached) {
          setList(EMPTY_LIST);
          setError(
            err instanceof Error
              ? err.message
              : "Please check your connection and try again."
          );
        }
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    },
    [fetchPage]
  );

  useEffect(() => {
    if (!ready) return;
    loadFirstPage(selectedId, debouncedSearch);
  }, [ready, selectedId, debouncedSearch, loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !list.hasMore) return;
    const requestId = requestIdRef.current;
    setIsLoadingMore(true);
    try {
      const nextPage = list.page + 1;
      const { products, hasMore, maxDiscount } = await fetchPage(selectedId, debouncedSearch, nextPage);
      if (requestId !== requestIdRef.current) return;

      setList((prev) => {
        const seen = new Set(prev.products.map((p) => String(p.publicId || p.id)));
        const merged = [
          ...prev.products,
          ...products.filter((p) => !seen.has(String(p.publicId || p.id))),
        ];
        const next = {
          products: merged,
          page: nextPage,
          hasMore,
          maxDiscount: Math.max(prev.maxDiscount, maxDiscount),
        };
        cacheRef.current.set(`${selectedId ?? "all"}|${debouncedSearch}`, next);
        return next;
      });
    } catch (err) {
      console.error("[Categories] Failed to load more products:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchPage, isLoadingMore, list.hasMore, list.page, selectedId, debouncedSearch]);

  // Wishlist hearts for whatever is on screen
  useEffect(() => {
    if (list.products.length === 0) return;
    const ids = list.products.map((p) => p.publicId || String(p.id)).filter(Boolean);
    checkBulkWishlistStatus(ids);
  }, [list.products, checkBulkWishlistStatus]);

  // ---- Actions ------------------------------------------------------------
  const selectCategory = useCallback(
    (cat: BackendCategory | null) => {
      setPickedId(cat ? getCategoryId(cat) : null);
      setSearch("");
      setDebouncedSearch("");
      paneRef.current?.scrollTo({ top: 0 });

      // Keep the URL in sync without adding a history entry
      const url = cat
        ? `${pathname}?category=${encodeURIComponent(getCategorySlug(cat))}`
        : pathname;
      window.history.replaceState(null, "", url);
    },
    [pathname]
  );

  // ---- Derived values -----------------------------------------------------
  const title = activeCategory ? activeCategory.name : "All";
  const isSearching = debouncedSearch.length > 0;

  const heading = isSearching ? `Results for “${debouncedSearch}”` : title === "All" ? "All products" : title;
  const countLabel = isLoading
    ? ""
    : `${list.products.length}${list.hasMore ? "+" : ""} ${list.products.length === 1 ? "item" : "items"}`;

  const emptyMessage = isSearching
    ? `We couldn’t find anything for “${debouncedSearch}”${activeCategory ? ` in ${activeCategory.name}` : ""}. Try a different word.`
    : activeCategory
    ? `${activeCategory.name} has no products right now. Check back soon.`
    : "No products are available right now. Check back soon.";

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
          activeId={selectedId}
          onSelect={selectCategory}
          isLoading={categoriesLoading}
        />

        <section
          ref={paneRef}
          aria-label={`${title} products`}
          className="min-w-0 flex-1 overflow-y-auto overscroll-contain px-2.5 pb-28 pt-3 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] md:px-5 md:pb-8 md:pt-4"
        >
          {!isSearching && (
            <CategoryBanner category={activeCategory} maxDiscountPercent={list.maxDiscount} />
          )}

          <div className="mb-2.5 mt-4 flex items-baseline justify-between gap-3">
            <h2 className="min-w-0 truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-xl">
              {heading}
            </h2>
            {countLabel && (
              <span className="shrink-0 text-xs font-semibold text-slate-500" aria-live="polite">
                {countLabel}
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
          </div>

          <CategoryProductGrid
            products={list.products}
            isLoading={isLoading}
            error={error}
            onRetry={() => loadFirstPage(selectedId, debouncedSearch)}
            emptyMessage={emptyMessage}
            onResetFilters={activeCategory || isSearching ? () => selectCategory(null) : undefined}
            hasMore={list.hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          />

          <div className="mt-8 hidden md:block">
            <HomeFooter />
          </div>
        </section>
      </div>

      <CustomerBottomNav wishlistCount={wishlistCount} cartCount={cartCount} />
    </main>
  );
}

export default function CategoriesPage() {
  // useSearchParams() must sit under a Suspense boundary in the App Router
  return (
    <Suspense fallback={<div className="h-dvh bg-[#f6f9f3]" />}>
      <CategoriesContent />
    </Suspense>
  );
}