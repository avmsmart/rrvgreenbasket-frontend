
"use client";

import React from "react";
import { MapPin, ChevronDown, Clock } from "lucide-react";
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
      className={`group flex min-w-0 items-center gap-2 text-left ${className}`}
      aria-label={`Delivery location: ${locationLabel}. Click to change.`}
    >
      <MapPin
        className={`shrink-0 text-emerald-700 ${
          isMobile ? "h-4 w-4" : "h-5 w-5"
        }`}
      />

      <span className="min-w-0 leading-tight">
        <span className="block text-[10px] font-medium text-slate-500">
          Delivering to
        </span>

        <span className="flex min-w-0 items-center gap-1">
          <span
            className={`truncate font-bold text-slate-900 ${
              isMobile ? "text-xs" : "text-sm"
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

        <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-emerald-700">
          <Clock className="h-3 w-3 shrink-0" />
          Delivery by 10:00 AM
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
