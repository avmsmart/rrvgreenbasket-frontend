"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import CustomerNavAuth from "@/components/customer/CustomerNavAuth";
import HomeFooter from "@/components/HomeFooter";
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

const getCategoryVisuals = (cat: BackendCategory) => {
  const name = cat.name || "";
  const img = cat.imageUrl || DEFAULT_CATEGORY_IMAGES[name] || DEFAULT_CATEGORY_IMAGES.Vegetables;
  const icon = cat.icon || DEFAULT_CATEGORY_ICONS[name] || "▦";
  return { img, icon };
};

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

  // Delivery location selector (embedded directly in the navigation)
  type DeliveryLocation = {
    latitude: number;
    longitude: number;
    address: string;
    displayName: string;
  };
  type LocationSuggestion = { lat: string; lon: string; display_name: string };
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation | null>(null);
  const [locationCandidate, setLocationCandidate] = useState<DeliveryLocation | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [deliveryCheckLoading, setDeliveryCheckLoading] = useState(false);
  type DeliveryAvailability = {
    available: boolean;
    zonePublicId?: string;
    zoneName?: string;
    deliveryCharge?: number;
    minimumOrderAmount?: number;
    freeDeliveryThreshold?: number;
    estimatedDeliveryTime?: string;
    message?: string;
  };
  const [deliveryAvailability, setDeliveryAvailability] = useState<DeliveryAvailability | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rrv-delivery-location");
      if (saved) {
        const parsed = JSON.parse(saved) as DeliveryLocation & { deliveryAvailability?: DeliveryAvailability };
        if (parsed?.address && Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
          setSelectedLocation(parsed);
          if (parsed.deliveryAvailability) setDeliveryAvailability(parsed.deliveryAvailability);
        }
      }
    } catch {
      localStorage.removeItem("rrv-delivery-location");
    }
  }, []);

  useEffect(() => {
    if (!locationOpen || !locationQuery.trim() || locationCandidate?.address === locationQuery) {
      setLocationSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setLocationLoading(true);
        const params = new URLSearchParams({
          q: `${locationQuery}, Kurnool, Andhra Pradesh, India`,
          format: "jsonv2",
          addressdetails: "1",
          limit: "5",
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          signal: controller.signal,
          headers: { "Accept-Language": "en" },
        });
        if (!response.ok) throw new Error("Address search is unavailable. Please try again.");
        setLocationSuggestions(await response.json());
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setLocationError(error instanceof Error ? error.message : "Unable to search this address.");
        }
      } finally {
        setLocationLoading(false);
      }
    }, 550);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [locationQuery, locationOpen, locationCandidate]);

  async function getReadableLocation(latitude: number, longitude: number): Promise<DeliveryLocation> {
    const params = new URLSearchParams({
      lat: String(latitude), lon: String(longitude), format: "jsonv2", addressdetails: "1",
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: { "Accept-Language": "en" },
    });
    if (!response.ok) throw new Error("Could not find the address for this location.");
    const data = await response.json();
    return {
      latitude,
      longitude,
      address: data.display_name || "Selected map location",
      displayName: data.address?.suburb || data.address?.neighbourhood || data.address?.village ||
        data.address?.town || data.address?.city || "Selected location",
    };
  }

  function detectCustomerLocation() {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location detection.");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const result = await getReadableLocation(coords.latitude, coords.longitude);
        setLocationCandidate(result);
        setLocationQuery(result.address);
        setLocationSuggestions([]);
      } catch (error) {
        setLocationError(error instanceof Error ? error.message : "Unable to detect your address.");
      } finally { setLocationLoading(false); }
    }, (error) => {
      setLocationLoading(false);
      setLocationError(error.code === error.PERMISSION_DENIED
        ? "Location permission denied. Allow access or search for your address."
        : error.code === error.TIMEOUT ? "Location request timed out. Please try again."
        : "Your current location could not be detected.");
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  }

  async function chooseLocationSuggestion(item: LocationSuggestion) {
    try {
      setLocationLoading(true);
      setLocationError("");
      const result = await getReadableLocation(Number(item.lat), Number(item.lon));
      setLocationCandidate(result);
      setLocationQuery(result.address);
      setLocationSuggestions([]);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "Unable to select this address.");
    } finally { setLocationLoading(false); }
  }

  async function confirmDeliveryLocation() {
    if (!locationCandidate || deliveryCheckLoading) return;

    setDeliveryCheckLoading(true);
    setLocationError("");
    setDeliveryAvailability(null);

    try {
      const apiBaseUrl = (
        process.env.NEXT_PUBLIC_CUSTOMER_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://192.168.0.138:8082"
      ).replace(/\/$/, "");

      const response = await fetch(`${apiBaseUrl}/api/delivery/check-availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          latitude: locationCandidate.latitude,
          longitude: locationCandidate.longitude,
          address: locationCandidate.address,
        }),
      });

      const result = await response.json();
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Unable to check delivery availability. Please try again.");
      }

      // API response shape: { success, message, data: { available, zoneName, ... } }
      const availability = result?.data as DeliveryAvailability | undefined;
      if (!availability || typeof availability.available !== "boolean") {
        throw new Error("The delivery service returned an unexpected response.");
      }

      setSelectedLocation(locationCandidate);
      setDeliveryAvailability(availability);
      localStorage.setItem("rrv-delivery-location", JSON.stringify({
        ...locationCandidate,
        deliveryAvailability: availability,
      }));
      setLocationOpen(false);
      setNotice(availability.available
        ? availability.message || `Delivery is available${availability.zoneName ? ` in ${availability.zoneName}` : ""}.`
        : availability.message || "Sorry, delivery is not available at this location.");
    } catch (error) {
      console.error("[Delivery] Availability check failed:", error);
      setLocationError(error instanceof Error ? error.message : "Could not verify this delivery location.");
    } finally {
      setDeliveryCheckLoading(false);
    }
  }

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
    if (!selectedLocation) {
      setNotice("Please select and confirm your delivery location first.");
      setLocationOpen(true);
      return;
    }
    if (!deliveryAvailability?.available) {
      setNotice("Delivery is not available at your selected location. Please choose another location.");
      setLocationOpen(true);
      return;
    }
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

            {/* Mobile Delivery Location Selector - opens inside the navigation */}
            <div className="relative min-w-0 flex-1 md:hidden">
              <button
                type="button"
                onClick={() => {
                  setLocationCandidate(selectedLocation);
                  setLocationQuery(selectedLocation?.address || "");
                  setLocationError("");
                  setLocationOpen((open) => !open);
                }}
                className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-green-100 bg-green-50/70 px-2.5 py-2 text-left"
                aria-expanded={locationOpen}
              >
                <MapPin size={18} className="shrink-0 text-green-700" />
                <span className="min-w-0 leading-tight">
                  <span className="block text-[9px] text-gray-500">Deliver to</span>
                  <span className="block truncate text-[11px] font-bold text-gray-800">
                    {selectedLocation?.displayName || "Select location"}
                  </span>
                </span>
                <ChevronDown size={13} className="shrink-0 text-gray-500" />
              </button>
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

            {/* Desktop Delivery Location Selector - same navigation flow */}
            <div className="relative hidden shrink-0 lg:block">
              <button
                type="button"
                onClick={() => {
                  setLocationCandidate(selectedLocation);
                  setLocationQuery(selectedLocation?.address || "");
                  setLocationError("");
                  setLocationOpen((open) => !open);
                }}
                className="flex items-center gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-green-50"
                aria-expanded={locationOpen}
              >
                <MapPin size={20} className="text-green-700" />
                <span className="leading-tight">
                  <span className="block text-[10px] text-gray-500">Deliver to</span>
                  <span className="flex max-w-[180px] items-center gap-1 truncate text-xs font-bold text-gray-900">
                    {selectedLocation?.displayName || "Select location"}
                    <ChevronDown size={12} />
                  </span>
                </span>
              </button>
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

      {/* Shared location panel anchored below the navigation. It is not a separate page. */}
      {locationOpen && (
        <div className="fixed inset-0 z-[150] bg-black/25" onClick={() => setLocationOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Choose delivery location"
            onClick={(event) => event.stopPropagation()}
            className="absolute left-3 right-3 top-[76px] mx-auto max-w-md rounded-2xl border border-green-100 bg-white p-4 shadow-2xl sm:left-auto sm:right-8 sm:top-[78px]"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Where should we deliver?</h2>
                <p className="mt-1 text-xs text-gray-500">Choose your location before shopping.</p>
              </div>
              <button type="button" onClick={() => setLocationOpen(false)} className="rounded-full bg-gray-100 p-1.5 text-gray-600" aria-label="Close location selector">
                <X size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={detectCustomerLocation}
              disabled={locationLoading}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-bold text-green-800 disabled:opacity-60"
            >
              {locationLoading ? <Loader2 size={15} className="animate-spin" /> : <MapPin size={15} />}
              Use my current location
            </button>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={locationQuery}
                onChange={(event) => {
                  setLocationQuery(event.target.value);
                  setLocationCandidate(null);
                  setLocationError("");
                }}
                placeholder="Search locality, street or landmark"
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-9 text-xs outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
              {locationLoading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-green-700" />}
            </div>
            {locationSuggestions.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
                {locationSuggestions.map((item, index) => (
                  <button
                    key={`${item.lat}-${item.lon}-${index}`}
                    type="button"
                    onClick={() => chooseLocationSuggestion(item)}
                    className="flex w-full items-start gap-2 border-b border-gray-100 px-3 py-2.5 text-left last:border-0 hover:bg-green-50"
                  >
                    <MapPin size={14} className="mt-0.5 shrink-0 text-green-700" />
                    <span className="text-[11px] leading-4 text-gray-700">{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
            {locationCandidate && (
              <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-bold text-green-800"><CheckCircle2 size={14} /> Confirm this location</p>
                <p className="mt-1 text-[11px] leading-4 text-gray-700">{locationCandidate.address}</p>
              </div>
            )}
            {locationError && <p role="alert" className="mt-2 rounded-lg bg-red-50 p-2 text-[11px] text-red-700">{locationError}</p>}
            <button
              type="button"
              onClick={confirmDeliveryLocation}
              disabled={!locationCandidate || locationLoading || deliveryCheckLoading}
              className="mt-3 w-full rounded-xl bg-green-700 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {deliveryCheckLoading ? <><Loader2 size={14} className="animate-spin" /> Checking availability...</> : "Confirm location"}
            </button>
            <p className="mt-2 text-center text-[10px] text-gray-400">Delivery serviceability must be verified by the server at checkout.</p>
          </section>
        </div>
      )}

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
