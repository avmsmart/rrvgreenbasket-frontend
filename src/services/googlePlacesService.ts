/**
 * RRV Green Basket - Google Places API (New) & Maps JS API Service
 * Handles browser-side Google Maps script loading, Places Autocomplete with session tokens,
 * Place Details retrieval, and Geolocation Reverse Geocoding.
 */

import { GooglePlaceSuggestion, VerifiedAddress } from "@/types/location";

declare global {
  interface Window {
    google?: any;
    initGoogleMapsApi?: () => void;
  }
}

let googleMapsScriptPromise: Promise<boolean> | null = null;

export class GooglePlacesService {
  private static apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  /**
   * Loads Google Maps JavaScript API with places library once
   */
  public static async loadGoogleMapsApi(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    if (window.google?.maps?.places) {
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
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-js-sdk";
      script.type = "text/javascript";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        key
      )}&libraries=places,marker&loading=async&v=weekly`;
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
   * Creates a new session token for grouping autocomplete requests
   */
  public static createSessionToken(): any | null {
    if (typeof window !== "undefined" && window.google?.maps?.places?.AutocompleteSessionToken) {
      return new window.google.maps.places.AutocompleteSessionToken();
    }
    return null;
  }

  /**
   * Search places using Google Places Autocomplete with session token & Kurnool bias
   */
  public static async getAutocompleteSuggestions(
    input: string,
    sessionToken?: any
  ): Promise<GooglePlaceSuggestion[]> {
    const trimmed = input.trim();
    if (!trimmed) return [];

    const isLoaded = await this.loadGoogleMapsApi();
    if (!isLoaded || !window.google?.maps?.places?.AutocompleteService) {
      return [];
    }

    return new Promise((resolve) => {
      const service = new window.google.maps.places.AutocompleteService();

      // Kurnool center bias (lat: 15.8281, lng: 78.0373, radius 25km)
      const kurnoolCenter = new window.google.maps.LatLng(15.8281, 78.0373);
      const circle = new window.google.maps.Circle({
        center: kurnoolCenter,
        radius: 25000,
      });

      const request: any = {
        input: trimmed,
        componentRestrictions: { country: "in" },
        bounds: circle.getBounds(),
      };

      if (sessionToken) {
        request.sessionToken = sessionToken;
      }

      service.getPlacePredictions(
        request,
        (predictions: any[], status: any) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            Array.isArray(predictions)
          ) {
            const mapped: GooglePlaceSuggestion[] = predictions.map((p) => ({
              placeId: p.place_id,
              mainText: p.structured_formatting?.main_text || p.description,
              secondaryText: p.structured_formatting?.secondary_text || "",
              description: p.description,
              types: p.types,
            }));
            resolve(mapped);
          } else {
            resolve([]);
          }
        }
      );
    });
  }

  /**
   * Fetch place details (geometry, address components) by placeId
   */
  public static async getPlaceDetails(
    placeId: string,
    sessionToken?: any
  ): Promise<VerifiedAddress | null> {
    const isLoaded = await this.loadGoogleMapsApi();
    if (!isLoaded || !window.google?.maps?.places?.PlacesService) {
      return null;
    }

    return new Promise((resolve) => {
      const dummyDiv = document.createElement("div");
      const service = new window.google.maps.places.PlacesService(dummyDiv);

      const request: any = {
        placeId,
        fields: [
          "place_id",
          "name",
          "formatted_address",
          "geometry",
          "address_components",
        ],
      };

      if (sessionToken) {
        request.sessionToken = sessionToken;
      }

      service.getDetails(request, (place: any, status: any) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry?.location
        ) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          let city = "Kurnool";
          let state = "Andhra Pradesh";
          let pincode = "";
          let country = "India";
          let landmark = "";
          let sublocality = "";

          if (Array.isArray(place.address_components)) {
            for (const c of place.address_components) {
              const types = c.types as string[];
              if (types.includes("locality")) city = c.long_name;
              else if (types.includes("administrative_area_level_2") && city === "Kurnool") city = c.long_name;
              if (types.includes("administrative_area_level_1")) state = c.long_name;
              if (types.includes("postal_code")) pincode = c.long_name;
              if (types.includes("country")) country = c.long_name;
              if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
                sublocality = c.long_name;
              }
              if (types.includes("point_of_interest") || types.includes("landmark")) {
                landmark = c.long_name;
              }
            }
          }

          const verified: VerifiedAddress = {
            placeId: place.place_id,
            displayName: place.name || sublocality || city,
            formattedAddress: place.formatted_address || `${place.name}, ${city}`,
            addressLine: place.name || sublocality || "",
            landmark: landmark || sublocality || undefined,
            city,
            state,
            pincode,
            latitude: lat,
            longitude: lng,
            country,
            verifiedAt: new Date().toISOString(),
          };

          resolve(verified);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Reverse geocodes latitude and longitude using Google Geocoder
   */
  public static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<VerifiedAddress | null> {
    const isLoaded = await this.loadGoogleMapsApi();
    if (!isLoaded || !window.google?.maps?.Geocoder) {
      return null;
    }

    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat: latitude, lng: longitude };

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
              if (types.includes("locality")) city = c.long_name;
              if (types.includes("administrative_area_level_1")) state = c.long_name;
              if (types.includes("postal_code")) pincode = c.long_name;
              if (types.includes("country")) country = c.long_name;
              if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
                sublocality = c.long_name;
              }
              if (types.includes("premise") || types.includes("street_number") || types.includes("route")) {
                if (!displayName) displayName = c.long_name;
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
  }
}
