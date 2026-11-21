/**
 * RRV Green Basket - Google Places API (New) & Maps JS API Service
 * 
 * Migrated to Google Places API (New):
 * - Uses google.maps.importLibrary("places")
 * - Uses AutocompleteSuggestion.fetchAutocompleteSuggestions()
 * - Uses Place.fetchFields()
 * - Uses AutocompleteSessionToken for session billing
 * - Completely removes deprecated AutocompleteService, getPlacePredictions, PlacesService, and legacy getDetails
 */

import { GooglePlaceSuggestion, VerifiedAddress } from "@/types/location";

declare global {
  interface Window {
    google?: any;
    initGoogleMapsApi?: () => void;
  }
}

let googleMapsScriptPromise: Promise<boolean> | null = null;
let placesLibraryPromise: Promise<any> | null = null;

export class GooglePlacesService {
  private static apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  /**
   * Loads Google Maps JavaScript API once with weekly channel and async loading
   */
  public static async loadGoogleMapsApi(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    // Check if google maps JS API is already available on window
    if (window.google?.maps?.importLibrary) {
      return true;
    }

    if (googleMapsScriptPromise) {
      return googleMapsScriptPromise;
    }

    const key = this.apiKey.trim();
    if (!key) {
      console.warn(
        "[GooglePlacesService] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined. Manual fallback will be used."
      );
      return false;
    }

    googleMapsScriptPromise = new Promise<boolean>((resolve) => {
      const existingScript = document.getElementById("google-maps-js-sdk");
      if (existingScript) {
        if (window.google?.maps?.importLibrary) {
          resolve(true);
        } else {
          existingScript.addEventListener("load", () => resolve(true));
          existingScript.addEventListener("error", () => resolve(false));
        }
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-js-sdk";
      script.type = "text/javascript";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        key
      )}&loading=async&v=weekly&libraries=places,marker,geometry`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        resolve(true);
      };

      script.onerror = (e) => {
        console.error("[GooglePlacesService] Failed to load Google Maps SDK:", e);
        resolve(false);
      };

      document.head.appendChild(script);
    });

    return googleMapsScriptPromise;
  }

  /**
   * Loads the modern Places (New) library via google.maps.importLibrary("places")
   */
  public static async getPlacesLibrary(): Promise<any | null> {
    const isLoaded = await this.loadGoogleMapsApi();
    if (!isLoaded || typeof window === "undefined" || !window.google?.maps) {
      return null;
    }

    if (placesLibraryPromise) {
      return placesLibraryPromise;
    }

    placesLibraryPromise = (async () => {
      try {
        if (typeof window.google.maps.importLibrary === "function") {
          const placesLib = await window.google.maps.importLibrary("places");
          return placesLib;
        } else if (window.google.maps.places) {
          return window.google.maps.places;
        }
        return null;
      } catch (err) {
        console.error("[GooglePlacesService] Error importing places library:", err);
        return null;
      }
    })();

    return placesLibraryPromise;
  }

  /**
   * Creates a new AutocompleteSessionToken instance for grouping autocomplete & details requests
   */
  public static async createSessionToken(): Promise<any | null> {
    try {
      const placesLib = await this.getPlacesLibrary();
      if (placesLib?.AutocompleteSessionToken) {
        return new placesLib.AutocompleteSessionToken();
      }
      if (window.google?.maps?.places?.AutocompleteSessionToken) {
        return new window.google.maps.places.AutocompleteSessionToken();
      }
    } catch (e) {
      console.warn("[GooglePlacesService] Failed to create session token:", e);
    }
    return null;
  }

  /**
   * Synchronous check/fallback for session token creation if library is already in memory
   */
  public static createSessionTokenSync(): any | null {
    if (typeof window !== "undefined" && window.google?.maps?.places?.AutocompleteSessionToken) {
      try {
        return new window.google.maps.places.AutocompleteSessionToken();
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Search places using Places API (New) AutocompleteSuggestion.fetchAutocompleteSuggestions()
   * 
   * Strictly adheres to Places API (New):
   * - No AutocompleteService
   * - No getPlacePredictions
   * - Uses AutocompleteSuggestion.fetchAutocompleteSuggestions
   * - Biased towards Kurnool (lat: 15.8281, lng: 78.0373) without blocking outside locations
   * - Handles India regional search (includedRegionCodes: ["in"])
   */
  public static async getAutocompleteSuggestions(
    input: string,
    sessionToken?: any
  ): Promise<GooglePlaceSuggestion[]> {
    const trimmed = input.trim();
    if (!trimmed) return [];

    try {
      const placesLib = await this.getPlacesLibrary();
      if (!placesLib?.AutocompleteSuggestion) {
        console.warn(
          "[GooglePlacesService] AutocompleteSuggestion is not available in imported places library."
        );
        return [];
      }

      // Configure AutocompleteRequest with Kurnool bias and India region filter
      const request: any = {
        input: trimmed,
        includedRegionCodes: ["in"],
        locationBias: {
          center: { lat: 15.8281, lng: 78.0373 },
          radius: 50000, // 50 km bias around Kurnool hub
        },
      };

      if (sessionToken) {
        request.sessionToken = sessionToken;
      }

      const response =
        await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

      if (!response || !Array.isArray(response.suggestions)) {
        return [];
      }

      const mapped: GooglePlaceSuggestion[] = [];

      for (const item of response.suggestions) {
        const pred = item.placePrediction || item;
        if (!pred) continue;

        const placeId = pred.placeId || pred.place_id || "";
        if (!placeId) continue;

        // Defensive string extractor for FormattableText, string, or object representations
        const extractText = (val: any): string => {
          if (!val) return "";
          if (typeof val === "string") return val;
          if (typeof val.text === "string") return val.text;
          if (typeof val.toString === "function") {
            const str = val.toString();
            if (str && str !== "[object Object]") return str;
          }
          return "";
        };

        const mainText =
          extractText(pred.mainText) ||
          extractText(pred.structuredFormat?.mainText) ||
          extractText(pred.structured_formatting?.main_text) ||
          extractText(pred.text) ||
          "";

        const secondaryText =
          extractText(pred.secondaryText) ||
          extractText(pred.structuredFormat?.secondaryText) ||
          extractText(pred.structured_formatting?.secondary_text) ||
          "";

        const description =
          extractText(pred.text) ||
          (secondaryText ? `${mainText}, ${secondaryText}` : mainText);

        const types = Array.isArray(pred.types) ? pred.types : [];

        mapped.push({
          placeId,
          mainText: mainText || description,
          secondaryText,
          description,
          types,
        });
      }

      return mapped;
    } catch (err) {
      console.error("[GooglePlacesService] fetchAutocompleteSuggestions failed:", err);
      return [];
    }
  }

  /**
   * Fetch place details using Places API (New) Place.fetchFields()
   * 
   * Retrieves:
   * - id
   * - displayName
   * - formattedAddress
   * - location
   * - addressComponents
   * 
   * Strictly adheres to Places API (New):
   * - No PlacesService
   * - No legacy getDetails
   * - Passes sessionToken to complete autocomplete session
   */
  public static async getPlaceDetails(
    placeId: string,
    sessionToken?: any
  ): Promise<VerifiedAddress | null> {
    if (!placeId) return null;

    try {
      const placesLib = await this.getPlacesLibrary();
      if (!placesLib?.Place) {
        console.warn("[GooglePlacesService] Place class is not available in imported places library.");
        return null;
      }

      // Instantiate new Place object using placeId
      const place = new placesLib.Place({
        id: placeId,
      });

      const fetchOptions: any = {
        fields: [
          "id",
          "displayName",
          "formattedAddress",
          "location",
          "addressComponents",
        ],
      };

      if (sessionToken) {
        fetchOptions.sessionToken = sessionToken;
      }

      // Authoritative call to fetchFields()
      await place.fetchFields(fetchOptions);

      // Extract coordinates
      let lat = 0;
      let lng = 0;
      if (place.location) {
        if (typeof place.location.lat === "function") {
          lat = place.location.lat();
        } else if (typeof place.location.lat === "number") {
          lat = place.location.lat;
        }
        if (typeof place.location.lng === "function") {
          lng = place.location.lng();
        } else if (typeof place.location.lng === "number") {
          lng = place.location.lng;
        }
      }

      // Extract display name
      let displayName = "";
      if (typeof place.displayName === "string") {
        displayName = place.displayName;
      } else if (place.displayName && typeof place.displayName.text === "string") {
        displayName = place.displayName.text;
      } else if (typeof place.displayName?.toString === "function") {
        const s = place.displayName.toString();
        if (s && s !== "[object Object]") displayName = s;
      }

      const formattedAddress =
        typeof place.formattedAddress === "string" ? place.formattedAddress : "";

      let city = "Kurnool";
      let state = "Andhra Pradesh";
      let pincode = "";
      let country = "India";
      let landmark = "";
      let sublocality = "";

      // Parse address components (supporting both Places New longText/shortText and legacy long_name/short_name)
      if (Array.isArray(place.addressComponents)) {
        for (const c of place.addressComponents) {
          const types: string[] = Array.isArray(c.types) ? c.types : [];
          const longName = c.longText || c.long_name || "";
          const shortName = c.shortText || c.short_name || "";

          if (types.includes("locality")) {
            city = longName;
          } else if (types.includes("administrative_area_level_2") && city === "Kurnool") {
            city = longName;
          }

          if (types.includes("administrative_area_level_1")) {
            state = longName;
          }
          if (types.includes("postal_code")) {
            pincode = longName || shortName;
          }
          if (types.includes("country")) {
            country = longName;
          }
          if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
            sublocality = longName;
          }
          if (types.includes("point_of_interest") || types.includes("landmark")) {
            landmark = longName;
          }
        }
      }

      const finalDisplayName =
        displayName || sublocality || landmark || city || (formattedAddress.split(",")[0] || "Selected Location");

      const verified: VerifiedAddress = {
        placeId: place.id || placeId,
        displayName: finalDisplayName,
        formattedAddress: formattedAddress || `${finalDisplayName}, ${city}`,
        addressLine: finalDisplayName || sublocality || "",
        landmark: landmark || sublocality || undefined,
        city,
        state,
        pincode,
        latitude: lat,
        longitude: lng,
        country,
        verifiedAt: new Date().toISOString(),
      };

      return verified;
    } catch (err) {
      console.error("[GooglePlacesService] fetchFields failed for placeId:", placeId, err);
      return null;
    }
  }

  /**
   * Reverse geocodes latitude and longitude using Google Geocoder
   */
  public static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<VerifiedAddress | null> {
    const isLoaded = await this.loadGoogleMapsApi();
    if (!isLoaded || typeof window === "undefined" || !window.google?.maps) {
      return null;
    }

    try {
      let GeocoderClass = window.google.maps.Geocoder;
      if (!GeocoderClass && typeof window.google.maps.importLibrary === "function") {
        const geocodingLib = await window.google.maps.importLibrary("geocoding");
        GeocoderClass = geocodingLib?.Geocoder;
      }

      if (!GeocoderClass) {
        return null;
      }

      const geocoder = new GeocoderClass();
      const latlng = { lat: latitude, lng: longitude };

      return new Promise((resolve) => {
        geocoder.geocode({ location: latlng }, (results: any[], status: any) => {
          if (status === "OK" && results && results[0]) {
            const res = results[0];
            let city = "Kurnool";
            let state = "Andhra Pradesh";
            let pincode = "";
            let country = "India";
            let displayName = "";
            let sublocality = "";

            if (Array.isArray(res.address_components)) {
              for (const c of res.address_components) {
                const types = c.types as string[];
                const longName = c.longText || c.long_name || "";
                const shortName = c.shortText || c.short_name || "";

                if (types.includes("locality")) city = longName;
                if (types.includes("administrative_area_level_1")) state = longName;
                if (types.includes("postal_code")) pincode = longName || shortName;
                if (types.includes("country")) country = longName;
                if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
                  sublocality = longName;
                }
                if (
                  types.includes("premise") ||
                  types.includes("street_number") ||
                  types.includes("route")
                ) {
                  if (!displayName) displayName = longName;
                }
              }
            }

            resolve({
              placeId: res.place_id,
              displayName: displayName || sublocality || city,
              formattedAddress: res.formatted_address,
              addressLine: sublocality || displayName || "",
              city,
              state,
              pincode,
              latitude,
              longitude,
              country,
              verifiedAt: new Date().toISOString(),
            });
          } else {
            resolve(null);
          }
        });
      });
    } catch (err) {
      console.error("[GooglePlacesService] Reverse geocode error:", err);
      return null;
    }
  }
}
