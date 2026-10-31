"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  MapPin,
  MapPinOff,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import {
  CustomerAddress,
  CustomerAddressRequest,
} from "@/types/customer-address";
import customerAddressService, {
  CustomerAddressError,
} from "@/services/customer-address.service";
import CustomerAddressCard from "./CustomerAddressCard";
import CustomerAddressForm from "./CustomerAddressForm";
import DeleteAddressDialog from "./DeleteAddressDialog";

export const CustomerAddressList: React.FC = () => {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{
    message: string;
    statusCode: number;
  } | null>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<CustomerAddress | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  /**
   * Fetch all customer addresses from backend Spring Boot API on port 8082
   */
  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await customerAddressService.getMyAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      if (err instanceof CustomerAddressError) {
        setError({
          message: err.message,
          statusCode: err.statusCode,
        });
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : "Unable to load delivery addresses from the backend service.";
        setError({
          message: msg,
          statusCode: 500,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  /**
   * Handle Create or Update Address
   */
  const handleFormSubmit = async (payload: CustomerAddressRequest) => {
    if (editingAddress) {
      // 4.3 PUT update address
      await customerAddressService.updateAddress(editingAddress.id, payload);
      showToast("Address updated successfully!");
    } else {
      // 4.2 POST add address
      await customerAddressService.addAddress(payload);
      showToast("Address added successfully!");
    }
    await fetchAddresses();
  };

  /**
   * Handle Delete Address confirmation
   */
  const handleConfirmDelete = async () => {
    if (!deletingAddress) return;
    setIsDeleting(true);
    try {
      await customerAddressService.deleteAddress(deletingAddress.id);
      showToast("Address deleted successfully!");
      setDeletingAddress(null);
      // Refetch address list to display backend-promoted default address
      await fetchAddresses();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not delete address. Please try again.";
      showToast(msg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handle Set Address as Default
   */
  const handleSetDefault = async (address: CustomerAddress) => {
    if (address.isDefault) return;
    setSettingDefaultId(address.id);
    try {
      await customerAddressService.setDefaultAddress(address.id);
      showToast("Default address updated successfully!");
      await fetchAddresses();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not set default address. Please try again.";
      showToast(msg, "error");
    } finally {
      setSettingDefaultId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`rounded-2xl p-4 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-200 border ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-gray-600 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Card */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <MapPin className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                My Addresses
              </h1>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Manage your delivery locations for faster checkout and scheduled farm deliveries
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingAddress(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-800 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Loading State: Skeletons */}
        {isLoading && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl border border-gray-100 bg-gray-50/70 p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-5 w-24 rounded-lg bg-gray-200" />
                  <div className="h-4 w-40 rounded-lg bg-gray-200" />
                  <div className="h-3 w-3/4 rounded-lg bg-gray-200" />
                  <div className="h-3 w-1/2 rounded-lg bg-gray-200" />
                </div>
                <div className="h-8 w-full rounded-xl bg-gray-200/60" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/60 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-gray-900">
              {error.statusCode === 401
                ? "Sign in required"
                : error.statusCode === 500
                ? "Backend Server Error (500)"
                : "Unable to load addresses"}
            </h3>
            <p className="mt-1 text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
              {error.message}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {error.statusCode === 401 ? (
                <Link
                  href="/login?redirect=/customer/profile/addresses"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-800 transition active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Mobile OTP</span>
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={fetchAddresses}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-800 transition active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Request</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddress(null);
                      setIsFormOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Delivery Address</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && addresses.length === 0 && (
          <div className="mt-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-50 text-gray-300 border border-gray-100">
              <MapPinOff className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-gray-900">
              No addresses saved yet
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Add your delivery address to make your next farm-fresh vegetable order easier and faster.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingAddress(null);
                setIsFormOpen(true);
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3 text-xs font-bold text-white shadow hover:bg-emerald-800 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Address</span>
            </button>
          </div>
        )}

        {/* Addresses Grid */}
        {!isLoading && !error && addresses.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <CustomerAddressCard
                key={address.id}
                address={address}
                onEdit={(addr) => {
                  setEditingAddress(addr);
                  setIsFormOpen(true);
                }}
                onDelete={(addr) => {
                  setDeletingAddress(addr);
                }}
                onSetDefault={handleSetDefault}
                isSettingDefault={settingDefaultId === address.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      <CustomerAddressForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAddress(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingAddress}
        isFirstAddress={addresses.length === 0}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteAddressDialog
        isOpen={Boolean(deletingAddress)}
        address={deletingAddress}
        onClose={() => setDeletingAddress(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default CustomerAddressList;
