"use client";

import React, { useState } from "react";
import {
  X,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Phone,
  User,
  CreditCard,
  UserPlus,
  RotateCcw,
} from "lucide-react";
import { DeliveryOrder, DeliveryStatus } from "@/types";

interface DeliveryDetailsDrawerProps {
  order: DeliveryOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, status: DeliveryStatus, reason?: string) => void;
  onOpenAssignModal: (order: DeliveryOrder) => void;
}

export const DeliveryDetailsDrawer: React.FC<DeliveryDetailsDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange,
  onOpenAssignModal,
}) => {
  const [failReasonInput, setFailReasonInput] = useState("");
  const [isFailing, setIsFailing] = useState(false);

  if (!isOpen || !order) return null;

  const getStatusBadge = () => {
    switch (order.status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Delivered
          </span>
        );
      case "Out for Delivery":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Out for Delivery
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Assignment
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            Delivery Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 transform transition-transform animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5 text-emerald-600" />
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

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            
            {/* If Failed, show alert box */}
            {order.status === "Failed" && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Reason for Failure
                </div>
                <p className="pl-6">{order.failureReason || "Customer unreachable after multiple attempts."}</p>
              </div>
            )}

            {/* Customer Information Card */}
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
                      className="text-emerald-700 hover:underline font-medium font-mono text-xs"
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
              </div>
            </div>

            {/* Delivery Partner Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Assigned Delivery Partner
                </h3>
                <button
                  type="button"
                  onClick={() => onOpenAssignModal(order)}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  {order.assignedPartnerName ? "Change Partner" : "Assign Now"}
                </button>
              </div>

              {order.assignedPartnerName ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {order.assignedPartnerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {order.assignedPartnerName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {order.assignedPartnerPhone || "+91 98765 43210"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active Rider
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
                  <p className="text-xs font-semibold text-amber-800">
                    No delivery partner assigned yet
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenAssignModal(order)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00875a] text-white text-xs font-bold shadow-3xs hover:bg-[#00704a]"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Assign Delivery Partner
                  </button>
                </div>
              )}
            </div>

            {/* Order & Payment Summary */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Order & Payment Summary
              </h3>
              <div className="flex justify-between text-slate-600">
                <span>Items Count</span>
                <span className="font-semibold text-slate-900">{order.itemsCount} items</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Mode</span>
                <span className="font-semibold text-slate-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Status</span>
                <span className="font-semibold text-emerald-700">{order.paymentStatus}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-emerald-700 font-extrabold text-base">₹{order.amount}</span>
              </div>
            </div>

            {/* Failure input form toggle */}
            {isFailing && (
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/60 space-y-2 animate-in fade-in duration-150">
                <label className="block text-xs font-bold text-red-900">
                  Reason for Delivery Failure:
                </label>
                <input
                  type="text"
                  value={failReasonInput}
                  onChange={(e) => setFailReasonInput(e.target.value)}
                  placeholder="e.g. Customer not reachable, Wrong address, Cancelled at door"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onStatusChange(order.id, "Failed", failReasonInput || "Delivery failed");
                      setIsFailing(false);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                  >
                    Confirm Failure
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFailing(false)}
                    className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Sticky Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              {order.status === "Pending" ? (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenAssignModal(order)}
                    className="col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00875a] text-white text-xs font-bold hover:bg-[#00704a] shadow-3xs transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Assign Delivery Partner
                  </button>
                </>
              ) : order.status === "Out for Delivery" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsFailing(true)}
                    className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors"
                  >
                    Mark as Failed
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onStatusChange(order.id, "Delivered");
                      onClose();
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00875a] text-white text-xs font-bold hover:bg-[#00704a] shadow-3xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Delivered
                  </button>
                </>
              ) : order.status === "Failed" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onStatusChange(order.id, "Pending");
                      onClose();
                    }}
                    className="col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-3xs transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Re-attempt Delivery
                  </button>
                </>
              ) : (
                <div className="col-span-2 text-center text-xs text-slate-500 py-1">
                  Completed on {order.deliveryTime || "09:45 AM"}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
