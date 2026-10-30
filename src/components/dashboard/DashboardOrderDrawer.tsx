"use client";

import React from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  CreditCard,
  Truck,
  ExternalLink,
  Printer,
  Download,
} from "lucide-react";
import Link from "next/link";
import { generateInvoicePdf } from "@/utils";
import { DashboardOrder } from "./DashboardMiddleRow";

interface DashboardOrderDrawerProps {
  order: DashboardOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardOrderDrawer: React.FC<DashboardOrderDrawerProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const handlePrintInvoice = () => {
    generateInvoicePdf(
      {
        id: order.id,
        customerName: order.customerName,
        customerPhone: "+91 94401 28912",
        customerAddress: "Flat 402, Green Meadows, Kurnool",
        amount: order.amount,
        subtotal: order.amount - 20,
        deliveryCharge: 20,
        discount: 0,
        paymentMethod: "UPI",
        paymentStatus: "Paid",
        status: order.status as any,
        orderTime: order.time,
        items: [
          {
            id: "1",
            productId: "PRD-1",
            productName: "Fresh Hybrid Tomato",
            unit: "Kg",
            unitPrice: 34,
            quantity: 2,
            totalPrice: 68,
            hsnCode: "7101000",
          },
          {
            id: "2",
            productId: "PRD-2",
            productName: "Premium Red Onion",
            unit: "Kg",
            unitPrice: 42,
            quantity: 3,
            totalPrice: 126,
            hsnCode: "7101000",
          },
          {
            id: "3",
            productId: "PRD-3",
            productName: "Baby Spinach (Palak)",
            unit: "Bunch",
            unitPrice: 20,
            quantity: 2,
            totalPrice: 40,
            hsnCode: "7101000",
          },
        ],
      },
      "print"
    );
  };

  const handleDownloadInvoice = () => {
    generateInvoicePdf(
      {
        id: order.id,
        customerName: order.customerName,
        customerPhone: "+91 94401 28912",
        customerAddress: "Flat 402, Green Meadows, Kurnool",
        amount: order.amount,
        subtotal: order.amount - 20,
        deliveryCharge: 20,
        discount: 0,
        paymentMethod: "UPI",
        paymentStatus: "Paid",
        status: order.status as any,
        orderTime: order.time,
        items: [
          {
            id: "1",
            productId: "PRD-1",
            productName: "Fresh Hybrid Tomato",
            unit: "Kg",
            unitPrice: 34,
            quantity: 2,
            totalPrice: 68,
            hsnCode: "7101000",
          },
          {
            id: "2",
            productId: "PRD-2",
            productName: "Premium Red Onion",
            unit: "Kg",
            unitPrice: 42,
            quantity: 3,
            totalPrice: 126,
            hsnCode: "7101000",
          },
          {
            id: "3",
            productId: "PRD-3",
            productName: "Baby Spinach (Palak)",
            unit: "Bunch",
            unitPrice: 20,
            quantity: 2,
            totalPrice: 40,
            hsnCode: "7101000",
          },
        ],
      },
      "download"
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900">
                  Order {order.id}
                </span>
                {order.status === "Delivered" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]">
                    Delivered
                  </span>
                )}
                {order.status === "Processing" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Processing
                  </span>
                )}
                {order.status === "Cancelled" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                    Cancelled
                  </span>
                )}
                {order.status === "Pending" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Placed today at {order.time}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 shadow-3xs transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6">
            {/* Customer Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Customer Information
              </h4>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Name:</span>
                </span>
                <span className="font-bold text-slate-900">{order.customerName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phone:</span>
                </span>
                <span className="font-mono text-slate-800">+91 94401 28912</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Delivery Address:</span>
                </span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                  Sector 2, Kurnool Town
                </span>
              </div>
            </div>

            {/* Estimated Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Order Items ({order.itemsCount})
                </h4>
                <span className="text-xs font-bold text-slate-700">Total: ₹{order.amount}</span>
              </div>

              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white p-3 space-y-2">
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-slate-800">Fresh Hybrid Tomato</span>
                  <span className="font-semibold text-slate-500">1 kg • ₹34</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="font-bold text-slate-800">Red Onions (Nasik Grade)</span>
                  <span className="font-semibold text-slate-500">2 kg • ₹112</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="font-bold text-slate-800">Green Bell Pepper (Capsicum)</span>
                  <span className="font-semibold text-slate-500">500 g • ₹46</span>
                </div>
                {order.itemsCount > 3 && (
                  <div className="flex items-center justify-between text-xs pt-2 text-slate-400 italic">
                    <span>+{order.itemsCount - 3} additional fresh items</span>
                    <span>included</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Logistics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Payment Method
                </span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#00875a]" />
                  <span>UPI / Paid</span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Delivery Partner
                </span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#00875a]" />
                  <span>Ravi Kumar</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50/70 space-y-2.5">
          {/* Invoice Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrintInvoice}
              className="py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-3xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Invoice</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-[#00875a] text-xs font-bold flex items-center justify-center gap-1.5 shadow-3xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#00875a]" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <Link
              href="/admin/orders"
              className="flex-1 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold text-center shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Full Order View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
