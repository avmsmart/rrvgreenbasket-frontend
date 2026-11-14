"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trash2, Loader2, ExternalLink } from "lucide-react";
import { CartItemResponse } from "@/types/cart";
import { resolveImageUrl } from "@/utils/image-utils";
import { CartQuantitySelector } from "./CartQuantitySelector";

export interface CartItemCardProps {
  item: CartItemResponse;
  isMutating?: boolean;
  onUpdateQuantity: (cartItemPublicId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemPublicId: string, productName?: string) => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  isMutating = false,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const [imageError, setImageError] = useState(false);

  const resolvedImage = item.productImageUrl
    ? resolveImageUrl(item.productImageUrl, 300)
    : "";

  const productLink = item.productPublicId
    ? `/products/${item.productPublicId}`
    : "#";

  return (
    <article className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-sm">
      {/* Left side: Image and details */}
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
        {/* Product Image */}
        <Link
          href={productLink}
          className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl bg-[#f8faf7] border border-emerald-100 p-1 flex items-center justify-center cursor-pointer transition-transform group-hover:scale-102"
        >
          {resolvedImage && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvedImage}
              alt={item.productName}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl select-none">
              🥦
            </div>
          )}
        </Link>

        {/* Product Details */}
        <div className="min-w-0 flex-1 space-y-1">
          <Link
            href={productLink}
            className="block text-sm sm:text-base font-black tracking-tight text-slate-900 hover:text-[#00875a] transition-colors truncate cursor-pointer"
          >
            {item.productName}
          </Link>

          <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span>
              Price: <strong className="text-slate-800">₹{item.pricePerKg}</strong> / {item.unitOfMeasure}
            </span>
          </p>

          <div className="pt-0.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-black text-[#00875a] uppercase tracking-wide">
              Farm Fresh
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Quantity Stepper, Total Price, and Remove Button */}
      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Reusable Stepper */}
        <div>
          <CartQuantitySelector
            quantityKg={item.quantityKg}
            unitOfMeasure={item.unitOfMeasure}
            isMutating={isMutating}
            onUpdate={(newQty) => onUpdateQuantity(item.publicId, newQty)}
            disabled={isMutating}
          />
        </div>

        {/* Item Total Price */}
        <div className="text-right min-w-20">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Subtotal
          </span>
          <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            ₹{item.totalPrice}
          </span>
        </div>

        {/* Remove Button */}
        <div>
          <button
            type="button"
            onClick={() => onRemoveItem(item.publicId, item.productName)}
            disabled={isMutating}
            aria-label={`Remove ${item.productName} from cart`}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isMutating ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
