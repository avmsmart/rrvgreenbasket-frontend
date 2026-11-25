"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Home,
  BriefcaseBusiness,
  Phone,
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import {
  CustomerAddress,
  getStoredAddresses,
  saveStoredAddresses,
} from "@/data/customer-profile-mock";

export const CustomerAddresses: React.FC = () => {
  const { selectedAddress: globalLocation } = useLocation();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [flatHouse, setFlatHouse] = useState("");
  const [streetArea, setStreetArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Kurnool");
  const [state, setState] = useState("Andhra Pradesh");
  const [pin, setPin] = useState("");
  const [type, setType] = useState<"HOME" | "WORK" | "OTHER">("HOME");
  const [isDefault, setIsDefault] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setAddresses(getStoredAddresses());
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setFullName("");
    setPhone("");
    setFlatHouse("");
    setStreetArea("");
    setLandmark("");
    setCity("Kurnool");
    setState("Andhra Pradesh");
    setPin("");
    setType("HOME");
    setIsDefault(addresses.length === 0);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setFlatHouse(addr.flatHouse);
    setStreetArea(addr.streetArea);
    setLandmark(addr.landmark || "");
    setCity(addr.city);
    setState(addr.state);
    setPin(addr.pin);
    setType(addr.type);
    setIsDefault(addr.isDefault);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !phone.trim() || !flatHouse.trim() || !streetArea.trim() || !pin.trim()) {
      setErrorMessage("Please fill in all mandatory fields.");
      return;
    }

    if (pin.trim().length !== 6 || !/^\d{6}$/.test(pin.trim())) {
      setErrorMessage("Please enter a valid 6-digit PIN code.");
      return;
    }

    let updatedList: CustomerAddress[];

    if (editingAddress) {
      updatedList = addresses.map((a) => {
        if (a.id === editingAddress.id) {
          return {
            ...a,
            fullName: fullName.trim(),
            phone: phone.trim(),
            flatHouse: flatHouse.trim(),
            streetArea: streetArea.trim(),
            landmark: landmark.trim() || undefined,
            city: city.trim(),
            state: state.trim(),
            pin: pin.trim(),
            type,
            isDefault: isDefault || (a.isDefault && addresses.length === 1),
          };
        }
        return isDefault ? { ...a, isDefault: false } : a;
      });
    } else {
      const newAddress: CustomerAddress = {
        id: `addr-${Date.now()}`,
        fullName: fullName.trim(),
        phone: phone.trim(),
        flatHouse: flatHouse.trim(),
        streetArea: streetArea.trim(),
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pin: pin.trim(),
        type,
        isDefault: isDefault || addresses.length === 0,
      };

      if (newAddress.isDefault) {
        updatedList = addresses.map((a) => ({ ...a, isDefault: false }));
        updatedList.push(newAddress);
      } else {
        updatedList = [...addresses, newAddress];
      }
    }

    setAddresses(updatedList);
    saveStoredAddresses(updatedList);
    setIsModalOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      const remaining = addresses.filter((a) => a.id !== id);
      if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0].isDefault = true;
      }
      setAddresses(remaining);
      saveStoredAddresses(remaining);
    }
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    saveStoredAddresses(updated);
  };

  return (
    <div className="w-full bg-white px-4 py-5 text-slate-900 sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-5xl">
        {/* Heading and add action */}
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                My Addresses
              </h1>
              <p className="mt-1 max-w-xl text-sm leading-5 text-slate-500">
                Manage your delivery locations for faster checkout and scheduled farm deliveries
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
          >
            <Plus className="h-4 w-4" />
            Add New Address
          </button>
        </div>

        {/* Saved addresses */}
        <section className="pt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">Saved Addresses</h2>
            <span className="text-xs text-slate-500">
              {addresses.length} {addresses.length === 1 ? "address" : "addresses"}
            </span>
          </div>

          {addresses.length === 0 ? (
            <div className="border-y border-slate-100 py-10 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <MapPin className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-800">
                No saved addresses yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Add an address to make your next delivery easier.
              </p>
              <button
                type="button"
                onClick={openAddModal}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" />
                Add your first address
              </button>
            </div>
          ) : (
            <div className="!block !w-full !max-w-full divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {addresses.map((addr, index) => {
                const AddressIcon =
                  addr.type === "HOME"
                    ? Home
                    : addr.type === "WORK"
                      ? BriefcaseBusiness
                      : MapPin;

                return (
                  <article
                    key={addr.id}
                    className={`!block !w-full !max-w-full px-4 py-4 sm:px-5 ${
                      addr.isDefault ? "bg-emerald-50/40" : "bg-white"
                    }`}
                  >
                    <div className="flex w-full min-w-0 items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          addr.isDefault
                            ? "bg-emerald-100 text-emerald-700"
                            : addr.type === "WORK"
                              ? "bg-blue-50 text-blue-700"
                              : addr.type === "OTHER"
                                ? "bg-orange-50 text-orange-600"
                                : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        <AddressIcon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {addr.fullName}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                            {addr.type}
                          </span>
                          {addr.isDefault && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                              <CheckCircle2 className="h-3 w-3" />
                              Default address
                            </span>
                          )}
                        </div>

                        <p className="mt-1.5 break-words text-xs leading-5 text-slate-600">
                          {addr.flatHouse}, {addr.streetArea}
                          {addr.landmark ? `, Near ${addr.landmark}` : ""}
                        </p>
                        <p className="break-words text-xs leading-5 text-slate-600">
                          {addr.city}, {addr.state} – {addr.pin}
                        </p>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <Phone className="h-3.5 w-3.5 text-blue-600" />
                          {addr.phone}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(addr.id)}
                              className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-emerald-800"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Set as default
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditModal(addr)}
                            className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>

                      <ChevronRight className="mt-1 hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="mt-5 space-y-4">
              {globalLocation && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Map Location: {globalLocation.displayName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStreetArea(globalLocation.formattedAddress);
                      setCity(globalLocation.city || "Kurnool");
                      setState(globalLocation.state || "Andhra Pradesh");
                      setPin(globalLocation.pincode || "518002");
                    }}
                    className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shrink-0 cursor-pointer"
                  >
                    Auto Fill
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-green-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-green-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Flat, House No., Building *
                </label>
                <input
                  type="text"
                  required
                  value={flatHouse}
                  onChange={(e) => setFlatHouse(e.target.value)}
                  placeholder="e.g. Flat 302, Palm Heights"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-green-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Area, Street, Sector *
                </label>
                <input
                  type="text"
                  required
                  value={streetArea}
                  onChange={(e) => setStreetArea(e.target.value)}
                  placeholder="e.g. 12th Main, 4th Block, Koramangala"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-green-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near City Park"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-green-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-green-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="560001"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-green-700 outline-none"
                  />
                </div>
              </div>

              {/* Address Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Address Type
                </label>
                <div className="flex gap-2">
                  {(["HOME", "WORK", "OTHER"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 rounded-xl py-2 text-xs font-semibold border transition ${
                        type === t
                          ? "border-green-700 bg-green-50 text-green-800"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {t === "HOME" ? "🏠 Home" : t === "WORK" ? "🏢 Work" : "📍 Other"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded text-green-700 focus:ring-green-500"
                  />
                  <span>Make this my default delivery address</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-green-700 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-green-800"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAddresses;
