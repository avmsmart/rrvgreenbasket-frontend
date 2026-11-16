"use client";

import React from "react";
import { MapPin, CheckCircle2, RotateCcw, Building, ShieldCheck } from "lucide-react";
import { VerifiedAddress } from "@/types/location";

interface AddressConfirmationProps {
  address: VerifiedAddress;
  onConfirm: () => void;
  onSearchAnother: () => void;
  isLoading?: boolean;
}

export const AddressConfirmation: React.FC<AddressConfirmationProps> = ({
  address,
  onConfirm,
  onSearchAnother,
  isLoading = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs sm:text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Location</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Kurnool Region
          </span>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-900 leading-snug">
            {address.displayName || address.city}
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {address.formattedAddress}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100/70 text-[11px]">
          <div>
            <span className="text-slate-400 block font-medium">City & State</span>
            <span className="font-bold text-slate-700">
              {address.city}, {address.state}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Postal PIN Code</span>
            <span className="font-bold text-slate-700">
              {address.pincode || "518001/518002"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Checking Availability...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify Delivery Availability</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onSearchAnother}
          disabled={isLoading}
          className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition cursor-pointer"
        >
          Change Location
        </button>
      </div>
    </div>
  );
};
