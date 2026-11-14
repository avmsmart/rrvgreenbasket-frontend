"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  Leaf,
  Sparkles,
  Tag,
  CheckCircle2,
  Lock,
} from "lucide-react";

export interface CartOrderSummaryProps {
  itemCount: number;
  totalAmount: number;
  isMutating?: boolean;
  onProceedToCheckout?: () => void;
}

export const CartOrderSummary: React.FC<CartOrderSummaryProps> = ({
  itemCount,
  totalAmount,
  isMutating = false,
  onProceedToCheckout,
}) => {
  const router = useRouter();

  const handleCheckout = () => {
    if (itemCount <= 0 || isMutating) return;
    if (onProceedToCheckout) {
      onProceedToCheckout();
    } else {
      router.push("/checkout");
    }
  };

  return (
    <aside className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Order Summary
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Based on active backend cart items
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-black text-[#00875a]">
          {itemCount} {itemCount === 1 ? "Item" : "Items"}
        </span>
      </div>

      {/* Pricing Lines */}
      <div className="space-y-3.5 text-xs sm:text-sm">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-slate-600 font-medium">
          <span>Items Subtotal</span>
          <span className="font-extrabold text-slate-900">₹{totalAmount}</span>
        </div>

        {/* Delivery Charges */}
        <div className="flex items-center justify-between text-slate-600 font-medium">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivery Charges</span>
          </span>
          <span className="font-extrabold text-[#00875a]">
            {totalAmount >= 299 ? "FREE" : "Standard ₹30"}
          </span>
        </div>

        {/* Free delivery threshold helper */}
        {totalAmount < 299 && totalAmount > 0 && (
          <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-2.5 text-[11px] font-semibold text-emerald-800 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Add <strong className="font-black">₹{299 - totalAmount}</strong> more for FREE Delivery!
            </span>
          </div>
        )}

        {/* Coupon Discount */}
        <div className="flex items-center justify-between text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Coupon Discount</span>
          </span>
          <span className="font-extrabold text-slate-700">₹0</span>
        </div>

        {/* Total Divider */}
        <div className="pt-4 border-t border-dashed border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900">
                Cart Total
              </span>
              <p className="text-[10px] text-slate-400 font-medium">
                Taxes & slot verified at checkout
              </p>
            </div>
            <span className="text-2xl font-black text-[#00875a] tracking-tight">
              ₹{totalAmount >= 299 || totalAmount === 0 ? totalAmount : totalAmount + 30}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={itemCount <= 0 || isMutating}
          className="w-full h-12 sm:h-13 rounded-2xl bg-[#00875a] hover:bg-[#00734d] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Lock className="w-4 h-4" />
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-center text-slate-400 font-medium flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Safe &amp; Secure Pre-Order Checkout</span>
        </p>
      </div>

      {/* Freshness & Trust Features */}
      <div className="pt-4 border-t border-slate-100 space-y-2.5">
        <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#00875a] flex items-center justify-center shrink-0">
            <Leaf className="w-3.5 h-3.5" />
          </div>
          <span>Harvested fresh daily from trusted local farms</span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#00875a] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span>Zero-hassle replacement if quality doesn&apos;t satisfy</span>
        </div>
      </div>
    </aside>
  );
};
