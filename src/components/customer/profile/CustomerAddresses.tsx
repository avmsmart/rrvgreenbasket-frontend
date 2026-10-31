"use client";

import React, { useState, useEffect } from "react";
import {
  CustomerAddress,
  getStoredAddresses,
  saveStoredAddresses,
} from "@/data/customer-profile-mock";

export const CustomerAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [flatHouse, setFlatHouse] = useState("");
  const [streetArea, setStreetArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
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
    setCity("Bengaluru");
    setState("Karnataka");
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
    <div className="space-y-6">
      <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Saved Delivery Addresses</h1>
            <p className="mt-1 text-xs text-gray-500">
              Manage locations where your organic vegetables and groceries are delivered
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-green-800 transition active:scale-95"
          >
            <span>+</span> Add New Address
          </button>
        </div>

        {/* Addresses Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
                addr.isDefault
                  ? "border-green-600 bg-green-50/30 ring-1 ring-green-600 shadow-sm"
                  : "border-gray-200 bg-white hover:border-green-300 hover:shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 uppercase">
                      {addr.type}
                    </span>
                    {addr.isDefault && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                        ✓ Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => openEditModal(addr)}
                      className="text-green-700 hover:underline font-semibold"
                    >
                      Edit
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-red-600 hover:underline font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <h3 className="mt-3 text-sm font-bold text-gray-900">
                  {addr.fullName}
                </h3>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                  {addr.flatHouse}, {addr.streetArea}
                  {addr.landmark ? `, Near ${addr.landmark}` : ""}
                  <br />
                  {addr.city}, {addr.state} – {addr.pin}
                </p>
                <p className="mt-2 text-xs text-gray-500 font-mono">
                  📞 {addr.phone}
                </p>
              </div>

              {!addr.isDefault && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-semibold text-green-700 hover:underline"
                  >
                    Set as Default Delivery Address
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
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
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
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
