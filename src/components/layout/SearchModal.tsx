"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/constants/navigation";

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

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
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

  if (!isOpen) return null;

  const filteredNavItems = ADMIN_NAV_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    handleClose();
    router.push(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-[#16a34a] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules, pages, orders, customers..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">
            Admin Modules ({filteredNavItems.length})
          </div>

          {filteredNavItems.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              No matching modules found for &quot;{query}&quot;.
            </div>
          ) : (
            <ul className="space-y-1">
              {filteredNavItems.map((item) => {
                const IconComponent = ICON_MAP[item.iconName] || Home;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left text-sm text-slate-700 hover:bg-[#eefcf2] hover:text-[#15803d] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-white flex items-center justify-center text-slate-600 group-hover:text-[#15803d] transition-colors">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#15803d] group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tip: Press Ctrl + K anywhere to open search</span>
          <span>RRV Green Basket Admin</span>
        </div>
      </div>
    </div>
  );
};
