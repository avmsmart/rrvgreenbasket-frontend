/**
 * RRV Green Basket - Cart Service Types
 * Matches the Spring Boot Cart Service Microservice API contract exactly.
 */

export interface CartItemResponse {
  publicId: string;
  productPublicId: string;
  productName: string;
  productImageUrl: string;
  quantityKg: number;
  unitOfMeasure: string;
  pricePerKg: number;
  totalPrice: number;
}

export interface CartResponse {
  publicId: string;
  status: string;
  items: CartItemResponse[];
  itemCount: number;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddCartItemRequest {
  productPublicId: string;
  quantityKg: number;
  productName?: string;
  productImageUrl?: string;
  pricePerKg?: number;
  unitOfMeasure?: string;
}

export interface UpdateCartItemRequest {
  quantityKg: number;
}

export interface CartErrorResponse {
  timestamp?: string;
  status: number;
  error?: string;
  message: string;
  path?: string;
  validationErrors?: Record<string, string> | null;
}
