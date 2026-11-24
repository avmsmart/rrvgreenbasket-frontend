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
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  CreditCard,
  Banknote,
  Loader2,
  ShoppingCart,
  ChevronRight,
  Check,
  AlertCircle,
  WalletCards,
  ClipboardList,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useLocation } from "@/context/LocationContext";
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
  const {
    selectedAddress: globalLocation,
    availability: globalAvailability,
    openLocationModal,
  } = useLocation();

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
          placeId: globalLocation?.placeId,
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
    [globalLocation]
  );

  // Sync global verified location into custom coordinates and address form
  useEffect(() => {
    if (globalLocation) {
      setCustomCoordinates({
        lat: globalLocation.latitude,
        lng: globalLocation.longitude,
      });
      setNewAddress((prev) => ({
        ...prev,
        addressLine1: prev.addressLine1 || globalLocation.addressLine || globalLocation.displayName,
        city: globalLocation.city || prev.city,
        state: globalLocation.state || prev.state,
        pincode: globalLocation.pincode || prev.pincode,
      }));
    }
  }, [globalLocation]);

  useEffect(() => {
    if (selectedAddress) {
      const addrStr = `${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.pincode}`;
      // Use verified coordinates or Kurnool default coordinates (15.8281, 78.0373)
      const lat = customCoordinates?.lat || 15.8281;
      const lng = customCoordinates?.lng || 78.0373;
      checkAddressDelivery(lat, lng, addrStr);
    }
  }, [selectedAddress, customCoordinates, checkAddressDelivery]);

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
      // 1. Authoritative backend checkout validation
      try {
        const val = await deliveryService.validateCheckout({
          placeId: globalLocation?.placeId,
          latitude: customCoordinates?.lat || 15.8281,
          longitude: customCoordinates?.lng || 78.0373,
          address: `${selectedAddress.addressLine1}, ${selectedAddress.city}`,
        });
        if (val && !val.serviceable) {
          setOrderError(
            val.message ||
              "Your selected delivery address is outside our serviceable delivery zone. Please choose another address."
          );
          setIsSubmittingOrder(false);
          return;
        }
      } catch {
        // Fallback: verify with latest availability state
        if (deliveryAvailability && !deliveryAvailability.available) {
          setOrderError(
            "Your selected delivery address is not serviceable. Please choose another location within Kurnool."
          );
          setIsSubmittingOrder(false);
          return;
        }
      }

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
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-emerald-700">
              <ArrowLeft className="h-4 w-4" /> Back to cart
            </Link>
            <span className="h-5 w-px bg-slate-200" />
            <Link href="/" className="text-sm font-extrabold tracking-tight text-emerald-800">RRV GREEN BASKET</Link>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4" /> Secure checkout
          </div>
        </div>
      </header>

      {isOrdersPaused && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-start gap-2 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <strong>Online ordering is currently closed.</strong>{' '}
              {operatingWindow?.openingTime && operatingWindow?.closingTime
                ? `Orders are accepted from ${operatingWindow.openingTime.slice(0, 5)} to ${operatingWindow.closingTime.slice(0, 5)}.`
                : 'Please try again during store operating hours.'}
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:py-10">
        <div className="grid grid-cols-1 items-start gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="space-y-8 sm:space-y-10 lg:col-span-7">
            <section className="border-b border-slate-200 pb-7 sm:pb-8">
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl"><MapPin className="h-5 w-5 text-emerald-700" />Delivery address</h1>
                  <p className="mt-0.5 text-sm text-slate-500">Choose where your order should be delivered.</p>
                </div>
                {!isAddingNewAddress && (
                  <button type="button" onClick={() => setIsAddingNewAddress(true)} className="inline-flex shrink-0 items-center gap-1 py-2 text-sm font-semibold text-emerald-700 hover:underline">
                    <Plus className="h-4 w-4" /> Add new
                  </button>
                )}
              </div>

              <div className="mb-6 flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
                  <MapPin className="h-4 w-4 shrink-0 text-emerald-700" />
                  <span className="truncate font-medium text-slate-800">{globalLocation?.displayName || globalLocation?.formattedAddress || 'Choose your delivery location'}</span>
                  {globalLocation && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />}
                </div>
                <button type="button" onClick={openLocationModal} className="shrink-0 text-xs font-bold text-emerald-800 hover:underline">Change</button>
              </div>

              {isAddressLoading ? (
                <div className="flex items-center gap-2 py-5 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading saved addresses...</div>
              ) : !isAddingNewAddress && addresses.length > 0 ? (
                <div className="divide-y divide-slate-200 border-y border-slate-200">
                  {addresses.map((addr) => {
                    const selected = addr.id === selectedAddressId;
                    return (
                      <button key={addr.id} type="button" onClick={() => setSelectedAddressId(addr.id)} className={`w-full py-4 text-left transition ${selected ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{addr.receiverName}</span>
                              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">{addr.addressType}</span>
                              {addr.isDefault && <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">Default</span>}
                            </div>
                            <p className="mt-1 break-words text-sm text-slate-600">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}{addr.landmark ? `, Near ${addr.landmark}` : ''}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Phone className="h-3 w-3" /> {addr.receiverMobile}</p>
                          </div>
                          <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>{selected && <Check className="h-3 w-3" />}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {isAddingNewAddress && (
                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Add delivery details</h3>
                    <p className="mt-1 text-xs text-slate-500">Enter the recipient and address details for this order.</p>
                  </div>
                  {addressError && <p className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">{addressError}</p>}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold text-slate-700">Recipient name *<input required value={newAddress.receiverName} onChange={(e) => setNewAddress({ ...newAddress, receiverName: e.target.value })} placeholder="Full name" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></label>
                    <label className="text-xs font-semibold text-slate-700">Mobile number *<input required type="tel" maxLength={10} value={newAddress.receiverMobile} onChange={(e) => setNewAddress({ ...newAddress, receiverMobile: e.target.value.replace(/\D/g, '') })} placeholder="10-digit mobile number" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></label>
                  </div>
                  <label className="block text-xs font-semibold text-slate-700">House / street address *<input required value={newAddress.addressLine1} onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })} placeholder="House number, street, area" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="text-xs font-semibold text-slate-700">Landmark<input value={newAddress.landmark || ''} onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })} placeholder="Optional" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700">City<input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700">Pincode *<input required maxLength={6} value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '') })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal" /></label>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">{(['HOME', 'WORK', 'OTHER'] as CustomerAddressType[]).map((type) => <button key={type} type="button" onClick={() => setNewAddress({ ...newAddress, addressType: type })} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${newAddress.addressType === type ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>{type}</button>)}</div>
                    <div className="flex gap-2">
                      {addresses.length > 0 && <button type="button" onClick={() => setIsAddingNewAddress(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>}
                      <button type="submit" disabled={isSavingAddress} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{isSavingAddress && <Loader2 className="h-4 w-4 animate-spin" />} Save address</button>
                    </div>
                  </div>
                </form>
              )}

              {selectedAddress && (
                <div className="mt-4">
                  {isCheckingDelivery ? <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" /> Checking delivery availability...</div> : deliveryAvailability ? (
                    deliveryAvailability.available ? <div className="flex flex-wrap items-center justify-between gap-2 border-t border-emerald-200 py-3 text-sm"><span className="flex items-center gap-2 font-semibold text-emerald-800"><CheckCircle2 className="h-4 w-4" /> Delivery available{deliveryAvailability.zoneName ? ` · ${deliveryAvailability.zoneName}` : ''}</span><span className="font-bold text-emerald-800">{actualDeliveryCharge === 0 ? 'Free delivery' : `₹${actualDeliveryCharge} delivery`}</span>{deliveryAvailability.estimatedDeliveryTime && <span className="w-full text-xs text-emerald-700">Estimated delivery: {deliveryAvailability.estimatedDeliveryTime}</span>}{!meetsMinOrder && <span className="w-full text-xs font-medium text-amber-800">Minimum order: ₹{minOrderAmount}</span>}</div> : <div className="border-t border-red-200 py-3 text-sm text-red-700"><AlertCircle className="mr-1 inline h-4 w-4" /> This address is outside the delivery area. Please choose another address.</div>
                  ) : deliveryError ? <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{deliveryError}</p> : null}
                </div>
              )}
            </section>

            <section className="border-b border-slate-200 pb-7 sm:pb-8">
              <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900"><WalletCards className="h-5 w-5 text-emerald-700" />Payment method</h2>
              <p className="mb-3 mt-1 text-sm text-slate-500">Choose how you would like to pay.</p>
              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {([
                  { value: 'COD', title: 'Cash on Delivery', detail: 'Pay when your order arrives.', Icon: Banknote },
                  { value: 'ONLINE_FULL', title: 'Online payment', detail: 'UPI, cards or net banking.', Icon: CreditCard },
                  { value: 'ONLINE_PARTIAL', title: 'Partial payment', detail: 'Pay an advance online and the balance on delivery.', Icon: IndianRupee },
                ] as const).map(({ value, title, detail, Icon }) => (
                  <label key={value} className={`flex cursor-pointer items-start gap-3 px-2 py-4 transition-colors ${paymentMethod === value ? 'bg-emerald-50/60 text-emerald-900' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <input type="radio" name="paymentMethod" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="h-4 w-4 accent-emerald-700" />
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${paymentMethod === value ? "text-emerald-700" : "text-slate-400"}`} />
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{title}</span><span className="block text-xs text-slate-500">{detail}</span></span>
                  </label>
                ))}
              </div>
            </section>

            <section className="border-b border-slate-200 pb-7 sm:pb-8">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900"><ClipboardList className="h-5 w-5 text-amber-600" />Delivery instructions <span className="font-normal text-slate-400">(optional)</span></label>
              <textarea rows={2} maxLength={300} value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Any instructions for the delivery partner?" className="mt-2 w-full resize-y border-b border-slate-300 bg-transparent px-0 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-600" />
            </section>
          </div>

          <aside className="lg:col-span-5">
            <section className="border-t border-slate-200 pt-6 lg:sticky lg:top-20 lg:border-t-0 lg:pt-0">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <h2 className="flex min-w-0 items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
                  <ShoppingCart className="h-5 w-5 shrink-0 text-emerald-700" />
                  <span>Order summary</span>
                </h2>
                <span className="shrink-0 text-sm font-medium text-slate-500">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {items.map((item) => (
                  <div
                    key={item.publicId}
                    className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-100 py-3.5 sm:gap-4"
                  >
                    {item.productImageUrl ? (
                      <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 sm:text-[15px]">
                        {item.productName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.quantityKg} kg <span className="px-1 text-slate-300">×</span> ₹{item.pricePerKg}/kg
                      </p>
                    </div>

                    <span className="min-w-[3.75rem] text-right text-sm font-bold tabular-nums text-slate-900">
                      ₹{item.totalPrice}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-b border-slate-200 py-5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold tabular-nums text-slate-800">₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Delivery</span>
                  <span className="font-semibold tabular-nums text-slate-800">
                    {actualDeliveryCharge === 0 ? (
                      <span className="font-bold text-emerald-700">FREE</span>
                    ) : (
                      `₹${actualDeliveryCharge}`
                    )}
                  </span>
                </div>
                {actualDeliveryCharge === 0 && subtotal >= freeDeliveryThreshold && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    Free delivery applied on orders above ₹{freeDeliveryThreshold}.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 py-5">
                <span className="text-base font-bold text-slate-900">Total</span>
                <span className="text-xl font-extrabold tabular-nums text-emerald-800">₹{totalAmount}</span>
              </div>

              {orderError && (
                <div className="mb-4 flex items-start gap-2 border-l-2 border-red-500 bg-red-50 px-3 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!canPlaceOrder}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-emerald-800 active:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                {isSubmittingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing order...
                  </>
                ) : isOrdersPaused ? (
                  "Ordering currently closed"
                ) : !isServiceable ? (
                  "Address not serviceable"
                ) : !meetsMinOrder ? (
                  `Minimum order ₹${minOrderAmount}`
                ) : !selectedAddress ? (
                  "Select delivery address"
                ) : (
                  `Place order · ₹${totalAmount}`
                )}
                {!isSubmittingOrder && !isOrdersPaused && isServiceable && meetsMinOrder && selectedAddress && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              <p className="mt-3 px-2 text-center text-xs leading-relaxed text-slate-400">
                By placing your order, you agree to the RRV Green Basket terms.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
