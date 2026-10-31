"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Trash2,
  ShoppingCart,
  Check,
  Search,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Sparkles,
  Ticket,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Order, OrderItem, PaymentMethod } from "@/types";
import { Coupon } from "@/types/coupon";
import { MASTER_PRODUCTS_DATA } from "@/data";
import { getSavedCoupons, getSavedSettings, getCurrencySymbol } from "@/data/shared-store";
import { ProduceImage } from "@/components/common";

interface CreateManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (order: Partial<Order>) => void;
}

// Popular quick-add vegetables for 1-click convenience
const POPULAR_QUICK_ITEMS = [
  { id: "VGIV000787", name: "Tomato (Hybrid)", price: 40, unit: "Kg" },
  { id: "VGIV000854", name: "Onion (Small/Medium)", price: 35, unit: "Kg" },
  { id: "VGIV000966", name: "Potato", price: 30, unit: "Kg" },
  { id: "VGIV000867", name: "Palak (Spinach)", price: 20, unit: "Bunch" },
  { id: "VGIV000832", name: "Lady Finger (Bhendi)", price: 45, unit: "Kg" },
  { id: "VGEV000908", name: "Capsicum (Green)", price: 50, unit: "Kg" },
];

export const CreateManualOrderModal: React.FC<CreateManualOrderModalProps> = ({
  isOpen,
  onClose,
  onCreateOrder,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [items, setItems] = useState<OrderItem[]>([]);

  // Produce Search & Filter
  const [searchProduceQuery, setSearchProduceQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Coupons State
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showCouponList, setShowCouponList] = useState<boolean>(false);

  // Reset all state fresh whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setPaymentMethod("COD");
      setItems([]);
      setSearchProduceQuery("");
      setSelectedCategory("All");
      setCouponInput("");
      setAppliedCoupon(null);
      setCouponError(null);
      setShowCouponList(false);
      setAvailableCoupons(getSavedCoupons().filter((c) => c.status === "Active"));
    }
  }, [isOpen]);

  const handleClose = () => {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setPaymentMethod("COD");
    setItems([]);
    setSearchProduceQuery("");
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponError(null);
    setShowCouponList(false);
    onClose();
  };

  // Filtered 75+ master products
  const filteredProducts = useMemo(() => {
    return MASTER_PRODUCTS_DATA.filter((p) => {
      // Category filter
      if (selectedCategory !== "All" && p.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchProduceQuery.trim()) {
        const q = searchProduceQuery.toLowerCase().trim();
        const matches =
          p.name.toLowerCase().includes(q) ||
          (p.excelName && p.excelName.toLowerCase().includes(q)) ||
          p.id.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [searchProduceQuery, selectedCategory]);

  const categories = ["All", "English Vegetables", "Indian Vegetables", "Leafy Greens"];

  const handleAddProduct = (prod: {
    id: string;
    name: string;
    price: number;
    unit: string;
    imageUrl?: string;
  }) => {
    const existingIndex = items.findIndex((it) => it.productId === prod.id);
    if (existingIndex > -1) {
      setItems((prev) =>
        prev.map((it, idx) =>
          idx === existingIndex
            ? {
                ...it,
                quantity: it.quantity + 1,
                totalPrice: (it.quantity + 1) * it.unitPrice,
              }
            : it
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          productId: prod.id,
          productName: prod.name,
          unit: prod.unit || "Kg",
          unitPrice: prod.price,
          quantity: 1,
          totalPrice: prod.price,
          imageUrl: prod.imageUrl,
        },
      ]);
    }
  };

  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setItems((prev) => prev.filter((_, idx) => idx !== index));
    } else {
      setItems((prev) =>
        prev.map((it, idx) =>
          idx === index
            ? { ...it, quantity: newQty, totalPrice: newQty * it.unitPrice }
            : it
        )
      );
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Pricing & Coupon Calculations
  const storeSettings = getSavedSettings();
  const currencySymbol = getCurrencySymbol();
  const freeThreshold = storeSettings.freeDeliveryThreshold ?? 299;
  const standardFee = storeSettings.standardDeliveryFee ?? 20;
  const subtotal = items.reduce((acc, it) => acc + it.totalPrice, 0);
  const baseDeliveryCharge = items.length === 0 ? 0 : subtotal >= freeThreshold ? 0 : standardFee;

  // Compute discount
  let discountAmount = 0;
  let deliveryCharge = baseDeliveryCharge;

  if (appliedCoupon) {
    const val = appliedCoupon.discountValue ?? 0;
    if (subtotal >= appliedCoupon.minOrder) {
      if (appliedCoupon.discountType === "free_shipping") {
        discountAmount = baseDeliveryCharge;
        deliveryCharge = 0;
      } else if (appliedCoupon.discountType === "fixed") {
        discountAmount = Math.min(subtotal, val);
      } else {
        // Percentage discount
        discountAmount = Math.round((subtotal * val) / 100);
      }
    }
  }

  const totalAmount = Math.max(
    0,
    subtotal + deliveryCharge - (appliedCoupon?.discountType === "free_shipping" ? 0 : discountAmount)
  );

  // Apply Coupon Handler
  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    if (items.length === 0) {
      setCouponError("Please add items to your basket before applying a coupon.");
      return;
    }

    const found = availableCoupons.find((c) => c.code.toUpperCase() === code);
    if (!found) {
      setCouponError(`Coupon "${code}" is invalid or currently inactive.`);
      return;
    }

    if (subtotal < found.minOrder) {
      setCouponError(
        `Order minimum ₹${found.minOrder} required for coupon ${found.code} (Current basket: ₹${subtotal}).`
      );
      return;
    }

    setAppliedCoupon(found);
    setCouponInput(found.code);
    setCouponError(null);
    setShowCouponList(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  const isFormValid =
    customerName.trim().length > 0 &&
    customerPhone.trim().length > 0 &&
    customerAddress.trim().length > 0 &&
    items.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    onCreateOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      items,
      itemsCount: items.length,
      amount: totalAmount,
      subtotal,
      deliveryCharge,
      discount: discountAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
    });

    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#00875a] to-[#006b47] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Create Manual Customer Order</h3>
              <p className="text-xs text-[#d1f2e0]">
                Quick counter order or phone booking with full product catalog
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs"
        >
          {/* 1. Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Customer Name *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00875a]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00875a]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Delivery Address *
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Flat / Street / Sector"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00875a]"
                />
              </div>
            </div>
          </div>

          {/* Quick 1-Click Common Veggies */}
          <div className="p-2.5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00875a]" />
              <span>1-Click Popular Additions</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_QUICK_ITEMS.map((veg) => (
                <button
                  key={veg.id}
                  type="button"
                  onClick={() => handleAddProduct(veg)}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100/60 border border-slate-200/80 rounded-xl font-bold text-slate-800 flex items-center gap-1.5 transition-all shadow-3xs"
                >
                  <ProduceImage name={veg.name} size={18} />
                  <span>{veg.name}</span>
                  <span className="text-[#00875a]">₹{veg.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Search & Add from Complete Master Catalog */}
          <div className="border border-slate-200 rounded-2xl p-3 bg-white shadow-3xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                <ShoppingBag className="w-4 h-4 text-[#00875a]" />
                <span>Search &amp; Add from Complete Catalog ({MASTER_PRODUCTS_DATA.length}+ Products):</span>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? "bg-[#00875a] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Produce Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type to search all vegetables (e.g. Lady Finger, Brinjal, Carrot, Cauliflower, Ginger...)"
                value={searchProduceQuery}
                onChange={(e) => setSearchProduceQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00875a]"
              />
            </div>

            {/* Catalog List */}
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-4 text-slate-400">
                  No vegetables found matching &quot;{searchProduceQuery}&quot;
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const alreadyInBasket = items.find(
                    (it) => it.productId === prod.id
                  );
                  return (
                    <div
                      key={prod.id}
                      className="p-2 sm:px-3 sm:py-2 flex items-center justify-between hover:bg-emerald-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ProduceImage name={prod.name} src={prod.imageUrl} size={28} />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-xs truncate">
                            {prod.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {prod.category} • ₹{prod.price} / {prod.unit || "Kg"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddProduct(prod)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-3xs ${
                          alreadyInBasket
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-[#00875a] hover:bg-[#00704a] text-white"
                        }`}
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        <span>
                          {alreadyInBasket
                            ? `Add More (${alreadyInBasket.quantity})`
                            : "Add"}
                        </span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. Selected Items in Basket */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">
                Selected Basket Items ({items.length})
              </label>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setItems([])}
                  className="text-[11px] font-semibold text-rose-500 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="text-center py-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-medium">
                <ShoppingCart className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <p>No items added yet. Click items or search above to add.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden bg-white shadow-3xs">
                {items.map((it, idx) => (
                  <div
                    key={it.id}
                    className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ProduceImage name={it.productName} src={it.imageUrl} size={28} />
                      <div>
                        <div className="font-bold text-slate-800">
                          {it.productName}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          ₹{it.unitPrice}/{it.unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(idx, it.quantity - 1)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold text-slate-800">
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(idx, it.quantity + 1)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-slate-900 w-14 text-right">
                        ₹{it.totalPrice}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. APPLY COUPON / PROMO CODE SECTION */}
          <div className="pt-2 border-t border-slate-200">
            <div className="p-3.5 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-slate-50 rounded-2xl border border-emerald-100/90">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Ticket className="w-4 h-4 text-[#00875a]" />
                  <span>Apply Coupon / Promo Code</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCouponList(!showCouponList)}
                  className="text-[11px] font-bold text-[#00875a] hover:underline flex items-center gap-1"
                >
                  <span>
                    {showCouponList
                      ? "Hide Offers"
                      : `View Available Offers (${availableCoupons.length})`}
                  </span>
                  {showCouponList ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Input or Applied Banner */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-300 rounded-xl shadow-3xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎉</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs text-[#00875a]">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                          {appliedCoupon.discount}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-emerald-700">
                        {appliedCoupon.discountType === "free_shipping"
                          ? "Free delivery applied to this order!"
                          : `₹${discountAmount} discount applied successfully!`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove Coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="Enter code (e.g. WELCOME10, FRESH20, VEG15)"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 uppercase"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      disabled={!couponInput.trim()}
                      className="px-4 py-2 bg-[#00875a] hover:bg-[#00734d] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-3xs"
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 pl-1">
                      <span>⚠️</span> {couponError}
                    </p>
                  )}
                </div>
              )}

              {/* Available Store Offers Quick Picker */}
              {showCouponList && !appliedCoupon && (
                <div className="mt-2.5 pt-2 border-t border-emerald-100 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Available Active Offers (Click to Apply)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableCoupons.map((c) => {
                      const isEligible = subtotal >= c.minOrder;
                      return (
                        <div
                          key={c.id}
                          className="p-2 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-3xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-xs text-slate-800">
                                {c.code}
                              </span>
                              <span className="text-[10px] font-black text-[#00875a] bg-emerald-50 px-1 rounded">
                                {c.discount}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              Min order ₹{c.minOrder} • {c.offerName}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApplyCoupon(c.code)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                              isEligible
                                ? "bg-emerald-100 hover:bg-emerald-200 text-[#00875a]"
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            }`}
                          >
                            Apply
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 5. Payment Method & Live Total Calculation */}
          <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]"
              >
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="UPI">UPI (QR / PhonePe / GPay)</option>
                <option value="Card">Credit / Debit Card</option>
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-center text-right space-y-0.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Subtotal ({items.length} items):</span>
                <span>{currencySymbol}{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Delivery Charge:</span>
                <span className={deliveryCharge === 0 && items.length > 0 ? "font-bold text-emerald-700" : ""}>
                  {items.length === 0
                    ? `${currencySymbol}0`
                    : deliveryCharge === 0
                    ? "FREE"
                    : `${currencySymbol}${deliveryCharge}`}
                </span>
              </div>

              {/* Coupon Discount Row */}
              {appliedCoupon && discountAmount > 0 && (
                <div className="flex items-center justify-between text-[11px] font-bold text-[#00875a]">
                  <span>Coupon Discount ({appliedCoupon.code}):</span>
                  <span>-{currencySymbol}{discountAmount}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 mt-1">
                <span className="text-xs font-bold text-emerald-900">
                  Total Payable Amount:
                </span>
                <span className="text-lg font-black text-[#00875a]">
                  {currencySymbol}{totalAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="px-5 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white font-bold transition-all shadow-3xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Create Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
