"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Maximize2,
  Sliders,
  Layers,
  Info,
  Loader2,
  X,
  Compass,
  Check,
  Building2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { GooglePlacesService } from "@/services/googlePlacesService";
import { deliveryService, DeliveryApiError } from "@/services/delivery.service";
import {
  AdminStoreLocationSettings,
  UpdateAdminStoreLocationRequest,
  GooglePlaceSuggestion,
} from "@/types";

// Default configuration constants
const DEFAULT_LATITUDE = 15.8281;
const DEFAULT_LONGITUDE = 78.0373;
const DEFAULT_RADIUS_METERS = 10000; // 10 km
const MIN_RADIUS_METERS = 1000; // 1 km
const MAX_RADIUS_METERS = 50000; // 50 km

export const StoreLocationCoverageManager: React.FC = () => {
  // Saved backend state
  const [savedSettings, setSavedSettings] = useState<AdminStoreLocationSettings | null>(null);

  // Form & map working state
  const [storeName, setStoreName] = useState<string>("RRV Green Basket Hub");
  const [formattedAddress, setFormattedAddress] = useState<string>(
    "Rajivihar, Kurnool, Andhra Pradesh 518001"
  );
  const [postalCode, setPostalCode] = useState<string>("518001");
  const [city, setCity] = useState<string>("Kurnool");
  const [stateName, setStateName] = useState<string>("Andhra Pradesh");
  const [googlePlaceId, setGooglePlaceId] = useState<string | undefined>(undefined);
  const [latitude, setLatitude] = useState<number>(DEFAULT_LATITUDE);
  const [longitude, setLongitude] = useState<number>(DEFAULT_LONGITUDE);
  const [radiusMeters, setRadiusMeters] = useState<number>(DEFAULT_RADIUS_METERS);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Validation & Error states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Search state (Places API New)
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<GooglePlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Google Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  // Quick preset options in KM
  const RADIUS_PRESETS = [5, 10, 15, 20, 25];

  // Calculate coverage area (pi * r^2 in sq km)
  const radiusKm = Number((radiusMeters / 1000).toFixed(2));
  const coverageAreaSqKm = Number((Math.PI * Math.pow(radiusKm, 2)).toFixed(2));

  // --- 1. Load Initial Configuration from Backend ---
  const loadInitialSettings = useCallback(async () => {
    setIsLoading(true);
    setBackendError(null);
    setFieldErrors({});
    try {
      const data = await deliveryService.getAdminStoreSettings();
      setSavedSettings(data);
      setStoreName(data.storeName || "RRV Green Basket Hub");
      setFormattedAddress(data.formattedAddress || data.address || "");
      setPostalCode(data.postalCode || data.pincode || "518001");
      setCity(data.city || "Kurnool");
      setStateName(data.state || "Andhra Pradesh");
      setGooglePlaceId(data.googlePlaceId);
      setLatitude(data.latitude || DEFAULT_LATITUDE);
      setLongitude(data.longitude || DEFAULT_LONGITUDE);
      setRadiusMeters(data.radiusMeters || DEFAULT_RADIUS_METERS);
      setIsActive(data.active !== false && data.deliveryEnabled !== false);
      setIsDirty(false);
    } catch (err: unknown) {
      console.error("[StoreLocationCoverageManager] Failed to load store settings:", err);
      const msg =
        err instanceof DeliveryApiError
          ? `${err.message} (Endpoint: ${err.endpoint})`
          : err instanceof Error
          ? err.message
          : "Unable to connect to delivery service. Default settings loaded.";
      setBackendError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialSettings();
  }, [loadInitialSettings]);

  // --- 2. Initialize Google Map & Overlays ---
  const initMap = useCallback(async () => {
    if (!mapContainerRef.current) return;

    const mapsSdkLoaded = await GooglePlacesService.loadGoogleMapsApi();
    if (!mapsSdkLoaded || typeof window === "undefined" || !window.google?.maps) {
      console.warn("[StoreLocationCoverageManager] Google Maps SDK unavailable.");
      return;
    }

    const center = { lat: latitude, lng: longitude };

    // Create Map
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center,
      zoom: 12,
      mapTypeId: mapType,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    mapRef.current = map;

    // Create Circular Delivery Radius Overlay
    const circle = new window.google.maps.Circle({
      map,
      center,
      radius: radiusMeters,
      fillColor: "#10b981", // Emerald 500
      fillOpacity: 0.18,
      strokeColor: "#059669", // Emerald 600
      strokeOpacity: 0.85,
      strokeWeight: 2,
    });
    circleRef.current = circle;

    // Custom Store Marker Icon
    const marker = new window.google.maps.Marker({
      map,
      position: center,
      draggable: true,
      title: storeName,
      icon: {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
        fillColor: "#00875a",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: 2,
        anchor: new window.google.maps.Point(12, 22),
      },
    });
    markerRef.current = marker;

    // Draggable Marker Event
    marker.addListener("dragend", async (e: any) => {
      const newLat = Number(e.latLng.lat().toFixed(6));
      const newLng = Number(e.latLng.lng().toFixed(6));
      setLatitude(newLat);
      setLongitude(newLng);
      circle.setCenter({ lat: newLat, lng: newLng });
      setIsDirty(true);
      setFieldErrors((prev) => ({ ...prev, latitude: "", longitude: "" }));

      // Reverse geocode to retrieve street address, PIN code, city, and state
      try {
        const addr = await GooglePlacesService.reverseGeocode(newLat, newLng);
        if (addr) {
          if (addr.formattedAddress) setFormattedAddress(addr.formattedAddress);
          if (addr.pincode) {
            setPostalCode(addr.pincode);
            setFieldErrors((prev) => ({ ...prev, postalCode: "" }));
          }
          if (addr.city) setCity(addr.city);
          if (addr.state) setStateName(addr.state);
        }
      } catch (err) {
        console.warn("[StoreLocationCoverageManager] Reverse geocode error:", err);
      }
    });

    // Map Click Event to relocate store marker
    map.addListener("click", async (e: any) => {
      const newLat = Number(e.latLng.lat().toFixed(6));
      const newLng = Number(e.latLng.lng().toFixed(6));
      marker.setPosition({ lat: newLat, lng: newLng });
      circle.setCenter({ lat: newLat, lng: newLng });
      setLatitude(newLat);
      setLongitude(newLng);
      setIsDirty(true);
      setFieldErrors((prev) => ({ ...prev, latitude: "", longitude: "" }));

      try {
        const addr = await GooglePlacesService.reverseGeocode(newLat, newLng);
        if (addr) {
          if (addr.formattedAddress) setFormattedAddress(addr.formattedAddress);
          if (addr.pincode) {
            setPostalCode(addr.pincode);
            setFieldErrors((prev) => ({ ...prev, postalCode: "" }));
          }
          if (addr.city) setCity(addr.city);
          if (addr.state) setStateName(addr.state);
        }
      } catch (err) {
        console.warn("[StoreLocationCoverageManager] Reverse geocode error:", err);
      }
    });

    setIsMapLoaded(true);
  }, [latitude, longitude, radiusMeters, storeName, mapType]);

  useEffect(() => {
    if (!isLoading && !mapRef.current) {
      initMap();
    }
  }, [isLoading, initMap]);

  // Handle map type toggle (Roadmap / Satellite)
  const toggleMapType = () => {
    const nextType = mapType === "roadmap" ? "satellite" : "roadmap";
    setMapType(nextType);
    if (mapRef.current) {
      mapRef.current.setMapTypeId(nextType);
    }
  };

  // Recenter map on marker and fit circle
  const handleRecenter = () => {
    if (mapRef.current && circleRef.current) {
      mapRef.current.setCenter({ lat: latitude, lng: longitude });
      mapRef.current.fitBounds(circleRef.current.getBounds());
    }
  };

  // --- 3. Places API (New) Autocomplete Search ---
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await GooglePlacesService.getAutocompleteSuggestions(trimmed);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.error("[StoreLocationCoverageManager] Autocomplete failed:", err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle suggestion selection
  const handleSelectSuggestion = async (suggestion: GooglePlaceSuggestion) => {
    setSearchQuery(suggestion.mainText);
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      const details = await GooglePlacesService.getPlaceDetails(suggestion.placeId);
      if (details) {
        setLatitude(details.latitude);
        setLongitude(details.longitude);
        setFormattedAddress(details.formattedAddress);
        setGooglePlaceId(details.placeId);
        if (details.pincode) {
          setPostalCode(details.pincode);
        }
        if (details.city) {
          setCity(details.city);
        }
        if (details.state) {
          setStateName(details.state);
        }
        setFieldErrors((prev) => ({
          ...prev,
          postalCode: "",
          formattedAddress: "",
          latitude: "",
          longitude: "",
        }));
        setIsDirty(true);

        // Move Map, Marker, Circle
        if (mapRef.current) {
          const newPos = { lat: details.latitude, lng: details.longitude };
          mapRef.current.panTo(newPos);
          markerRef.current?.setPosition(newPos);
          circleRef.current?.setCenter(newPos);
          mapRef.current.fitBounds(circleRef.current.getBounds());
        }
      }
    } catch (err) {
      console.error("[StoreLocationCoverageManager] Place details error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. Radius Adjustment Handlers ---
  const handleRadiusSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const kmVal = parseFloat(e.target.value);
    const newMeters = Math.round(kmVal * 1000);
    setRadiusMeters(newMeters);
    setIsDirty(true);

    if (circleRef.current) {
      circleRef.current.setRadius(newMeters);
    }
  };

  const handleRadiusNumericKmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const kmVal = parseFloat(e.target.value);
    if (!isNaN(kmVal) && kmVal >= 1 && kmVal <= 100) {
      const newMeters = Math.round(kmVal * 1000);
      setRadiusMeters(newMeters);
      setIsDirty(true);
      if (circleRef.current) {
        circleRef.current.setRadius(newMeters);
      }
    }
  };

  const handleApplyPreset = (km: number) => {
    const newMeters = km * 1000;
    setRadiusMeters(newMeters);
    setIsDirty(true);
    if (circleRef.current) {
      circleRef.current.setRadius(newMeters);
      if (mapRef.current) {
        mapRef.current.fitBounds(circleRef.current.getBounds());
      }
    }
  };

  // --- 5. Coordinate Manual Adjustment ---
  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= -90 && val <= 90) {
      setLatitude(val);
      setIsDirty(true);
      if (markerRef.current && circleRef.current) {
        const newPos = { lat: val, lng: longitude };
        markerRef.current.setPosition(newPos);
        circleRef.current.setCenter(newPos);
        mapRef.current?.panTo(newPos);
      }
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= -180 && val <= 180) {
      setLongitude(val);
      setIsDirty(true);
      if (markerRef.current && circleRef.current) {
        const newPos = { lat: latitude, lng: val };
        markerRef.current.setPosition(newPos);
        circleRef.current.setCenter(newPos);
        mapRef.current?.panTo(newPos);
      }
    }
  };

  // --- 6. Reset Changes Handler ---
  const handleResetChanges = () => {
    if (!savedSettings) return;
    setStoreName(savedSettings.storeName || "RRV Green Basket Hub");
    setFormattedAddress(savedSettings.formattedAddress || savedSettings.address || "");
    setPostalCode(savedSettings.postalCode || savedSettings.pincode || "518001");
    setCity(savedSettings.city || "Kurnool");
    setStateName(savedSettings.state || "Andhra Pradesh");
    setLatitude(savedSettings.latitude || DEFAULT_LATITUDE);
    setLongitude(savedSettings.longitude || DEFAULT_LONGITUDE);
    setRadiusMeters(savedSettings.radiusMeters || DEFAULT_RADIUS_METERS);
    setIsActive(savedSettings.active !== false && savedSettings.deliveryEnabled !== false);
    setIsDirty(false);
    setFieldErrors({});
    setBackendError(null);
    setSearchQuery("");

    if (mapRef.current && markerRef.current && circleRef.current) {
      const pos = { lat: savedSettings.latitude, lng: savedSettings.longitude };
      markerRef.current.setPosition(pos);
      circleRef.current.setCenter(pos);
      circleRef.current.setRadius(savedSettings.radiusMeters || DEFAULT_RADIUS_METERS);
      mapRef.current.panTo(pos);
      mapRef.current.fitBounds(circleRef.current.getBounds());
    }
  };

  // --- 7. Client-Side Validation ---
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!storeName.trim()) {
      errors.storeName = "Store name is required";
    }

    if (!formattedAddress.trim()) {
      errors.formattedAddress = "Store physical address is required";
    }

    const pin = postalCode.trim();
    if (!pin) {
      errors.postalCode = "Postal PIN code is required";
    } else if (!/^[0-9]{6}$/.test(pin)) {
      errors.postalCode = "Please enter a valid 6-digit postal PIN code (e.g., 518001)";
    }

    if (!city.trim()) {
      errors.city = "City is required";
    }

    if (!stateName.trim()) {
      errors.state = "State is required";
    }

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      errors.latitude = "Latitude must be between -90 and 90";
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      errors.longitude = "Longitude must be between -180 and 180";
    }

    if (isNaN(radiusMeters) || radiusMeters < 100 || radiusMeters > 100000) {
      errors.radius = "Delivery radius must be between 100m and 100km";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenConfirm = () => {
    setBackendError(null);
    if (!validateForm()) {
      return;
    }
    setIsConfirmModalOpen(true);
  };

  // --- 8. Save Configuration to Backend ---
  const handleSaveConfirm = async () => {
    if (!validateForm()) {
      setIsConfirmModalOpen(false);
      return;
    }

    setIsSaving(true);
    setBackendError(null);

    const cleanPostalCode = postalCode.trim();
    const cleanAddress = formattedAddress.trim();
    const cleanStoreName = storeName.trim();
    const cleanCity = city.trim() || "Kurnool";
    const cleanState = stateName.trim() || "Andhra Pradesh";

    try {
      const payload: UpdateAdminStoreLocationRequest = {
        storeName: cleanStoreName,
        formattedAddress: cleanAddress,
        address: cleanAddress,
        googlePlaceId,
        latitude,
        longitude,
        city: cleanCity,
        state: cleanState,
        postalCode: cleanPostalCode, // Authoritative backend requirement
        pincode: cleanPostalCode,    // Compatibility alias
        country: "India",
        maximumDeliveryDistanceMeters: radiusMeters,
        radiusMeters,
        deliveryEnabled: isActive,
        active: isActive,
      };

      const result = await deliveryService.updateAdminStoreSettings(payload);

      setSavedSettings(result);
      setIsDirty(false);
      setFieldErrors({});
      setIsConfirmModalOpen(false);
      setSuccessToast("Store central location and delivery radius saved successfully!");
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: unknown) {
      console.error("[StoreLocationCoverageManager] Save failed:", err);
      let errorMsg = "Failed to persist delivery settings to backend.";
      const newFieldErrors: Record<string, string> = {};

      if (err instanceof DeliveryApiError) {
        errorMsg = `${err.message} (Status: ${err.statusCode})`;
        if (err.statusCode === 400 && err.message.toLowerCase().includes("pin")) {
          newFieldErrors.postalCode = err.message;
        }

        if (err.details && typeof err.details === "object") {
          const d = err.details as any;
          if (d.field === "postalCode" || d.field === "pincode") {
            newFieldErrors.postalCode = d.message || err.message;
          }
          if (Array.isArray(d.errors)) {
            for (const item of d.errors) {
              if (item.field === "postalCode" || item.field === "pincode") {
                newFieldErrors.postalCode = item.defaultMessage || item.message || err.message;
              }
              if (item.field === "storeName") {
                newFieldErrors.storeName = item.defaultMessage || item.message;
              }
              if (item.field === "formattedAddress" || item.field === "address") {
                newFieldErrors.formattedAddress = item.defaultMessage || item.message;
              }
            }
          }
        }
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      setBackendError(errorMsg);
      setFieldErrors((prev) => ({ ...prev, ...newFieldErrors }));
      setIsConfirmModalOpen(false);
      // Notice: Form inputs remain intact to preserve unsaved changes on failure
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-20 right-6 z-[9999] animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl bg-emerald-600 text-white font-bold text-sm border border-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successToast}</span>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              className="ml-2 hover:opacity-80 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Backend Connection Error Banner */}
      {backendError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Delivery Service Connection Notice</h4>
              <p className="text-xs text-amber-800 mt-0.5">{backendError}</p>
              <p className="text-[11px] text-amber-700/80 mt-1">
                Your modifications are preserved locally. You can verify and retry saving once the
                Spring Boot service is active in Eureka.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadInitialSettings}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-2xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* TOP CONFIGURATION SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Store Hub */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Store Hub
            </span>
            <h3 className="text-base font-extrabold text-slate-900 truncate max-w-[170px] mt-0.5">
              {storeName}
            </h3>
            <span className="text-[11px] text-emerald-700 font-bold inline-flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Primary Hub Active
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00875a] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Coordinates */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Center Location
            </span>
            <h3 className="text-sm font-black text-slate-800 mt-0.5 font-mono">
              {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
            </h3>
            <p className="text-[11px] text-slate-500 truncate max-w-[180px] mt-0.5 font-medium">
              PIN: <span className="font-bold text-slate-700">{postalCode}</span> • {city}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Delivery Radius */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Delivery Radius
            </span>
            <h3 className="text-xl font-black text-[#00875a] mt-0.5">
              {radiusKm} km
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {radiusMeters.toLocaleString()} metres circular
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Coverage Area */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Serviceable Area
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">
              {coverageAreaSqKm} <span className="text-xs font-bold text-slate-500">sq km</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Authoritative delivery zone
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE: MAP (LEFT) + CONFIGURATION CARD (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GOOGLE MAPS WORKSPACE (OCCUPIES 7-8 COLS) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-3">
          <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-slate-100 h-[520px] sm:h-[580px] lg:h-[640px]">
            
            {/* Top Floating Places Autocomplete Search Bar */}
            <div
              ref={searchContainerRef}
              className="absolute top-4 inset-x-4 sm:inset-x-6 z-20 max-w-md mx-auto"
            >
              <div className="relative flex items-center rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 px-3.5 py-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(suggestions.length > 0)}
                  placeholder="Search landmark or address to move store..."
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                />
                {isSearching && (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0 ml-2" />
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                    }}
                    className="p-1 hover:text-slate-700 text-slate-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <ul className="mt-2 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {suggestions.map((s) => (
                    <li
                      key={s.placeId}
                      onClick={() => handleSelectSuggestion(s)}
                      className="p-3 hover:bg-emerald-50/70 transition cursor-pointer flex items-start gap-2.5 text-left"
                    >
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{s.mainText}</p>
                        <p className="text-[11px] text-slate-500 truncate">{s.secondaryText}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Map Floating Controls (Bottom Left) */}
            <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRecenter}
                className="px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md shadow-md hover:bg-white text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer active:scale-95 transition"
                title="Recenter map on store"
              >
                <Compass className="w-4 h-4 text-[#00875a]" />
                <span className="hidden sm:inline">Recenter Store</span>
              </button>

              <button
                type="button"
                onClick={toggleMapType}
                className="px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md shadow-md hover:bg-white text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer active:scale-95 transition"
                title="Toggle Satellite Imagery"
              >
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">
                  {mapType === "roadmap" ? "Satellite" : "Map"}
                </span>
              </button>
            </div>

            {/* Live Visual Legend (Bottom Right) */}
            <div className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md text-[11px] font-bold text-slate-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-600" />
              <span>Coverage: {radiusKm} km Radius</span>
            </div>
          </div>

          {/* Interactive Hint */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium px-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Tip: Click anywhere on the map or drag the green store pin to precisely relocate your
              store hub.
            </span>
          </div>
        </div>

        {/* CONFIGURATION PANEL (OCCUPIES 5-4 COLS) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-6">
            
            {/* Header */}
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Coverage Configuration</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authoritative store origin & delivery boundary
                </p>
              </div>
              {isDirty && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                  Unsaved Changes
                </span>
              )}
            </div>

            {/* SECTION 1: STORE ORIGIN LOCATION */}
            <div className="space-y-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                1. Central Store Details
              </span>

              {/* Store Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Store Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => {
                    setStoreName(e.target.value);
                    setIsDirty(true);
                    if (e.target.value.trim()) {
                      setFieldErrors((prev) => ({ ...prev, storeName: "" }));
                    }
                  }}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border ${
                    fieldErrors.storeName
                      ? "border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-600"
                      : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-600"
                  } outline-none transition`}
                  placeholder="Store / Hub Name"
                />
                {fieldErrors.storeName && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.storeName}</span>
                  </p>
                )}
              </div>

              {/* Postal PIN Code (Required by Spring Boot DTO) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Postal PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">6 digits</span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={postalCode}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setPostalCode(clean);
                    setIsDirty(true);
                    if (clean.length === 6) {
                      setFieldErrors((prev) => ({ ...prev, postalCode: "" }));
                    }
                  }}
                  placeholder="e.g. 518001"
                  className={`w-full px-3 py-2 text-xs font-mono font-semibold rounded-xl border ${
                    fieldErrors.postalCode
                      ? "border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-600"
                      : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-600"
                  } outline-none transition`}
                />
                {fieldErrors.postalCode ? (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.postalCode}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Populated automatically from map or enter manually.
                  </p>
                )}
              </div>

              {/* Formatted Physical Address */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Physical Store Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formattedAddress}
                  onChange={(e) => {
                    setFormattedAddress(e.target.value);
                    setIsDirty(true);
                    if (e.target.value.trim()) {
                      setFieldErrors((prev) => ({ ...prev, formattedAddress: "" }));
                    }
                  }}
                  placeholder="Click on the map or type full physical address"
                  className={`w-full px-3 py-2 text-xs font-medium rounded-xl border ${
                    fieldErrors.formattedAddress
                      ? "border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-600"
                      : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-600"
                  } outline-none transition resize-none`}
                />
                {fieldErrors.formattedAddress && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.formattedAddress}</span>
                  </p>
                )}
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setIsDirty(true);
                      if (e.target.value.trim()) {
                        setFieldErrors((prev) => ({ ...prev, city: "" }));
                      }
                    }}
                    className={`w-full px-3 py-1.5 text-xs font-semibold rounded-xl border ${
                      fieldErrors.city ? "border-rose-400 bg-rose-50/50" : "border-slate-200 bg-slate-50/50"
                    } focus:bg-white focus:border-emerald-600 outline-none`}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">State</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => {
                      setStateName(e.target.value);
                      setIsDirty(true);
                      if (e.target.value.trim()) {
                        setFieldErrors((prev) => ({ ...prev, state: "" }));
                      }
                    }}
                    className={`w-full px-3 py-1.5 text-xs font-semibold rounded-xl border ${
                      fieldErrors.state ? "border-rose-400 bg-rose-50/50" : "border-slate-200 bg-slate-50/50"
                    } focus:bg-white focus:border-emerald-600 outline-none`}
                    placeholder="State"
                  />
                </div>
              </div>

              {/* Precise Coordinates Inputs */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={handleLatChange}
                    className="w-full px-3 py-1.5 text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-600 outline-none"
                  />
                  {fieldErrors.latitude && (
                    <p className="text-[10px] text-rose-600 mt-0.5">{fieldErrors.latitude}</p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={handleLngChange}
                    className="w-full px-3 py-1.5 text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-600 outline-none"
                  />
                  {fieldErrors.longitude && (
                    <p className="text-[10px] text-rose-600 mt-0.5">{fieldErrors.longitude}</p>
                  )}
                </div>
              </div>

              {/* Active Delivery Status Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-700">Delivery Status</span>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => {
                      setIsActive(e.target.checked);
                      setIsDirty(true);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                  <span className={`text-[11px] font-bold ${isActive ? "text-emerald-700" : "text-slate-500"}`}>
                    {isActive ? "Active (Delivery Enabled)" : "Disabled"}
                  </span>
                </label>
              </div>
            </div>

            {/* SECTION 2: CIRCULAR DELIVERY RADIUS */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  2. Circular Delivery Boundary
                </span>
                <span className="text-sm font-black text-[#00875a]">{radiusKm} km</span>
              </div>

              {/* Slider Control */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                  <span>1 km</span>
                  <span>10 km (Default)</span>
                  <span>50 km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="0.5"
                  value={radiusKm}
                  onChange={handleRadiusSliderChange}
                  className="w-full accent-[#00875a] cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Numeric Input & Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700">Radius in Kilometres:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="0.5"
                      value={radiusKm}
                      onChange={handleRadiusNumericKmChange}
                      className="w-20 px-2.5 py-1.5 text-xs font-black text-center rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 outline-none"
                    />
                    <span className="text-xs font-bold text-slate-500">km</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Presets:
                  </span>
                  {RADIUS_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        radiusKm === preset
                          ? "bg-[#00875a] text-white shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {preset} km
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 3: ACTIONS & PERSISTENCE */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <button
                type="button"
                onClick={handleOpenConfirm}
                disabled={isSaving || !isDirty}
                className="w-full py-3 rounded-2xl bg-[#00875a] hover:bg-[#00734d] disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Configuration</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleResetChanges}
                  disabled={!isDirty}
                  className="py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Changes</span>
                </button>

                <button
                  type="button"
                  onClick={handleRecenter}
                  className="py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Center Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL BEFORE PERSISTENCE */}
      {isConfirmModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#00875a] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Confirm Store Location &amp; Radius
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review the delivery coverage settings before saving to the database.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-slate-50 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Store Hub:</span>
                <span className="font-bold text-slate-900">{storeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Postal PIN Code:</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {postalCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">City / State:</span>
                <span className="font-bold text-slate-800">{city}, {stateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Coordinates:</span>
                <span className="font-mono font-bold text-slate-800">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Delivery Radius:</span>
                <span className="font-bold text-[#00875a]">
                  {radiusKm} km ({radiusMeters.toLocaleString()} m)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className={`font-bold ${isActive ? "text-emerald-700" : "text-amber-700"}`}>
                  {isActive ? "Active (Delivery Enabled)" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Serviceable Area:</span>
                <span className="font-bold text-slate-800">{coverageAreaSqKm} sq km</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                <span className="font-bold text-emerald-800">Authoritative Update:</span> Customer
                location verification and checkout will immediately use this center point, {postalCode} PIN code, and {radiusKm} km radius.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConfirm}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Confirm &amp; Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreLocationCoverageManager;
