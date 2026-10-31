"use client";

import React from "react";
import {
  Home,
  Briefcase,
  MapPin,
  Phone,
  Pencil,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { CustomerAddress } from "@/types/customer-address";

interface CustomerAddressCardProps {
  address: CustomerAddress;
  onEdit: (address: CustomerAddress) => void;
  onDelete: (address: CustomerAddress) => void;
  onSetDefault: (address: CustomerAddress) => void;
  isSettingDefault?: boolean;
}

export const CustomerAddressCard: React.FC<CustomerAddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault = false,
}) => {
  const renderTypeBadge = () => {
    switch (address.addressType) {
      case "HOME":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            <Home className="w-3.5 h-3.5" />
            <span>HOME</span>
          </span>
        );
      case "WORK":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 border border-blue-200">
            <Briefcase className="w-3.5 h-3.5" />
            <span>WORK</span>
          </span>
        );
      case "OTHER":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-800 border border-purple-200">
            <MapPin className="w-3.5 h-3.5" />
            <span>OTHER</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl p-5 transition-all duration-200 border ${
        address.isDefault
          ? "border-emerald-600 bg-white shadow-md ring-1 ring-emerald-600/30"
          : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md"
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {renderTypeBadge()}
            {address.isDefault && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>DEFAULT ADDRESS</span>
              </span>
            )}
          </div>
        </div>

        {/* Receiver Name */}
        <h3 className="mt-4 text-base font-bold text-gray-900 tracking-tight">
          {address.receiverName}
        </h3>

        {/* Address Lines */}
        <div className="mt-2 space-y-0.5 text-xs text-gray-600 leading-relaxed">
          <p className="font-medium text-gray-800">
            {address.addressLine1}
            {address.addressLine2 ? `, ${address.addressLine2}` : ""}
          </p>
          {address.landmark && (
            <p className="text-gray-500">
              <span className="font-medium text-gray-600">Landmark:</span>{" "}
              {address.landmark}
            </p>
          )}
          <p className="font-medium text-gray-800">
            {address.city}, {address.state} –{" "}
            <span className="font-mono font-bold text-gray-900">
              {address.pincode}
            </span>
          </p>
          <p className="text-gray-500">{address.country || "India"}</p>
        </div>

        {/* Contact Mobile */}
        <div className="mt-3.5 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-700 border border-gray-100">
          <Phone className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-medium text-gray-500">Mobile:</span>
          <span className="font-mono font-bold text-gray-900">
            {address.receiverMobile}
          </span>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="mt-5 pt-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(address)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-emerald-600 hover:text-emerald-800 transition active:scale-95"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(address)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:border-red-300 hover:bg-red-50 transition active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        {!address.isDefault && (
          <button
            type="button"
            onClick={() => onSetDefault(address)}
            disabled={isSettingDefault}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition active:scale-95 disabled:opacity-50"
          >
            {isSettingDefault ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Set as Default</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerAddressCard;
