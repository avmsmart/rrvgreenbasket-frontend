"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GooglePlacesService } from "@/services/googlePlacesService";
import { GooglePlaceSuggestion, VerifiedAddress } from "@/types/location";

interface UsePlacesAutocompleteOptions {
  debounceMs?: number;
  onSelect?: (address: VerifiedAddress) => void;
}

export function usePlacesAutocomplete({
  debounceMs = 300,
  onSelect,
}: UsePlacesAutocompleteOptions = {}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GooglePlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const sessionTokenRef = useRef<any>(null);
  const activeRequestRef = useRef<number>(0);

  // Initialize or get session token
  const getSessionToken = useCallback(() => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = GooglePlacesService.createSessionToken();
    }
    return sessionTokenRef.current;
  }, []);

  // Reset session token when place is picked
  const resetSessionToken = useCallback(() => {
    sessionTokenRef.current = null;
  }, []);

  // Preload Google Maps API on mount
  useEffect(() => {
    GooglePlacesService.loadGoogleMapsApi().catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
      setSelectedIndex(-1);
      return;
    }

    const requestId = ++activeRequestRef.current;
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const token = getSessionToken();
        const results = await GooglePlacesService.getAutocompleteSuggestions(
          trimmed,
          token
        );
        if (activeRequestRef.current === requestId) {
          setSuggestions(results);
          setSelectedIndex(-1);
        }
      } catch (err: unknown) {
        if (activeRequestRef.current === requestId) {
          console.error("[usePlacesAutocomplete] Search failed:", err);
          setError("Unable to search locations right now. Please try again.");
          setSuggestions([]);
        }
      } finally {
        if (activeRequestRef.current === requestId) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [query, debounceMs, getSessionToken]);

  // Select suggestion handler
  const selectSuggestion = useCallback(
    async (suggestion: GooglePlaceSuggestion): Promise<VerifiedAddress | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const token = getSessionToken();
        const details = await GooglePlacesService.getPlaceDetails(
          suggestion.placeId,
          token
        );
        resetSessionToken();

        if (details) {
          setQuery(details.displayName || details.formattedAddress);
          setSuggestions([]);
          if (onSelect) {
            onSelect(details);
          }
          return details;
        } else {
          setError("Could not retrieve place details. Please try another location.");
          return null;
        }
      } catch (err) {
        console.error("[usePlacesAutocomplete] Select error:", err);
        setError("Failed to fetch address details. Please try again.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getSessionToken, resetSessionToken, onSelect]
  );

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!suggestions.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        const item = suggestions[selectedIndex];
        if (item) {
          selectSuggestion(item);
        }
      } else if (e.key === "Escape") {
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    },
    [suggestions, selectedIndex, selectSuggestion]
  );

  const clear = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setError(null);
    setSelectedIndex(-1);
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    error,
    selectedIndex,
    setSelectedIndex,
    selectSuggestion,
    handleKeyDown,
    clear,
  };
}
