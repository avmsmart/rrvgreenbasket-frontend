"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Trash2,
  ShoppingBag,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { WishlistProductItem } from "@/types/wishlist";
import { ProductWeightVariant } from "@/types";
import { WishlistCard } from "@/components/customer/WishlistCard";

export const CustomerWishlist: React.FC = () => {
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

  const { isAuthenticated } = useCustomerAuth();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  const handleRemove = async (productPublicId: string, productName?: string): Promise<boolean> => {
    setRemovingId(productPublicId);
    try {
      return await removeFromWishlist(productPublicId, productName);
    } finally {
      setRemovingId(null);
    }
  };

  const handleMoveToCart = async (
    item: WishlistProductItem,
    variant: ProductWeightVariant
  ): Promise<boolean> => {
    return moveToCart(item, variant, 1);
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>Saved Wishlist Produce</span>
            {wishlistCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {wishlistCount}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Produce items you have saved to re-order quickly. Select your preferred weight variant and click Move to Cart.
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Wishlist</span>
          </button>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchWishlist()}
              className="font-bold underline hover:text-rose-900 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
            <button
              onClick={clearError}
              className="text-rose-500 hover:text-rose-800 font-bold ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 p-3 shadow-2xs animate-pulse space-y-3"
            >
              <div className="w-full h-32 bg-slate-100 rounded-xl" />
              <div className="h-3 bg-slate-100 rounded-md w-1/3" />
              <div className="h-4 bg-slate-100 rounded-md w-3/4" />
              <div className="h-8 bg-slate-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && wishlistItems.length === 0 && (
        <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-12 text-center max-w-md mx-auto my-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">
            No items in your wishlist
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t saved any produce items yet. Save your favourite farm products from our catalog to re-order quickly.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00875a] hover:bg-[#00734d] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Farm Catalog</span>
          </Link>
        </div>
      )}

      {/* Items Grid */}
      {!isLoading && wishlistItems.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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

      {/* Clear Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Clear all wishlist items?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove all {wishlistItems.length} items from your wishlist?
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
    </div>
  );
};

export default CustomerWishlist;
