"use client";

import React from "react";
import Link from "next/link";
import { Heart, Home as HomeIcon, LayoutGrid, ShoppingCart, UserRound } from "lucide-react";

interface CustomerBottomNavProps {
  wishlistCount: number;
  cartCount: number;
}

/** Floating bottom navigation for mobile. "Categories" is the current page. */
export const CustomerBottomNav: React.FC<CustomerBottomNavProps> = ({
  wishlistCount,
  cartCount,
}) => {
  const idle =
    "flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 transition-colors hover:text-[#00734d]";

  const badge = (count: number, color: string) =>
    count > 0 ? (
      <span
        className={`absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[8px] font-bold text-white ${color}`}
      >
        {count}
      </span>
    ) : null;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-3 bottom-2 z-[100] rounded-[26px] border border-white/70 bg-white/80 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_8px_32px_rgba(22,55,35,0.18)] backdrop-blur-2xl md:hidden"
    >
      <div className="mx-auto flex h-[64px] max-w-md items-center justify-around">
        <Link href="/" className={idle}>
          <HomeIcon size={21} strokeWidth={1.8} />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>

        <Link href="/wishlist" data-nav-wishlist-mobile aria-label="Wishlist" className={idle}>
          <span className="relative">
            <Heart
              size={21}
              strokeWidth={1.8}
              className={wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}
            />
            {badge(wishlistCount, "bg-rose-500")}
          </span>
          <span className="text-[10px] font-semibold">Wishlist</span>
        </Link>

        <span
          aria-current="page"
          className="flex flex-1 flex-col items-center justify-center gap-1 font-bold text-[#00875a]"
        >
          <LayoutGrid size={21} strokeWidth={2.2} />
          <span className="text-[10px]">Categories</span>
        </span>

        <Link href="/cart" data-nav-cart-mobile className={idle}>
          <span className="relative">
            <ShoppingCart size={21} strokeWidth={1.8} />
            {badge(cartCount, "bg-orange-500")}
          </span>
          <span className="text-[10px] font-semibold">Cart</span>
        </Link>

        <Link href="/customer/profile?tab=profile" aria-label="My account" className={idle}>
          <UserRound size={21} strokeWidth={1.8} />
          <span className="text-[10px] font-semibold">Account</span>
        </Link>
      </div>
    </nav>
  );
};

export default CustomerBottomNav;