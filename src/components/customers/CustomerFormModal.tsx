"use client";

import React, { useState, useEffect } from "react";
import { X, UserCheck, Lock, Mail, User, Image as ImageIcon, AlertCircle } from "lucide-react";
import { CustomerDetailResponse, CustomerListItem } from "@/types";

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerDetailResponse | CustomerListItem | null;
  onSave: (data: {
    fullName: string;
    email: string | null;
    profileImageUrl: string | null;
  }) => Promise<void>;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSave,
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setFullName(customer.fullName || "");
      setEmail(customer.email || "");
      setProfileImageUrl(customer.profileImageUrl || "");
      setValidationError(null);
    } else {
      setFullName("");
      setEmail("");
      setProfileImageUrl("");
      setValidationError(null);
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setValidationError("Full Name is required.");
      return;
    }

    if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);
    try {
      await onSave({
        fullName: fullName.trim(),
        email: email.trim() || null,
        profileImageUrl: profileImageUrl.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err?.message || "Failed to update customer profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Edit Customer Profile
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                UUID: {customer.id.substring(0, 16)}...
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Mobile Number (Immutable - Auth synchronization) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
              <span>Mobile Number</span>
              <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Immutable (Auth Synced)
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={customer.mobileNumber}
                disabled
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed select-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Mobile numbers are primary authentication identifiers and cannot be modified here.
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sundaram"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Profile Image URL */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Profile Image URL (Optional)
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            {profileImageUrl && (
              <div className="mt-2 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profileImageUrl}
                  alt="Preview"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <span className="text-[10px] text-slate-400">Avatar image preview</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-bold shadow-3xs transition-colors disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? "Saving changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
