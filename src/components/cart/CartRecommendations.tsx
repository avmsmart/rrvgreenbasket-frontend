"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Sparkles, ShoppingCart, Plus, Check, Loader2, ArrowRight } from "lucide-react";
import { StoreProduct } from "@/types";
import { CartItemResponse } from "@/types/cart";
import { productService, mapBackendToStoreProduct } from "@/services/product.service";
import { useCart } from "@/context/CartContext";
import { resolveImageUrl } from "@/utils/image-utils";

export interface CartRecommendationsProps {
  cartItems: CartItemResponse[];
}

export const CartRecommendations: React.FC<CartRecommendationsProps> = ({
  cartItems,
}) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Fetch real products from Product Service
  useEffect(() => {
    let isSubscribed = true;

    const fetchCatalog = async () => {
      try {
        const response = await productService.getStorefrontProducts({ size: 60 });
        const list = response?.content || (Array.isArray(response) ? response : []);
        if (isSubscribed) {
          setProducts(list.map(mapBackendToStoreProduct));
        }
      } catch (err) {
        console.warn("[CartRecommendations] Failed to fetch product catalog:", err);
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    fetchCatalog();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Set of productPublicIds already present in active cart
  const cartProductIds = useMemo(() => {
    return new Set(
      cartItems.map((item) => (item.productPublicId || "").toLowerCase())
    );
  }, [cartItems]);

  // Determine categories in cart to prioritize related items
  const recommendedList = useMemo(() => {
    if (products.length === 0) return [];

    // Filter out items already in the cart
    const availablePool = products.filter(
      (p) =>
        p.available !== false &&
        p.inStock !== false &&
        !cartProductIds.has(String(p.publicId || p.id).toLowerCase())
    );

    // If cart is empty, show top popular farm fresh items
    if (cartItems.length === 0) {
      return availablePool.slice(0, 8);
    }

    // Identify category keywords present in current cart item names
    const cartKeywords = cartItems.map((item) =>
      item.productName.toLowerCase()
    );

    const hasVegetable = cartKeywords.some((name) =>
      /tomato|onion|potato|carrot|spinach|coriander|chilli|cucumber|beans|cabbage|cauliflower|brinjal|ladyfinger|bhindi|garlic|ginger/i.test(
        name
      )
    );

    const hasFruit = cartKeywords.some((name) =>
      /apple|banana|mango|grape|orange|pomegranate|papaya|guava|watermelon|pineapple|strawberry|fruit/i.test(
        name
      )
    );

    // Score products based on category match
    const scored = availablePool.map((prod) => {
      let score = 0;
      const cat = (prod.category || "").toLowerCase();
      const pName = (prod.name || "").toLowerCase();

      if (hasVegetable && (cat.includes("veg") || cat.includes("leafy") || cat.includes("root"))) {
        score += 2;
      }
      if (hasFruit && cat.includes("fruit")) {
        score += 2;
      }
      if (prod.badge === "Bestseller" || prod.badge === "Popular") score += 1;
      return { product: prod, score };
    });

    // Sort by relevance score descending
    scored.sort((a, b) => b.score - a.score);

    return scored.map((s) => s.product).slice(0, 8);
  }, [products, cartItems, cartProductIds]);

  const handleAdd = async (prod: StoreProduct) => {
    const pId = String(prod.publicId || prod.id || "").trim();
    setAddingId(pId);
    try {
      await addToCart(pId, 1, prod.name);
    } finally {
      setTimeout(() => setAddingId(null), 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs animate-pulse space-y-4">
        <div className="h-5 bg-slate-100 rounded-md w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 bg-slate-50 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendedList.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00875a] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              You May Also Like
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Fresh produce pairings hand-picked for your order
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs font-bold text-[#00875a] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Responsive Horizontal Scroll on Mobile / Grid on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {recommendedList.map((prod) => {
          const isAdding = addingId === (prod.publicId || String(prod.id));
          const prodImage = resolveImageUrl(prod.image, 250);

          return (
            <div
              key={prod.id}
              className="rounded-2xl border border-slate-200/80 bg-[#fbfdfa] p-3 flex flex-col justify-between hover:border-emerald-300 hover:shadow-xs transition-all group"
            >
              <div>
                <Link
                  href={`/products/${prod.publicId || prod.id}`}
                  className="block relative h-28 w-full rounded-xl bg-white p-1 overflow-hidden cursor-pointer"
                >
                  <img
                    src={prodImage}
                    alt={prod.name}
                    loading="lazy"
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="mt-2.5 space-y-0.5">
                  <Link
                    href={`/products/${prod.publicId || prod.id}`}
                    className="block text-xs font-black text-slate-900 hover:text-[#00875a] transition-colors truncate cursor-pointer"
                  >
                    {prod.name}
                  </Link>
                  <p className="text-[11px] text-slate-500 font-medium">
                    ₹{prod.price} / {prod.unit || "KG"}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleAdd(prod)}
                  disabled={isAdding}
                  className="w-full py-1.5 px-3 rounded-xl bg-[#00875a] hover:bg-[#00734d] active:scale-95 text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-3xs disabled:opacity-60"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
