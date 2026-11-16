"use client";

import React from "react";
import { MapPin, ChevronDown } from "lucide-react";
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

  // Desktop layout:
  // [Location Icon] Delivering to
  // [Customer Selected Address] [Change]
  if (variant === "desktop") {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={openLocationModal}
          className="group flex items-center gap-2.5 px-3 py-1.5 rounded-2xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-100 transition-all duration-200 text-left cursor-pointer"
          aria-label={`Delivery location: ${locationLabel}. Click to change.`}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MapPin className="w-4 h-4 text-emerald-700" />
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Delivering to
              </span>
              {selectedAddress && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isAvailable ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                  }`}
                  title={isAvailable ? "Serviceable" : "Outside delivery area"}
                />
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-slate-800 max-w-[140px] xl:max-w-[180px] truncate">
                {locationLabel}
              </span>
              <span className="text-[11px] font-bold text-emerald-700 group-hover:underline ml-1">
                Change
              </span>
            </div>
          </div>
        </button>
      </div>
    );
  }

  // Mobile layout:
  // [Location Icon] [Selected Location / Select Location] [Chevron]
  return (
    <div className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={openLocationModal}
        className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-2.5 py-1.5 text-left transition hover:bg-emerald-100/60 cursor-pointer"
        aria-label={`Delivery location: ${locationLabel}. Tap to change.`}
      >
        <MapPin className="w-4 h-4 shrink-0 text-emerald-700" />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-400">
            Deliver to
          </span>
          <span className="flex items-center gap-1">
            <span className="block truncate text-[11px] font-black text-slate-900">
              {locationLabel}
            </span>
            {selectedAddress && (
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isAvailable ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
            )}
          </span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
      </button>
    </div>
  );
};
