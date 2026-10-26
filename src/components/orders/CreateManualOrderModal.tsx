"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, ShoppingCart, Check } from "lucide-react";
import { Order, OrderItem, PaymentMethod } from "@/types";

interface CreateManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (order: Partial<Order>) => void;
}

const AVAILABLE_PRODUCE = [
  { productId: "PRD-001", productName: "Fresh Hybrid Tomato", unit: "1 kg", unitPrice: 40, icon: "🍅" },
  { productId: "PRD-002", productName: "Red Onions", unit: "1 kg", unitPrice: 35, icon: "🧅" },
  { productId: "PRD-003", productName: "Organic Palak (Spinach)", unit: "1 bunch", unitPrice: 20, icon: "🥬" },
  { productId: "PRD-004", productName: "Desi Coriander", unit: "1 bunch", unitPrice: 15, icon: "🌿" },
  { productId: "PRD-005", productName: "Green Bell Pepper (Capsicum)", unit: "500 g", unitPrice: 50, icon: "🫑" },
  { productId: "PRD-006", productName: "Baby Potato", unit: "1 kg", unitPrice: 30, icon: "🥔" },
  { productId: "PRD-009", productName: "Pomegranate (Kandhari)", unit: "1 kg", unitPrice: 180, icon: "🍎" },
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
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: "item-1",
      productId: "PRD-001",
      productName: "Fresh Hybrid Tomato",
      unit: "1 kg",
      unitPrice: 40,
      quantity: 2,
      totalPrice: 80,
      imageUrl: "🍅",
    },
  ]);

  if (!isOpen) return null;

  const handleAddItem = (prod: (typeof AVAILABLE_PRODUCE)[0]) => {
    const existingIndex = items.findIndex((it) => it.productId === prod.productId);
    if (existingIndex > -1) {
      setItems((prev) =>
        prev.map((it, idx) =>
          idx === existingIndex
            ? { ...it, quantity: it.quantity + 1, totalPrice: (it.quantity + 1) * it.unitPrice }
            : it
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random()}`,
          productId: prod.productId,
          productName: prod.productName,
          unit: prod.unit,
          unitPrice: prod.unitPrice,
          quantity: 1,
          totalPrice: prod.unitPrice,
          imageUrl: prod.icon,
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

  const subtotal = items.reduce((acc, it) => acc + it.totalPrice, 0);
  const deliveryCharge = subtotal >= 299 ? 0 : 20;
  const totalAmount = subtotal + deliveryCharge;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || items.length === 0) return;

    onCreateOrder({
      customerName,
      customerPhone,
      customerAddress: customerAddress || "Kurnool Town",
      items,
      itemsCount: items.length,
      amount: totalAmount,
      subtotal,
      deliveryCharge,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#00875a] to-[#006b47] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-base font-bold">Create Manual Customer Order</h3>
              <p className="text-xs text-[#d1f2e0]">
                Quick counter order or phone booking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Naidu"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00875a] focus:bg-white text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00875a] focus:bg-white text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Delivery Address
            </label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="e.g. Door 4-12, C-Camp, Kurnool"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00875a] focus:bg-white text-xs font-semibold"
            />
          </div>

          {/* Quick Add Items Picker */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Select Fresh Produce to Add:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_PRODUCE.map((prod) => (
                <button
                  type="button"
                  key={prod.productId}
                  onClick={() => handleAddItem(prod)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#eefcf2] hover:border-[#bbf7d0] text-slate-700 hover:text-[#00875a] text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>{prod.icon}</span>
                  <span>{prod.productName}</span>
                  <span className="text-slate-400 font-normal">
                    (₹{prod.unitPrice})
                  </span>
                  <Plus className="w-3 h-3 text-[#00875a]" />
                </button>
              ))}
            </div>
          </div>

          {/* Selected Items Table */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Selected Basket Items ({items.length})
            </label>
            {items.length === 0 ? (
              <p className="text-center py-4 bg-slate-50 rounded-xl text-slate-400 font-medium">
                No items added yet. Click items above to add.
              </p>
            ) : (
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {items.map((it, idx) => (
                  <div
                    key={it.id}
                    className="p-2.5 flex items-center justify-between bg-white hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{it.imageUrl || "🥬"}</span>
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
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold text-slate-800">
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(idx, it.quantity + 1)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-slate-900 w-12 text-right">
                        ₹{it.totalPrice}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method & Total */}
          <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <option value="UPI">UPI (QR / PhonePe)</option>
                <option value="Card">Card</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col justify-center text-right">
              <span className="text-[11px] text-emerald-800 font-semibold">
                Total Payable Amount
              </span>
              <span className="text-xl font-black text-[#00875a]">
                ₹{totalAmount}
              </span>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={items.length === 0 || !customerName || !customerPhone}
              className="px-5 py-2 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Create Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
