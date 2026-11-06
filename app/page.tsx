"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import CustomerNavAuth from "@/components/customer/CustomerNavAuth";
import HomeFooter from "@/components/HomeFooter";
import {
  Search,
  MapPin,
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
  CheckCircle2,
  X,
  Tag,
} from "lucide-react";
import {
  productService,
  getCategoryId,
  mapBackendToStoreProduct,
} from "@/services/product.service";
import { BackendCategory, StoreProduct } from "@/types";
import {
  getStoredWishlist,
  saveStoredWishlist,
  CustomerWishlistItem,
} from "@/data/customer-profile-mock";

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

const resolveImageUrl = (img?: string, width = 600) => {
  if (!img) {
    return `https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=${width}&q=85`;
  }
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:") || img.startsWith("/")) {
    return img;
  }
  return `https://images.unsplash.com/${img}?auto=format&fit=crop&w=${width}&q=85`;
};

const getCategoryVisuals = (cat: BackendCategory) => {
  const name = cat.name || "";
  const img = cat.imageUrl || DEFAULT_CATEGORY_IMAGES[name] || DEFAULT_CATEGORY_IMAGES.Vegetables;
  const icon = cat.icon || DEFAULT_CATEGORY_ICONS[name] || "▦";
  return { img, icon };
};

export default function Home() {
  // Category state (driven dynamically from backend API)
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string>("All Products");

  // Product state (fetched dynamically from backend API)
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Search state
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Cart state
  const [cart, setCart] = useState<Record<string | number, number>>({});

  // Favorites (Wishlist) state
  const [favorites, setFavorites] = useState<(string | number)[]>([]);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);

  // UI state
  const [notice, setNotice] = useState<string>("");
  const [scrolling, setScrolling] = useState<boolean>(false);

  // Synchronize cart from localStorage and window storage events
  const syncCartFromStorage = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("rrv-cart") || "{}");
      setCart(saved);
    } catch {
      setCart({});
    }
  }, []);

  useEffect(() => {
    syncCartFromStorage();
    window.addEventListener("storage", syncCartFromStorage);
    return () => window.removeEventListener("storage", syncCartFromStorage);
  }, [syncCartFromStorage]);

  // Synchronize favorites from customer wishlist
  useEffect(() => {
    try {
      const stored = getStoredWishlist();
      setFavorites(stored.map((item) => item.id));
    } catch {
      setFavorites([]);
    }
  }, []);

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
        const rawItems = res?.content || (Array.isArray(res) ? res : []);
        const mapped = rawItems.map(mapBackendToStoreProduct);
        setProducts(mapped);
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

  // Filter products by favorites if favorites tab active
  const displayedProducts = useMemo(() => {
    if (showFavorites) {
      return products.filter((p) => favorites.some((f) => String(f) === String(p.id)));
    }
    return products;
  }, [showFavorites, favorites, products]);

  // Cart total calculations
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = products.find((prod) => String(prod.id) === String(id));
      return sum + (p ? p.price * qty : 0);
    }, 0);
  }, [cart, products]);

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

  // Cart modification handlers
  function addToCart(p: StoreProduct) {
    const next = {
      ...cart,
      [p.id]: (cart[p.id] || 0) + 1,
    };
    setCart(next);
    localStorage.setItem("rrv-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("storage"));
    setNotice(`Added ${p.name} to cart!`);
    setTimeout(() => setNotice(""), 2500);
  }

  function changeQuantity(id: string | number, amount: number) {
    const next = { ...cart };
    const qty = (next[id] || 0) + amount;

    if (qty <= 0) {
      delete next[id];
    } else {
      next[id] = qty;
    }

    setCart(next);
    localStorage.setItem("rrv-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("storage"));
  }

  // Wishlist toggle handler
  function toggleFavorite(p: StoreProduct) {
    try {
      const stored = getStoredWishlist();
      const exists = stored.some((item) => String(item.id) === String(p.id));

      if (exists) {
        const nextList = stored.filter((item) => String(item.id) !== String(p.id));
        saveStoredWishlist(nextList);
        setFavorites((old) => old.filter((id) => String(id) !== String(p.id)));
        setNotice(`Removed ${p.name} from Wishlist`);
      } else {
        const newItem: CustomerWishlistItem = {
          id: typeof p.id === "number" ? p.id : Math.floor(Math.random() * 1000) + 100,
          name: p.name,
          category: p.category,
          price: p.price,
          unit: p.unit,
          image: resolveImageUrl(p.image),
          inStock: p.inStock ?? true,
          badge: p.badge,
        };
        const nextList = [newItem, ...stored];
        saveStoredWishlist(nextList);
        setFavorites((old) => [...old, p.id]);
        setNotice(`Saved ${p.name} to Wishlist ❤️`);
      }
      setTimeout(() => setNotice(""), 2500);
    } catch {
      setFavorites((old) =>
        old.includes(p.id) ? old.filter((x) => x !== p.id) : [...old, p.id]
      );
    }
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-md shadow-emerald-700/20">
                <Leaf size={23} />
              </div>

              <div className="text-left leading-tight">
                <h1 className="text-lg font-extrabold tracking-tight text-gray-900">
                  <span className="text-green-700">RRV</span> Green Basket
                </h1>
                <p className="text-[9px] font-medium tracking-wide text-gray-500">
                  FRESHNESS DELIVERED DAILY
                </p>
              </div>
            </button>

            {/* Mobile Location Selector */}
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-green-100 bg-green-50/70 px-2.5 py-2 text-left md:hidden cursor-pointer"
            >
              <MapPin size={18} className="shrink-0 text-green-700" />
              <span className="min-w-0 leading-tight">
                <span className="block text-[9px] text-gray-500">Deliver to</span>
                <span className="block truncate text-[11px] font-bold text-gray-800">
                  Kurnool, AP
                </span>
              </span>
              <ChevronDown size={13} className="shrink-0 text-gray-500" />
            </button>

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

            {/* Desktop Delivery Location */}
            <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
              <MapPin size={20} className="text-green-700" />
              <div className="leading-tight">
                <p className="text-[10px] text-gray-500">Deliver to</p>
                <p className="flex items-center gap-1 text-xs font-bold text-gray-900">
                  Kurnool, AP <ChevronDown size={12} />
                </p>
              </div>
            </div>

            {/* Customer Account / Auth Navigation */}
            <div className="hidden shrink-0 border-l border-gray-100 pl-3 lg:block">
              <CustomerNavAuth />
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => {
                setShowFavorites((x) => !x);
                setSearch("");
                document.getElementById("products")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className={`hidden shrink-0 items-center gap-1.5 border-l border-gray-100 pl-3 text-gray-700 transition hover:text-green-700 md:flex cursor-pointer ${
                showFavorites ? "text-green-700 font-bold" : ""
              }`}
            >
              <Heart size={20} className={showFavorites ? "fill-green-600 text-green-600" : ""} />
              <span className="hidden text-xs font-medium xl:block">Wishlist</span>
              {favorites.length > 0 && (
                <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <Link
              href="/cart"
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
          2. MOBILE HORIZONTALLY SCROLLABLE CATEGORY CHIPS
         ========================================================================= */}
      <section
        className={`sticky top-[110px] z-40 border-b border-green-100/70 bg-white/95 px-2.5 py-2 backdrop-blur-xl transition-all duration-300 ease-out md:hidden ${
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
                  src={resolveImageUrl(img, 120)}
                  alt={c.name}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-white shadow-2xs"
                />
                <span className="line-clamp-1 w-full text-center">{c.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          3. MAIN CONTENT: DESKTOP SIDEBAR + STOREFRONT PRODUCTS GRID
         ========================================================================= */}
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-5">
        
        {/* Desktop Sidebar: Shop Categories */}
        <aside
          id="categories"
          className="hidden h-fit scroll-mt-24 rounded-3xl border border-green-100 bg-white p-3.5 lg:sticky lg:top-[88px] lg:block lg:max-h-[calc(100vh-108px)] lg:overflow-y-auto lg:self-start shadow-xs"
        >
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
              Shop Categories
            </h2>
            {isCategoriesLoading && (
              <RefreshCw size={12} className="animate-spin text-emerald-600" />
            )}
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {/* All Products option */}
            <button
              onClick={() => selectCategory(null)}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-xs font-bold transition-all cursor-pointer ${
                activeCategoryId === null && !showFavorites
                  ? "bg-green-700 text-white shadow-md shadow-emerald-700/20 font-extrabold"
                  : "text-gray-700 hover:bg-green-50"
              }`}
            >
              <span className="text-sm">▦</span>
              <span>All Products</span>
            </button>

            {/* Dynamic Backend Categories */}
            {categories.map((c) => {
              const catId = getCategoryId(c);
              const { icon } = getCategoryVisuals(c);
              const isActive = activeCategoryId === catId && !showFavorites;

              return (
                <button
                  key={catId}
                  onClick={() => selectCategory(c)}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-green-700 text-white shadow-md shadow-emerald-700/20 font-extrabold"
                      : "text-gray-700 hover:bg-green-50"
                  }`}
                >
                  <span className="text-sm">{icon}</span>
                  <span className="truncate">{c.name}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Product Listing Main Section */}
        <section className="min-w-0">

          {/* Desktop Circular Category Shortcuts */}
          {!search && !showFavorites && (
            <section className="mb-5 hidden md:block">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-extrabold text-gray-900 sm:text-base">
                  Shop by category
                </h2>
                <button
                  type="button"
                  onClick={() => selectCategory(null)}
                  className="text-xs font-bold text-green-700 hover:underline cursor-pointer"
                >
                  View all
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map((c) => {
                  const catId = getCategoryId(c);
                  const { img } = getCategoryVisuals(c);
                  const isActive = activeCategoryId === catId;

                  return (
                    <button
                      key={catId}
                      type="button"
                      onClick={() => selectCategory(c)}
                      className={`group flex w-[88px] shrink-0 flex-col items-center gap-2 rounded-2xl border p-2 transition-all sm:w-[105px] cursor-pointer ${
                        isActive
                          ? "border-green-500 bg-green-50 shadow-xs ring-2 ring-emerald-500/20"
                          : "border-green-100 bg-white hover:border-green-300 hover:bg-green-50/60"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveImageUrl(img, 200)}
                        alt={c.name}
                        loading="lazy"
                        className="h-16 w-16 rounded-full bg-green-50 object-cover sm:h-[76px] sm:w-[76px] transition-transform group-hover:scale-105"
                      />
                      <span className="line-clamp-2 min-h-8 text-center text-[10px] font-bold leading-4 text-gray-700 sm:text-xs">
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Products Header */}
          <section id="products" className="scroll-mt-28">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700 flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>
                    {showFavorites
                      ? "Your saved wishlist items"
                      : search
                      ? "Search results"
                      : "Fresh picks for you"}
                  </span>
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight">
                  {showFavorites
                    ? "Wishlist Favorites"
                    : search
                    ? `Results for "${search}"`
                    : activeCategoryName}
                </h2>

                <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-gray-500">
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between h-full bg-white rounded-3xl border border-gray-100 p-3 shadow-xs animate-pulse"
                  >
                    <div className="w-full aspect-square rounded-2xl bg-slate-100 mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 w-16 bg-slate-100 rounded-md" />
                      <div className="h-4 w-3/4 bg-slate-100 rounded-md" />
                      <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="h-5 w-14 bg-slate-100 rounded-md" />
                      <div className="h-8 w-8 bg-slate-100 rounded-xl" />
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
              /* Product Grid (Responsive 2-col mobile, 3-col tablet, 4-col desktop) */
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                {displayedProducts.map((p) => {
                  const originalPrice = p.originalPrice;
                  const discount =
                    originalPrice && originalPrice > p.price
                      ? Math.round(((originalPrice - p.price) / originalPrice) * 100)
                      : 0;
                  const isFav = favorites.some((f) => String(f) === String(p.id));
                  const cartQty = cart[p.id] || 0;

                  return (
                    <article
                      key={p.id}
                      className="group relative flex flex-col justify-between h-full bg-white rounded-3xl border border-gray-100 p-2.5 sm:p-3 shadow-2xs hover:shadow-xl hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1 active:scale-[0.99] select-none"
                    >
                      <div>
                        {/* Product Image Frame */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#f8faf7] to-[#f0f6ee] aspect-square w-full flex items-center justify-center p-3 sm:p-4 group/img">
                          <Link
                            href={`/products/${p.id}`}
                            className="relative flex h-full w-full items-center justify-center overflow-hidden"
                            aria-label={`View details for ${p.name}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resolveImageUrl(p.image)}
                              alt={p.name}
                              loading="lazy"
                              className="h-full w-full object-contain drop-shadow-sm transition-transform duration-500 ease-out group-hover/img:scale-108"
                            />
                          </Link>

                          {/* Product Badge */}
                          {p.badge && (
                            <span className="absolute left-2.5 top-2.5 rounded-lg bg-[#00875a] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs flex items-center gap-1 sm:text-[10px]">
                              <Sparkles size={10} />
                              <span>{p.badge}</span>
                            </span>
                          )}

                          {/* Wishlist Heart Button */}
                          <button
                            type="button"
                            aria-label={`Toggle favorite for ${p.name}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(p);
                            }}
                            className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-90 shadow-2xs cursor-pointer ${
                              isFav
                                ? "bg-rose-50 text-rose-500 ring-1 ring-rose-200"
                                : "bg-white/90 text-gray-400 hover:text-rose-500 hover:bg-rose-50/60 backdrop-blur-xs"
                            }`}
                          >
                            <Heart
                              size={16}
                              className={`transition-colors ${isFav ? "fill-rose-500 text-rose-500" : ""}`}
                            />
                          </button>

                          {/* Quick Add / Quantity Controls */}
                          <div className="absolute bottom-2.5 right-2.5">
                            {cartQty > 0 ? (
                              <div className="flex h-9 items-center gap-1.5 rounded-xl border-2 border-[#00875a] bg-white px-2 shadow-md">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeQuantity(p.id, -1);
                                  }}
                                  className="w-5 h-5 flex items-center justify-center font-bold text-[#00875a] hover:bg-emerald-50 rounded-md transition-colors active:scale-90 cursor-pointer"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={13} strokeWidth={2.8} />
                                </button>
                                <span className="min-w-[1.2rem] text-center text-xs font-black text-slate-900">
                                  {cartQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeQuantity(p.id, 1);
                                  }}
                                  className="w-5 h-5 flex items-center justify-center font-bold text-[#00875a] hover:bg-emerald-50 rounded-md transition-colors active:scale-90 cursor-pointer"
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={13} strokeWidth={2.8} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                aria-label={`Add ${p.name} to cart`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(p);
                                }}
                                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#00875a] text-white shadow-md shadow-emerald-700/25 transition-all duration-200 hover:bg-[#00734d] hover:scale-110 active:scale-95 cursor-pointer"
                              >
                                <Plus size={18} strokeWidth={2.8} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Product Info Section */}
                        <div className="pt-2.5 pb-1">
                          {/* Category Pill & Unit */}
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                              {p.category}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                              {p.unit}
                            </span>
                          </div>

                          {/* Product Title */}
                          <Link
                            href={`/products/${p.id}`}
                            className="block mt-1 line-clamp-2 text-xs sm:text-sm font-bold text-slate-900 hover:text-[#00875a] transition-colors leading-snug min-h-[2.5rem]"
                          >
                            {p.name}
                          </Link>
                        </div>
                      </div>

                      {/* Price & Delivery Row */}
                      <div className="pt-2 border-t border-gray-100/90 flex items-end justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                              ₹{p.price}
                            </span>
                            {discount > 0 && (
                              <span className="text-[11px] font-semibold text-gray-400 line-through">
                                ₹{p.originalPrice}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 font-medium">
                            ₹{p.price} / {p.unit}
                          </p>
                        </div>

                        {discount > 0 ? (
                          <span className="text-[10px] font-extrabold text-[#00875a] bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            {discount}% OFF
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400">
                            ⚡ 10 MINS
                          </span>
                        )}
                      </div>
                    </article>
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

          <button
            type="button"
            onClick={() => {
              setShowFavorites(true);
              setSearch("");
              document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 cursor-pointer ${
              showFavorites ? "text-green-800 font-bold" : "text-gray-400 hover:text-green-700"
            }`}
          >
            <span className="relative">
              <Heart
                size={21}
                strokeWidth={showFavorites ? 2.4 : 1.8}
                className={showFavorites ? "fill-green-600 text-green-600" : ""}
              />
              {favorites.length > 0 && (
                <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-green-600 px-1 text-[8px] font-bold text-white">
                  {favorites.length}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold">Wishlist</span>
          </button>

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
