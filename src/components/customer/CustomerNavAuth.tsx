"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import CustomerLogoutDialog from "./CustomerLogoutDialog";

export const CustomerNavAuth: React.FC = () => {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, logout } = useCustomerAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Compute display name or initials
  const displayName = customer?.fullName?.trim() || "Customer";
  const firstName = displayName.split(" ")[0];
  const initials = (displayName || "C")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Loading skeleton
  if (isLoading) {
    return <div className="h-9 w-24 animate-pulse rounded-2xl bg-gray-100" />;
  }

  // Not logged in: Show Login / Register button
  if (!isAuthenticated || !customer) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-2xl border border-emerald-700 bg-white px-4 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 active:scale-95 shadow-sm"
        >
          Login / Register
        </Link>
      </div>
    );
  }

  // Logged in: Show Profile Avatar & First Name with dropdown
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 py-1 pl-1.5 pr-2.5 transition hover:border-emerald-300 hover:bg-emerald-100/60 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-1"
      >
        {/* Avatar circle */}
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 to-green-800 text-xs font-bold text-white shadow-sm ring-2 ring-white">
          {initials}
        </div>

        {/* First name on desktop */}
        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-xs font-bold text-gray-900 max-w-[110px] truncate">
            {firstName}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">
            Account ▾
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-emerald-800" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 origin-top-right rounded-3xl bg-white p-2.5 shadow-2xl ring-1 ring-black/5 border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header section */}
          <div className="px-3 py-2.5 border-b border-gray-100 mb-1.5">
            <p className="text-xs font-bold text-gray-900 truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-gray-500 truncate font-mono">
              {customer.mobileNumber || customer.email}
            </p>
          </div>

          {/* 1. My Overview */}
          <Link
            href="/customer/profile?tab=overview"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-2xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-700" />
            <span>My Overview</span>
          </Link>

          {/* 2. My Profile */}
          <Link
            href="/customer/profile?tab=profile"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-2xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
          >
            <User className="w-4 h-4 text-emerald-700" />
            <span>My Profile</span>
          </Link>

          {/* 3. My Orders */}
          <Link
            href="/customer/profile?tab=orders"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-2xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
          >
            <Package className="w-4 h-4 text-emerald-700" />
            <span>My Orders</span>
          </Link>

          {/* 4. My Addresses */}
          <Link
            href="/customer/profile?tab=addresses"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-2xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
          >
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>My Addresses</span>
          </Link>

          {/* 5. My Wishlist */}
          <Link
            href="/customer/profile?tab=wishlist"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-2xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
          >
            <Heart className="w-4 h-4 text-emerald-700" />
            <span>My Wishlist</span>
          </Link>

          {/* 6. Account Settings */}
          <Link
            href="/customer/profile?tab=settings"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-2xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
          >
            <Settings className="w-4 h-4 text-emerald-700" />
            <span>Account Settings</span>
          </Link>

          {/* 7. Help & Support */}
          <Link
            href="/customer/profile?tab=support"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-2xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
          >
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            <span>Help &amp; Support</span>
          </Link>

          <div className="my-1.5 border-t border-gray-100" />

          {/* 8. Logout */}
          <button
            type="button"
            onClick={() => {
              setDropdownOpen(false);
              setShowLogoutModal(true);
            }}
            role="menuitem"
            className="w-full flex items-center gap-3 rounded-2xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition text-left"
          >
            <LogOut className="w-4 h-4 text-red-500" />
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
