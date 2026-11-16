"use client";

import React from "react";
import { LocateFixed, Loader2, Navigation } from "lucide-react";
import { useCustomerLocation } from "@/hooks/useCustomerLocation";
import { VerifiedAddress } from "@/types/location";

interface CurrentLocationButtonProps {
  onLocationDetected: (address: VerifiedAddress) => void;
  className?: string;
  disabled?: boolean;
}

export const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({
  onLocationDetected,
  className = "",
  disabled = false,
}) => {
  const { isDetecting, error, detectLocation, clearError } = useCustomerLocation();

  const handleClick = async () => {
    clearError();
    const result = await detectLocation();
    if (result) {
      onLocationDetected(result);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isDetecting}
        className={`w-full group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-left transition-all duration-200 shadow-3xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            {isDetecting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1.5">
              <span>Use My Current Location</span>
              {isDetecting && (
                <span className="text-[10px] text-emerald-700 font-bold animate-pulse">
                  (Detecting GPS...)
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-800/80 font-medium mt-0.5">
              Detect your device location automatically via GPS
            </p>
          </div>
        </div>

        <LocateFixed className="w-4 h-4 text-emerald-700 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
      </button>

      {error && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2 animate-in fade-in">
          <span className="font-bold text-amber-700">Notice:</span>
          <span className="flex-1 leading-relaxed">{error}</span>
        </div>
      )}
    </div>
  );
};
