
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  UserRound,
  Package,
  MapPin,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

import { useCustomerAuth } from "@/context/CustomerAuthContext";
import CustomerLogoutDialog from "./CustomerLogoutDialog";

export const CustomerNavAuth: React.FC = () => {
  const router = useRouter();

  const { customer, isAuthenticated, isLoading, logout } =
    useCustomerAuth();

  const [mounted, setMounted] = useState(false);
const [dropdownOpen, setDropdownOpen] = useState(false);
const [showLogoutModal, setShowLogoutModal] = useState(false);
const [isLoggingOut, setIsLoggingOut] = useState(false);

const dropdownRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  setMounted(true);
}, []);
  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  // Logout handler
  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      setShowLogoutModal(false);
      setDropdownOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Customer details
  const displayName = customer?.fullName?.trim() || "Customer";

  // Loading skeleton
 if (!mounted || isLoading) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-[21px] w-[21px] animate-pulse rounded-full bg-gray-200" />
      <div className="h-2.5 w-12 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

  // Not logged in: Login / Register
  if (!isAuthenticated || !customer) {
    return (
      <Link
        href="/login"
        aria-label="Login or Register"
        className="flex flex-col items-center justify-center gap-1
                   bg-transparent border-0 p-0
                   text-gray-500 transition
                   hover:text-emerald-700
                   focus:outline-none"
      >
        <UserRound size={21} strokeWidth={1.8} />

        <span className="text-[10px] font-semibold">
          Account
        </span>
      </Link>
    );
  }

  // Logged in: Account icon matching mobile navigation
  return (
    <div
      className="relative inline-flex text-center"
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        aria-label="My Account"
        className="flex flex-col items-center justify-center gap-1
                   bg-transparent border-0 p-0
                   text-gray-500 transition
                   hover:text-emerald-700
                   focus:outline-none"
      >
        <UserRound size={21} strokeWidth={1.8} />

        <span className="text-[10px] font-semibold">
          Account
        </span>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2
                     z-50 w-64 origin-top-right
                     rounded-3xl border border-gray-100
                     bg-white p-2.5 shadow-2xl
                     ring-1 ring-black/5
                     animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header section */}
          <div className="mb-1.5 border-b border-gray-100 px-3 py-2.5">
            <p className="truncate text-xs font-bold text-gray-900">
              {displayName}
            </p>

            <p className="truncate font-mono text-[11px] text-gray-500">
              {customer.mobileNumber || customer.email}
            </p>
          </div>

          {/* 1. My Overview */}
          <Link
            href="/customer/profile?tab=overview"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-2xl
                       px-3 py-2 text-xs font-semibold
                       text-gray-700 transition
                       hover:bg-emerald-50 hover:text-emerald-900"
          >
            <LayoutDashboard className="h-4 w-4 text-emerald-700" />
            <span>My Overview</span>
          </Link>

          {/* 2. My Profile */}
          <Link
            href="/customer/profile?tab=profile"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-2xl
                       px-3 py-2 text-xs font-semibold
                       text-gray-700 transition
                       hover:bg-emerald-50 hover:text-emerald-900"
          >
            <User className="h-4 w-4 text-emerald-700" />
            <span>My Profile</span>
          </Link>

          {/* 3. My Orders */}
          <Link
            href="/customer/profile?tab=orders"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-2xl
                       px-3 py-2 text-xs font-semibold
                       text-gray-700 transition
                       hover:bg-emerald-50 hover:text-emerald-900"
          >
            <Package className="h-4 w-4 text-emerald-700" />
            <span>My Orders</span>
          </Link>

          {/* 4. My Addresses */}
          <Link
            href="/customer/profile?tab=addresses"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-2xl
                       px-3 py-2 text-xs font-semibold
                       text-gray-700 transition
                       hover:bg-emerald-50 hover:text-emerald-900"
          >
            <MapPin className="h-4 w-4 text-emerald-700" />
            <span>My Addresses</span>
          </Link>

          {/* 5. My Wishlist */}
          <Link
            href="/customer/profile?tab=wishlist"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-2xl
                       px-3 py-2 text-xs font-semibold
                       text-gray-700 transition
                       hover:bg-emerald-50 hover:text-emerald-900"
          >
            <Heart className="h-4 w-4 text-emerald-700" />
            <span>My Wishlist</span>
          </Link>

          {/* 6. Account Settings */}
          <Link
            href="/customer/profile?tab=settings"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-2xl
                       px-3 py-2 text-xs font-semibold
                       text-gray-700 transition
                       hover:bg-emerald-50 hover:text-emerald-900"
          >
            <Settings className="h-4 w-4 text-emerald-700" />
            <span>Account Settings</span>
          </Link>

          {/* 7. Help & Support */}
          <Link
            href="/customer/profile?tab=support"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-2xl
                       px-3 py-2 text-xs font-semibold
                       text-gray-700 transition
                       hover:bg-emerald-50 hover:text-emerald-900"
          >
            <HelpCircle className="h-4 w-4 text-emerald-700" />
            <span>Help &amp; Support</span>
          </Link>

          {/* Divider */}
          <div className="my-1.5 border-t border-gray-100" />

          {/* 8. Logout */}
          <button
            type="button"
            onClick={() => {
              setDropdownOpen(false);
              setShowLogoutModal(true);
            }}
            role="menuitem"
            className="flex w-full items-center gap-3
                       rounded-2xl px-3 py-2 text-left
                       text-xs font-semibold text-red-600
                       transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <CustomerLogoutDialog
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        isLoggingOut={isLoggingOut}
      />
    </div>
  );
};

export default CustomerNavAuth;
