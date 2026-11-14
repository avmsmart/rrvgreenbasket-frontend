"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowLeft,
  MapPin,
  Plus,
  Phone,
  UserRound,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  IndianRupee,
  CreditCard,
  Banknote,
  Loader2,
  ShoppingCart,
  ChevronRight,
  Info,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { customerAddressService } from "@/services/customer-address.service";
import { deliveryService } from "@/services/delivery.service";
import { orderService } from "@/services/order.service";
import {
  CustomerAddress,
  CustomerAddressRequest,
  CustomerAddressType,
} from "@/types/customer-address";
import {
  DeliveryAvailabilityResponse,
  CustomerDeliveryZone,
} from "@/types/delivery";
import {
  OrderBusinessSettingsResponse,
  BackendPaymentMethod,
  AddressDto,
} from "@/types/order";
import { DeliveryLocationPicker, SelectedLocationData } from "@/components/delivery/DeliveryLocationPicker";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    itemCount,
    totalAmount: cartTotal,
    isLoading: isCartLoading,
    clearCart,
  } = useCart();
  const { customer, isAuthenticated, isLoading: isAuthLoading } = useCustomerAuth();

  // Operating window & store settings
  const [operatingWindow, setOperatingWindow] = useState<OrderBusinessSettingsResponse | null>(null);
  const [isWindowLoading, setIsWindowLoading] = useState<boolean>(true);

  // Addresses
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressLoading, setIsAddressLoading] = useState<boolean>(true);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(false);

  // New address form state
  const [newAddress, setNewAddress] = useState<CustomerAddressRequest>({
    receiverName: "",
    receiverMobile: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "Kurnool",
    state: "Andhra Pradesh",
    pincode: "518001",
    country: "India",
    addressType: "HOME" as CustomerAddressType,
    isDefault: false,
  });
  const [isSavingAddress, setIsSavingAddress] = useState<boolean>(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Delivery availability
  const [deliveryAvailability, setDeliveryAvailability] = useState<DeliveryAvailabilityResponse | null>(null);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState<boolean>(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [customCoordinates, setCustomCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Payment & Order options
  const [paymentMethod, setPaymentMethod] = useState<BackendPaymentMethod>("COD");
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // 1. Fetch Operating Window on mount
  useEffect(() => {
    let mounted = true;
    setIsWindowLoading(true);
    orderService
      .getOperatingWindow()
      .then((settings) => {
        if (mounted && settings) {
          setOperatingWindow(settings);
        }
      })
      .catch((err) => {
        console.warn("[Checkout] Failed to load operating window:", err);
      })
      .finally(() => {
        if (mounted) setIsWindowLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch Customer Addresses
  const loadAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setIsAddressLoading(false);
      return;
    }

    setIsAddressLoading(true);
    try {
      const list = await customerAddressService.getMyAddresses();
      setAddresses(list);

      if (list.length > 0) {
        // Pick default address or first one
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        setSelectedAddressId(defaultAddr.id);
        setIsAddingNewAddress(false);
      } else {
        setIsAddingNewAddress(true);
        if (customer) {
          setNewAddress((prev) => ({
            ...prev,
            receiverName: customer.fullName || "",
            receiverMobile: customer.mobileNumber || "",
          }));
        }
      }
    } catch (err) {
      console.error("[Checkout] Failed to load customer addresses:", err);
      setIsAddingNewAddress(true);
    } finally {
      setIsAddressLoading(false);
    }
  }, [isAuthenticated, customer]);

  useEffect(() => {
    if (!isAuthLoading) {
      loadAddresses();
    }
  }, [isAuthLoading, loadAddresses]);

  // Selected address object
  const selectedAddress = useMemo(() => {
    return addresses.find((a) => a.id === selectedAddressId) || null;
  }, [addresses, selectedAddressId]);

  // 3. Verify Delivery Availability whenever selected address changes
  const checkAddressDelivery = useCallback(
    async (lat: number, lng: number, addrStr?: string) => {
      setIsCheckingDelivery(true);
      setDeliveryError(null);

      try {
        const result = await deliveryService.checkAvailability({
          latitude: lat,
          longitude: lng,
          address: addrStr,
        });
        setDeliveryAvailability(result);
      } catch (err: unknown) {
        console.warn("[Checkout] Delivery check failed:", err);
        setDeliveryError(
          err instanceof Error ? err.message : "Unable to verify delivery serviceability"
        );
      } finally {
        setIsCheckingDelivery(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedAddress) {
      const addrStr = `${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.pincode}`;
      // Use verified coordinates or Kurnool default coordinates (15.8281, 78.0373)
      const lat = customCoordinates?.lat || 15.8281;
      const lng = customCoordinates?.lng || 78.0373;
      checkAddressDelivery(lat, lng, addrStr);
    }
  }, [selectedAddress, customCoordinates, checkAddressDelivery]);

  // Handle location picker verification
  const handleLocationPickerVerified = (
    loc: SelectedLocationData,
    avail: DeliveryAvailabilityResponse
  ) => {
    setCustomCoordinates({ lat: loc.latitude, lng: loc.longitude });
    setDeliveryAvailability(avail);
    setNewAddress((prev) => ({
      ...prev,
      addressLine1: loc.addressLine || prev.addressLine1,
      city: loc.city || prev.city,
      state: loc.state || prev.state,
      pincode: loc.pincode || prev.pincode,
    }));
  };

  // 4. Save New Address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);

    if (!newAddress.receiverName.trim()) {
      setAddressError("Recipient name is required");
      return;
    }
    if (!newAddress.receiverMobile.trim() || newAddress.receiverMobile.length < 10) {
      setAddressError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!newAddress.addressLine1.trim()) {
      setAddressError("Street address is required");
      return;
    }

    setIsSavingAddress(true);
    try {
      const saved = await customerAddressService.addAddress(newAddress);
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddressId(saved.id);
      setIsAddingNewAddress(false);
      // Reset form
      setNewAddress({
        receiverName: customer?.fullName || "",
        receiverMobile: customer?.mobileNumber || "",
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        city: "Kurnool",
        state: "Andhra Pradesh",
        pincode: "518001",
        country: "India",
        addressType: "HOME",
        isDefault: addresses.length === 0,
      });
    } catch (err: unknown) {
      setAddressError(
        err instanceof Error ? err.message : "Failed to save address. Please try again."
      );
    } finally {
      setIsSavingAddress(false);
    }
  };

  // 5. Financial calculations
  const subtotal = cartTotal;

  // Delivery charge calculation from Spring Boot availability rules
  const baseDeliveryCharge = deliveryAvailability?.available
    ? (deliveryAvailability.deliveryCharge ?? 30)
    : 30; // standard default

  const freeDeliveryThreshold = deliveryAvailability?.freeDeliveryThreshold ?? 500;
  const isFreeDelivery = deliveryAvailability?.isFreeDelivery || subtotal >= freeDeliveryThreshold;
  const actualDeliveryCharge = subtotal > 0 && isFreeDelivery ? 0 : baseDeliveryCharge;

  const totalAmount = subtotal + actualDeliveryCharge;

  // Validation rules
  const isOrdersPaused = operatingWindow !== null && !operatingWindow.orderAcceptanceEnabled;
  const isServiceable = deliveryAvailability ? deliveryAvailability.available : true;
  const minOrderAmount = deliveryAvailability?.minimumOrderAmount ?? 0;
  const meetsMinOrder = subtotal >= minOrderAmount;

  const canPlaceOrder =
    itemCount > 0 &&
    !isOrdersPaused &&
    selectedAddress !== null &&
    isServiceable &&
    meetsMinOrder &&
    !isSubmittingOrder;

  // 6. Real Order Submission to Spring Boot Order Microservice
  const handlePlaceOrder = async () => {
    if (!canPlaceOrder || !selectedAddress) return;

    setIsSubmittingOrder(true);
    setOrderError(null);

    const addressDto: AddressDto = {
      addressLine: `${selectedAddress.addressLine1}${
        selectedAddress.addressLine2 ? ", " + selectedAddress.addressLine2 : ""
      }`,
      landmark: selectedAddress.landmark || undefined,
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.pincode,
      latitude: customCoordinates?.lat || 15.8281,
      longitude: customCoordinates?.lng || 78.0373,
    };

    try {
      const createdOrder = await orderService.createOrder({
        deliveryAddress: addressDto,
        addressId: selectedAddress.id,
        paymentMethod: paymentMethod,
        notes: orderNotes.trim() || undefined,
      });

      // Clear the cart on successful order placement
      await clearCart();

      // Redirect to confirmation page with real orderPublicId
      const targetId = createdOrder.orderPublicId || (createdOrder as unknown as { id: string }).id;
      router.push(`/order-confirmation?orderPublicId=${encodeURIComponent(targetId)}`);
    } catch (err: unknown) {
      console.error("[Checkout] Order placement failed:", err);
      setOrderError(
        err instanceof Error
          ? err.message
          : "Order placement failed. Please verify your details and try again."
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Loading state
  if (isCartLoading || isAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8faf7]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-700" />
          <p className="text-sm font-semibold text-slate-600">
            Preparing your farm-fresh checkout...
          </p>
        </div>
      </main>
    );
  }

  // Empty cart redirect / view
  if (itemCount === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f8faf7] px-4 py-16 text-center text-slate-800">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
          <ShoppingCart className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
          Your basket is empty
        </h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Add some fresh farm vegetables and fruits to your cart before proceeding to checkout.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Explore Farm Products</span>
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf7] text-slate-900 flex flex-col justify-between">
      {/* =========================================================================
          1. SECURE CHECKOUT TOP BAR
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-3xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cart</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <Link href="/" className="flex items-center gap-2 font-black text-emerald-800">
              <span className="text-base tracking-tight">RRV GREEN BASKET</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>100% Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. OPERATING WINDOW PAUSE ALERT BANNER
         ========================================================================= */}
      {isOrdersPaused && (
        <div className="bg-amber-500 text-white px-4 py-3 shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center gap-3 text-xs sm:text-sm font-medium">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <span className="font-bold">Store Notice:</span> Order acceptance is currently paused by store administration.
              {operatingWindow?.openingTime && operatingWindow?.closingTime && (
                <span> Operating hours are {operatingWindow.openingTime.slice(0, 5)} to {operatingWindow.closingTime.slice(0, 5)}.</span>
              )}
              {" "}You can review your order, but checkout submission will be available once the store resumes acceptance.
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. MAIN CHECKOUT CONTENT
         ========================================================================= */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery Details & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Delivery Address Selection */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm">
                    1
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Delivery Address
                    </h2>
                    <p className="text-xs text-slate-500">
                      Select where you want your fresh harvest delivered
                    </p>
                  </div>
                </div>

                {!isAddingNewAddress && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Saved Addresses List */}
              {!isAddingNewAddress && addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = addr.id === selectedAddressId;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600"
                            : "border-gray-200 hover:border-emerald-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {addr.receiverName}
                              </span>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                {addr.addressType}
                              </span>
                              {addr.isDefault && (
                                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {addr.addressLine1}
                              {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                              {addr.landmark ? `, Near ${addr.landmark}` : ""}
                            </p>
                            <p className="text-xs text-slate-500">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-xs font-medium text-slate-600 pt-0.5 flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{addr.receiverMobile}</span>
                            </p>
                          </div>

                          <div
                            className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add New Address Form */}
              {isAddingNewAddress && (
                <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
                  {addressError && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{addressError}</span>
                    </div>
                  )}

                  {/* Delivery Location Picker with Live Geolocation */}
                  <div className="mb-4">
                    <DeliveryLocationPicker
                      compact={true}
                      initialLocation={{
                        city: newAddress.city,
                        state: newAddress.state,
                        pincode: newAddress.pincode,
                      }}
                      onLocationVerified={handleLocationPickerVerified}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Recipient Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.receiverName}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, receiverName: e.target.value })
                        }
                        placeholder="e.g. John Doe"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={newAddress.receiverMobile}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            receiverMobile: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        placeholder="10-digit mobile"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Flat / House No. / Building / Street *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.addressLine1}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, addressLine1: e.target.value })
                      }
                      placeholder="e.g. Flat 302, Green Acres"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Landmark
                      </label>
                      <input
                        type="text"
                        value={newAddress.landmark || ""}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, landmark: e.target.value })
                        }
                        placeholder="Near Temple / Park"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={newAddress.pincode}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, pincode: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-2">
                      {(["HOME", "WORK", "OTHER"] as CustomerAddressType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewAddress({ ...newAddress, addressType: t })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            newAddress.addressType === t
                              ? "bg-emerald-700 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsAddingNewAddress(false)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isSavingAddress}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition disabled:opacity-50"
                      >
                        {isSavingAddress ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>Save Address</span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Delivery Zone Serviceability Feedback */}
              {selectedAddress && (
                <div className="pt-2">
                  {isCheckingDelivery ? (
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-700" />
                      <span>Verifying delivery zone serviceability for {selectedAddress.city}...</span>
                    </div>
                  ) : deliveryAvailability ? (
                    deliveryAvailability.available ? (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5 text-emerald-800">
                            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                            <span>Serviceable Zone: {deliveryAvailability.zoneName}</span>
                          </span>
                          <span className="text-emerald-700">
                            {actualDeliveryCharge === 0 ? "FREE Delivery" : `₹${actualDeliveryCharge} Delivery Charge`}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700">
                          {deliveryAvailability.estimatedDeliveryTime || deliveryAvailability.estimatedDeliveryWindow || "Fresh morning harvest delivery (6:00 AM - 10:00 AM)"}
                        </p>
                        {!meetsMinOrder && (
                          <div className="mt-2 p-2 rounded-xl bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                            <span>Minimum order of ₹{minOrderAmount} is required for this delivery zone.</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                        <div>
                          <span className="font-bold">Not Serviceable: </span>
                          <span>We currently do not deliver to this exact location in {selectedAddress.city}. Please select another address within Kurnool city limits.</span>
                        </div>
                      </div>
                    )
                  ) : null}
                </div>
              )}
            </div>

            {/* Step 2: Morning Harvest Delivery Window Information */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm">
                  2
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Harvest & Delivery Schedule
                  </h2>
                  <p className="text-xs text-slate-500">
                    Straight from farm harvest to your doorstep
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                <Truck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-slate-700">
                  <p className="font-bold text-emerald-950">
                    Next Morning Delivery Slot: 6:00 AM – 10:00 AM
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    All vegetables and fruits are freshly picked at sunrise from our partnered Kurnool farms to ensure 100% natural freshness, crisp texture, and farm aroma.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm">
                  3
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Payment Method
                  </h2>
                  <p className="text-xs text-slate-500">
                    Choose how you would like to pay
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === "COD"
                      ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600"
                      : "border-gray-200 hover:border-emerald-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-emerald-700" />
                      <span className="font-bold text-slate-900 text-sm">
                        Cash on Delivery (COD)
                      </span>
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Most Popular
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pay with cash or scan UPI QR code directly with the delivery partner upon arrival.
                    </p>
                  </div>
                </label>

                {/* Online Full Payment */}
                <label
                  onClick={() => setPaymentMethod("ONLINE_FULL")}
                  className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === "ONLINE_FULL"
                      ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600"
                      : "border-gray-200 hover:border-emerald-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "ONLINE_FULL"}
                    onChange={() => setPaymentMethod("ONLINE_FULL")}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-emerald-700" />
                      <span className="font-bold text-slate-900 text-sm">
                        UPI / Cards / Net Banking (Online Full)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pay 100% online securely through Google Pay, PhonePe, Paytm, or Credit/Debit Card.
                    </p>
                  </div>
                </label>

                {/* Online Partial Payment */}
                <label
                  onClick={() => setPaymentMethod("ONLINE_PARTIAL")}
                  className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === "ONLINE_PARTIAL"
                      ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600"
                      : "border-gray-200 hover:border-emerald-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "ONLINE_PARTIAL"}
                    onChange={() => setPaymentMethod("ONLINE_PARTIAL")}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-emerald-700" />
                      <span className="font-bold text-slate-900 text-sm">
                        Partial Payment
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pay a token booking advance online, and clear the remaining balance at doorstep delivery.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Optional Delivery Notes */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Ring the bell, leave at front gate, or call when outside..."
                className="w-full rounded-2xl border border-gray-200 p-3 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-5 sticky top-24">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-gray-100">
                Order Summary ({itemCount} {itemCount === 1 ? "item" : "items"})
              </h2>

              {/* Items Preview List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 pr-1">
                {items.map((item) => (
                  <div key={item.publicId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.productImageUrl ? (
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="h-10 w-10 rounded-xl object-cover bg-slate-50 border border-gray-100 shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                          <ShoppingCart className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.quantityKg} kg x ₹{item.pricePerKg}/kg
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      ₹{item.totalPrice}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Basket Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-slate-900">
                    {actualDeliveryCharge === 0 ? (
                      <span className="text-emerald-700">FREE</span>
                    ) : (
                      `₹${actualDeliveryCharge}`
                    )}
                  </span>
                </div>
                {actualDeliveryCharge === 0 && subtotal >= freeDeliveryThreshold && (
                  <p className="text-[11px] text-emerald-700 font-medium">
                    🎉 Free delivery applied on orders above ₹{freeDeliveryThreshold}!
                  </p>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-3 border-t border-gray-100">
                  <span>Total Payable</span>
                  <span className="text-emerald-800 text-base">₹{totalAmount}</span>
                </div>
              </div>

              {/* Order Error Notification */}
              {orderError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* Place Order Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!canPlaceOrder}
                className="w-full rounded-2xl bg-emerald-700 py-3.5 px-6 text-sm font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmittingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Placing Order with Farm...</span>
                  </>
                ) : isOrdersPaused ? (
                  <span>Orders Currently Paused</span>
                ) : !isServiceable ? (
                  <span>Location Not Serviceable</span>
                ) : !meetsMinOrder ? (
                  <span>Min Order ₹{minOrderAmount} Required</span>
                ) : !selectedAddress ? (
                  <span>Select Delivery Address</span>
                ) : (
                  <>
                    <span>Confirm & Place Order (₹{totalAmount})</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-[11px] text-slate-500">
                  By placing this order, you agree to RRV Green Basket Terms of Service & Fresh Quality Guarantee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
