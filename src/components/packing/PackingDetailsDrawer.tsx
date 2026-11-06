"use client";

import React, { useState } from "react";
import {
  X,
  Printer,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Phone,
  User,
  CreditCard,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { PackingOrder, PackingOrderItem } from "@/types";
import { ProduceImage } from "@/components/common/ProduceImage";

interface PackingDetailsDrawerProps {
  order: PackingOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onItemToggle: (orderId: string, itemId: string) => void;
  onPackAllItems: (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: "Pending" | "In Packing" | "Packed") => void;
  onPrintSlip: (order: PackingOrder) => void;
}

export const PackingDetailsDrawer: React.FC<PackingDetailsDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onItemToggle,
  onPackAllItems,
  onStatusChange,
  onPrintSlip,
}) => {
  if (!isOpen || !order) return null;

  const packedItemsCount = order.items.filter((it) => it.isPacked).length;
  const totalItemsCount = order.items.length;
  const allPacked = totalItemsCount > 0 && packedItemsCount === totalItemsCount;
  const progressPercent =
    totalItemsCount > 0 ? Math.round((packedItemsCount / totalItemsCount) * 100) : 0;

  const getStatusBadge = () => {
    switch (order.status) {
      case "Packed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Packed
          </span>
        );
      case "In Packing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            In Packing
          </span>
        );
      case "Pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 transform transition-transform animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{order.id}</h2>
                  {getStatusBadge()}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ordered: {order.orderDate} • {order.orderTime}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* Packing Progress Bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Items Packed: {packedItemsCount} of {totalItemsCount}
                </span>
                <span className="text-emerald-700 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Customer Information
              </h3>
              
              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-900">{order.customerName}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="text-emerald-700 hover:underline font-medium"
                    >
                      {order.customerPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1 text-slate-600 text-xs leading-relaxed">
                    {order.customerAddress}
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {order.area}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1 border-t border-slate-100 text-xs">
                  <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600 font-medium">Payment:</span>
                  <span className="text-slate-900 font-semibold">{order.paymentMethod}</span>
                  <span
                    className={`ml-auto px-2 py-0.5 rounded text-[11px] font-semibold ${
                      order.paymentStatus === "Paid"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Order Items ({totalItemsCount})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Check off each item as you pack it into the basket
                  </p>
                </div>
                {!allPacked && (
                  <button
                    onClick={() => onPackAllItems(order.id)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 transition-colors"
                  >
                    Pack All
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-3xs">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onItemToggle(order.id, item.id)}
                    className={`p-3.5 flex items-center gap-3 transition-colors cursor-pointer select-none ${
                      item.isPacked
                        ? "bg-emerald-50/40 hover:bg-emerald-50/60"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="shrink-0 text-slate-400">
                      {item.isPacked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Square className="w-5 h-5 hover:text-slate-600" />
                      )}
                    </div>

                    {/* Produce Thumbnail */}
                    <ProduceImage name={item.productName} size={36} className="shrink-0" />

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-semibold truncate ${
                            item.isPacked
                              ? "text-slate-500 line-through decoration-slate-400"
                              : "text-slate-900"
                          }`}
                        >
                          {item.productName}
                        </p>
                        <span className="text-sm font-bold text-slate-900 ml-2">
                          ₹{item.totalPrice}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
                        <span>
                          {item.quantity} {item.unit} × ₹{item.unitPrice}
                        </span>
                        {item.isPacked && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Bill Summary
              </h3>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalItemsCount} items)</span>
                <span className="font-semibold text-slate-900">₹{order.subtotal || order.amount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-900">
                  {order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-semibold">-₹{order.discount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-emerald-700 font-extrabold text-base">₹{order.amount}</span>
              </div>
            </div>

            {/* Notes if any */}
            {order.notes && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Packing Instructions: </span>
                  {order.notes}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onPrintSlip(order)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-3xs"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                Print Packing Slip
              </button>

              {order.status === "Pending" ? (
                <button
                  type="button"
                  onClick={() => onStatusChange(order.id, "In Packing")}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-3xs"
                >
                  <Package className="w-4 h-4" />
                  Start Packing
                </button>
              ) : order.status === "In Packing" ? (
                <button
                  type="button"
                  onClick={() => onStatusChange(order.id, "Packed")}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00875a] text-white text-xs font-bold hover:bg-[#00704a] transition-colors shadow-3xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Packed
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onStatusChange(order.id, "In Packing")}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors shadow-3xs"
                >
                  Reopen Packing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
