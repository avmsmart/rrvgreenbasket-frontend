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
  FolderTree,
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
import { getSavedCoupons } from "@/data/shared-store";
import { ProduceImage } from "@/components/common/ProduceImage";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";

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
  FolderTree,
  Settings,
};

type SearchTab = "all" | "products" | "orders" | "customers" | "categories" | "coupons" | "pages";

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load public categories when modal opens
  useEffect(() => {
    if (isOpen) {
      categoryService
        .getPublicCategories()
        .then((cats) => setCategories(cats))
        .catch(() => {});
    }
  }, [isOpen]);

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

  const matchingCategories = useMemo(() => {
    if (!q) return [];
    return categories
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [categories, q]);

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
    matchingCategories.length +
    matchingCoupons.length +
    matchingPages.length;

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    handleClose();
    router.push(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
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
            placeholder="Search products, orders, customers, categories, coupons, pages..."
            className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
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
              { id: "categories", label: "Categories", count: matchingCategories.length },
              { id: "coupons", label: "Coupons", count: matchingCoupons.length },
              { id: "pages", label: "Pages", count: matchingPages.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SearchTab)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 1. Empty Query State (Quick links) */}
          {!q && (
            <div className="space-y-4 py-2">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#00875a]" />
                  <span>Popular Quick Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Tomatoes", "Onions", "Potato", "Fruits", "Organic", "Delivery", "Coupons"].map(
                    (tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-[#00875a] hover:border-emerald-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Quick Navigation
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ADMIN_NAV_ITEMS.slice(0, 6).map((item) => {
                    const IconComponent = ICON_MAP[item.iconName] || Home;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.path)}
                        className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 text-left transition-all group cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#00875a] flex items-center justify-center text-slate-600 group-hover:text-white transition-colors">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-[#00875a]">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
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
                We couldn&apos;t find any products, orders, customers, categories, or coupons matching your search.
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
                  className="text-[#00875a] hover:underline normal-case font-bold cursor-pointer"
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
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded">
                            {p.erpCode || p.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {p.category} • Pack: {(p as any).packQty || p.unit || "1 Kg"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-black text-xs sm:text-sm text-[#00875a]">
                        ₹{p.pricePerKg}
                        <span className="text-[10px] text-slate-400 font-normal"> /Kg</span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700">
                        {p.stockStatus}
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
                  className="text-[#00875a] hover:underline normal-case font-bold cursor-pointer"
                >
                  View in Orders →
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
                          <span className="font-mono font-black text-xs sm:text-sm text-slate-900 group-hover:text-[#00875a]">
                            {o.id}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-700">
                            {o.customerName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {o.customerPhone} • {o.itemsCount} items
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-black text-xs text-slate-900">
                        ₹{((o as any).totalAmount || (o as any).finalAmount || (o as any).total || 0).toLocaleString()}
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
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
                  className="text-[#00875a] hover:underline normal-case font-bold cursor-pointer"
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
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center flex-shrink-0">
                        {c.name.charAt(0)}
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
                      <div className="font-bold text-xs text-slate-800">
                        {(c as any).ordersCount ?? (c as any).totalOrders ?? 0} orders
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Spent ₹{c.totalSpent.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Categories Results */}
          {(activeTab === "all" || activeTab === "categories") && matchingCategories.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Categories ({matchingCategories.length})</span>
                <button
                  onClick={() => handleSelect(`/admin/categories?search=${encodeURIComponent(query)}`)}
                  className="text-[#00875a] hover:underline normal-case font-bold cursor-pointer"
                >
                  View in Categories →
                </button>
              </div>
              <div className="space-y-1.5">
                {matchingCategories.map((c) => (
                  <div
                    key={c.publicId}
                    onClick={() => handleSelect(`/admin/categories?search=${encodeURIComponent(c.name)}`)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all shadow-3xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00875a] flex items-center justify-center flex-shrink-0">
                        <FolderTree className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#00875a] truncate">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {c.description || `slug: ${c.slug}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          c.isActive
                            ? "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]"
                            : "bg-rose-50 text-rose-600 border-rose-200"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
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
                  className="text-[#00875a] hover:underline normal-case font-bold cursor-pointer"
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
