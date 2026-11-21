"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, Percent, ChevronUp } from "lucide-react";
import { useCart } from "@/context/CartContext";

export interface ZeptoFloatingCartProps {
  scrolling?: boolean;
}

export const ZeptoFloatingCart: React.FC<ZeptoFloatingCartProps> = ({
  scrolling = false,
}) => {
  const { itemCount: cartCount, totalAmount: cartTotal } = useCart();

  // If cart is empty, do NOT show fake summary or incorrect count
  if (cartCount <= 0) return null;

  return (
    <div
      className={`fixed bottom-[74px] inset-x-3 z-40 transition-all duration-300 ease-out md:hidden ${
        scrolling ? "pointer-events-none translate-y-16 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-2.5">
        {/* LEFT: OFFERS / SAVINGS PILL (Zepto Style from reference screenshot) */}
        <div className="relative flex flex-1 items-center gap-2 rounded-2xl bg-[#1c2229] px-3 py-2 text-white shadow-xl border border-slate-800">
          {/* Top 'Offers ^' badge */}
          <div className="absolute -top-2.5 left-3 flex items-center gap-0.5 rounded-full bg-white px-2 py-0.5 text-[8.5px] font-black uppercase text-slate-900 shadow-xs border border-slate-100">
            <span>Offers</span>
            <ChevronUp size={9} strokeWidth={3} />
          </div>

          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Percent size={13} strokeWidth={2.5} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-extrabold text-white">
              {cartTotal >= 199
                ? "Free Delivery Unlocked! 🎉"
                : `Unlock Free Delivery`}
            </p>
            <p className="truncate text-[9.5px] text-slate-300">
              {cartTotal >= 199
                ? "Enjoy ₹0 delivery charge"
                : `Shop for ₹${Math.max(0, 199 - cartTotal)} more`}
            </p>
          </div>
        </div>

        {/* RIGHT: FLOATING CART BUTTON (Zepto Signature Pink Pill from reference screenshot) */}
        <Link
          href="/cart"
          className="flex shrink-0 items-center gap-2 rounded-2xl bg-[#ff3269] hover:bg-[#e21b70] px-4 py-2.5 text-white shadow-xl shadow-rose-950/20 active:scale-95 transition-all cursor-pointer border border-rose-400/40"
          aria-label={`View cart with ${cartCount} items`}
        >
          <ShoppingCart size={18} strokeWidth={2.2} />
          <div className="leading-tight text-left">
            <p className="text-[12px] font-black tracking-wide">Cart</p>
            <p className="text-[10px] font-bold text-rose-100">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ZeptoFloatingCart;
