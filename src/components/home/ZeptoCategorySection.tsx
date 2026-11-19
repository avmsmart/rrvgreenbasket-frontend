"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { StoreProduct, ProductWeightVariant } from "@/types";
import { ZeptoProductCard } from "./ZeptoProductCard";

export interface ZeptoCategorySectionProps {
  title: string;
  subtitle?: string;
  products: StoreProduct[];
  onSeeAll?: () => void;
  isWishlisted: (id: string) => boolean;
  onToggleWishlist: (p: StoreProduct) => void;
  onAddToCart: (
    p: StoreProduct,
    variant: ProductWeightVariant,
    quantity: number
  ) => void;
}

export const ZeptoCategorySection: React.FC<ZeptoCategorySectionProps> = ({
  title,
  subtitle,
  products,
  onSeeAll,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
}) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="my-3.5 flex flex-col">
      {/* 1. SECTION HEADER (Zepto Style) */}
      <div className="flex items-center justify-between px-3 mb-2">
        <div>
          <h3 className="text-[15px] font-extrabold tracking-tight text-slate-900">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] font-medium text-gray-500">{subtitle}</p>
          )}
        </div>

        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="flex items-center gap-0.5 text-[11.5px] font-bold text-[#00875a] hover:underline cursor-pointer active:scale-95"
          >
            <span>See All</span>
            <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* 2. HORIZONTAL SCROLLING PRODUCT CAROUSEL (3 visible cards on mobile) */}
      <div className="flex gap-2.5 overflow-x-auto px-3 pb-2 pt-0.5 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => {
          const publicId = product.publicId || String(product.id);
          const isFav = isWishlisted(publicId);

          return (
            <ZeptoProductCard
              key={publicId}
              product={product}
              isWishlisted={isFav}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
            />
          );
        })}
      </div>

      {/* 3. CENTERED "SEE ALL" ACTION BUTTON (Directly from Zepto reference screenshot) */}
      {onSeeAll && products.length > 3 && (
        <div className="px-3 mt-1.5">
          <button
            type="button"
            onClick={onSeeAll}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white py-2 text-xs font-bold text-slate-800 shadow-2xs transition hover:bg-slate-50 active:scale-98 cursor-pointer"
          >
            <span>See All</span>
            <ChevronRight size={14} className="text-[#00875a]" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </section>
  );
};

export default ZeptoCategorySection;
