"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  IndianRupee,
  Loader2,
  Search,
} from "lucide-react";
import { deliveryService, DeliveryApiError } from "@/services/delivery.service";
import {
  DeliveryAvailabilityResponse,
  CustomerDeliveryZone,
} from "@/types";

export interface SelectedLocationData {
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export interface DeliveryLocationPickerProps {
  initialLocation?: Partial<SelectedLocationData>;
  onLocationVerified?: (
    location: SelectedLocationData,
    availability: DeliveryAvailabilityResponse
  ) => void;
  className?: string;
  compact?: boolean;
}

export const DeliveryLocationPicker: React.FC<DeliveryLocationPickerProps> = ({
  initialLocation,
  onLocationVerified,
  className = "",
  compact = false,
}) => {
  const [addressLine, setAddressLine] = useState(initialLocation?.addressLine || "");
  const [city, setCity] = useState(initialLocation?.city || "Kurnool");
  const [state, setState] = useState(initialLocation?.state || "Andhra Pradesh");
  const [pincode, setPincode] = useState(initialLocation?.pincode || "518001");
  const [latitude, setLatitude] = useState<number>(initialLocation?.latitude || 15.8281);
  const [longitude, setLongitude] = useState<number>(initialLocation?.longitude || 78.0373);

  const [activeZones, setActiveZones] = useState<CustomerDeliveryZone[]>([]);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [availability, setAvailability] = useState<DeliveryAvailabilityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load active zones for reference
  useEffect(() => {
    let mounted = true;
    deliveryService
      .getActiveZones()
      .then((zones) => {
        if (mounted && Array.isArray(zones)) {
          setActiveZones(zones);
        }
      })
      .catch((err) => {
        console.warn("[DeliveryLocationPicker] Could not load active zones:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Check location availability with backend
  const verifyAvailability = useCallback(
    async (lat: number, lng: number, addr?: string) => {
      setIsChecking(true);
      setError(null);

      try {
        const result = await deliveryService.checkAvailability({
          latitude: lat,
          longitude: lng,
          address: addr || addressLine,
        });

        setAvailability(result);

        if (onLocationVerified) {
          onLocationVerified(
            {
              addressLine,
              city,
              state,
              pincode,
              latitude: lat,
              longitude: lng,
            },
            result
          );
        }
      } catch (err: unknown) {
        const msg =
          err instanceof DeliveryApiError
            ? err.message
            : "Failed to verify delivery zone for this location.";
        setError(msg);
        setAvailability(null);
      } finally {
        setIsChecking(false);
      }
    },
    [addressLine, city, state, pincode, onLocationVerified]
  );

  // Handle Current GPS Location
  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setIsLocating(false);
        verifyAvailability(lat, lng, addressLine || "Current Location");
      },
      (geoError) => {
        setIsLocating(false);
        let msg = "Could not retrieve your current location.";
        if (geoError.code === 1) msg = "Location permission was denied.";
        else if (geoError.code === 2) msg = "Location position unavailable.";
        else if (geoError.code === 3) msg = "Location request timed out.";
        setError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  return (
    <div className={`rounded-2xl border border-emerald-100 bg-white p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2 text-emerald-900">
          <Truck className="h-5 w-5 text-emerald-700 shrink-0" />
          <h3 className="text-sm font-bold tracking-tight">Delivery Location & Serviceability</h3>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating || isChecking}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {isLocating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" />
          ) : (
            <Navigation className="h-3.5 w-3.5 text-emerald-700" />
          )}
          <span>{isLocating ? "Detecting GPS..." : "Detect Location"}</span>
        </button>
      </div>

      {/* Coordinate & Address Input */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
            placeholder="15.8281"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
            placeholder="78.0373"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            Street Address / Area Landmark
          </label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. Near Collectorate, Prakash Nagar"
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Verify Button */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => verifyAvailability(latitude, longitude, addressLine)}
          disabled={isChecking || isLocating}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Search className="h-4 w-4 text-white" />
          )}
          <span>{isChecking ? "Checking Serviceability..." : "Check Availability"}</span>
        </button>

        {activeZones.length > 0 && (
          <span className="text-[11px] text-gray-500">
            {activeZones.length} active delivery {activeZones.length === 1 ? "zone" : "zones"} in Kurnool
          </span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Availability Status Card */}
      {availability && (
        <div
          className={`mt-4 rounded-xl border p-3.5 transition-all ${
            availability.available
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
              : "bg-amber-50/70 border-amber-200 text-amber-950"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {availability.available ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-xs font-bold">
                {availability.available
                  ? `Serviceable Zone: ${availability.zoneName || "Kurnool City"}`
                  : "Location Out of Delivery Range"}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-600">
                {availability.message ||
                  (availability.available
                    ? "Great news! Fresh vegetables & fruits can be delivered to this location."
                    : "Sorry, we do not currently service this exact area. Please choose a nearby delivery address.")}
              </p>

              {availability.available && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 border-t border-emerald-200/60 pt-2.5 text-[11px]">
                  <div>
                    <span className="block text-gray-500 text-[10px]">Delivery Charge</span>
                    <span className="font-bold text-emerald-900">
                      {availability.deliveryCharge ? `₹${availability.deliveryCharge}` : "FREE"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-[10px]">Min. Order</span>
                    <span className="font-bold text-emerald-900">
                      ₹{availability.minimumOrderAmount || 100}
                    </span>
                  </div>
                  {availability.freeDeliveryThreshold && (
                    <div>
                      <span className="block text-gray-500 text-[10px]">Free Delivery From</span>
                      <span className="font-bold text-emerald-900">
                        ₹{availability.freeDeliveryThreshold}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="block text-gray-500 text-[10px]">Est. Delivery</span>
                    <span className="font-bold text-emerald-900">
                      {availability.estimatedDeliveryTime || "Next Morning (6:00 - 9:00 AM)"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryLocationPicker;
