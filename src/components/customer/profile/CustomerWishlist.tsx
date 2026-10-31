"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  X,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";
import {
  CustomerWishlistItem,
  getStoredWishlist,
  saveStoredWishlist,
} from "@/data/customer-profile-mock";

export const CustomerWishlist: React.FC = () => {
  const [items, setItems] = useState<CustomerWishlistItem[]>([]);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  useEffect(() => {
    setItems(getStoredWishlist());
  }, []);

  const handleRemove = (id: number) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    saveStoredWishlist(updated);
  };

  const handleAddToCart = (item: CustomerWishlistItem) => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("rrv-cart") || "{}");
      savedCart[item.id] = (Number(savedCart[item.id]) || 0) + 1;
      localStorage.setItem("rrv-cart", JSON.stringify(savedCart));

      setAddedMessage(`Added 1 ${item.unit} of ${item.name} to your cart!`);
      setTimeout(() => setAddedMessage(null), 3500);

      window.dispatchEvent(new Event("storage"));
    } catch {
      setAddedMessage("Could not add to cart. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-50 text-pink-700">
                <Heart className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                My Wishlist
              </h1>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Save your favorite vegetables and fruits for quick recurring orders
            </p>
          </div>

          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3.5 py-1.5 rounded-full">
            {items.length} {items.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        {addedMessage && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{addedMessage}</span>
            </div>
            <Link href="/cart" className="font-bold underline text-emerald-950">
              View Cart →
            </Link>
          </div>
        )}

        {items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-50 text-pink-400 border border-pink-100">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-gray-900">
              Your wishlist is empty
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Explore our fresh farm catalog and bookmark fresh produce you love.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3 text-xs font-bold text-white shadow hover:bg-emerald-800 transition active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-md"
              >
                <div>
                  {/* Image container */}
                  <div className="relative h-44 w-full overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    {item.badge && (
                      <span className="absolute left-2.5 top-2.5 rounded-lg bg-emerald-700 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
                        {item.badge}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      title="Remove from wishlist"
                      className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-400 hover:text-red-600 shadow transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="mt-3.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-base font-black text-emerald-800">
                        ₹{item.price}
                      </span>
                      <span className="text-xs text-gray-500">/ {item.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3.5 border-t border-gray-100">
                  {item.inStock ? (
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-800 transition active:scale-95"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full rounded-xl bg-gray-100 py-2.5 text-xs font-semibold text-gray-400 cursor-not-allowed"
                    >
                      Currently Out of Stock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerWishlist;
