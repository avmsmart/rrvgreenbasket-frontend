"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import CustomerNavAuth from "@/components/customer/CustomerNavAuth";
import { LocationNavbar } from "@/components/location";
import HomeFooter from "@/components/HomeFooter";
import {
  MarqueeBar,
  ZeptoProductCard,
  ZeptoCategorySection,
  ZeptoPromoBanner,
  ZeptoFloatingCart,
} from "@/components/home";

import {
  Search,
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
import { useCustomerAuth } from "@/context/CustomerAuthContext";

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

const getCategoryVisuals = (cat: BackendCategory) => {
  const name = cat.name || "";
  const img = cat.imageUrl || DEFAULT_CATEGORY_IMAGES[name] || DEFAULT_CATEGORY_IMAGES.Vegetables;
  const icon = cat.icon || DEFAULT_CATEGORY_ICONS[name] || "▦";
  return { img, icon };
};

const extractProductItems = (
  response: unknown
): Parameters<typeof mapBackendToStoreProduct>[0][] => {
  if (Array.isArray(response)) {
    return response as Parameters<typeof mapBackendToStoreProduct>[0][];
  }

  if (!response || typeof response !== "object") return [];

  const root = response as Record<string, unknown>;
  const data = root.data && typeof root.data === "object"
    ? (root.data as Record<string, unknown>)
    : null;

  const candidates = [
    root.content,
    root.items,
    root.products,
    root.data,
    data?.content,
    data?.items,
    data?.products,
    data?.data,
  ];

  const list = candidates.find(Array.isArray);
  return Array.isArray(list)
    ? (list as Parameters<typeof mapBackendToStoreProduct>[0][])
    : [];
};

// Reuse the same quantity variants in mobile and desktop category sections.
const expandProductVariants = (
  items: StoreProduct[]
): { product: StoreProduct; variant: ProductWeightVariant | null }[] =>
  items.flatMap((product) => {
    const unit = String(product.quantityUnit || product.unit || "").trim().toUpperCase();

    if (["KG", "KILO", "KILOGRAM", "KILOGRAMS"].includes(unit)) {
      const variants: ProductWeightVariant[] = [
        { key: "1kg", label: "1 KG", unit: "KG", multiplier: 1 },
        { key: "500g", label: "500 g", unit: "KG", multiplier: 0.5 },
        { key: "250g", label: "250 g", unit: "KG", multiplier: 0.25 },
      ];
      return variants.map((variant) => ({ product, variant }));
    }

    if (["DOZEN", "DOZENS"].includes(unit)) {
      const variants: ProductWeightVariant[] = [
        { key: "1-dozen", label: "1 Dozen (12 pcs)", unit: "DOZEN", multiplier: 1 },
        { key: "6-pieces", label: "6 Pieces", unit: "DOZEN", multiplier: 0.5 },
        { key: "3-pieces", label: "3 Pieces", unit: "DOZEN", multiplier: 0.25 },
      ];
      return variants.map((variant) => ({ product, variant }));
    }

    return [{ product, variant: null }];
  });

export default function Home() {
  // Public Store Branding Settings
  const { settings } = useStoreSettings();

  // Category state (driven dynamically from backend API)
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string>("Best Sellers");
  const [produceMode, setProduceMode] = useState<"all" | "vegetables" | "fruits">("all");

  // Product state (fetched dynamically from backend API)
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [allProducts, setAllProducts] = useState<StoreProduct[]>([]);
  // Each homepage category is loaded independently so categories such as Fruits
  // are not hidden just because their products are outside the first global page.
  const [categoryProducts, setCategoryProducts] = useState<Record<string, StoreProduct[]>>({});
  const [isCategoryProductsLoading, setIsCategoryProductsLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Wishlist state from centralized context
  const { wishlistCount, isWishlisted, toggleWishlist, checkBulkWishlistStatus } = useWishlist();

  // Cart state from centralized CartContext (connected to Spring Boot Cart Service)
  const { itemCount: cartCount, totalAmount: cartTotal, addToCart } = useCart();

  // Customer authentication state
  const { isAuthenticated, customer } = useCustomerAuth();
  const isCustomerLoggedIn = isAuthenticated && Boolean(customer?.mobileNumber);

  // Search state
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Favorites (Wishlist) state
  const [showFavorites, setShowFavorites] = useState<boolean>(false);

  // UI state
  const [notice, setNotice] = useState<string>("");
  const [scrolling, setScrolling] = useState<boolean>(false);
  // Collapse the mobile delivery/brand row while scrolling down; reveal it again on upward scroll.
  const [isCompactHeader, setIsCompactHeader] = useState<boolean>(false);

  // Fetch categories from backend API
  const loadCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
    try {
      const data = await productService.getCategories();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      } else {
        setCategories([]);
      }
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
        const rawItems = extractProductItems(res);
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

  // Fetch a separate product page for every backend category. The homepage's
  // global product request is intentionally paginated and may not contain all
  // categories (for example, Fruits), so it must not drive category visibility.
  useEffect(() => {
    if (categories.length === 0) {
      setCategoryProducts({});
      setIsCategoryProductsLoading(false);
      return;
    }

    let cancelled = false;
    setIsCategoryProductsLoading(true);

    const loadProductsByCategory = async () => {
      try {
      const entries = await Promise.all(
        categories.map(async (cat) => {
          const categoryId = getCategoryId(cat);
          if (!categoryId) return [String(cat.name || ""), [] as StoreProduct[]] as const;

          try {
            const response = await productService.getStorefrontProducts({
              categoryId,
              page: 0,
              size: 100,
            });
            const rawItems = extractProductItems(response);
            const mapped = rawItems.map(mapBackendToStoreProduct);
            return [String(categoryId), mapped] as const;
          } catch (error) {
            console.error(`[Storefront] Failed to load category ${cat.name}:`, error);
            return [String(categoryId), [] as StoreProduct[]] as const;
          }
        })
      );

      if (cancelled) return;

      const nextCategoryProducts: Record<string, StoreProduct[]> = {};
      const mergedProducts = new Map<string, StoreProduct>();
      entries.forEach(([categoryId, items]) => {
        nextCategoryProducts[categoryId] = items;
        items.forEach((item) => mergedProducts.set(String(item.id), item));
      });

      setCategoryProducts(nextCategoryProducts);
      if (mergedProducts.size > 0) {
        setAllProducts((previous) => {
          const combined = new Map<string, StoreProduct>();
          previous.forEach((item) => combined.set(String(item.id), item));
          mergedProducts.forEach((item, id) => combined.set(id, item));
          return Array.from(combined.values());
        });
      }
      } finally {
        if (!cancelled) setIsCategoryProductsLoading(false);
      }
    };

    loadProductsByCategory().catch((error) => {
      console.error("[Storefront] Category product loading failed:", error);
      if (!cancelled) setIsCategoryProductsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [categories]);

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

  // Stable mobile header: collapse once the page leaves the top area.
  // Do not expand on every small upward movement; that caused the header to flicker.
  useEffect(() => {
    let frame = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const currentY = window.scrollY;

        setIsCompactHeader((wasCompact) => {
          if (currentY <= 24) return false;
          if (currentY >= 105) return true;
          return wasCompact;
        });

        setScrolling(true);
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => setScrolling(false), 260);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  // Filter products by search, category, and favorites
  const displayedProducts = useMemo(() => {
    const source = products.length > 0 ? products : allProducts;
    let list = [...source];

    // 0. Best-Sellers filter
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
          pCatLower === activeNameLower;
        return Boolean(matchesId || (!p.categoryId && matchesName));
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

  /**
   * Expand KG and DOZEN products into separate storefront cards.
   * Explicitly typed to prevent flatMap union mismatch errors.
   */
  const displayedProductCards = useMemo(
    () => expandProductVariants(displayedProducts),
    [displayedProducts]
  );

  const hasDesktopFilters =
    activeCategoryId !== null || Boolean(search.trim() || debouncedSearch.trim()) || showFavorites;

  // Helper to extract products for a specific category (for Zepto mobile rows)
  const getProductsForCategory = useCallback(
    (cat: BackendCategory) => {
      const catId = getCategoryId(cat);
      const categorySpecificProducts = categoryProducts[String(catId)];
      if (categorySpecificProducts) return categorySpecificProducts;

      const catNameLower = (cat.name || "").toLowerCase().trim();
      const source = allProducts.length > 0 ? allProducts : products;

      return source.filter((p) => {
        const matchesId = p.categoryId && String(p.categoryId) === String(catId);
        const pCatLower = (p.category || "").toLowerCase().trim();
        // Exact category match prevents child categories appearing in parent rows.
        const matchesName = pCatLower && pCatLower === catNameLower;
        return Boolean(matchesId || (!p.categoryId && matchesName));
      });
    },
    [allProducts, products, categoryProducts]
  );

  const visibleProduceCategories = useMemo(() => {
    if (produceMode === "all") return categories;
    return categories.filter((category) => {
      const name = String(category.name || "").toLowerCase();
      if (produceMode === "fruits") return /fruit/.test(name);
      return /vegetable|veggie|veg\\b/.test(name);
    });
  }, [categories, produceMode]);

  // Helper for best-selling / top-picks products (for Zepto mobile top section)
  const bestSellerProducts = useMemo(() => {
    const source = allProducts.length > 0 ? allProducts : products;
    const produceCategoryIds = new Set(
      visibleProduceCategories.map((category) => String(getCategoryId(category)))
    );
    const produceSource =
      produceMode === "all"
        ? source
        : source.filter((product) => {
            if (product.categoryId) {
              return produceCategoryIds.has(String(product.categoryId));
            }
            const productCategory = String(product.category || "").toLowerCase().trim();
            return visibleProduceCategories.some(
              (category) =>
                productCategory === String(category.name || "").toLowerCase().trim()
            );
          });
    const featured = produceSource.filter(
      (p) =>
        p.badge === "Featured" ||
        (typeof p.originalPrice === "number" &&
          typeof p.price === "number" &&
          p.originalPrice > p.price)
    );
    return featured.length > 0 ? featured.slice(0, 10) : produceSource.slice(0, 10);
  }, [allProducts, products, visibleProduceCategories, produceMode]);

  // Handle category selection using actual categoryId
  function selectCategory(cat: BackendCategory | null) {
    if (cat === null) {
      setActiveCategoryId(null);
      setActiveCategoryName("Best Sellers");
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
    <main className="min-h-screen bg-white pb-32 text-[#20392a] md:pb-0">
      
      {/* =========================================================================
          1. HEADER NAVIGATION (Zepto-Style Mobile & Desktop Responsive)
         ========================================================================= */}
      <header className="sticky top-0 z-[60] border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-3 sm:px-5 lg:px-6">
          
          {/* DESKTOP HEADER (Preserved 100%) */}
          <div className="hidden min-h-[70px] items-center gap-3 lg:gap-5 md:flex">

            {/* Brand: left side */}
            <button
              type="button"
              onClick={() => {
                selectCategory(null);
                setSearch("");
                setShowFavorites(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex shrink-0 items-center gap-2.5 text-left cursor-pointer"
              aria-label="Go to homepage"
            >
              {settings.logoUrl ? (
                // <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-emerald-100 bg-white p-1">
                  <img
                    // src={settings.logoUrl}
                    src={"/images/auth/logo1.png"}
                    alt={settings.storeName || "RRV Green Basket"}
                   className="h-20 w-20 object-contain"
                  />
                // </div>
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Leaf size={25} />
                </div>
              )}
              <div className="hidden leading-tight sm:block">
                <h1 className="whitespace-nowrap text-lg font-extrabold tracking-tight text-slate-900">
                  {settings.storeName || "RRV Green Basket"}
                </h1>
                <p className="mt-0.5 whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {settings.brandTagline || "FRESHNESS DELIVERED DAILY"}
                </p>
              </div>
            </button>

            {/* Desktop delivery location: beside brand, Zepto-style */}
            <div className="hidden min-w-[205px] max-w-[245px] shrink-0 lg:block">
              <LocationNavbar variant="desktop" />
            </div>

            {/* Search: wide center section */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                document.getElementById("products")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
             className="hidden h-[50px] w-full min-w-0
           md:w-[420px] lg:w-[500px] xl:w-[560px]
           shrink-0 overflow-hidden rounded-xl
           border border-[#E5E7EB]
           bg-[#F5F5F5] transition
           focus-within:border-slate-300
           focus-within:bg-white
           focus-within:ring-2 focus-within:ring-slate-100
           md:flex">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
                <Search size={20} className="shrink-0 text-slate-700" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowFavorites(false);
                  }}
                  placeholder='Search for "fresh vegetables, fruits..."'
                  aria-label="Search products"
                className="h-full w-full min-w-0 bg-transparent
           text-sm font-medium text-slate-800
           outline-none placeholder:text-slate-500"/>
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* <div className="flex shrink-0 items-center border-l border-slate-200 px-3">
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
                  aria-label="Select product category"
                  className="max-w-[145px] cursor-pointer appearance-none bg-transparent pr-5 text-xs font-semibold text-slate-700 outline-none"
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
                <ChevronDown size={14} className="-ml-4 pointer-events-none text-slate-500" />
              </div> */}
              {/* <button
                type="submit"
                className="flex w-[54px] shrink-0 items-center justify-center bg-emerald-600 text-white transition hover:bg-emerald-700 cursor-pointer"
                aria-label="Submit search"
              >
                <Search size={20} />
              </button> */}
            </form>

            {/* Desktop account: Login before authentication, Profile after */}
            <div className="hidden shrink-0 items-center justify-center border-l border-slate-100 pl-4 md:flex">
              <CustomerNavAuth />
            </div>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              data-nav-wishlist
              aria-label="View wishlist"
              className="hidden shrink-0 flex-col items-center justify-center gap-1 border-l border-slate-100 px-4 text-slate-800 transition hover:text-emerald-700 md:flex"
            >
              <span className="relative">
                <Heart
                  size={23}
                  strokeWidth={1.8}
                  className={wishlistCount > 0 ? "fill-rose-50 text-rose-500" : ""}
                />
                {wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              data-nav-cart
              aria-label="View cart"
              className="hidden shrink-0 flex-col items-center justify-center gap-1 border-l border-slate-100 pl-4 text-slate-800 transition hover:text-emerald-700 md:flex"
            >
              <span className="relative">
                <ShoppingCart size={28} strokeWidth={1.8} />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">Cart</span>
            </Link>
          </div>

          {/* MOBILE TOP NAVIGATION (Zepto Style - Row 1: Logo + Delivery Location + Account) */}
          <div
            aria-hidden={isCompactHeader}
            className={`flex items-center justify-between gap-2 overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-out md:hidden ${
              isCompactHeader
                ? "pointer-events-none max-h-0 py-0 opacity-0"
                : "max-h-[52px] pt-2.5 pb-2 opacity-100"
            }`}
          >
            {/* Brand Logo */}
            <button
              type="button"
              onClick={() => {
                selectCategory(null);
                setSearch("");
                setShowFavorites(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex shrink-0 items-center gap-2 text-left cursor-pointer"
              aria-label="Go to homepage"
            >
              {settings.logoUrl ? (
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-emerald-100 bg-white p-0.5">
                  <img
                    src={settings.logoUrl}
                    alt={settings.storeName || "RRV Green Basket"}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Leaf size={20} />
                </div>
              )}
            </button>

            {/* Mobile Delivery Location Pill */}
            <div className="relative min-w-0 flex-1 px-1">
              <LocationNavbar variant="mobile" />
            </div>

            {/* Mobile Account Profile Icon */}
            <div className="flex shrink-0 items-center">
              <CustomerNavAuth />
            </div>
          </div>

          {/* MOBILE SEARCH: remains visible because the complete header is sticky. */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mb-0 flex h-[46px] items-center gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white px-3 shadow-none md:hidden"
          >
            <Search size={18} className="shrink-0 text-slate-500" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowFavorites(false);
              }}
              placeholder='Search fruits, vegetables, groceries...'
              aria-label="Search products"
              className="h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-[13px] font-medium text-slate-800 outline-none ring-0 shadow-none focus:border-0 focus:outline-none focus:ring-0 placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </form>

      {/* Mobile produce tabs: fixed directly beneath search, with a smooth active underline. */}
      <section className="sticky top-[46px] z-40 border-b border-slate-200 bg-white md:hidden">
        <div className="relative grid grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setProduceMode("vegetables");
              setActiveCategoryId(null);
              setActiveCategoryName("Best Sellers");
              setSearch("");
              setShowFavorites(false);
            }}
            aria-pressed={produceMode === "vegetables"}
            className={`relative z-10 flex h-11 items-center justify-center text-[13px] font-semibold transition-colors duration-300 ease-out ${
              produceMode === "vegetables" ? "text-emerald-700" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Vegetables
          </button>
          <button
            type="button"
            onClick={() => {
              setProduceMode("fruits");
              setActiveCategoryId(null);
              setActiveCategoryName("Best Sellers");
              setSearch("");
              setShowFavorites(false);
            }}
            aria-pressed={produceMode === "fruits"}
            className={`relative z-10 flex h-11 items-center justify-center text-[13px] font-semibold transition-colors duration-300 ease-out ${
              produceMode === "fruits" ? "text-emerald-700" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Fruits
          </button>
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-0 h-[2px] w-1/2 bg-emerald-600 transition-transform duration-300 ease-in-out ${
              produceMode === "fruits" ? "translate-x-full" : "translate-x-0"
            }`}
          />
        </div>
      </section>

        </div>
      </header>

      {/* =========================================================================
          2. MOBILE HERO CATEGORY SHORTCUTS
         ========================================================================= */}
      <section className="md:hidden border-b border-emerald-100 bg-[#e8f8f1]">
        <div className="flex gap-4 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button type="button" onClick={() => selectCategory(null)} className="flex min-w-[42px] shrink-0 flex-col items-center gap-1 text-[11px] font-semibold text-slate-800">
            <span className="flex h-9 w-9 items-center justify-center text-xl">🛍️</span>
            All
          </button>
          {categories.map((c) => {
            const catId = getCategoryId(c);
            const { icon } = getCategoryVisuals(c);
            return (
              <button key={catId} type="button" onClick={() => selectCategory(c)} className="flex min-w-[54px] shrink-0 flex-col items-center gap-1 text-[11px] font-semibold text-slate-800">
                <span className="flex h-9 w-9 items-center justify-center text-xl">{icon}</span>
                <span className="max-w-[68px] truncate">{c.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          3. DESKTOP PROMOTIONAL STRIP & CATEGORY GRID
          Mobile image slider removed as requested.
         ========================================================================= */}
      <div className="mx-auto hidden w-full max-w-[1400px] px-3 sm:px-5 lg:px-6 md:block">
        <MarqueeBar />

        {/* Desktop category navigation: same simple icon-and-name style as mobile.
            No image tiles, card backgrounds, or category-grid cards. */}
        <nav
          aria-label="Browse product categories"
          className="border-b border-slate-100 bg-white"
        >
          <div className="flex items-start gap-7 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => selectCategory(null)}
              className={`flex min-w-[58px] shrink-0 flex-col items-center gap-1 text-[12px] font-semibold transition-colors ${
                activeCategoryId === null ? "text-emerald-700" : "text-slate-600 hover:text-emerald-700"
              }`}
            >
              <span className="flex h-9 items-center justify-center text-2xl" aria-hidden="true">🛍️</span>
              <span>All</span>
              <span className={`h-0.5 w-8 rounded-full ${activeCategoryId === null ? "bg-emerald-600" : "bg-transparent"}`} />
            </button>
            {categories.map((cat) => {
              const categoryId = getCategoryId(cat);
              const active = activeCategoryId === categoryId;
              const { icon } = getCategoryVisuals(cat);
              return (
                <button
                  key={categoryId}
                  type="button"
                  onClick={() => selectCategory(cat)}
                  className={`flex min-w-[76px] shrink-0 flex-col items-center gap-1 text-[12px] font-semibold transition-colors ${
                    active ? "text-emerald-700" : "text-slate-600 hover:text-emerald-700"
                  }`}
                >
                  <span className="flex h-9 items-center justify-center text-2xl" aria-hidden="true">{icon}</span>
                  <span className="max-w-[130px] truncate">{cat.name}</span>
                  <span className={`h-0.5 w-8 rounded-full ${active ? "bg-emerald-600" : "bg-transparent"}`} />
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Mobile brand hero and compact sticky category navigation */}
      <section className="md:hidden bg-gradient-to-b from-sky-100 via-white to-white px-4 pb-3 pt-2 text-center">
        <div className="mx-auto flex min-h-[72px] flex-col items-center justify-center">
          <h2 className="text-[25px] font-black leading-none tracking-tight text-emerald-700">FRESH</h2>
          <p className="mt-1 text-[10px] font-bold tracking-wide text-emerald-800">Fruits &amp; Vegetables</p>
        </div>
      </section>

      <nav
        aria-label="Shop by category"
        className="sticky top-[46px] z-50 border-b border-slate-200 bg-white md:hidden"
      >
        <div className="flex gap-6 overflow-x-auto scroll-smooth px-4 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
          <button type="button" onClick={() => selectCategory(null)} className={`relative shrink-0 py-3 text-[11px] font-bold ${activeCategoryId === null ? "text-emerald-700 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-emerald-600" : "text-slate-600"}`}>All</button>
          {categories.map((c) => {
            const catId = getCategoryId(c);
            const active = activeCategoryId === catId;
            return (
              <button key={catId} type="button" onClick={() => selectCategory(c)} className={`relative shrink-0 py-3 text-[11px] font-bold ${active ? "text-emerald-700 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-emerald-600" : "text-slate-600"}`}>
                {c.name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* =========================================================================
          4. MOBILE HOMEPAGE: CATEGORY-WISE HORIZONTAL SECTIONS (Zepto Style)
         ========================================================================= */}
      <div className="block md:hidden">
        {/* State A: When Search, Wishlist, or Category Filter is Active -> Filtered Grid View */}
        {activeCategoryId !== null || search || showFavorites ? (
          <div className="px-3 py-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {showFavorites
                    ? "Wishlist Favorites"
                    : search
                    ? `Results for "${search}"`
                    : activeCategoryName}
                </h3>
                <p className="text-xs font-medium text-gray-500">
                  {displayedProducts.length} items found
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  selectCategory(null);
                  setSearch("");
                  setShowFavorites(false);
                }}
                className="text-xs font-bold text-[#00875a] hover:underline cursor-pointer"
              >
                Reset Filters &rarr;
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-3 gap-x-2 gap-y-8 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl mb-2">🔎</div>
                <h4 className="text-sm font-bold text-slate-800">No products found</h4>
                <p className="text-xs text-gray-500 mt-1">Try another search or category</p>
                <button
                  type="button"
                  onClick={() => {
                    selectCategory(null);
                    setSearch("");
                    setShowFavorites(false);
                  }}
                  className="mt-4 rounded-xl bg-[#00875a] px-4 py-2 text-xs font-bold text-white shadow-xs"
                >
                  Show All Products
                </button>
              </div>
            ) : (
              <div
                
                  className="
                        flex w-full gap-3
                        overflow-x-auto
                        pl-3 pr-3 pb-3
                        snap-x snap-mandatory
                        [scrollbar-width:none]
                        [&::-webkit-scrollbar]:hidden
                      "
                      >
            {displayedProductCards.map(({ product: p, variant }) => (
              <div
                key={`${p.publicId || p.id}-${variant?.key || "default"}`}
                className="w-[142px] min-w-[142px] shrink-0 snap-start"
              >
                {/* Keep your existing ProductCard props and handlers here */}
                <ProductCard
                  product={p}
                  fixedVariant={variant || undefined}
                  // Keep your existing wishlist and cart props here
                />
              </div>
            ))}
          </div>
            )}
          </div>
        ) : (
          /* State B: Default Mobile Homepage -> Horizontally Scrollable Category Rows (Zepto Style) */
          <div className="pb-8">
            {/* Seasonal launch strip, as shown in the reference recording */}
            <div className="mx-3 mt-3 mb-4 overflow-hidden rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-4 py-3 text-white shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-white/80">Fresh seasonal launches</p>
                  <p className="mt-0.5 text-sm font-black">Explore this season’s picks</p>
                  <p className="text-[10px] text-white/85">Picked fresh for your basket</p>
                </div>
                <span className="text-3xl" aria-hidden="true">🍓🍊</span>
              </div>
            </div>

            {/* Best Sellers & Top Picks carousel */}
            <ZeptoCategorySection
              title="Trending & Best Sellers"
              subtitle="Most ordered farm-fresh favorites"
              products={bestSellerProducts}
              onSeeAll={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              isWishlisted={(id) => isWishlisted(id)}
              onToggleWishlist={toggleFavorite}
              onAddToCart={handleAddToCart}
            />

            {/* Promotional banner between product groups */}
            <ZeptoPromoBanner variant="seasonal" onClick={() => selectCategory(null)} />

            {/* Backend category product rows */}
            <div id="mobile-category-sections">
            {visibleProduceCategories.map((cat, idx) => {
              const catProducts = getProductsForCategory(cat);
              if (catProducts.length === 0) return null;

              return (
                <React.Fragment key={getCategoryId(cat)}>
                  <ZeptoCategorySection
                    title={cat.name}
                    subtitle={`Fresh ${cat.name.toLowerCase()} direct from local harvest`}
                    products={catProducts}
                    onSeeAll={() => selectCategory(cat)}
                    isWishlisted={(id) => isWishlisted(id)}
                    onToggleWishlist={toggleFavorite}
                    onAddToCart={handleAddToCart}
                  />

                  {/* Interleaved Promotional Banners between product rows */}
                  {idx === 0 && (
                    <ZeptoPromoBanner variant="organic" onClick={() => selectCategory(cat)} />
                  )}
                  {idx === 2 && (
                    <ZeptoPromoBanner variant="express" onClick={() => selectCategory(cat)} />
                  )}
                </React.Fragment>
              );
            })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          5. MAIN CONTENT: DESKTOP STOREFRONT PRODUCTS GRID (Preserved 100%)
         ========================================================================= */}
      <div className="hidden mx-auto max-w-[1400px] px-3 py-4 sm:px-5 lg:px-6 lg:py-5 md:block">
      
        
        <section className="min-w-0">

          
          <section id="products" className="scroll-mt-28">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                {/* <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700 flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>
                    {showFavorites
                      ? "Your saved wishlist items"
                      : search
                      ? "Search results"
                      : "Top picks for you"}
                  </span>
                </p> */}

                {/* <h2 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight">
                  {showFavorites
                    ? "Wishlist Favorites"
                    : search
                    ? `Results for "${search}"`
                    : activeCategoryName}
                </h2> */}

                {/* <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <span>{displayedProductCards.length} product options available</span>
                  {activeCategoryId && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Tag size={11} />
                        <span>Filter: {activeCategoryName}</span>
                      </span>
                    </>
                  )}
                </div> */}
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
            {isLoading ||
            (!hasDesktopFilters && (isCategoriesLoading || isCategoryProductsLoading)) ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4 2xl:grid-cols-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between h-full rounded-xl border border-emerald-100/80 bg-white p-2.5 shadow-2xs animate-pulse sm:p-3"
                  >
                    <div className="mb-2 aspect-square w-full rounded-lg bg-slate-100" />
                    <div className="space-y-2">
                      <div className="h-3 w-16 rounded-md bg-slate-100" />
                      <div className="h-4 w-3/4 rounded-md bg-slate-100" />
                      <div className="h-7 w-full rounded-md bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !hasDesktopFilters ? (
              /* Default desktop homepage: a separate section for every backend category. */
              <div className="space-y-10">
                {categories.map((cat) => {
                  const catId = getCategoryId(cat);
                  const catProducts = getProductsForCategory(cat);
                  const categoryCards = expandProductVariants(catProducts);

                  if (categoryCards.length === 0) return null;

                  return (
                    <section
                      key={catId}
                      id={`desktop-category-${catId}`}
                      className="scroll-mt-28"
                    >
                      <div className="mb-4 flex items-end justify-between gap-4 border-b border-emerald-100 pb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xl" aria-hidden="true">
                              {getCategoryVisuals(cat).icon}
                            </span>
                            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                              {cat.name}
                            </h3>
                          </div>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {catProducts.length} {catProducts.length === 1 ? "product" : "products"} available
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectCategory(cat)}
                          className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          View all <span aria-hidden="true">→</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-5 2xl:grid-cols-7">
                        {categoryCards.map(({ product, variant }) => {
                          const isFav = isWishlisted(product.publicId || String(product.id));
                          return (
                            <div
                              key={`${product.publicId || product.id}-${variant?.key || "default"}`}
                              className="w-full min-w-0"
                            >
                              <ProductCard
                                product={product}
                                fixedVariant={variant || undefined}
                                isWishlisted={isFav}
                                onToggleWishlist={toggleFavorite}
                                onAddToCart={handleAddToCart}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}

                {categories.length > 0 &&
                  categories.every((cat) => getProductsForCategory(cat).length === 0) && (
                    <div className="rounded-3xl border border-dashed border-green-200 bg-white px-5 py-14 text-center">
                      <div className="mb-2 text-4xl">🥬</div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        No products available in these categories
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Products will appear here when they are available from the store.
                      </p>
                    </div>
                  )}
              </div>
            ) : displayedProducts.length === 0 ? (
              /* Empty state for search, wishlist, or selected category. */
              <div className="rounded-3xl border border-dashed border-green-200 bg-white px-5 py-14 text-center shadow-xs">
                <div className="mb-2 text-4xl">🔎</div>
                <h3 className="text-base font-extrabold text-slate-900">No products found</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                  {search
                    ? `No items matching "${search}" in ${activeCategoryName}.`
                    : `No produce items currently listed under ${activeCategoryName}.`}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    selectCategory(null);
                    setSearch("");
                    setShowFavorites(false);
                  }}
                  className="mt-5 rounded-2xl bg-[#00875a] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-[#00734d]"
                >
                  Show All Categories
                </button>
              </div>
            ) : (
              /* Filtered desktop grid: preserve search/category/wishlist behavior. */
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-5 2xl:grid-cols-7">
                {displayedProductCards.map(({ product: p, variant }) => {
                  const isFav = isWishlisted(p.publicId || String(p.id));
                  return (
                    <div
                      key={`${p.publicId || p.id}-${variant?.key || "default"}`}
                      className="w-full min-w-0"
                    >
                      <ProductCard
                        product={p}
                        fixedVariant={variant || undefined}
                        isWishlisted={isFav}
                        onToggleWishlist={toggleFavorite}
                        onAddToCart={handleAddToCart}
                      />
                    </div>
                  );
                })}
              </div>
            )}          </section>

          <HomeFooter />
        </section>
      </div>

      {/* =========================================================================
          6. FLOATING OFFERS AND CART SUMMARY (Zepto Style on Mobile)
         ========================================================================= */}
      {/* <ZeptoFloatingCart scrolling={scrolling} /> */}

      {/* =========================================================================
          7. FIXED MOBILE BOTTOM NAVIGATION (Zepto Style)
         ========================================================================= */}
      <nav
        className={`fixed inset-x-0 bottom-0 z-[100] border-t border-slate-200/80 bg-white/95 px-3 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-2xl transition-all duration-300 ease-out md:hidden ${
          scrolling ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="mx-auto flex h-[58px] max-w-md items-center justify-around">
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
                ? "text-[#00875a] font-bold"
                : "text-gray-400 hover:text-[#00875a]"
            }`}
          >
            <HomeIcon size={20} strokeWidth={2} />
            <span className="text-[10px] font-semibold">Home</span>
          </button>

          <Link
            href="/categories"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#00875a]"
            aria-label="Categories"
          >
            <LayoutGrid size={20} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold">Categories</span>
          </Link>

          <Link
            href="/wishlist"
            data-nav-wishlist-mobile
            className="relative flex flex-1 flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#00875a]"
            aria-label="Wishlist"
          >
            <span className="relative">
              <Heart
                size={20}
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

          <Link
            href="/cart"
            data-nav-cart-mobile
            className="relative flex flex-1 flex-col items-center justify-center gap-1 text-gray-400 transition hover:text-[#00875a]"
          >
            <span className="relative">
              <ShoppingCart size={20} strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#00875a] px-1 text-[8px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold">Cart</span>
          </Link>

          <Link
            href={isCustomerLoggedIn ? "/customer/profile?tab=overview" : "/login"}
            aria-label={isCustomerLoggedIn ? "Profile" : "Login"}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-gray-400 transition hover:text-[#00875a] cursor-pointer"
          >
            <UserRound size={20} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold">
              {isCustomerLoggedIn ? "Profile" : "Login"}
            </span>
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
