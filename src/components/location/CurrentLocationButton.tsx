
"use client";

import React from "react";
import {
  LocateFixed,
  Loader2,
} from "lucide-react";
import { useCustomerLocation } from "@/hooks/useCustomerLocation";
import { VerifiedAddress } from "@/types/location";

interface CurrentLocationButtonProps {
  onLocationDetected: (address: VerifiedAddress) => void;
  className?: string;
  disabled?: boolean;
}

export const CurrentLocationButton: React.FC<
  CurrentLocationButtonProps
> = ({
  onLocationDetected,
  className = "",
  disabled = false,
}) => {
  const {
    isDetecting,
    error,
    detectLocation,
    clearError,
  } = useCustomerLocation();

  const handleClick = async () => {
    clearError();

    const result = await detectLocation();

    if (result) {
      onLocationDetected(result);
    }
  };

  return (
    <div className={`w-full sm:w-auto ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isDetecting}
        className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-center sm:gap-2 sm:rounded-md sm:bg-[#008f36] sm:px-3 sm:py-3 sm:text-white sm:hover:bg-[#007d30]"
      >
        {isDetecting ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#00875a] sm:text-white" />
        ) : (
          <LocateFixed className="h-5 w-5 shrink-0 text-[#00875a] sm:text-white" />
        )}

        <span className="text-sm font-semibold text-[#24594b] sm:whitespace-nowrap sm:text-white">
          {isDetecting
            ? "Detecting location..."
            : "Use current location"}
        </span>
      </button>

      {error && (
        <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800 sm:absolute sm:mt-1 sm:max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
};
