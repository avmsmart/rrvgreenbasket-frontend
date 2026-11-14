"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  CartResponse,
  CartItemResponse,
  AddCartItemRequest,
  UpdateCartItemRequest,
} from "@/types/cart";
import { cartService, CartApiError } from "@/services/cart.service";
import { customerTokenStorage } from "@/services/customer-auth.service";
import { useCustomerAuth } from "./CustomerAuthContext";
import { CheckCircle2, AlertCircle, Info, ShoppingCart } from "lucide-react";

export interface CartContextType {
  cart: CartResponse | null;
  items: CartItemResponse[];
  itemCount: number;
  totalAmount: number;
  isLoading: boolean;
  isMutating: boolean;
  mutatingItemIds: string[];
  error: string | null;
  fetchCart: () => Promise<CartResponse | null>;
  addToCart: (
    productPublicId: string,
    quantityKg: number,
    productName?: string,
    metadata?: {
      productImageUrl?: string;
      pricePerKg?: number;
      unitOfMeasure?: string;
    }
  ) => Promise<boolean>;
  updateQuantity: (
    cartItemPublicId: string,
    quantityKg: number
  ) => Promise<boolean>;
  removeItem: (
    cartItemPublicId: string,
    productName?: string
  ) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  getCartItemForProduct: (productPublicId: string) => CartItemResponse | undefined;
  clearError: () => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useCustomerAuth();

  const [cart, setCart] = useState<CartResponse | null>(() => {
    if (typeof window !== "undefined") {
      return cartService.getLocalCart();
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [mutatingItemIds, setMutatingItemIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      setToastMessage(message);
      setToastType(type);
      toastTimeoutRef.current = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Listen for background or cross-component cart changes
  useEffect(() => {
    const handleCartChanged = (e: Event) => {
      const customEvent = e as CustomEvent<CartResponse>;
      if (customEvent.detail) {
        setCart(customEvent.detail);
      } else if (typeof window !== "undefined") {
        setCart(cartService.getLocalCart());
      }
    };

    window.addEventListener("rrv:cart:changed", handleCartChanged);
    return () => {
      window.removeEventListener("rrv:cart:changed", handleCartChanged);
    };
  }, []);

  /**
   * Fetch active cart from backend
   */
  const fetchCart = useCallback(async (): Promise<CartResponse | null> => {
    const token = customerTokenStorage.getAccessToken();
    const hasAuth = isAuthenticated || !!token;
    if (!hasAuth) {
      // Do not wipe local cart if user is browsing
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await cartService.getCart();
      setCart(response);
      return response;
    } catch (err: unknown) {
      console.warn("[CartContext] fetchCart using persistent cart:", err);
      const local = cartService.getLocalCart();
      setCart(local);
      return local;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Sync cart when authentication changes
  useEffect(() => {
    const token = customerTokenStorage.getAccessToken();
    if (isAuthenticated || token) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  /**
   * Add product to cart with specified quantity in KG
   */
  const addToCart = useCallback(
    async (
      productPublicId: string,
      quantityKg: number,
      productName?: string,
      metadata?: {
        productImageUrl?: string;
        pricePerKg?: number;
        unitOfMeasure?: string;
      }
    ): Promise<boolean> => {
      const token = customerTokenStorage.getAccessToken();
      const hasAuth = isAuthenticated || !!token;
      if (!hasAuth) {
        showToast("Please sign in to add items to your cart", "error");
        return false;
      }

      if (!productPublicId?.trim()) {
        showToast("Invalid product. Cannot add to cart.", "error");
        return false;
      }

      if (quantityKg <= 0) {
        showToast("Please select a quantity greater than zero.", "error");
        return false;
      }

      setIsMutating(true);
      setError(null);

      try {
        const updatedCart = await cartService.addItem({
          productPublicId: productPublicId.trim(),
          quantityKg: Number(quantityKg),
          productName,
          ...metadata,
        });

        setCart(updatedCart);
        const nameDisplay = productName ? `"${productName}"` : "Item";
        showToast(`Added ${nameDisplay} to cart! 🛒`, "success");
        return true;
      } catch (err: unknown) {
        console.warn("[CartContext] addToCart handled error with persistent fallback:", err);
        const fallbackCart = cartService.applyItemToLocalCart({
          productPublicId: productPublicId.trim(),
          quantityKg: Number(quantityKg),
          productName,
          ...metadata,
        });
        setCart(fallbackCart);
        const nameDisplay = productName ? `"${productName}"` : "Item";
        showToast(`Added ${nameDisplay} to cart! 🛒`, "success");
        return true;
      } finally {
        setIsMutating(false);
      }
    },
    [isAuthenticated, showToast]
  );

  /**
   * Update quantity of an item in the cart
   */
  const updateQuantity = useCallback(
    async (
      cartItemPublicId: string,
      quantityKg: number
    ): Promise<boolean> => {
      const hasAuth = isAuthenticated || !!customerTokenStorage.getAccessToken();
      if (!hasAuth) {
        showToast("Please sign in to update your cart", "error");
        return false;
      }

      if (!cartItemPublicId?.trim()) {
        showToast("Invalid cart item identifier.", "error");
        return false;
      }

      if (quantityKg <= 0) {
        // If reduced to zero, call removeItem
        return removeItem(cartItemPublicId);
      }

      setMutatingItemIds((prev) => [...prev, cartItemPublicId]);
      setError(null);

      try {
        const updatedCart = await cartService.updateQuantity(
          cartItemPublicId.trim(),
          { quantityKg: Number(quantityKg) }
        );

        setCart(updatedCart);
        return true;
      } catch (err: unknown) {
        const msg =
          err instanceof CartApiError
            ? err.message
            : "Failed to update quantity. Please try again.";
        setError(msg);
        showToast(msg, "error");
        return false;
      } finally {
        setMutatingItemIds((prev) =>
          prev.filter((id) => id !== cartItemPublicId)
        );
      }
    },
    [isAuthenticated, showToast]
  );

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(
    async (
      cartItemPublicId: string,
      productName?: string
    ): Promise<boolean> => {
      const hasAuth = isAuthenticated || !!customerTokenStorage.getAccessToken();
      if (!hasAuth) {
        showToast("Please sign in to modify your cart", "error");
        return false;
      }

      if (!cartItemPublicId?.trim()) {
        return false;
      }

      setMutatingItemIds((prev) => [...prev, cartItemPublicId]);
      setError(null);

      try {
        const updatedCart = await cartService.removeItem(
          cartItemPublicId.trim()
        );

        setCart(updatedCart);
        const nameDisplay = productName ? `"${productName}"` : "Item";
        showToast(`Removed ${nameDisplay} from cart`, "info");
        return true;
      } catch (err: unknown) {
        const msg =
          err instanceof CartApiError
            ? err.message
            : "Failed to remove item. Please try again.";
        setError(msg);
        showToast(msg, "error");
        return false;
      } finally {
        setMutatingItemIds((prev) =>
          prev.filter((id) => id !== cartItemPublicId)
        );
      }
    },
    [isAuthenticated, showToast]
  );

  /**
   * Clear all items from cart
   */
  const clearCart = useCallback(async (): Promise<boolean> => {
    const hasAuth = isAuthenticated || !!customerTokenStorage.getAccessToken();
    if (!hasAuth) {
      showToast("Please sign in to modify your cart", "error");
      return false;
    }

    setIsMutating(true);
    setError(null);

    try {
      const updatedCart = await cartService.clearCart();
      setCart(updatedCart);
      showToast("Your cart has been cleared", "info");
      return true;
    } catch (err: unknown) {
      const msg =
        err instanceof CartApiError
          ? err.message
          : "Failed to clear cart. Please try again.";
      setError(msg);
      showToast(msg, "error");
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [isAuthenticated, showToast]);

  /**
   * Find cart item for a given product publicId
   */
  const getCartItemForProduct = useCallback(
    (productPublicId: string): CartItemResponse | undefined => {
      if (!cart || !Array.isArray(cart.items)) return undefined;
      const cleanId = productPublicId.trim().toLowerCase();
      return cart.items.find(
        (item) => item.productPublicId?.toLowerCase() === cleanId
      );
    },
    [cart]
  );

  const items = cart?.items || [];
  const itemCount = cart?.itemCount ?? items.length;
  const totalAmount = cart?.totalAmount ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        totalAmount,
        isLoading,
        isMutating,
        mutatingItemIds,
        error,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        getCartItemForProduct,
        clearError,
        showToast,
      }}
    >
      {children}

      {/* Global floating toast notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-[120] max-w-sm rounded-2xl p-4 shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            toastType === "success"
              ? "bg-emerald-900/95 border-emerald-500 text-white"
              : toastType === "error"
              ? "bg-rose-900/95 border-rose-500 text-white"
              : "bg-slate-900/95 border-slate-700 text-white"
          }`}
        >
          {toastType === "success" && (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          {toastType === "error" && (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          {toastType === "info" && (
            <Info className="w-5 h-5 text-sky-400 shrink-0" />
          )}
          <p className="text-xs font-semibold leading-relaxed">{toastMessage}</p>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
