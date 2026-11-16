"use client";

import { useState, useCallback } from "react";
import { deliveryService } from "@/services/delivery.service";
import { GooglePlacesService } from "@/services/googlePlacesService";
import { VerifiedAddress } from "@/types/location";

interface UseCustomerLocationResult {
  isDetecting: boolean;
  error: string | null;
  detectLocation: () => Promise<VerifiedAddress | null>;
  clearError: () => void;
}

export function useCustomerLocation(): UseCustomerLocationResult {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const detectLocation = useCallback(async (): Promise<VerifiedAddress | null> => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Your browser does not support automatic location detection. Please search your address manually.");
      return null;
    }

    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      setError("Location detection requires a secure HTTPS connection. Please search your address manually.");
      return null;
    }

    setIsDetecting(true);
    setError(null);

    return new Promise<VerifiedAddress | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // 1. Try backend reverse-geocoding resolution first
            let resolved: VerifiedAddress | null = null;
            try {
              const backendResult = await deliveryService.resolveLocation(latitude, longitude);
              if (backendResult && backendResult.formattedAddress) {
                resolved = {
                  placeId: backendResult.placeId,
                  displayName: backendResult.displayName || backendResult.city || "Current Location",
                  formattedAddress: backendResult.formattedAddress,
                  addressLine: backendResult.addressLine || "",
                  landmark: backendResult.landmark,
                  city: backendResult.city || "Kurnool",
                  state: backendResult.state || "Andhra Pradesh",
                  pincode: backendResult.pincode || "",
                  latitude,
                  longitude,
                  country: backendResult.country || "India",
                  verifiedAt: new Date().toISOString(),
                };
              }
            } catch {
              // Backend endpoint in transition - fallback to browser geocoding
            }

            // 2. If backend didn't resolve, use Google Places SDK reverse-geocoder
            if (!resolved) {
              resolved = await GooglePlacesService.reverseGeocode(latitude, longitude);
            }

            // 3. Fallback normalized address
            if (!resolved) {
              resolved = {
                displayName: "Current Location",
                formattedAddress: `Kurnool, Andhra Pradesh (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
                city: "Kurnool",
                state: "Andhra Pradesh",
                pincode: "518002",
                latitude,
                longitude,
                country: "India",
                verifiedAt: new Date().toISOString(),
              };
            }

            setIsDetecting(false);
            resolve(resolved);
          } catch (err: unknown) {
            console.error("[useCustomerLocation] Geocode resolution failed:", err);
            setError("Could not resolve your detected coordinates into a valid address. Please search your address manually.");
            setIsDetecting(false);
            resolve(null);
          }
        },
        (geoError) => {
          setIsDetecting(false);
          let message = "We couldn't detect your location. Please try again or search manually.";
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              message = "Please allow location access in your browser or search your address manually.";
              break;
            case geoError.POSITION_UNAVAILABLE:
              message = "We couldn't detect your device's current location. Please try again or search manually.";
              break;
            case geoError.TIMEOUT:
              message = "Location detection timed out. Please retry or search your address manually.";
              break;
          }
          setError(message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  return {
    isDetecting,
    error,
    detectLocation,
    clearError,
  };
}
