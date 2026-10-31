"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { CustomerAddress } from "@/types/customer-address";

interface DeleteAddressDialogProps {
  isOpen: boolean;
  address: CustomerAddress | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export const DeleteAddressDialog: React.FC<DeleteAddressDialogProps> = ({
  isOpen,
  address,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen || !address) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-address-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3
          id="delete-address-title"
          className="text-center text-lg font-bold text-gray-900 tracking-tight"
        >
          Delete Delivery Address?
        </h3>

        <p className="mt-2 text-center text-xs text-gray-500 leading-relaxed">
          Are you sure you want to remove this delivery address? This action cannot be undone.
        </p>

        {/* Address Preview Box */}
        <div className="mt-4 rounded-2xl bg-gray-50 p-3.5 border border-gray-100 text-left">
          <p className="text-xs font-bold text-gray-900">
            {address.receiverName} •{" "}
            <span className="text-[11px] font-semibold text-gray-500 uppercase">
              {address.addressType}
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-600 truncate">
            {address.addressLine1}, {address.city} - {address.pincode}
          </p>
          {address.isDefault && (
            <p className="mt-2 text-[11px] font-bold text-emerald-800 bg-emerald-50 rounded-lg px-2 py-1 border border-emerald-200">
              ℹ️ This is your default address. Deleting it will automatically promote your next address as default.
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 disabled:opacity-50 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white shadow hover:bg-red-700 active:scale-95 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Confirm Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAddressDialog;
