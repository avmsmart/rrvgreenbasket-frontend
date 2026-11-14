/**
 * RRV Green Basket - Wishlist Service Data Transfer Objects
 * Matches Spring Boot Wishlist Service REST contracts and complete product details.
 */

import { ProductWeightVariant } from "./product";

export interface WishlistProductItem {
  wishlistItemId?: string | number;
  productId?: string | number;
  productPublicId: string;
  productName: string;
  productDescription?: string;
  productSlug?: string;
  productImage?: string;
  galleryImages?: string[];
  category?: string;
  categoryId?: string | number;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  unit?: string;
  variants?: ProductWeightVariant[];
  selectedVariant?: ProductWeightVariant;
  stockQuantity?: number;
  stockStatus?: string;
  availabilityStatus?: string;
  isAvailable?: boolean;
  addedAt?: string;

  // Compatibility fields for nested product objects from backend
  product?: {
    publicId?: string;
    id?: string | number;
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    images?: Array<{ imageUrl?: string; url?: string }>;
    price?: number;
    pricePerKg?: number;
    totalPrice?: number;
    originalPrice?: number;
    quantityUnit?: string;
    unit?: string;
    category?: { name?: string } | string;
    stockStatus?: string;
    available?: boolean;
  };
}

export interface WishlistResponse {
  wishlistPublicId?: string;
  customerPublicId?: string;
  totalItems: number;
  items: WishlistProductItem[];
}

export interface WishlistCountResponse {
  totalItems: number;
  count?: number;
}

export interface WishlistStatusResponse {
  productPublicId: string;
  isWishlisted: boolean;
}

export interface WishlistItemResponse {
  wishlistItemId?: string | number;
  productPublicId: string;
  isWishlisted: boolean;
  product?: WishlistProductItem;
}

export interface WishlistBulkStatusResponse {
  customerPublicId?: string;
  statusMap: Record<string, boolean>;
  items?: WishlistStatusResponse[];
}

export interface AddWishlistItemRequest {
  productPublicId?: string;
  productId?: string | number;
}

export interface BulkWishlistStatusRequest {
  productPublicIds: string[];
}
