
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Leaf,
  CheckCircle2,
} from "lucide-react";

export interface CartOrderSummaryProps {
  itemCount: number;
  totalAmount: number;
  isMutating?: boolean;
  onProceedToCheckout?: () => void;
}

const FREE_DELIVERY_AT = 299;
const DELIVERY_FEE = 30;

export const CartOrderSummary: React.FC<CartOrderSummaryProps> = ({
  itemCount,
  totalAmount,
  isMutating = false,
  onProceedToCheckout,
}) => {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  const isFree = totalAmount >= FREE_DELIVERY_AT || totalAmount === 0;
  const grandTotal = isFree ? totalAmount : totalAmount + DELIVERY_FEE;
  const remaining = FREE_DELIVERY_AT - totalAmount;
  const progress = Math.min(100, (totalAmount / FREE_DELIVERY_AT) * 100);
  const disabled = itemCount <= 0 || isMutating;

  const handleCheckout = () => {
    if (disabled) return;

    if (onProceedToCheckout) {
      onProceedToCheckout();
    } else {
      router.push("/checkout");
    }
  };

  return (
    <>
      {/* ================= DESKTOP ORDER SUMMARY ================= */}
      <aside className="hidden space-y-4 rounded-xl border border-slate-100 bg-white p-5 lg:block">

        <h2 className="text-sm font-bold text-slate-900">
          Price Details ({itemCount} {itemCount === 1 ? "Item" : "Items"})
        </h2>

        {/* Free delivery progress */}
        {totalAmount > 0 && (
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-xs font-semibold text-emerald-800">
              {isFree ? (
                "You've unlocked FREE delivery 🎉"
              ) : (
                <>
                  Add <strong>₹{remaining}</strong> more for FREE delivery
                </>
              )}
            </p>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100">
              <div
                className="h-full rounded-full bg-[#00875a] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Price breakdown */}
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <dt>Items Subtotal</dt>
            <dd className="font-semibold text-slate-900">
              ₹{totalAmount}
            </dd>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <dt className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-[#00875a]" />
              Delivery Charges
            </dt>
            <dd className="font-semibold text-[#00875a]">
              {isFree ? "FREE" : `₹${DELIVERY_FEE}`}
            </dd>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <dt>Coupon Discount</dt>
            <dd className="font-semibold text-slate-700">₹0</dd>
          </div>
        </dl>

        <div className="border-t border-dashed border-slate-200 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-base font-bold text-slate-900">
                Total Amount
              </span>
              <p className="text-[10px] text-slate-400">
                Taxes &amp; slot verified at checkout
              </p>
            </div>

            <span className="text-2xl font-extrabold text-slate-900">
              ₹{grandTotal}
            </span>
          </div>
        </div>

        {/* Desktop checkout */}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={disabled}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#00875a] text-sm font-bold text-white transition hover:bg-[#00734d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Proceed to Checkout
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-[#00875a]" />
          100% safe &amp; secure checkout
        </p>

        <div className="space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#00875a]">
              <Leaf className="h-3.5 w-3.5" />
            </span>
            Harvested fresh daily from trusted local farms
          </div>

          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#00875a]">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
            Zero-hassle replacement if quality doesn't satisfy
          </div>
        </div>
      </aside>

      {/* ================= MOBILE CHECKOUT BAR ================= */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.08)] lg:hidden">

        {/* Expandable price details */}
        {showDetails && (
          <div className="max-h-[55vh] overflow-y-auto border-b border-slate-100 px-4 py-4">
            <div className="mx-auto max-w-md space-y-4">

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Price Details
                </h3>

                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className="text-xs font-semibold text-[#00875a]"
                >
                  Close
                </button>
              </div>

              {totalAmount > 0 && (
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-xs font-semibold text-emerald-800">
                    {isFree
                      ? "You've unlocked FREE delivery 🎉"
                      : `Add ₹${remaining} more for FREE delivery`}
                  </p>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                    <div
                      className="h-full rounded-full bg-[#00875a] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <dt>Items Subtotal</dt>
                  <dd className="font-semibold text-slate-900">
                    ₹{totalAmount}
                  </dd>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <dt className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-[#00875a]" />
                    Delivery Charges
                  </dt>
                  <dd className="font-semibold text-[#00875a]">
                    {isFree ? "FREE" : `₹${DELIVERY_FEE}`}
                  </dd>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <dt>Coupon Discount</dt>
                  <dd className="font-semibold">₹0</dd>
                </div>
              </dl>

              <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                <span className="font-bold text-slate-900">
                  Total Amount
                </span>
                <span className="text-lg font-extrabold text-[#2f6f5e]">
                  ₹{grandTotal}
                </span>
              </div>

              <p className="text-[10px] text-slate-400">
                Taxes &amp; slot verified at checkout
              </p>
            </div>
          </div>
        )}

        {/* Always visible bottom row */}
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">

          {/* Total and View Details */}
          <div className="min-w-[76px] shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Total
            </p>

            <p className="text-lg font-extrabold leading-tight text-slate-900">
              ₹{grandTotal}
            </p>

            <button
              type="button"
              onClick={() => setShowDetails((previous) => !previous)}
              aria-expanded={showDetails}
              className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#00875a]"
            >
              View Details
              {showDetails ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUp className="h-3 w-3" />
              )}
            </button>
          </div>

          {/* Checkout button */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={disabled}
            className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#00875a] px-3 text-sm font-bold text-white shadow-md shadow-emerald-700/15 transition hover:bg-[#00734d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            CHECKOUT
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>

        </div>
      </div>
    </>
  );
};
