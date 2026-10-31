"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Phone,
  MapPin,
  Clock,
  Printer,
  Download,
  CheckCircle2,
  Copy,
  Check,
  Truck,
  CreditCard,
  User,
} from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { ProduceImage } from "@/components/common";
import { generateInvoicePdf } from "@/utils";
import { getCurrencySymbol } from "@/data/shared-store";

interface OrderDetailsProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrderDetailsContent: React.FC<OrderDetailsProps & { isDrawer?: boolean }> = ({
  order,
  onClose,
  onUpdateStatus,
  isDrawer = false,
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("₹");

  useEffect(() => {
    setCurrencySymbol(getCurrencySymbol());
    const onSettingsUpdate = () => {
      setCurrencySymbol(getCurrencySymbol());
    };
    window.addEventListener("rrv:settings:updated", onSettingsUpdate);
    return () => window.removeEventListener("rrv:settings:updated", onSettingsUpdate);
  }, []);

  if (!order) return null;

  const handleCopyPhone = () => {
    navigator.clipboard?.writeText(order.customerPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleDownloadBill = () => {
    generateInvoicePdf(order, "download");
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handlePrintBill = () => {
    generateInvoicePdf(order, "print");
  };

  const defaultItems = [
    { id: "1", productId: "PRD-1", productName: "Tomato (Hybrid)", unit: "1 kg", unitPrice: 40, quantity: 2, totalPrice: 80, imageUrl: "🍅" },
    { id: "2", productId: "PRD-2", productName: "Red Onion", unit: "1 kg", unitPrice: 35, quantity: 1, totalPrice: 35, imageUrl: "🧅" },
    { id: "3", productId: "PRD-5", productName: "Fresh Carrot", unit: "1 kg", unitPrice: 50, quantity: 1, totalPrice: 50, imageUrl: "🥕" },
    { id: "4", productId: "PRD-3", productName: "Organic Palak", unit: "1 bunch", unitPrice: 20, quantity: 1, totalPrice: 20, imageUrl: "🥬" },
    { id: "5", productId: "PRD-8", productName: "Fresh Lemon", unit: "1 kg", unitPrice: 40, quantity: 1, totalPrice: 40, imageUrl: "🍋" },
  ];

  const itemsToRender = order.items && order.items.length > 0 ? order.items : defaultItems;

  return (
    <div className="flex flex-col h-full justify-between bg-white">
      {/* Scrollable Content Container */}
      <div className="overflow-y-auto">
        {/* 1. Header with Close Button */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Order Details
            </h3>
            <span className="text-[11px] text-slate-400">
              Full customer &amp; item summary
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Order Identity Banner Matching Screenshot */}
        <div className="p-4 bg-gradient-to-r from-emerald-50/70 via-slate-50/50 to-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-base font-extrabold text-[#00875a]">
              {order.id}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                order.status === "Delivered"
                  ? "bg-[#eefcf2] text-[#15803d] border-[#bbf7d0]"
                  : order.status === "Processing" || order.status === "In Packing"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : order.status === "Out for Delivery"
                  ? "bg-teal-50 text-teal-700 border-teal-200"
                  : order.status === "Cancelled"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {order.status}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {order.orderDate || "25 Aug 2025"}, {order.orderTime}
            </span>
          </div>
        </div>

        {/* 3. Main Details Sections */}
        <div className="p-4 space-y-4 text-xs">
          {/* Customer Details Card */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Customer Details</span>
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
              <div className="font-bold text-slate-900 text-sm">
                {order.customerName}
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#00875a] flex-shrink-0" />
                  <span>{order.customerPhone}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="text-slate-400 hover:text-[#00875a] p-1 rounded transition-colors"
                  title="Copy phone"
                >
                  {copiedPhone ? (
                    <Check className="w-3.5 h-3.5 text-[#00875a]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="flex items-start gap-1.5 text-slate-600 pt-1.5 border-t border-slate-200/60">
                <MapPin className="w-3.5 h-3.5 text-[#00875a] flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed text-[11px] text-slate-700">
                  {order.customerAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items with Realistic Produce Illustrations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800">
                Order Items ({itemsToRender.length})
              </h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Fresh Produce
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden bg-white">
              {itemsToRender.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 sm:p-3 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ProduceImage name={item.productName} size={36} />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate text-xs">
                        {item.productName}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {currencySymbol}{item.unitPrice}/{item.unit} • Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 text-xs flex-shrink-0 pl-2">
                    {currencySymbol}{item.totalPrice}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Breakdown */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2">Payment Breakdown</h4>
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 font-medium">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{currencySymbol}{order.subtotal || order.amount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span>
                  {order.deliveryCharge ? `${currencySymbol}${order.deliveryCharge}` : "FREE"}
                </span>
              </div>
              {order.discount ? (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Discount (Coupon)</span>
                  <span>-{currencySymbol}{order.discount}</span>
                </div>
              ) : null}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-extrabold text-sm text-slate-900">
                <span>Total Amount</span>
                <span className="text-base text-[#00875a]">{currencySymbol}{order.amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Details with PhonePe UPI Branding */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>Payment Details</span>
            </h4>
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Method</span>
                {order.paymentMethod === "UPI" ? (
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <span className="w-4 h-4 rounded-md bg-[#5f259f] text-white flex items-center justify-center text-[9px] font-black">
                      पे
                    </span>
                    <span>UPI (PhonePe)</span>
                  </div>
                ) : (
                  <span className="font-semibold text-slate-800">
                    {order.paymentMethod}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Transaction ID</span>
                <span className="font-mono text-[11px] font-semibold text-slate-700">
                  {order.transactionId || "TXN" + order.id.replace("#", "")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Status</span>
                <span
                  className={`font-bold ${
                    order.paymentStatus === "Paid"
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div>
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>Order Timeline</span>
            </h4>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {(order.timeline || [
                { status: "Order Placed", time: order.orderTime, completed: true },
                { status: "Payment Confirmed", time: "Instant", completed: true },
                { status: "Processing", time: "In Progress", completed: order.status !== "Pending" },
                {
                  status: "Out for Delivery",
                  time: "Pending",
                  completed: order.status === "Out for Delivery" || order.status === "Delivered",
                },
                { status: "Delivered", time: "Pending", completed: order.status === "Delivered" },
              ]).map((t, idx) => {
                const isCancelledEvent = t.status === "Cancelled";
                return (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCancelledEvent
                          ? "bg-rose-600 border-white text-white shadow-3xs"
                          : t.completed
                          ? "bg-[#00875a] border-white text-white shadow-3xs"
                          : "bg-white border-slate-300 text-transparent"
                      }`}
                    >
                      {isCancelledEvent ? (
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      ) : (
                        t.completed && <CheckCircle2 className="w-3 h-3" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-semibold ${
                          isCancelledEvent
                            ? "text-rose-700"
                            : t.completed
                            ? "text-slate-800"
                            : "text-slate-400"
                        }`}
                      >
                        {t.status}
                      </span>
                      <span
                        className={`text-[10px] font-medium ${
                          isCancelledEvent ? "text-rose-600 font-semibold" : "text-slate-400"
                        }`}
                      >
                        {t.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Actions Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 sticky bottom-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">Status:</span>
          <select
            value={order.status}
            onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#00875a]"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="In Packing">In Packing</option>
            <option value="Packed">Packed</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handlePrintBill}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-3xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Official Invoice</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadBill}
            className="px-3 py-2 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-3xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadSuccess ? "PDF Saved!" : "Download PDF Bill"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 1. Embedded Desktop Side Panel (Matching Page 5 & Screenshot)
export const OrderDetailsPanel: React.FC<OrderDetailsProps> = ({
  order,
  onClose,
  onUpdateStatus,
}) => {
  if (!order) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-3xs overflow-hidden flex flex-col max-h-[calc(100vh-140px)] sticky top-20 animate-in fade-in zoom-in-95 duration-200">
      <OrderDetailsContent
        order={order}
        onClose={onClose}
        onUpdateStatus={onUpdateStatus}
        isDrawer={false}
      />
    </div>
  );
};

// 2. Slide-over Drawer (for mobile / overlay)
interface OrderDetailsDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          <OrderDetailsContent
            order={order}
            onClose={onClose}
            onUpdateStatus={onUpdateStatus}
            isDrawer={true}
          />
        </div>
      </div>
    </div>
  );
};
