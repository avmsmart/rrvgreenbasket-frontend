"use client";

import React from "react";
import { Plus, Minus, Loader2 } from "lucide-react";

export interface CartQuantitySelectorProps {
  quantityKg: number;
  unitOfMeasure: string;
  isMutating?: boolean;
  onUpdate: (newQuantity: number) => void;
  disabled?: boolean;
}

export const CartQuantitySelector: React.FC<CartQuantitySelectorProps> = ({
  quantityKg,
  unitOfMeasure,
  isMutating = false,
  onUpdate,
  disabled = false,
}) => {
  const isKg = (unitOfMeasure || "KG").toUpperCase().includes("KG");
  const step = isKg ? 0.5 : 1.0;
  const minQuantity = isKg ? 0.5 : 1.0;

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isMutating) return;

    const nextVal = Number((quantityKg - step).toFixed(3));
    onUpdate(nextVal <= 0 ? 0 : nextVal);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isMutating) return;

    const nextVal = Number((quantityKg + step).toFixed(3));
    onUpdate(nextVal);
  };

  // Formatted display value
  const displayValue = isKg
    ? quantityKg % 1 === 0
      ? `${quantityKg.toFixed(0)} KG`
      : `${quantityKg.toFixed(1)} KG`
    : `${Math.max(1, Math.round(quantityKg))} ${unitOfMeasure || "Unit"}`;

  return (
    <div className="inline-flex items-center rounded-xl border border-emerald-200/90 bg-[#f8faf7] p-0.5 shadow-3xs transition-all hover:border-emerald-300">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || isMutating}
        aria-label="Decrease quantity"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-3xs transition-all hover:bg-emerald-50 hover:text-[#00875a] active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
      </button>

      <div className="min-w-16 px-2 text-center">
        {isMutating ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00875a]" />
          </div>
        ) : (
          <span className="text-xs font-black tracking-tight text-slate-900 select-none">
            {displayValue}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || isMutating}
        aria-label="Increase quantity"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-3xs transition-all hover:bg-emerald-50 hover:text-[#00875a] active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
      </button>
    </div>
  );
};
