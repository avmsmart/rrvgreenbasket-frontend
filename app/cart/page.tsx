
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useCart } from "@/context/CartContext";

import {
  CartItemCard,
  CartOrderSummary,
  CartCouponSection,
  EmptyCart,
  CartLoadingSkeleton,
  CartClearModal,
} from "@/components/cart";

export default function CartPage() {
  const router = useRouter();

  const { isAuthenticated, isLoading: isAuthLoading } = useCustomerAuth();

  const {
    cart,
    items,
    itemCount,
    totalAmount,
    isLoading,
    isMutating,
    mutatingItemIds,
    error,
    fetchCart,
    updateQuantity,
    removeItem,
    clearCart,
    clearError,
  } = useCart();

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleUpdateQuantity = async (
    cartItemPublicId: string,
    newQuantity: number
  ) => {
    await updateQuantity(cartItemPublicId, newQuantity);
  };

  const handleRemoveItem = async (
    cartItemPublicId: string,
    productName?: string
  ) => {
    await removeItem(cartItemPublicId, productName);
  };

  const handleConfirmClear = async () => {
    setIsClearing(true);

    try {
      const success = await clearCart();

      if (success) {
        setIsClearModalOpen(false);
      }
    } finally {
      setIsClearing(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (itemCount <= 0 || isMutating) return;
    router.push("/checkout");
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-x-hidden overflow-y-auto bg-white text-slate-900 lg:overflow-hidden">

      {/* ================= CART HEADER ================= */}
      {/* Normal flow: disappears when the page scrolls on mobile */}
      
{/* ================= CART HEADER ================= */}
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
        My Cart
      </h1>

      <p className="mt-0.5 text-xs font-medium tracking-wide text-slate-500">
        {itemCount} {itemCount === 1 ? "item" : "items"} in your basket
      </p>
    </div>

  </div>
</header>


      {/* ================= MAIN CART CONTENT ================= */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-3 sm:px-6 lg:h-[calc(100dvh-64px)] lg:min-h-0 lg:overflow-hidden lg:px-8 lg:pb-4">

        {/* Error Banner */}
        {error && (
          <div className="mb-4 flex shrink-0 items-start justify-between gap-3 border-b border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{error}</span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {!isAuthenticated ? (
                <Link
                  href="/login?redirect=/cart"
                  className="rounded-lg bg-rose-600 px-3 py-1 font-bold text-white transition hover:bg-rose-700"
                >
                  Sign In
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => fetchCart()}
                  className="flex items-center gap-1 font-bold underline hover:text-rose-900"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
              )}

              <button
                type="button"
                onClick={clearError}
                className="ml-2 font-bold text-rose-500 hover:text-rose-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Unauthenticated State */}
        {!isAuthLoading && !isAuthenticated && (
          <div className="mx-auto my-8 max-w-md space-y-4 border border-dashed border-emerald-200 bg-white p-8 text-center sm:p-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center bg-emerald-50 text-[#2f6f5e]">
              <ShoppingCart className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">
                Sign in to view your cart
              </h2>

              <p className="mx-auto max-w-sm text-xs font-medium leading-relaxed text-slate-500">
                Sign in to your customer account to view and manage your active
                farm pre-order basket.
              </p>
            </div>

            <Link
              href="/login?redirect=/cart"
              className="inline-flex items-center gap-2 bg-[#2f6f5e] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#24594b]"
            >
              Sign In to Account
            </Link>
          </div>
        )}

        {/* Loading */}
        {isAuthenticated && isLoading && !cart && (
          <CartLoadingSkeleton />
        )}

        {/* Empty Cart - No Recommendations */}
        {isAuthenticated && !isLoading && items.length === 0 && (
          <div className="lg:h-full lg:overflow-y-auto">
            <EmptyCart />
          </div>
        )}

        {/* ================= ACTIVE CART ================= */}
        {isAuthenticated && items.length > 0 && (
          <div className="grid grid-cols-1 items-start gap-6 lg:h-full lg:min-h-0 lg:grid-cols-12 lg:gap-8">

            {/* ================= LEFT: SCROLLABLE PRODUCTS ================= */}
            <div className="min-w-0 lg:col-span-8 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-3">

              <section className="bg-white">

                <div className="flex items-center justify-between border-b border-slate-200 py-3">
                  <h2 className="text-sm font-bold text-slate-800">
                    Your Items
                  </h2>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-[#2f6f5e]">
                      {itemCount} {itemCount === 1 ? "Item" : "Items"}
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsClearModalOpen(true)}
                      disabled={isMutating || isClearing}
                      className="text-xs font-semibold text-rose-500 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.publicId}
                      item={item}
                      isMutating={mutatingItemIds.includes(item.publicId)}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                    />
                  ))}
                </div>

              </section>
            </div>

            {/* ================= RIGHT: COUPON + ORDER SUMMARY ================= */}
            <aside className="min-w-0 space-y-4 lg:col-span-4 lg:self-start">

              <CartCouponSection />

              <CartOrderSummary
                itemCount={itemCount}
                totalAmount={totalAmount}
                isMutating={isMutating}
                onProceedToCheckout={handleProceedToCheckout}
              />

            </aside>

          </div>
        )}
      </main>

      {/* ================= CLEAR CART MODAL ================= */}
      <CartClearModal
        isOpen={isClearModalOpen}
        itemCount={itemCount}
        isClearing={isClearing}
        onConfirm={handleConfirmClear}
        onCancel={() => setIsClearModalOpen(false)}
      />

      {/* Mobile checkout bar is rendered by CartOrderSummary */}

    </div>
  );
}
