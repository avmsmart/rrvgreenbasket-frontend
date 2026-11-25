"use client";

import React from "react";
import { ChevronDown, Clock } from "lucide-react";
import { useLocation } from "@/context/LocationContext";

interface LocationNavbarProps {
  variant?: "desktop" | "mobile" | "compact";
  className?: string;
}

export const LocationNavbar: React.FC<LocationNavbarProps> = ({
  variant = "desktop",
  className = "",
}) => {
  const { selectedAddress, availability, openLocationModal } = useLocation();

  const isAvailable = availability ? availability.available : true;

  const locationLabel = selectedAddress
    ? selectedAddress.displayName || selectedAddress.city || "Kurnool"
    : "Select Location";

  const isMobile = variant === "mobile" || variant === "compact";

  return (
    <button
      type="button"
      onClick={openLocationModal}
      className={`group flex min-w-0 max-w-full items-center gap-2 text-left ${className}`}
      aria-label={`Delivery location: ${locationLabel}. Click to change.`}
    >
      <span className="min-w-0 text-center leading-tight">
        {/* Line 1: big */}
        <span
          className={`flex items-center justify-center gap-1.5 font-extrabold text-emerald-800 ${
            isMobile ? "text-[17px]" : "text-lg"
          }`}
        >
          <Clock className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">Delivery by 10:00 AM</span>
        </span>

        {/* Line 2: medium (current location) */}
        <span className="mt-0.5 flex min-w-0 items-center justify-center gap-1.5">
          <span
            className={`truncate font-semibold text-slate-700 ${
              isMobile ? "text-[13px]" : "text-sm"
            }`}
          >
            {locationLabel}
          </span>

          {selectedAddress && (
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                isAvailable ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
          )}

          <ChevronDown className="h-3 w-3 shrink-0 text-slate-400 transition-transform group-hover:translate-y-0.5" />
        </span>
      </span>

      {!isMobile && (
        <span className="ml-1 text-[11px] font-semibold text-emerald-700 group-hover:underline">
          Change
        </span>
      )}
    </button>
  );
};