"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Home,
  Box,
  Package,
  ShoppingCart,
  ShoppingBasket,
  PackageCheck,
  Truck,
  UserCheck,
  Share2,
  CreditCard,
  Ticket,
  BarChart3,
  Layers,
  Settings,
  ArrowRight,
  User,
  Tag,
  Store,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/constants/navigation";
import { MASTER_PRODUCTS_DATA, MOCK_ORDERS_DATA, MOCK_CUSTOMERS_PAGE17 } from "@/data";
import { getSavedCoupons, getSavedSectors } from "@/data/shared-store";
import { ProduceImage } from "@/components/common/ProduceImage";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Box,
  Package,
  ShoppingCart,
  ShoppingBasket,
  PackageCheck,
  Truck,
  UserCheck,
  Share2,
  CreditCard,
  Ticket,
  BarChart3,
  Layers,
  Settings,
};

type SearchTab = "all" | "products" | "orders" | "customers" | "sectors" | "coupons" | "pages";

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveTab("all");
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = React.useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  // Keyboard shortcut listener for ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Search Results Calculations
  const q = query.trim().toLowerCase();

  const matchingProducts = useMemo(() => {
    if (!q) return [];
    return MASTER_PRODUCTS_DATA.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.excelName && p.excelName.toLowerCase().includes(q)) ||
        (p.erpCode && p.erpCode.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [q]);

  const matchingOrders = useMemo(() => {
    if (!q) return [];
    return MOCK_ORDERS_DATA.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        (o.customerAddress && o.customerAddress.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [q]);

  const matchingCustomers = useMemo(() => {
    if (!q) return [];
    return MOCK_CUSTOMERS_PAGE17.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [q]);

  const matchingSectors = useMemo(() => {
    if (!q) return [];
    return getSavedSectors()
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [q]);

  const matchingCoupons = useMemo(() => {
    if (!q) return [];
    return getSavedCoupons()
      .filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.offerName.toLowerCase().includes(q) ||
          c.discount.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [q]);

  const matchingPages = useMemo(() => {
    if (!q) return [];
    return ADMIN_NAV_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [q]);

  const totalResults =
    matchingProducts.length +
    matchingOrders.length +
    matchingCustomers.length +
    matchingSectors.length +
    matchingCoupons.length +
    matchingPages.length;

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    handleClose();
    router.push(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-3 sm:px-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3 shrink-0">
          <Search className="w-5 h-5 text-[#00875a] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, orders, customers, sectors, coupons, pages..."
            className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md font-mono">
            ESC
          </kbd>
        </div>

        {/* Category Filter Tabs (visible when searching) */}
        {q && (
          <div className="flex items-center gap-1 px-4 py-2 bg-slate-50/80 border-b border-slate-100 overflow-x-auto scrollbar-none shrink-0">
            {[
              { id: "all", label: "All", count: totalResults },
              { id: "products", label: "Products", count: matchingProducts.length },
              { id: "orders", label: "Orders", count: matchingOrders.length },
              { id: "customers", label: "Customers", count: matchingCustomers.length },
              { id: "sectors", label: "Sectors", count: matchingSectors.length },
              { id: "coupons", label: "Coupons", count: matchingCoupons.length },
              { id: "pages", label: "Pages", count: matchingPages.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SearchTab)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-[#00875a] text-white shadow-3xs"
                    : "text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/80 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Results Container */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-4 flex-1">
          {/* 1. If Query is empty: Show Popular Quick Shortcuts */}
          {!q && (
            <div className="space-y-4 py-2">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#00875a]" />
                  Quick Module Navigation
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ADMIN_NAV_ITEMS.slice(0, 6).map((item) => {
                    const Icon = ICON_MAP[item.iconName] || Home;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.path)}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 text-left transition-all group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-[#00875a]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#00875a] truncate">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Popular Produce Searches
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["Tomato", "Onion", "Potato", "Broccoli", "Capsicum", "Spinach", "Carrot", "Mushroom"].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. No Results State */}
          {q && totalResults === 0 && (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl">
                🔍
              </div>
              <h4 className="text-sm font-bold text-slate-800">No results found for &quot;{query}&quot;</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                We couldn&apos;t find any products, orders, customers, sectors, or coupons matching your search.
              </p>
            </div>
          )}

          {/* 3. Products Results */}
          {(activeTab === "all" || activeTab === "products") && matchingProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Products ({matchingProducts.length})</span>
                <button
                  onClick={() => handleSelect(`/admin/products?search=${encodeURIComponent(query)}`)}
                  className="text-[#00875a] hover:underline normal-case font-bold"
                >
                  View all in Products →
                </button>
              </div>
              <div className="space-y-1.5">
                {matchingProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(`/admin/products?search=${encodeURIComponent(p.name)}`)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all shadow-3xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ProduceImage name={p.name} src={p.imageUrl} size={34} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#00875a] truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {p.erpCode || p.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {p.category} • In Stock: {p.stock} {p.unit}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-black text-xs sm:text-sm text-slate-900">
                        ₹ {p.price} / {p.unit}
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
                          p.stock > 10
                            ? "bg-emerald-50 text-emerald-700"
                            : p.stock > 0
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Orders Results */}
          {(activeTab === "all" || activeTab === "orders") && matchingOrders.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Orders ({matchingOrders.length})</span>
                <button
                  onClick={() => handleSelect(`/admin/orders?search=${encodeURIComponent(query)}`)}
                  className="text-[#00875a] hover:underline normal-case font-bold"
                >
                  View all in Orders →
                </button>
              </div>
              <div className="space-y-1.5">
                {matchingOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => handleSelect(`/admin/orders?search=${encodeURIComponent(o.id)}`)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all shadow-3xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-slate-900 group-hover:text-[#00875a]">
                            {o.id}
                          </span>
                          <span className="font-bold text-xs text-slate-700 truncate">
                            {o.customerName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {o.itemsCount} items • {o.orderDate || o.orderTime}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-black text-xs sm:text-sm text-slate-900">
                        ₹ {o.amount}
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Customers Results */}
          {(activeTab === "all" || activeTab === "customers") && matchingCustomers.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Customers ({matchingCustomers.length})</span>
                <button
                  onClick={() => handleSelect(`/admin/customers?search=${encodeURIComponent(query)}`)}
                  className="text-[#00875a] hover:underline normal-case font-bold"
                >
                  View in Customers →
                </button>
              </div>
              <div className="space-y-1.5">
                {matchingCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(`/admin/customers?search=${encodeURIComponent(c.name)}`)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all shadow-3xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#00875a] truncate">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {c.phone} • {c.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-black text-xs text-slate-900">
                        ₹ {c.totalSpent} spent
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {c.totalOrders} orders
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Sectors Results */}
          {(activeTab === "all" || activeTab === "sectors") && matchingSectors.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Sectors ({matchingSectors.length})</span>
                <button
                  onClick={() => handleSelect(`/admin/sectors?search=${encodeURIComponent(query)}`)}
                  className="text-[#00875a] hover:underline normal-case font-bold"
                >
                  View in Sectors →
                </button>
              </div>
              <div className="space-y-1.5">
                {matchingSectors.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelect(`/admin/sectors?search=${encodeURIComponent(s.name)}`)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all shadow-3xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-lg flex-shrink-0">
                        {s.icon || "📦"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#00875a] truncate">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {s.description || `${s.productsCount || 0} products mapped`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-bold text-xs text-slate-900">
                        {s.productsCount || 0} items
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700">
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Coupons Results */}
          {(activeTab === "all" || activeTab === "coupons") && matchingCoupons.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Coupons &amp; Offers ({matchingCoupons.length})</span>
                <button
                  onClick={() => handleSelect(`/admin/coupons?search=${encodeURIComponent(query)}`)}
                  className="text-[#00875a] hover:underline normal-case font-bold"
                >
                  View in Coupons →
                </button>
              </div>
              <div className="space-y-1.5">
                {matchingCoupons.map((cpn) => (
                  <div
                    key={cpn.id}
                    onClick={() => handleSelect(`/admin/coupons?search=${encodeURIComponent(cpn.code)}`)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all shadow-3xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs sm:text-sm text-slate-900 group-hover:text-[#00875a]">
                            {cpn.code}
                          </span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                            {cpn.discount}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {cpn.offerName} • Min order ₹{cpn.minOrder}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-xs font-bold text-slate-700">
                        {cpn.usage}
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
                        {cpn.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Admin Navigation Pages Results */}
          {(activeTab === "all" || activeTab === "pages") && matchingPages.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Admin Pages ({matchingPages.length})
              </div>
              <div className="space-y-1.5">
                {matchingPages.map((item) => {
                  const IconComponent = ICON_MAP[item.iconName] || Home;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item.path)}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all shadow-3xs group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-[#00875a] flex items-center justify-center text-slate-600 group-hover:text-white transition-colors">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-[#00875a]">
                          {item.label}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#00875a] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Tip: Press Ctrl + K anywhere to open search</span>
          <span className="font-bold text-emerald-800">RRV Green Basket Live Omnibar</span>
        </div>
      </div>
    </div>
  );
};
