"use client";

import React, { useState } from "react";
import { X, UserPlus, Check, Bike, Phone, MapPin, AlertCircle } from "lucide-react";
import { DeliveryOrder, DeliveryPartner } from "@/types";

interface AssignPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: DeliveryOrder | null;
  partners: DeliveryPartner[];
  onAssign: (orderId: string, partnerId: string, partnerName: string, partnerPhone?: string) => void;
}

export const AssignPartnerModal: React.FC<AssignPartnerModalProps> = ({
  isOpen,
  onClose,
  order,
  partners,
  onAssign,
}) => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    order?.assignedPartnerId || (partners[0]?.id || "")
  );

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const partner = partners.find((p) => p.id === selectedPartnerId);
    if (partner) {
      onAssign(order.id, partner.id, partner.name, partner.phone);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Assign Delivery Partner
              </h3>
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

        {/* Order Details Brief */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Destination:</span>
            <span className="font-semibold text-slate-800 text-right max-w-[260px] truncate">
              {order.customerAddress}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Area:</span>
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
              {order.area}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Order Items / Amount:</span>
            <span className="font-bold text-slate-900">
              {order.itemsCount} items • ₹{order.amount} ({order.paymentMethod})
            </span>
          </div>
        </div>

        {/* Partner Selection List */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Delivery Rider
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {partners.map((partner) => {
                const isSelected = selectedPartnerId === partner.id;
                return (
                  <div
                    key={partner.id}
                    onClick={() => setSelectedPartnerId(partner.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? "bg-[#00875a] text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {partner.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {partner.name}
                          </span>
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                            ⭐ {partner.rating}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {partner.phone} • {partner.vehicleDetails || "Motorcycle"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 block">
                        {partner.activeDeliveries || 0} active
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {partner.totalDeliveries} done today
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedPartnerId}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#00875a] text-white text-xs font-bold hover:bg-[#00704a] shadow-3xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Confirm Assignment
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
