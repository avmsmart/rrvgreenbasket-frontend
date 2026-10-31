"use client";

import React from "react";

interface CustomerLogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
}

export const CustomerLogoutDialog: React.FC<CustomerLogoutDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transition-all scale-100 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 text-2xl">
          🚪
        </div>

        <h3
          id="logout-dialog-title"
          className="text-center text-lg font-bold text-gray-900"
        >
          Sign Out of RRV Green Basket?
        </h3>

        <p className="mt-2 text-center text-sm text-gray-500">
          Are you sure you want to end your current session? You will need your mobile OTP to log in again.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-red-700 active:scale-[0.99] disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isLoggingOut ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <span>Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogoutDialog;
