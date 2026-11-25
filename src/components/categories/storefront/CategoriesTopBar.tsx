"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Leaf,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import CustomerNavAuth from "@/components/customer/CustomerNavAuth";
import { LocationNavbar } from "@/components/location";
import { useStoreSettings } from "@/context/StoreSettingsContext";

interface CategoriesTopBarProps {
  /** Name of the selected category ("All" when none) */
  title: string;
  search: string;
  onSearchChange: (value: string) => void;
  wishlistCount: number;
  cartCount: number;
  cartTotal: number;
}

/**
 * Header for the categories page.
 *  - Mobile: back arrow, category title, delivery location, search toggle.
 *  - Desktop: logo, search, location, account, wishlist and cart.
 * A breadcrumb sits underneath on every screen size.
 */
export const CategoriesTopBar: React.FC<CategoriesTopBarProps> = ({
  title,
  search,
  onSearchChange,
  wishlistCount,
  cartCount,
  cartTotal,
}) => {
  const { settings } = useStoreSettings();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mobileSearchOpen) mobileInputRef.current?.focus();
  }, [mobileSearchOpen]);

  const searchPlaceholder = "Search fruits, vegetables, groceries...";

  return (
    <header className="z-40 shrink-0 border-b border-slate-100 bg-white">
      <div className="mx-auto max-w-[1600px] px-3 sm:px-5 lg:px-6">
        {/* ------------------------------ Mobile ------------------------------ */}
        <div className="flex min-h-14 items-center gap-2 py-2 md:hidden">
          <Link
            href="/"
            aria-label="Back to home"
            className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 active:scale-95"
          >
            <ChevronLeft size={20} />
          </Link>

          <div className="min-w-0 flex-1 leading-tight">
            <h1 className="truncate text-[15px] font-extrabold text-slate-900">{title}</h1>
            <div className="relative min-w-0">
              <LocationNavbar variant="compact" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label={mobileSearchOpen ? "Close search" : "Search products"}
            aria-expanded={mobileSearchOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 active:scale-95"
          >
            {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
        </div>

        {mobileSearchOpen && (
          <div className="pb-2.5 md:hidden">
            <div className="flex h-10 items-center rounded-full border border-slate-200 bg-slate-50 px-3 focus-within:border-[#00875a] focus-within:bg-white">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                ref={mobileInputRef}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-hidden placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Clear search"
                  className="p-1 text-slate-400"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------ Desktop ----------------------------- */}
        <div className="hidden min-h-[68px] items-center gap-4 md:flex lg:gap-5">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            {settings.logoUrl ? (
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-green-100 bg-white p-0.5 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  className="h-full w-full object-contain"
                />
              </span>
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00875a] text-white shadow-md shadow-emerald-700/20">
                <Leaf size={22} />
              </span>
            )}
            <span className="leading-tight">
              <span className="block text-lg font-extrabold tracking-tight text-slate-900">
                {settings.storeName || "RRV Green Basket"}
              </span>
              <span className="block text-[9px] font-medium text-slate-500">
                {settings.brandTagline || "Freshness delivered daily"}
              </span>
            </span>
          </Link>

          <div className="flex h-[42px] min-w-0 flex-1 items-center rounded-full border border-slate-200 bg-white px-3 transition-colors focus-within:border-[#00875a]">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-hidden placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="hidden min-w-[205px] max-w-[245px] shrink-0 lg:block">
            <LocationNavbar variant="desktop" />
          </div>

          <div className="hidden shrink-0 border-l border-slate-100 pl-3 lg:block">
            <CustomerNavAuth />
          </div>

          <Link
            href="/wishlist"
            data-nav-wishlist
            aria-label="Wishlist"
            className="flex shrink-0 items-center gap-1.5 border-l border-slate-100 pl-3 text-slate-700 transition-colors hover:text-[#00734d]"
          >
            <span className="relative">
              <Heart size={20} className={wishlistCount > 0 ? "fill-rose-50 text-rose-500" : ""} />
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </span>
            <span className="hidden text-xs font-medium xl:block">Wishlist</span>
          </Link>

          <Link
            href="/cart"
            data-nav-cart
            className="flex shrink-0 items-center gap-2 border-l border-slate-100 pl-3 text-slate-800 transition-colors hover:text-[#00734d]"
          >
            <span className="relative">
              <ShoppingCart size={21} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="leading-tight">
              <span className="block text-[11px] font-semibold">Cart</span>
              <span className="block text-[10px] font-bold text-[#00875a]">₹{cartTotal}</span>
            </span>
          </Link>
        </div>

        {/* ----------------------------- Breadcrumb ---------------------------- */}
        <nav aria-label="Breadcrumb" className="pb-2 md:pb-2.5">
          <ol className="flex items-center gap-1 text-xs text-slate-500">
            <li>
              <Link href="/" className="hover:text-[#00734d]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={12} />
            </li>
            <li className="truncate font-bold text-slate-800" aria-current="page">
              {title}
            </li>
          </ol>
        </nav>
      </div>
    </header>
  );
};

export default CategoriesTopBar;