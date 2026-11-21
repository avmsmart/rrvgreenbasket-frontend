
"use client";

import React from "react";
import {
  MapPin,
  Building2,
  Landmark,
} from "lucide-react";
import { GooglePlaceSuggestion } from "@/types/location";

interface LocationSuggestionListProps {
  suggestions: GooglePlaceSuggestion[];
  selectedIndex: number;
  onSelect: (suggestion: GooglePlaceSuggestion) => void;
  isLoading?: boolean;
  query: string;
}

export const LocationSuggestionList: React.FC<
  LocationSuggestionListProps
> = ({
  suggestions,
  selectedIndex,
  onSelect,
  isLoading = false,
  query,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-5 text-sm text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#00875a] border-t-transparent" />
        Searching locations...
      </div>
    );
  }

  if (!suggestions.length && query.trim().length >= 2) {
    return (
      <div className="py-6 text-center">
        <MapPin className="mx-auto h-6 w-6 text-slate-300" />

        <p className="mt-2 text-sm font-semibold text-slate-600">
          No locations found
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Try another area, street or landmark.
        </p>
      </div>
    );
  }

  if (!suggestions.length) return null;

  const getIcon = (types?: string[]) => {
    if (
      types?.includes("establishment") ||
      types?.includes("point_of_interest")
    ) {
      return <Landmark className="h-4 w-4" />;
    }

    if (
      types?.includes("premise") ||
      types?.includes("subpremise") ||
      types?.includes("apartment")
    ) {
      return <Building2 className="h-4 w-4" />;
    }

    return <MapPin className="h-4 w-4" />;
  };

  return (
    <ul
      role="listbox"
      aria-label="Location suggestions"
      className="max-h-64 divide-y divide-slate-100 overflow-y-auto"
    >
      {suggestions.map((suggestion, index) => {
        const isSelected = selectedIndex === index;

        return (
          <li
            key={suggestion.placeId || index}
            role="option"
            aria-selected={isSelected}
          >
            <button
              type="button"
              onClick={() => onSelect(suggestion)}
              className={`flex w-full items-start gap-3 px-2 py-3 text-left transition ${
                isSelected
                  ? "bg-emerald-50"
                  : "hover:bg-slate-50"
              }`}
            >
              <span className="mt-0.5 shrink-0 text-slate-400">
                {getIcon(suggestion.types)}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-800">
                  {suggestion.mainText}
                </span>

                {suggestion.secondaryText && (
                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                    {suggestion.secondaryText}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
