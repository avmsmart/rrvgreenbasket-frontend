"use client";

import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  IndianRupee,
  Navigation,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { VerifiedAddress, DeliveryVerificationResult } from "@/types/location";

interface DeliveryAvailabilityCardProps {
  address: VerifiedAddress;
  result: DeliveryVerificationResult;
  onConfirmSuccess: () => void;
  onSearchAnother: () => void;
  onRetry: () => void;
  isLoading?: boolean;
}

export const DeliveryAvailabilityCard: React.FC<DeliveryAvailabilityCardProps> = ({
  address,
  result,
  onConfirmSuccess,
  onSearchAnother,
  onRetry,
  isLoading = false,
}) => {
  const isAvailable = result.available && result.serviceable;
  const isOutside = result.status === "OUTSIDE_RANGE" || (!isAvailable && result.status !== "ROUTE_FAILED");
  const isRouteFailed = result.status === "ROUTE_FAILED";

  // CASE A: DELIVERY AVAILABLE
  if (isAvailable) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-300 bg-gradient-to-b from-emerald-50/80 to-emerald-50/30 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-800">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-black text-emerald-950">
                Great! We deliver to your location.
              </h4>
              <p className="text-[11px] text-emerald-700 font-medium">
                Your address is within our serviceable delivery zone ({result.zoneName || "Kurnool Zone"}).
              </p>
            </div>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-emerald-100 space-y-1">
            <div className="text-xs font-bold text-slate-800">
              {address.displayName || address.city}
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              {address.formattedAddress}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Road Distance</span>
                <span className="font-extrabold text-slate-800">
                  {result.distanceKm ? `${result.distanceKm} km` : "< 5 km"}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Delivery Fee</span>
                <span className="font-extrabold text-emerald-800">
                  {result.isFreeDelivery || result.deliveryCharge === 0
                    ? "FREE"
                    : `₹${result.deliveryCharge ?? 20}`}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 col-span-2 sm:col-span-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Coverage Area</span>
                <span className="font-extrabold text-slate-800">
                  Within {result.maxDistanceKm || 5} km
                </span>
              </div>
            </div>
          </div>

          {result.freeDeliveryThreshold && (
            <p className="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5 bg-emerald-100/60 p-2 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Enjoy free delivery on vegetable & grocery baskets over ₹{result.freeDeliveryThreshold}!</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onConfirmSuccess}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Continue Shopping</span>
          </button>

          <button
            type="button"
            onClick={onSearchAnother}
            className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            Choose Another
          </button>
        </div>
      </div>
    );
  }

  // CASE B: DELIVERY UNAVAILABLE (Outside 5 km)
  if (isOutside) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="p-4 sm:p-5 rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50/80 to-rose-50/30 space-y-4">
          <div className="flex items-start gap-3 text-rose-900">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-black text-rose-950">
                Sorry! We don&apos;t deliver to this location yet.
              </h4>
              <p className="text-[11px] text-rose-800 font-medium mt-0.5">
                Your selected location is outside our current {result.maxDistanceKm || 5} km serviceable delivery coverage.
              </p>
            </div>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-rose-100 space-y-1">
            <div className="text-xs font-bold text-slate-800">
              {address.displayName || address.city}
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              {address.formattedAddress}
            </div>
          </div>

          <div className="p-3 bg-rose-100/50 rounded-xl border border-rose-200 text-xs text-rose-900 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-rose-700 block font-medium">Calculated Road Distance</span>
              <span className="font-extrabold text-sm">
                {result.distanceKm ? `${result.distanceKm} km` : "Outside limits"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-rose-700 block font-medium">Max Delivery Coverage</span>
              <span className="font-bold text-xs">{result.maxDistanceKm || 5} km from Kurnool Hub</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onSearchAnother}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search Another Location</span>
          </button>
        </div>
      </div>
    );
  }

  // CASE C: ROUTE UNAVAILABLE / TEMPORARY FAILURE
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="p-4 sm:p-5 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-3">
        <div className="flex items-start gap-2.5 text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black text-amber-950">
              We couldn&apos;t calculate the delivery distance right now.
            </h4>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Please check your connection and try again, or search for a more specific landmark nearby.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onRetry}
          disabled={isLoading}
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>

        <button
          type="button"
          onClick={onSearchAnother}
          className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition cursor-pointer"
        >
          Change
        </button>
      </div>
    </div>
  );
};
