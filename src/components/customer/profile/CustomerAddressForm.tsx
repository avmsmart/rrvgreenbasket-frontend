"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Home,
  Briefcase,
  MapPin,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  CustomerAddress,
  CustomerAddressRequest,
  CustomerAddressType,
} from "@/types/customer-address";

interface CustomerAddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CustomerAddressRequest) => Promise<void>;
  initialData?: CustomerAddress | null;
  isFirstAddress?: boolean;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Puducherry",
  "Chandigarh",
];

export const CustomerAddressForm: React.FC<CustomerAddressFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isFirstAddress = false,
}) => {
  const isEditing = Boolean(initialData);

  const [receiverName, setReceiverName] = useState("");
  const [receiverMobile, setReceiverMobile] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [state, setState] = useState("Telangana");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");
  const [addressType, setAddressType] = useState<CustomerAddressType>("HOME");
  const [isDefault, setIsDefault] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initialData when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setReceiverName(initialData.receiverName || "");
      setReceiverMobile(initialData.receiverMobile || "");
      setAddressLine1(initialData.addressLine1 || "");
      setAddressLine2(initialData.addressLine2 || "");
      setLandmark(initialData.landmark || "");
      setCity(initialData.city || "Hyderabad");
      setState(initialData.state || "Telangana");
      setPincode(initialData.pincode || "");
      setCountry(initialData.country || "India");
      setAddressType(initialData.addressType || "HOME");
      setIsDefault(Boolean(initialData.isDefault));
    } else {
      setReceiverName("");
      setReceiverMobile("");
      setAddressLine1("");
      setAddressLine2("");
      setLandmark("");
      setCity("Hyderabad");
      setState("Telangana");
      setPincode("");
      setCountry("India");
      setAddressType("HOME");
      setIsDefault(isFirstAddress);
    }
    setError(null);
  }, [initialData, isOpen, isFirstAddress]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanName = receiverName.trim();
    if (!cleanName || cleanName.length < 2) {
      setError("Please enter the receiver's full name (at least 2 characters).");
      return;
    }

    const cleanMobile = receiverMobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    const cleanLine1 = addressLine1.trim();
    if (!cleanLine1 || cleanLine1.length < 3) {
      setError("Please enter your flat, house number, or building name.");
      return;
    }

    const cleanCity = city.trim();
    if (!cleanCity) {
      setError("Please enter the city.");
      return;
    }

    const cleanState = state.trim();
    if (!cleanState) {
      setError("Please select or enter the state.");
      return;
    }

    const cleanPincode = pincode.replace(/\D/g, "").slice(0, 6);
    if (cleanPincode.length !== 6) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    const payload: CustomerAddressRequest = {
      receiverName: cleanName,
      receiverMobile: cleanMobile,
      addressLine1: cleanLine1,
      addressLine2: addressLine2.trim() || undefined,
      landmark: landmark.trim() || undefined,
      city: cleanCity,
      state: cleanState,
      pincode: cleanPincode,
      country: country.trim() || "India",
      addressType,
      isDefault: isFirstAddress ? true : isDefault,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to save address. Please verify your details and try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-form-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur px-6 py-4">
          <div>
            <h2
              id="address-form-title"
              className="text-lg font-bold text-gray-900 tracking-tight"
            >
              {isEditing ? "Edit Delivery Address" : "Add New Delivery Address"}
            </h2>
            <p className="text-xs text-gray-500">
              {isEditing
                ? "Update your existing delivery details"
                : "Fill in your delivery address for farm-fresh orders"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Address Type Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Address Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(
                [
                  { type: "HOME", label: "Home", icon: Home },
                  { type: "WORK", label: "Work", icon: Briefcase },
                  { type: "OTHER", label: "Other", icon: MapPin },
                ] as const
              ).map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAddressType(type)}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold border transition ${
                    addressType === type
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600 shadow-sm"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Receiver Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Receiver Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={receiverMobile}
                  onChange={(e) =>
                    setReceiverMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="9876543210"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-12 pr-3.5 py-2.5 text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Flat, House No., Building Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="e.g. Flat 101, Main Residency, Tower B"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
            />
          </div>

          {/* Address Line 2 & Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Street, Area, Colony <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="e.g. Main Street, Madhapur"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Landmark <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Supermarket / Metro Station"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              />
            </div>
          </div>

          {/* City, State, PIN, Country */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Hyderabad"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) =>
                  setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="500001"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              />
            </div>
          </div>

          {/* Set as Default Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault || isFirstAddress}
                disabled={isFirstAddress}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded text-emerald-700 focus:ring-emerald-500 border-gray-300"
              />
              <span className="text-xs font-semibold text-gray-700">
                Set as default delivery address
                {isFirstAddress && (
                  <span className="ml-1 text-gray-400 font-normal">
                    (First address is automatically default)
                  </span>
                )}
              </span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-800 active:scale-95 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Address...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? "Update Address" : "Save Address"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerAddressForm;
