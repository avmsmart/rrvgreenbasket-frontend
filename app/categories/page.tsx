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

interface ProductListState {
  products: StoreProduct[];
  page: number;
  hasMore: boolean;
  /** Largest discount (%) that comes from a real originalPrice set in admin */
  maxDiscount: number;
}

const EMPTY_LIST: ProductListState = { products: [], page: 0, hasMore: false, maxDiscount: 0 };

/**
 * Real discount for one raw backend product. The product mapper invents an
 * originalPrice when none is set, so the percentage has to be read from the
 * raw record, not from the mapped StoreProduct.
 */
function realDiscountPercent(raw: Record<string, unknown>): number {
  const sell = Number(raw.pricePerKg ?? raw.price);
  const orig = Number(raw.originalPrice);
  if (!Number.isFinite(sell) || !Number.isFinite(orig) || sell <= 0 || orig <= sell) return 0;
  return Math.round(((orig - sell) / orig) * 100);
}

/** True when a product belongs to the category (by id, or exact name). */
function belongsToCategory(p: StoreProduct, cat: BackendCategory): boolean {
  if (p.categoryId !== undefined && p.categoryId !== null && String(p.categoryId) === cat.publicId) {
    return true;
  }
  return (p.category || "").trim().toLowerCase() === (cat.name || "").trim().toLowerCase();
}

/**
 * Customer categories page (Zepto-style).
 *   - Left: scrollable category rail
 *   - Right: banner + product grid for the selected category
 *
 * The selected category is kept in the URL (?category=<slug>) so the page can
 * be refreshed or linked to directly, e.g. from the home page.
 */
function CategoriesContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");

  const { itemCount: cartCount, totalAmount: cartTotal } = useCart();
  const { wishlistCount, checkBulkWishlistStatus } = useWishlist();

  // ---- Categories ---------------------------------------------------------
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

      // The backend does not reliably filter by categoryId, so filter here too
      // (this is what the old categories page did as well).
      const category = categoryId ? categories.find((c) => c.publicId === categoryId) : undefined;
      if (category) items = items.filter((i) => belongsToCategory(i.product, category));

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
    <main className="flex h-dvh flex-col bg-[#f6f9f3] text-[#20392a]">
      <CategoriesTopBar
        title={title}
        search={search}
        onSearchChange={setSearch}
        wishlistCount={wishlistCount}
        cartCount={cartCount}
        cartTotal={cartTotal}
      />

      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1">
        <CategoryRail
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