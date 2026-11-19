
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Loader2, X } from "lucide-react";
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
    <article
      className={`grid grid-cols-[76px_minmax(0,1fr)] gap-x-3 gap-y-3 border-b border-slate-200 py-5 transition-opacity sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:gap-x-5 sm:py-6 ${
        isMutating ? "opacity-60" : ""
      }`}
    >
      {/* Product Image - No card, border or background */}
      <Link
        href={productLink}
        aria-label={`View ${item.productName}`}
        className="flex h-[76px] w-[76px] items-center justify-center sm:h-28 sm:w-28"
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
          <span className="text-3xl">🥦</span>
        )}
      </Link>

      {/* Product Details */}
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={productLink}
            className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors hover:text-[#2f6f5e] sm:text-base"
          >
            {item.productName}
          </Link>

          {/* Mobile Remove */}
          <button
            type="button"
            onClick={() => onRemoveItem(item.publicId, item.productName)}
            disabled={isMutating}
            aria-label={`Remove ${item.productName} from cart`}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-slate-400 transition hover:text-red-600 disabled:opacity-50 sm:hidden"
          >
            {isMutating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        </div>

        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Price:{" "}
          <strong className="font-semibold text-slate-800">
            ₹{item.pricePerKg}
          </strong>{" "}
          / {item.unitOfMeasure}
        </p>

        <span className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#00875a]">
          Farm Fresh
        </span>

        {/* Mobile Quantity and Subtotal */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 sm:hidden">
          <CartQuantitySelector
            quantityKg={item.quantityKg}
            unitOfMeasure={item.unitOfMeasure}
            isMutating={isMutating}
            onUpdate={(newQty) =>
              onUpdateQuantity(item.publicId, newQty)
            }
            disabled={isMutating}
          />

          <div className="text-right">
            <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Subtotal
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              ₹{item.totalPrice}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Quantity, Subtotal and Remove */}
      <div className="hidden items-center gap-5 sm:flex">
        <CartQuantitySelector
          quantityKg={item.quantityKg}
          unitOfMeasure={item.unitOfMeasure}
          isMutating={isMutating}
          onUpdate={(newQty) =>
            onUpdateQuantity(item.publicId, newQty)
          }
          disabled={isMutating}
        />

        <div className="min-w-[75px] text-right">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Subtotal
          </span>
          <span className="text-base font-extrabold text-slate-900">
            ₹{item.totalPrice}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRemoveItem(item.publicId, item.productName)}
          disabled={isMutating}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-red-600 disabled:opacity-50"
        >
          {isMutating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          Remove
        </button>
      </div>
    </article>
  );
};
