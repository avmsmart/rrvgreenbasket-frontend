"use client";

import React, { useState } from "react";
import {
  User,
  Pencil,
  Check,
  X,
  ShieldCheck,
  Mail,
  Phone,
  AlertCircle,
  Info,
} from "lucide-react";
import { CustomerUser } from "@/types/customer-auth";

interface CustomerPersonalInformationProps {
  customer: CustomerUser | null;
  onUpdate: (data: Partial<CustomerUser>) => void;
}

const AVATAR_OPTIONS = ["🧺", "🌾", "🍎", "🥑", "🥕", "🥦", "🍊", "🍓"];

export const CustomerPersonalInformation: React.FC<CustomerPersonalInformationProps> = ({
  customer,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(customer?.fullName || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [selectedAvatar, setSelectedAvatar] = useState(customer?.avatarUrl || "🧺");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleEditClick = () => {
    setFullName(customer?.fullName || "");
    setEmail(customer?.email || "");
    setSelectedAvatar(customer?.avatarUrl || "🧺");
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setFullName(customer?.fullName || "");
    setEmail(customer?.email || "");
    setSelectedAvatar(customer?.avatarUrl || "🧺");
    setErrorMessage(null);
    setIsEditing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Full name must contain at least 2 characters.");
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    onUpdate({
      fullName: fullName.trim(),
      email: email.trim(),
      avatarUrl: selectedAvatar,
    });

    setIsEditing(false);
    setSuccessMessage("Profile updated successfully!");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <User className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Personal Information
            </h1>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Manage your personal profile details and contact preferences
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={handleEditClick}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-800 transition active:scale-95"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelClick}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-800 transition active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* View Mode */}
      {!isEditing ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Full Name
            </span>
            <p className="mt-1.5 text-sm font-bold text-gray-900">
              {customer?.fullName || "Not provided"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Mobile Number
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>Verified</span>
              </span>
            </div>
            <p className="mt-1.5 text-sm font-mono font-bold text-gray-900">
              {customer?.mobileNumber || "Not available"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Email Address
            </span>
            <p className="mt-1.5 text-sm font-semibold text-gray-900">
              {customer?.email || "No email address linked"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Account Status &amp; ID
            </span>
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-xs text-gray-600 font-mono truncate max-w-[180px]">
                {customer?.publicId || "CUST-RRV-LIVE"}
              </p>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                Active Member
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Choose Profile Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedAvatar(icon)}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition ${
                    selectedAvatar === icon
                      ? "bg-emerald-700 text-white ring-2 ring-emerald-600 scale-105 shadow-md"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Mahendra Kumar"
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <div>
              <p className="font-bold">Mobile Number Security</p>
              <p className="mt-0.5 text-amber-800">
                Your registered mobile number ({customer?.mobileNumber}) is used for OTP logins. To update your mobile number, please contact customer support.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancelClick}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-800"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CustomerPersonalInformation;
