"use client";

import React, { useState } from "react";
import {
  X,
  Phone,
  MapPin,
  Bike,
  Package,
  Calendar,
  Star,
  Award,
  CheckCircle2,
  FileText,
  Clock,
  TrendingUp,
  Edit2,
  ExternalLink,
} from "lucide-react";
import { DeliveryPartner } from "@/types";

interface PartnerDetailsCardProps {
  partner: DeliveryPartner | null;
  onClose?: () => void;
  onEdit?: (partner: DeliveryPartner, tab?: "details" | "vehicle" | "performance" | "documents") => void;
  onStatusChange?: (partner: DeliveryPartner, newStatus: DeliveryPartner["status"]) => void;
}

export const PartnerDetailsCard: React.FC<PartnerDetailsCardProps> = ({
  partner,
  onClose,
  onEdit,
  onStatusChange,
}) => {
  const [activeTab, setActiveTab] = useState<"details" | "performance" | "documents">("details");

  if (!partner) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-3xs flex flex-col items-center justify-center text-center h-[520px]">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <Bike className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Partner Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
          Click any partner in the list to view their detailed profile, performance, and documents.
        </p>
      </div>
    );
  }

  const numId = parseInt((partner.id || "1").replace(/\D/g, "") || "1");
  const dlNumber = partner.drivingLicenseNumber || `AP21-${2018 + (numId % 5)}-00${49280 + numId}`;
  const dlStatus = partner.drivingLicenseStatus || "Verified";
  const rcNumber = partner.vehicleRcNumber || partner.vehicleNumber || `AP 21 AB ${4320 + numId}`;
  const rcStatus = partner.vehicleRcStatus || "Verified";
  const aadhaarNumber = partner.aadhaarNumber || `XXXX-XXXX-${8920 + numId}`;
  const aadhaarStatus = partner.aadhaarStatus || "Verified";
  const bankAccount = partner.bankAccountDetails || `SBI •••• ${4520 + numId}`;
  const bankStatus = partner.bankAccountStatus || "Verified";

  const renderDocStatus = (st: "Verified" | "Pending" | "Rejected") => {
    if (st === "Verified") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3 h-3" /> Verified
        </span>
      );
    }
    if (st === "Pending") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
        <X className="w-3 h-3" /> Rejected
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs overflow-hidden flex flex-col">
      {/* 1. Header with Avatar & Status */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/50 via-slate-50/40 to-white border-b border-slate-200/80">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
              {partner.avatar || partner.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  {partner.name}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    partner.status === "Active"
                      ? "bg-emerald-100 text-emerald-800"
                      : partner.status === "On Delivery"
                      ? "bg-blue-100 text-blue-800"
                      : partner.status === "Idle"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {partner.status}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                ID: #{partner.id} • Joined: {partner.joinedDate || "Jan 15, 2024"}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2. Sub Tabs: Details | Performance | Documents */}
        <div className="flex items-center gap-1 mt-4 p-1 bg-slate-100/90 rounded-xl text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
              activeTab === "details"
                ? "bg-white text-emerald-800 shadow-3xs"
                : "hover:text-slate-900"
            }`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("performance")}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
              activeTab === "performance"
                ? "bg-white text-emerald-800 shadow-3xs"
                : "hover:text-slate-900"
            }`}
          >
            Performance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
              activeTab === "documents"
                ? "bg-white text-emerald-800 shadow-3xs"
                : "hover:text-slate-900"
            }`}
          >
            Documents
          </button>
        </div>
      </div>

      {/* 3. Tab Contents */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
        {activeTab === "details" && (
          <>
            {/* Info Items */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
                </span>
                <a
                  href="tel:8247329044"
                  className="font-bold text-emerald-700 hover:underline"
                >
                  824 732 9044
                </a>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Assigned Area
                </span>
                <span className="font-bold text-slate-800">{partner.area}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Bike className="w-3.5 h-3.5 text-slate-400" /> Vehicle
                </span>
                <span className="font-bold text-slate-800">
                  {partner.vehicleDetails || "Honda Activa (AP 21 AB 4321)"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Package className="w-3.5 h-3.5 text-slate-400" /> Current Order
                </span>
                {partner.currentOrder ? (
                  <span className="font-bold text-blue-600 flex items-center gap-1">
                    <span>{partner.currentOrder}</span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded">
                      Out for Delivery
                    </span>
                  </span>
                ) : (
                  <span className="font-medium text-slate-400">None currently</span>
                )}
              </div>
            </div>

            {/* Last 30 Days Stats 2x2 Grid */}
            <div className="pt-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Last 30 Days
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] text-slate-500 font-medium">Deliveries</span>
                  <p className="text-lg font-black text-slate-900 mt-0.5">
                    {partner.monthlyDeliveries ?? partner.totalDeliveries}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
                  <span className="text-[11px] text-emerald-800 font-medium">On-Time</span>
                  <p className="text-lg font-black text-emerald-700 mt-0.5">
                    {partner.onTimeDeliveries ?? Math.round(partner.totalDeliveries * 0.92)}{" "}
                    <span className="text-xs font-semibold text-emerald-600">
                      ({partner.onTimeRate || "92%"})
                    </span>
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
                  <span className="text-[11px] text-emerald-800 font-medium">Rating</span>
                  <p className="text-lg font-black text-emerald-700 mt-0.5 flex items-center gap-1">
                    <span>{partner.rating.toFixed(1)}</span>
                    <Star className="w-4 h-4 fill-emerald-500 text-emerald-600" />
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] text-slate-500 font-medium">Earnings</span>
                  <p className="text-lg font-black text-slate-900 mt-0.5">
                    ₹ {(partner.monthlyEarnings ?? 12450).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "performance" && (
          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-600 font-medium">On-Time Delivery Rate</span>
                <span className="font-bold text-emerald-700">
                  {partner.onTimeRate || "92%"}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: partner.onTimeRate || "92%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-600 font-medium">Order Acceptance Rate</span>
                <span className="font-bold text-slate-800">
                  {partner.orderAcceptanceRate || "98%"}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: partner.orderAcceptanceRate || "98%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-600 font-medium">Customer Satisfaction</span>
                <span className="font-bold text-amber-700">
                  {partner.customerSatisfaction || "96%"}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: partner.customerSatisfaction || "96%" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[11px] text-slate-500 font-medium">Avg Delivery Time</span>
                <p className="text-base font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {partner.avgDeliveryTime || "22 mins"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[11px] text-slate-500 font-medium">Distance Covered</span>
                <p className="text-base font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                  {partner.distanceCovered || "340 km"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="font-bold text-slate-800">Driving License</p>
                  <p className="text-[11px] text-slate-400">{dlNumber}</p>
                </div>
              </div>
              {renderDocStatus(dlStatus)}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="font-bold text-slate-800">Vehicle RC</p>
                  <p className="text-[11px] text-slate-400">{rcNumber}</p>
                </div>
              </div>
              {renderDocStatus(rcStatus)}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="font-bold text-slate-800">Aadhaar Card</p>
                  <p className="text-[11px] text-slate-400">{aadhaarNumber}</p>
                </div>
              </div>
              {renderDocStatus(aadhaarStatus)}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="font-bold text-slate-800">Bank Account</p>
                  <p className="text-[11px] text-slate-400">{bankAccount}</p>
                </div>
              </div>
              {renderDocStatus(bankStatus)}
            </div>
          </div>
        )}
      </div>

      {/* 4. Action Buttons Footer */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex items-center gap-2">
        <a
          href="tel:8247329044"
          className="flex-1 py-2 px-3 bg-[#00875a] hover:bg-[#00704a] text-white font-bold text-xs rounded-xl text-center shadow-3xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Partner (824 732 9044)</span>
        </a>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(partner, activeTab)}
            className="py-2 px-3 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-3xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {activeTab === "performance"
                ? "Edit Performance"
                : activeTab === "documents"
                ? "Edit Documents"
                : "Edit Profile"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
