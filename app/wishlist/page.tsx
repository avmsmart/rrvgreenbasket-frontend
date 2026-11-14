"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ShoppingBag,
  AlertTriangle,
  RefreshCw,
  Leaf,
  ChevronRight,
  Home as HomeIcon,
} from "lucide-react";
import CustomerNavAuth from "@/components/customer/CustomerNavAuth";
import HomeFooter from "@/components/HomeFooter";
import { useWishlist } from "@/context/WishlistContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { WishlistProductItem } from "@/types/wishlist";
import { ProductWeightVariant } from "@/types";
import { WishlistCard } from "@/components/customer/WishlistCard";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { settings } = useStoreSettings();
  const {
    wishlistItems,
    wishlistCount,
    isLoading,
    error,
    fetchWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist,
    clearError,
    showToast,
  } = useWishlist();

  const { isAuthenticated, isLoading: isAuthLoading } = useCustomerAuth();
  const { itemCount: cartCount } = useCart();

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fetch full wishlist on mount or auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  // Remove individual item with feedback
  const handleRemove = async (productPublicId: string, productName?: string): Promise<boolean> => {
    setRemovingId(productPublicId);
    try {
      return await removeFromWishlist(productPublicId, productName);
    } finally {
      setRemovingId(null);
    }
  };

  // Move individual item to cart with selected variant (PART 6)
  const handleMoveToCart = async (
    item: WishlistProductItem,
    variant: ProductWeightVariant
  ): Promise<boolean> => {
    return moveToCart(item, variant, 1);
  };

  // Clear all items with confirmation
  const handleConfirmClear = async () => {
    setIsClearing(true);
    try {
      const success = await clearWishlist();
      if (success) {
        setIsClearModalOpen(false);
      }
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] text-slate-900 flex flex-col justify-between">
      <div>
        {/* =========================================================================
            1. TOP NAVBAR
            ========================================================================= */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-3xs">
          <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
            {/* Compact, non-wrapping brand */}
            <Link
              href="/"
              className="flex min-w-0 shrink items-center gap-2 group cursor-pointer"
              aria-label={settings.storeName || "RRV Green Basket home"}
            >
              {settings.logoUrl ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-green-100 p-0.5 shadow-sm overflow-hidden">
                  <img
                    src={settings.logoUrl}
                    alt={settings.storeName}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00875a] to-emerald-700 text-white shadow-sm shadow-emerald-700/20 transition-transform group-hover:scale-105">
                  <Leaf className="h-5 w-5" />
                </div>
              )}
              <div className="flex min-w-0 flex-col">
                <span className="whitespace-nowrap text-[13px] font-semibold tracking-tight leading-none text-slate-900 sm:text-lg">
                  {settings.storeName || "RRV Green Basket"}
                </span>
                <span className="mt-1 hidden whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:block">
                  {settings.brandTagline || "Farm Fresh Daily"}
                </span>
              </div>
            </Link>

            {/* Keep all actions on one line on narrow screens */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              {/* Wishlist: icon and count on mobile, full label on larger screens */}
              <div
                aria-label={`Wishlist, ${wishlistCount} items`}
                className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-rose-200/80 bg-rose-50 px-2 text-[11px] font-semibold text-rose-600 shadow-2xs sm:h-auto sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs"
              >
                <Heart className="h-3.5 w-3.5 shrink-0 fill-rose-500 text-rose-500" />
                <span className="hidden sm:inline">Wishlist</span>
                <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                  {wishlistCount}
                </span>
              </div>

              {/* Cart Pill */}
              <Link
                href="/cart"
                aria-label="View shopping cart"
                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#00875a] border border-slate-200/80 transition-colors shadow-3xs cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00875a] px-1 text-[10px] font-black text-white ring-2 ring-white shadow-2xs">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Customer Auth Component */}
              <div className="shrink-0 [&_button]:whitespace-nowrap [&_a]:whitespace-nowrap">
                <CustomerNavAuth />
              </div>
            </div>
          </div>
        </header>

        {/* =========================================================================
            2. BREADCRUMBS & HERO BANNER
            ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
          <nav
            aria-label="Breadcrumbs"
            className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4"
          >
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-[#00875a] transition-colors"
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">Wishlist</span>
          </nav>

          {/* Page Title & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100/60">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  My Saved Wishlist
                </h1>
                {wishlistCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    {wishlistCount} {wishlistCount === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Your saved farm-fresh produce. Move items directly to your cart whenever you are ready to order.
              </p>
            </div>

            {/* Clear All Button */}
            {wishlistItems.length > 0 && isAuthenticated && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsClearModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 bg-rose-50/40 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-3xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Wishlist</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            3. MAIN CONTENT: WISHLIST CARDS GRID / STATES
            ========================================================================= */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchWishlist()}
                  className="font-bold underline hover:text-rose-900 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
                <button
                  type="button"
                  onClick={clearError}
                  className="text-rose-500 hover:text-rose-800 font-bold ml-2 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Unauthenticated State */}
          {!isAuthLoading && !isAuthenticated && (
            <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 sm:p-14 text-center max-w-md mx-auto my-8 shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100">
                <Heart className="w-7 h-7" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Sign in to view your wishlist
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Log in with your verified mobile number to view and move your saved fresh fruits and vegetables to your cart.
              </p>
              <Link
                href="/mobile-auth"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00875a] hover:bg-[#00734d] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <span>Sign in with Mobile</span>
              </Link>
            </div>
          )}

          {/* Loading Skeleton Grid */}
          {isAuthenticated && isLoading && (
            <div className="grid grid-cols-1 gap-2.5 pt-2 md:grid-cols-2 md:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-row items-center gap-3 rounded-xl border border-emerald-50 bg-white p-2.5 shadow-2xs animate-pulse md:flex-col md:items-stretch md:rounded-2xl md:p-3 md:space-y-3"
                >
                  <div className="h-[88px] w-[88px] shrink-0 rounded-lg bg-slate-100 md:h-36 md:w-full md:rounded-xl" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/3" />
                  <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                  <div className="h-9 bg-slate-100 rounded-xl w-full pt-2" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {isAuthenticated && !isLoading && wishlistItems.length === 0 && (
            <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 sm:p-14 text-center max-w-md mx-auto my-8 shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100">
                <Heart className="w-7 h-7" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Your wishlist is empty
              </h2>
              <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                You haven&apos;t saved any produce items yet. Explore our fresh vegetables and fruits and tap the heart icon on any card to save it.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00875a] hover:bg-[#00734d] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Products</span>
              </Link>
            </div>
          )}

          {/* =========================================================================
              4. REDESIGNED PRODUCT GRID (PART 5 & PART 10 RESPONSIVE)
              Desktop: 4 cards / 5 cards per row
              Mobile: 2 cards per row (grid-cols-2)
              ========================================================================= */}
          {isAuthenticated && !isLoading && wishlistItems.length > 0 && (
            <div className="grid grid-cols-1 gap-2.5 pt-2 md:grid-cols-2 md:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
              {wishlistItems.map((item) => (
                <WishlistCard
                  key={item.productPublicId || item.productId || item.wishlistItemId}
                  item={item}
                  onMoveToCart={handleMoveToCart}
                  onRemove={handleRemove}
                  isRemoving={removingId === item.productPublicId}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          5. CLEAR ALL CONFIRMATION MODAL
          ========================================================================= */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Clear all wishlist items?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove all {wishlistItems.length} saved produce items from your wishlist? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                disabled={isClearing}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                disabled={isClearing}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-rose-600/20 disabled:opacity-50"
              >
                {isClearing ? "Clearing..." : "Yes, Clear All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
