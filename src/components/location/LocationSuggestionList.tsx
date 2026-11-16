"use client";

import React from "react";
import { MapPin, Building2, Landmark, Navigation } from "lucide-react";
import { GooglePlaceSuggestion } from "@/types/location";

interface LocationSuggestionListProps {
  suggestions: GooglePlaceSuggestion[];
  selectedIndex: number;
  onSelect: (suggestion: GooglePlaceSuggestion) => void;
  isLoading?: boolean;
  query: string;
}

export const LocationSuggestionList: React.FC<LocationSuggestionListProps> = ({
  suggestions,
  selectedIndex,
  onSelect,
  isLoading = false,
  query,
}) => {
  if (isLoading) {
    return (
      <div className="py-6 px-4 text-center space-y-2">
        <div className="inline-block w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">
          Searching matching locations in Kurnool...
        </p>
      </div>
    );
  }

  if (!suggestions.length && query.trim().length >= 2) {
    return (
      <div className="py-8 px-4 text-center space-y-2">
        <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-xs sm:text-sm font-bold text-slate-700">No matching locations found</p>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
          Try searching for a prominent landmark, street, colony name (e.g. Rajivihar, Kondareddy Burj, Checkpost, Bus Stand), or PIN code.
        </p>
      </div>
    );
  }

  if (!suggestions.length) {
    return null;
  }

  const getIconForTypes = (types?: string[]) => {
    if (!types || !types.length) return <MapPin className="w-4 h-4 text-emerald-600" />;
    if (types.includes("establishment") || types.includes("point_of_interest")) {
      return <Landmark className="w-4 h-4 text-emerald-600" />;
    }
    if (types.includes("premise") || types.includes("subpremise") || types.includes("apartment")) {
      return <Building2 className="w-4 h-4 text-emerald-600" />;
    }
    return <MapPin className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <ul
      role="listbox"
      aria-label="Location suggestions"
      className="max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white shadow-lg [scrollbar-width:thin]"
    >
      {suggestions.map((suggestion, idx) => {
        const isSelected = selectedIndex === idx;
        return (
          <li
            key={suggestion.placeId || idx}
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(suggestion)}
            className={`p-3 sm:p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-left ${
              isSelected ? "bg-emerald-50/80" : "hover:bg-slate-50"
            }`}
          >
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0 mt-0.5">
              {getIconForTypes(suggestion.types)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {suggestion.mainText}
              </div>
              {suggestion.secondaryText && (
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {suggestion.secondaryText}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
