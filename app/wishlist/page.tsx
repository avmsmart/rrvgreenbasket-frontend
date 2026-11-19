
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { useWishlist } from "@/context/WishlistContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { WishlistProductItem } from "@/types/wishlist";
import { ProductWeightVariant } from "@/types";
import { WishlistCard } from "@/components/customer/WishlistCard";

export default function WishlistPage() {
  const router = useRouter();

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
  } = useWishlist();

  const { isAuthenticated, isLoading: isAuthLoading } =
    useCustomerAuth();

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fetch wishlist when authentication is ready
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  // Remove individual wishlist item
  const handleRemove = async (
    productPublicId: string,
    productName?: string
  ): Promise<boolean> => {
    setRemovingId(productPublicId);

    try {
      return await removeFromWishlist(productPublicId, productName);
    } finally {
      setRemovingId(null);
    }
  };

  // Move individual item to cart
  const handleMoveToCart = async (
    item: WishlistProductItem,
    variant: ProductWeightVariant
  ): Promise<boolean> => {
    return moveToCart(item, variant, 1);
  };

  // Clear complete wishlist
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
    <div className="flex min-h-[100dvh] flex-col bg-white text-slate-900">

      {/* ================= WISHLIST HEADER ================= */}
      <header className="relative z-10 shrink-0 border-b border-emerald-100 bg-white">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-3 px-4 sm:h-[76px] sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#2f6f5e] transition-colors hover:bg-emerald-50 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2]" />
          </button>

          <div className="flex min-w-0 flex-col justify-center">
            <h1 className="text-[19px] font-semibold tracking-tight text-[#24594b] sm:text-[21px]">
              My Wishlist
            </h1>

            <p className="mt-0.5 text-xs font-medium tracking-wide text-slate-500">
              {wishlistCount}{" "}
              {wishlistCount === 1 ? "item" : "items"} saved
            </p>
          </div>

          {wishlistItems.length > 0 && isAuthenticated && (
            <button
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">

        {/* ================= ERROR MESSAGE ================= */}
        {error && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/60 p-3.5 text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => fetchWishlist()}
                className="inline-flex items-center gap-1 font-semibold hover:text-rose-900"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>

              <button
                type="button"
                onClick={clearError}
                className="font-semibold text-rose-500 hover:text-rose-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ================= AUTH LOADING ================= */}
        {isAuthLoading && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-100 border-t-[#2f6f5e]" />
          </div>
        )}

        {/* ================= UNAUTHENTICATED ================= */}
        {!isAuthLoading && !isAuthenticated && (
          <div className="flex min-h-[55vh] flex-col items-center justify-center px-4 text-center">

            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
              <ShoppingBag className="h-11 w-11 text-[#2f6f5e]" />
            </div>

            <h2 className="text-lg font-semibold tracking-tight text-[#24594b]">
              Sign in to view your wishlist
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              Sign in to see your saved products and move your
              favourite items to your cart.
            </p>

            <Link
              href="/login?redirect=/wishlist"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg border border-[#2f6f5e] px-7 text-xs font-semibold tracking-wide text-[#2f6f5e] transition-colors hover:bg-[#2f6f5e] hover:text-white"
            >
              SIGN IN TO ACCOUNT
            </Link>
          </div>
        )}

        {/* ================= LOADING SKELETON ================= */}
        {isAuthenticated && isLoading && (
          <section>
            <div className="mb-5">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-3 w-52 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="flex flex-col">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border-b border-slate-100 py-4"
                >
                  <div className="h-[100px] w-[100px] shrink-0 animate-pulse rounded-lg bg-slate-100" />

                  <div className="flex flex-1 flex-col gap-3">
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= EMPTY WISHLIST ================= */}
        {isAuthenticated &&
          !isLoading &&
          wishlistItems.length === 0 && (
            <div className="flex min-h-[65vh] flex-col items-center justify-center px-4 py-10 text-center">

              <div className="relative mb-7 flex h-32 w-32 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-50" />

                <div className="absolute inset-3 rounded-full border border-dashed border-emerald-200" />

                <div className="relative flex h-[76px] w-[76px] animate-bounce items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-emerald-100">
                  <ShoppingBag
                    className="h-10 w-10 text-[#2f6f5e]"
                    strokeWidth={1.5}
                  />
                </div>

                <span className="absolute right-3 top-5 h-3 w-3 rounded-full bg-emerald-300" />
                <span className="absolute bottom-5 left-3 h-2.5 w-2.5 rounded-full bg-emerald-200" />
              </div>

              <h2 className="text-xl font-semibold tracking-tight text-[#24594b] sm:text-2xl">
                Hey, it feels so light!
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                There is nothing in your wishlist. Let&apos;s add
                some items.
              </p>

              <Link
                href="/"
                className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg border border-[#2f6f5e] px-8 text-xs font-semibold tracking-wide text-[#2f6f5e] transition-colors duration-200 hover:bg-[#2f6f5e] hover:text-white"
              >
                EXPLORE PRODUCTS
              </Link>
            </div>
          )}

        {/* ================= WISHLIST PRODUCTS ================= */}
        {isAuthenticated &&
          !isLoading &&
          wishlistItems.length > 0 && (
            <section>

              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Your Wishlist
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Your favourite products, saved for later
                  </p>
                </div>

                <span className="text-xs font-semibold text-slate-700">
                  {wishlistCount}{" "}
                  {wishlistCount === 1 ? "Item" : "Items"}
                </span>
              </div>

              {/* One horizontal row per product */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-0 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-6">
                {wishlistItems.map((item) => (
                  <WishlistCard
                    key={
                      item.productPublicId ||
                      item.productId ||
                      item.wishlistItemId
                    }
                    item={item}
                    onMoveToCart={handleMoveToCart}
                    onRemove={handleRemove}
                    isRemoving={removingId === item.productPublicId}
                  />
                ))}
              </div>
            </section>
          )}
      </main>

      {/* ================= CLEAR WISHLIST MODAL ================= */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Trash2 className="h-5 w-5" />
            </div>

            <div className="space-y-1 text-center">
              <h3 className="text-base font-semibold text-slate-900">
                Clear all wishlist items?
              </h3>

              <p className="text-xs leading-relaxed text-slate-500">
                Are you sure you want to remove all{" "}
                {wishlistItems.length} saved items from your
                wishlist? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                disabled={isClearing}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmClear}
                disabled={isClearing}
                className="flex-1 rounded-lg bg-rose-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                {isClearing ? "Clearing..." : "Yes, Clear All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
