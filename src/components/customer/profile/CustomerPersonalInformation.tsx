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
  Lock,
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
  const [selectedAvatar, setSelectedAvatar] = useState(customer?.avatarUrl || "🧺");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleEditClick = () => {
    setFullName(customer?.fullName || "");
    setSelectedAvatar(customer?.avatarUrl || "🧺");
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setFullName(customer?.fullName || "");
    setSelectedAvatar(customer?.avatarUrl || "🧺");
    setErrorMessage(null);
    setIsEditing(false);
  };

  // Customers can only change their name and profile icon.
  // Mobile number and email are never sent in the update.
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Full name must contain at least 2 characters.");
      return;
    }

    onUpdate({
      fullName: fullName.trim(),
      avatarUrl: selectedAvatar,
    });

    setIsEditing(false);
    setSuccessMessage("Profile updated successfully!");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const displayAvatar = isEditing ? selectedAvatar : customer?.avatarUrl;
  const initial = (customer?.fullName || "?").trim().charAt(0).toUpperCase();

  const editButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 active:scale-[0.98]";

  const detailRows = [
    {
      label: "Full name",
      value: customer?.fullName || "Not provided",
      icon: User,
      iconClass: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Mobile number",
      value: customer?.mobileNumber || "Not available",
      icon: Phone,
      iconClass: "bg-orange-50 text-orange-600",
      verified: true,
    },
    {
      label: "Email address",
      value: customer?.email || "No email address linked",
      icon: Mail,
      iconClass: "bg-blue-50 text-blue-700",
    },
  ];

  return (
    <div className="w-full bg-white px-4 py-5 text-slate-900 sm:px-6 sm:py-7">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              {displayAvatar || initial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Customer account
              </p>
              <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Personal Information
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your name and contact details
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={handleEditClick}
              className={`${editButtonClass} bg-orange-500 text-white hover:bg-orange-600`}
            >
              <Pencil className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        <div className="pt-5">
          {successMessage && (
            <div className="mb-4 flex items-center gap-2 border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              <Check className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isEditing ? (
            <div className="divide-y divide-slate-100">
              {detailRows.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 py-5 sm:gap-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.iconClass}`}>
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-slate-900 sm:text-base">
                        {item.value}
                      </p>
                    </div>
                    {item.verified && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleSave} className="max-w-3xl space-y-6">
              <div>
                <span className="block text-sm font-semibold text-slate-800">
                  Choose profile icon
                </span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      aria-label={`Select ${icon} icon`}
                      aria-pressed={selectedAvatar === icon}
                      onClick={() => setSelectedAvatar(icon)}
                      className={`flex h-11 w-11 items-center justify-center rounded-lg text-xl transition ${
                        selectedAvatar === icon
                          ? "bg-emerald-50 ring-2 ring-emerald-600"
                          : "bg-slate-50 hover:bg-orange-50"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cpi-name" className="block text-sm font-semibold text-slate-800">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cpi-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Mahendra Kumar"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />
                </div>

                <div>
                  <label htmlFor="cpi-mobile" className="block text-sm font-semibold text-slate-800">
                    Mobile number
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="cpi-mobile"
                      type="text"
                      value={customer?.mobileNumber || ""}
                      readOnly
                      disabled
                      className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 text-sm text-slate-500"
                    />
                    <Lock className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="cpi-email" className="block text-sm font-semibold text-slate-800">
                    Email address
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="cpi-email"
                      type="email"
                      value={customer?.email || ""}
                      readOnly
                      disabled
                      className="w-full cursor-not-allowed truncate rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 text-sm text-slate-500"
                    />
                    <Lock className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 border-l-4 border-blue-500 bg-blue-50 px-4 py-3 text-xs text-blue-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                <div>
                  <p className="font-bold">You can only change your name and profile icon</p>
                  <p className="mt-1 leading-5 text-blue-800">
                    Your mobile number and email are linked to your account and can&apos;t be
                    edited. To update them, please contact customer support.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:min-w-32"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 sm:min-w-36"
                >
                  <Check className="h-4 w-4" />
                  <span>Save changes</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

};

export default CustomerPersonalInformation;