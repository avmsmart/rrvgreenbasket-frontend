"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  VerifiedAddress,
  DeliveryVerificationResult,
  StoreLocationResponse,
} from "@/types/location";
import { deliveryService } from "@/services/delivery.service";

interface LocationContextType {
  selectedAddress: VerifiedAddress | null;
  availability: DeliveryVerificationResult | null;
  isModalOpen: boolean;
  isLoadingAvailability: boolean;
  storeInfo: StoreLocationResponse | null;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  verifyAddressAvailability: (address: VerifiedAddress) => Promise<DeliveryVerificationResult>;
  confirmLocation: (address: VerifiedAddress, result: DeliveryVerificationResult) => void;
  clearLocation: () => void;
  revalidateLocation: () => Promise<DeliveryVerificationResult | null>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = "rrv_customer_verified_location";
const SESSION_POPUP_KEY = "rrv_location_prompt_seen";

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedAddress, setSelectedAddress] = useState<VerifiedAddress | null>(null);
  const [availability, setAvailability] = useState<DeliveryVerificationResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(false);
  const [storeInfo, setStoreInfo] = useState<StoreLocationResponse | null>(null);

  // 1. Load store location and initial persisted location on mount
  useEffect(() => {
    let mounted = true;

    // Fetch store info (max delivery distance, hub coordinates)
    deliveryService
      .getStoreLocation()
      .then((info) => {
        if (mounted && info) {
          setStoreInfo(info);
        }
      })
      .catch((e) => console.warn("[LocationContext] Failed to load store location:", e));

    // Restore saved address from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.address && Number.isFinite(parsed.address.latitude) && Number.isFinite(parsed.address.longitude)) {
          setSelectedAddress(parsed.address);
          if (parsed.availability) {
            setAvailability(parsed.availability);
          }
        }
      } else {
        // If no saved location and hasn't seen the first-visit prompt in this session, show popup
        const hasSeenPrompt = sessionStorage.getItem(SESSION_POPUP_KEY);
        if (!hasSeenPrompt) {
          setIsModalOpen(true);
          sessionStorage.setItem(SESSION_POPUP_KEY, "true");
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }

    // Listen for real-time admin store location & radius updates
    const handleStoreUpdated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail && mounted) {
        setStoreInfo((prev) => ({
          storeName: detail.storeName || prev?.storeName || "RRV Green Basket Hub",
          address: detail.address || prev?.address || "Rajivihar, Kurnool, Andhra Pradesh 518002",
          latitude: typeof detail.latitude === "number" ? detail.latitude : (prev?.latitude ?? 15.8281),
          longitude: typeof detail.longitude === "number" ? detail.longitude : (prev?.longitude ?? 78.0373),
          maxDeliveryDistanceKm: detail.maxDeliveryDistanceKm || 10.0,
          baseDeliveryCharge: prev?.baseDeliveryCharge ?? 20,
        }));
      }
    };

    window.addEventListener("rrv:location:store-updated", handleStoreUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("rrv:location:store-updated", handleStoreUpdated);
    };
  }, []);

  // 2. Open / Close Modal helpers
  const openLocationModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeLocationModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // 3. Verify address availability with backend
  const verifyAddressAvailability = useCallback(
    async (address: VerifiedAddress): Promise<DeliveryVerificationResult> => {
      setIsLoadingAvailability(true);
      try {
        const payload = {
          placeId: address.placeId,
          latitude: address.latitude,
          longitude: address.longitude,
          address: address.formattedAddress,
        };

        const res = await deliveryService.checkAvailability(payload);

        const isAvailable = Boolean(res.available || res.serviceable);
        const distKm = res.distanceKm ?? (res.distanceMeters ? Number((res.distanceMeters / 1000).toFixed(2)) : null);
        const maxDist = res.maxDistanceKm ?? storeInfo?.maxDeliveryDistanceKm ?? 10.0;

        let statusKind: DeliveryVerificationResult["status"] = isAvailable ? "AVAILABLE" : "OUTSIDE_RANGE";
        if (distKm !== null && distKm > maxDist) {
          statusKind = "OUTSIDE_RANGE";
        }

        const formattedResult: DeliveryVerificationResult = {
          available: isAvailable,
          serviceable: isAvailable,
          status: statusKind,
          zonePublicId: res.zonePublicId,
          zoneName: res.zoneName || "Kurnool Central Zone",
          distanceMeters: res.distanceMeters || (distKm ? Math.round(distKm * 1000) : null),
          distanceKm: distKm,
          estimatedDuration: res.estimatedDuration || "30-45 mins",
          estimatedDeliveryTime: res.estimatedDeliveryTime || "Fresh morning harvest delivery (6:00 AM - 10:00 AM)",
          deliveryCharge: isAvailable ? (res.deliveryCharge ?? 20) : null,
          minimumOrderAmount: res.minimumOrderAmount ?? 100,
          freeDeliveryThreshold: res.freeDeliveryThreshold ?? 500,
          isFreeDelivery: Boolean(res.isFreeDelivery),
          maxDistanceKm: maxDist,
          message: res.message || (isAvailable
            ? `Great! We deliver to your location within ${maxDist} km.`
            : `Sorry! Your selected location is outside our current ${maxDist} km delivery area.`),
        };

        return formattedResult;
      } catch (err: unknown) {
        console.error("[LocationContext] checkAvailability failed:", err);
        return {
          available: false,
          serviceable: false,
          status: "ROUTE_FAILED",
          maxDistanceKm: storeInfo?.maxDeliveryDistanceKm ?? 10.0,
          message: "We couldn't calculate your delivery distance right now. Please try again.",
        };
      } finally {
        setIsLoadingAvailability(false);
      }
    },
    [storeInfo]
  );

  // 4. Confirm location and persist
  const confirmLocation = useCallback(
    (address: VerifiedAddress, result: DeliveryVerificationResult) => {
      setSelectedAddress(address);
      setAvailability(result);
      setIsModalOpen(false);

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            address,
            availability: result,
            savedAt: new Date().toISOString(),
          })
        );
      } catch (e) {
        console.warn("[LocationContext] Failed to persist location to storage:", e);
      }

      // Broadcast event for decoupled listeners
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("rrv:location:changed", {
            detail: { address, availability: result },
          })
        );
      }
    },
    []
  );

  // 5. Clear location
  const clearLocation = useCallback(() => {
    setSelectedAddress(null);
    setAvailability(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  // 6. Revalidate current location
  const revalidateLocation = useCallback(async (): Promise<DeliveryVerificationResult | null> => {
    if (!selectedAddress) return null;
    const res = await verifyAddressAvailability(selectedAddress);
    setAvailability(res);
    return res;
  }, [selectedAddress, verifyAddressAvailability]);

  return (
    <LocationContext.Provider
      value={{
        selectedAddress,
        availability,
        isModalOpen,
        isLoadingAvailability,
        storeInfo,
        openLocationModal,
        closeLocationModal,
        verifyAddressAvailability,
        confirmLocation,
        clearLocation,
        revalidateLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
