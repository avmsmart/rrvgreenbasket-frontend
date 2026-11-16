/**
 * RRV Green Basket - Location & Delivery Types
 * Aligned with Spring Boot Delivery Microservice & Google Places API (New)
 */

export interface GooglePlaceSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
  types?: string[];
}

export interface VerifiedAddress {
  placeId?: string;
  formattedAddress: string;
  displayName: string;
  addressLine?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  country?: string;
  verifiedAt?: string;
}

export interface StoreLocationResponse {
  storeName: string;
  address: string;
  latitude: number;
  longitude: number;
  maxDeliveryDistanceKm: number;
  baseDeliveryCharge: number;
  freeDeliveryThreshold?: number;
  minimumOrderAmount?: number;
  operatingHours?: string;
}

export type DeliveryStatusKind =
  | "AVAILABLE"
  | "OUTSIDE_RANGE"
  | "UNSERVICEABLE"
  | "ROUTE_FAILED"
  | "PENDING_VERIFICATION";

export interface DeliveryVerificationResult {
  available: boolean;
  serviceable: boolean;
  status: DeliveryStatusKind;
  zonePublicId?: string;
  zoneName?: string;
  distanceMeters?: number | null;
  distanceKm?: number | null;
  estimatedDuration?: string | null;
  estimatedDeliveryTime?: string | null;
  deliveryCharge?: number | null;
  minimumOrderAmount?: number | null;
  freeDeliveryThreshold?: number | null;
  isFreeDelivery?: boolean;
  maxDistanceKm?: number;
  message?: string;
}

export interface VerifyAddressRequest {
  placeId: string;
}

export interface ResolveLocationRequest {
  latitude: number;
  longitude: number;
}

export interface CheckAvailabilityRequest {
  placeId?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface ValidateCheckoutDeliveryRequest {
  placeId?: string;
  cartId?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface ValidateCheckoutDeliveryResponse {
  valid: boolean;
  serviceable: boolean;
  deliveryCharge: number;
  distanceKm?: number;
  zoneName?: string;
  minimumOrderAmount?: number;
  freeDeliveryThreshold?: number;
  message?: string;
}
