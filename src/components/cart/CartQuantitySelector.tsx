
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

  const displayValue = isKg
    ? quantityKg % 1 === 0
      ? `${quantityKg.toFixed(0)} KG`
      : `${quantityKg.toFixed(1)} KG`
    : `${Math.max(1, Math.round(quantityKg))} ${unitOfMeasure || "Unit"}`;

  const buttonClass =
    "flex h-8 w-8 items-center justify-center rounded-full text-[#2f6f5e] transition-all hover:bg-emerald-50 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9";

  return (
    <div className="inline-flex items-center gap-1 bg-white">

      {/* Decrease */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || isMutating}
        aria-label="Decrease quantity"
        className={buttonClass}
      >
        <Minus className="h-4 w-4 stroke-[2.2]" />
      </button>

      {/* Quantity */}
      <div className="flex min-w-[58px] items-center justify-center px-1">
        {isMutating ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#2f6f5e]" />
        ) : (
          <span className="whitespace-nowrap text-xs font-bold text-slate-800 sm:text-sm">
            {displayValue}
          </span>
        )}
      </div>

      {/* Increase */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || isMutating}
        aria-label="Increase quantity"
        className={buttonClass}
      >
        <Plus className="h-4 w-4 stroke-[2.2]" />
      </button>
    </div>
  );
};
