
"use client";

import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  IndianRupee,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import {
  VerifiedAddress,
  DeliveryVerificationResult,
} from "@/types/location";

interface DeliveryAvailabilityCardProps {
  address: VerifiedAddress;
  result: DeliveryVerificationResult;
  onConfirmSuccess: () => void;
  onSearchAnother: () => void;
  onRetry: () => void;
  isLoading?: boolean;
}

export const DeliveryAvailabilityCard: React.FC<
  DeliveryAvailabilityCardProps
> = ({
  address,
  result,
  onConfirmSuccess,
  onSearchAnother,
  onRetry,
  isLoading = false,
}) => {
  const isAvailable = result.available && result.serviceable;
  const isOutside =
    result.status === "OUTSIDE_RANGE" ||
    (!isAvailable && result.status !== "ROUTE_FAILED");

  const formatDistance = () =>
    result.distanceKm
      ? `${result.distanceKm} km`
      : `< ${result.maxDistanceKm || 10} km`;

  // Delivery available
  if (isAvailable) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-[#00875a]" />
            <div>
              <h3 className="text-base font-bold text-[#24594b]">
                Great! We deliver here.
              </h3>
              <p className="text-xs text-slate-500">
                Your location is within our delivery area.
              </p>
            </div>
          </div>

          <div className="border-y border-slate-100 py-3">
            <p className="text-sm font-semibold text-slate-800">
              {address.displayName || address.city}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {address.formattedAddress}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 shrink-0 text-[#00875a]" />
              <div>
                <p className="text-[10px] text-slate-400">
                  Road distance
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {formatDistance()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 shrink-0 text-[#00875a]" />
              <div>
                <p className="text-[10px] text-slate-400">
                  Delivery fee
                </p>
                <p className="text-sm font-semibold text-[#24594b]">
                  {result.isFreeDelivery || result.deliveryCharge === 0
                    ? "FREE"
                    : `₹${result.deliveryCharge ?? 20}`}
                </p>
              </div>
            </div>

            <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
              <Clock className="h-4 w-4 shrink-0 text-[#00875a]" />
              <div>
                <p className="text-[10px] text-slate-400">
                  Delivery coverage
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {result.maxDistanceKm || 5} km
                </p>
              </div>
            </div>
          </div>

          {result.freeDeliveryThreshold && (
            <p className="flex items-center gap-2 text-xs text-[#24594b]">
              <Sparkles className="h-4 w-4 shrink-0 text-[#00875a]" />
              Free delivery on orders above ₹
              {result.freeDeliveryThreshold}.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onConfirmSuccess}
            disabled={isLoading}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#00875a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006f49] disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm & Continue Shopping
          </button>

          <button
            type="button"
            onClick={onSearchAnother}
            className="min-h-11 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Choose another
          </button>
        </div>
      </div>
    );
  }

  // Location outside delivery coverage
  if (isOutside) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 shrink-0 text-rose-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sorry! We don't deliver here yet.
              </h3>
              <p className="text-xs text-slate-500">
                This location is outside our current delivery area.
              </p>
            </div>
          </div>

          <div className="border-y border-slate-100 py-3">
            <p className="text-sm font-semibold text-slate-800">
              {address.displayName || address.city}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {address.formattedAddress}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <div>
              <p className="text-[10px] text-slate-400">
                Calculated road distance
              </p>
              <p className="font-semibold text-slate-800">
                {result.distanceKm
                  ? `${result.distanceKm} km`
                  : "Outside limits"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-slate-400">
                Maximum coverage
              </p>
              <p className="font-semibold text-slate-800">
                {result.maxDistanceKm || 5} km
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onSearchAnother}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#24594b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#194438]"
        >
          <Search className="h-4 w-4" />
          Search another location
        </button>
      </div>
    );
  }

  // Route calculation or temporary service failure
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Unable to check delivery availability.
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Please check your internet connection and try again.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRetry}
          disabled={isLoading}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#00875a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#006f49] disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>

        <button
          type="button"
          onClick={onSearchAnother}
          className="min-h-11 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Change
        </button>
      </div>
    </div>
  );
};
