/**
 * Customer Address Types & Contracts
 * Based on Spring Boot Customer Address REST APIs.
 */

export type CustomerAddressType = "HOME" | "WORK" | "OTHER";

export interface CustomerAddress {
  id: string;
  customerId?: string;
  addressType: CustomerAddressType;
  receiverName: string;
  receiverMobile: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  createdAt?: string;
  updatedAt?: string;
  isDefault: boolean;
}

export interface CustomerAddressRequest {
  receiverName: string;
  receiverMobile: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  addressType: CustomerAddressType;
  isDefault?: boolean;
}

export interface CustomerAddressApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}
