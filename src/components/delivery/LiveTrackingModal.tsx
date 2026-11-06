"use client";

import React from "react";
import {
  X,
  Navigation,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Bike,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { DeliveryOrder } from "@/types";

interface LiveTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: DeliveryOrder | null;
  onMarkDelivered: (orderId: string) => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  isOpen,
  onClose,
  order,
  onMarkDelivered,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Live Delivery Tracking
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Order {order.id} • {order.customerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Map Preview Graphic */}
        <div className="my-4 relative h-48 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
          {/* Subtle grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:14px_14px] opacity-40"></div>

          {/* SVG Map visualization */}
          <svg viewBox="0 0 400 180" className="w-full h-full">
            {/* Route path */}
            <path
              d="M 60 120 C 140 120, 200 60, 320 60"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeDasharray="6 6"
              className="animate-pulse"
            />

            {/* Hub Start point */}
            <circle cx="60" cy="120" r="10" fill="#00875a" fillOpacity="0.2" />
            <circle cx="60" cy="120" r="5" fill="#00875a" />
            <text x="35" y="145" fill="#00875a" fontSize="10" fontWeight="bold">
              Hub
            </text>

            {/* Rider moving position */}
            <g transform="translate(200, 78)">
              <circle r="14" fill="#ffffff" stroke="#3b82f6" strokeWidth="2.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
              <circle r="5" fill="#3b82f6" />
              <text x="-20" y="-18" fill="#1e293b" fontSize="10" fontWeight="bold">
                🚴 {order.assignedPartnerName || "Rider"}
              </text>
            </g>

            {/* Customer Destination Pin */}
            <g transform="translate(320, 60)">
              <circle r="10" fill="#ef4444" fillOpacity="0.2" />
              <circle r="5" fill="#ef4444" />
              <text x="-25" y="25" fill="#1e293b" fontSize="10" fontWeight="bold">
                {order.area}
              </text>
            </g>
          </svg>

          {/* ETA Badge */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs">
            <span className="font-bold text-slate-900">ETA: ~12 mins</span>
            <span className="text-slate-500 block text-[10px]">1.8 km to destination</span>
          </div>
        </div>

        {/* Assigned Rider Card */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
              {(order.assignedPartnerName || "R").charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {order.assignedPartnerName || "Assigned Driver"}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {order.assignedPartnerPhone || "+91 91234 56789"}
              </p>
            </div>
          </div>

          <a
            href={`tel:${order.assignedPartnerPhone || "9123456789"}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-3xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Call Rider
          </a>
        </div>

        {/* Delivery Details */}
        <div className="space-y-2 text-xs text-slate-600 mb-5">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <span className="text-slate-800">{order.customerAddress}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Payment Mode:</span>
            <span className="font-bold text-slate-900">{order.paymentMethod} (₹{order.amount})</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onMarkDelivered(order.id);
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#00875a] text-white text-xs font-bold hover:bg-[#00704a] shadow-3xs transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Delivered
          </button>
        </div>

      </div>
    </div>
  );
};
