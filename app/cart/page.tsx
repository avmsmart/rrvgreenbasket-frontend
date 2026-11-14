"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Leaf,
  ChevronRight,
  Heart,
  Home as HomeIcon,
  RefreshCw,
  AlertTriangle,
  Lock,
  MessageCircle,
} from "lucide-react";
import CustomerNavAuth from "@/components/customer/CustomerNavAuth";
import HomeFooter from "@/components/HomeFooter";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useCart } from "@/context/CartContext";
import {
  CartItemCard,
  CartOrderSummary,
  CartCouponSection,
  CartRecommendations,
  EmptyCart,
  CartLoadingSkeleton,
  CartClearModal,
} from "@/components/cart";

export default function CartPage() {
  const router = useRouter();
  const { settings } = useStoreSettings();
  const { wishlistCount } = useWishlist();
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

  // Handle quantity modification from item card
  const handleUpdateQuantity = async (
    cartItemPublicId: string,
    newQuantity: number
  ) => {
    await updateQuantity(cartItemPublicId, newQuantity);
  };

  // Handle remove item from card
  const handleRemoveItem = async (
    cartItemPublicId: string,
    productName?: string
  ) => {
    await removeItem(cartItemPublicId, productName);
  };

  // Handle confirm clear cart
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

  // Handle Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (itemCount <= 0 || isMutating) return;
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] text-slate-900 flex flex-col justify-between overflow-x-hidden">
      <div>
        {/* =========================================================================
            1. TOP STORE HEADER NAVIGATION
           ========================================================================= */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-3xs">
          <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
            {/* Logo & Store Name */}
            <Link
              href="/"
              className="flex min-w-0 shrink items-center gap-2.5 group cursor-pointer"
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
                <span className="whitespace-nowrap text-[13px] font-black tracking-tight leading-none text-slate-900 sm:text-lg">
                  {settings.storeName || "RRV Green Basket"}
                </span>
                <span className="mt-1 hidden whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:block">
                  {settings.brandTagline || "Farm Fresh Daily"}
                </span>
              </div>
            </Link>

            {/* Navigation Actions */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                aria-label={`Wishlist, ${wishlistCount} items`}
                className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 text-[11px] font-bold text-rose-600 shadow-2xs sm:h-auto sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Heart className="h-3.5 w-3.5 shrink-0 fill-rose-500 text-rose-500" />
                <span className="hidden sm:inline">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="rounded-full bg-rose-600 px-1.5 py-0.2 text-[10px] font-black leading-none text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Active Cart Pill */}
              <div
                aria-label={`Cart, ${itemCount} items`}
                className="flex h-8 shrink-0 items-center gap-1 rounded-full bg-[#00875a] px-3 text-[11px] font-extrabold text-white shadow-sm shadow-emerald-700/20 sm:h-auto sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-xs"
              >
                <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                <span>Cart</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-black leading-none text-white">
                  {itemCount}
                </span>
              </div>

              {/* Customer Account Button */}
              <div className="border-l border-slate-200 pl-2 sm:pl-3">
                <CustomerNavAuth />
              </div>
            </div>
          </div>
        </header>

        {/* =========================================================================
            2. BREADCRUMB NAVIGATION
           ========================================================================= */}
        <div className="bg-white border-b border-emerald-100/60 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Link href="/" className="hover:text-[#00875a] flex items-center gap-1 transition-colors">
                <HomeIcon className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="font-bold text-slate-800">Shopping Cart</span>
            </nav>
          </div>
        </div>

        {/* =========================================================================
            3. PAGE HEADER
           ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  <ShoppingCart className="w-7 h-7 text-[#00875a]" />
                  <span>Shopping Cart</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-[#00875a] text-xs font-black">
                  {itemCount} {itemCount === 1 ? "Item" : "Items"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Fresh produce pre-order items reserved for morning harvest &amp; doorstep delivery
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-3xs transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue Shopping</span>
              </Link>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsClearModalOpen(true)}
                  disabled={isMutating}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/80 px-4 py-2.5 text-xs font-bold text-rose-600 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cart</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. MAIN CART CONTENT AREA
           ========================================================================= */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-2">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 flex items-start justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!isAuthenticated ? (
                  <Link
                    href="/login?redirect=/cart"
                    className="font-bold bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Sign In
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => fetchCart()}
                    className="font-bold underline hover:text-rose-900 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                )}
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
            <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 sm:p-14 text-center max-w-md mx-auto my-8 shadow-xs space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#00875a] border border-emerald-100">
                <ShoppingCart className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900">
                  Sign in to view your cart
                </h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
                  Log in with your verified mobile number to view and manage your active farm pre-order basket.
                </p>
              </div>
              <Link
                href="/mobile-auth"
                className="inline-flex items-center gap-2 rounded-xl bg-[#00875a] hover:bg-[#00734d] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <span>Sign in with Mobile</span>
              </Link>
            </div>
          )}

          {/* Loading Skeleton */}
          {isAuthenticated && isLoading && !cart && <CartLoadingSkeleton />}

          {/* Empty Cart State */}
          {isAuthenticated && !isLoading && items.length === 0 && (
            <div className="space-y-10">
              <EmptyCart />
              <CartRecommendations cartItems={[]} />
            </div>
          )}

          {/* Active Cart with Items */}
          {isAuthenticated && items.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Items List + Coupons + Recommendations */}
              <div className="lg:col-span-8 space-y-6">
                {/* Cart Items List */}
                <div className="space-y-3.5">
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

                {/* Coupon Code Section */}
                <CartCouponSection />

                {/* Recommendations Section */}
                <CartRecommendations cartItems={items} />
              </div>

              {/* Right Column: Sticky Order Summary */}
              <div className="lg:col-span-4 lg:sticky lg:top-24">
                <CartOrderSummary
                  itemCount={itemCount}
                  totalAmount={totalAmount}
                  isMutating={isMutating}
                  onProceedToCheckout={handleProceedToCheckout}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          5. CLEAR CART CONFIRMATION MODAL
         ========================================================================= */}
      <CartClearModal
        isOpen={isClearModalOpen}
        itemCount={itemCount}
        isClearing={isClearing}
        onConfirm={handleConfirmClear}
        onCancel={() => setIsClearModalOpen(false)}
      />

      {/* =========================================================================
          6. FIXED MOBILE STICKY CHECKOUT BAR
         ========================================================================= */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-emerald-100 bg-white/95 p-3.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total ({itemCount} {itemCount === 1 ? "item" : "items"})
              </p>
              <p className="text-xl font-black text-[#00875a] tracking-tight">
                ₹{totalAmount >= 299 || totalAmount === 0 ? totalAmount : totalAmount + 30}
              </p>
            </div>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={isMutating}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#00875a] hover:bg-[#00734d] px-5 text-sm font-black text-white shadow-lg shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>Checkout</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. FIXED MOBILE BOTTOM NAVIGATION
         ========================================================================= */}
      <nav className="fixed inset-x-3 bottom-2 z-[100] rounded-[26px] border border-white/70 bg-white/85 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_8px_32px_rgba(22,55,35,0.18)] backdrop-blur-2xl md:hidden">
        <div className="mx-auto flex h-[60px] max-w-md items-center justify-around">
          <Link
            href="/"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#00875a]"
          >
            <HomeIcon size={20} />
            <span className="text-[10px] font-semibold">Home</span>
          </Link>

          <Link
            href="/wishlist"
            className="relative flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#00875a]"
          >
            <span className="relative">
              <Heart
                size={20}
                className={wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}
              />
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold">Wishlist</span>
          </Link>

          <Link
            href="/cart"
            className="relative flex flex-1 flex-col items-center justify-center gap-1 text-[#00875a] font-bold"
          >
            <span className="relative">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#00875a] px-1 text-[8px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </span>
            <span className="text-[10px]">Cart</span>
          </Link>

          <Link
            href="/contact"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#00875a]"
          >
            <MessageCircle size={20} />
            <span className="text-[10px] font-semibold">Contact</span>
          </Link>
        </div>
      </nav>

      {/* Global Storefront Footer */}
      <HomeFooter />
    </div>
  );
}
