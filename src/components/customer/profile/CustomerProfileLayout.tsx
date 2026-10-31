"use client";

import React, { useState } from "react";
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
  ShoppingBag,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import CustomerNavAuth from "@/components/customer/CustomerNavAuth";
import CustomerLogoutDialog from "@/components/customer/CustomerLogoutDialog";
import CustomerProfileSidebar, { ProfileTab } from "./CustomerProfileSidebar";

interface CustomerProfileLayoutProps {
  currentTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  children: React.ReactNode;
}

const MOBILE_TABS: {
  id: ProfileTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "support", label: "Support", icon: HelpCircle },
];

export const CustomerProfileLayout: React.FC<CustomerProfileLayoutProps> = ({
  currentTab,
  onTabChange,
  children,
}) => {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, logout } = useCustomerAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8faf7] p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-xs font-semibold text-emerald-900">
            Loading your profile dashboard...
          </p>
        </div>
      </main>
    );
  }

  // Unauthenticated guard
  if (!isAuthenticated || !customer) {
    return (
      <main className="min-h-screen bg-[#f8faf7] text-gray-900">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🧺</span>
            <span className="text-lg font-black tracking-tight text-emerald-900">
              RRV Green Basket
            </span>
          </Link>
          <CustomerNavAuth />
        </header>

        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
              <User className="w-8 h-8" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-gray-900 tracking-tight">
              Customer Account
            </h1>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              Please sign in with your mobile number to view and manage your delivery addresses, farm orders, and personal preferences.
            </p>
            <Link
              href="/login?redirect=/customer/profile"
              className="mt-6 block w-full rounded-2xl bg-emerald-700 py-3 text-xs font-bold text-white shadow hover:bg-emerald-800 transition active:scale-95"
            >
              Sign In with Mobile OTP →
            </Link>
            <Link
              href="/"
              className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf7] text-gray-900">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur px-4 py-3 sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🧺</span>
            <div>
              <span className="block text-base font-black leading-tight text-emerald-950">
                RRV Green Basket
              </span>
              <span className="text-[10px] font-semibold text-emerald-700">
                Customer Account Dashboard
              </span>
            </div>
          </Link>

          <span className="hidden sm:inline-block text-gray-200">|</span>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
            <span>Cart</span>
          </Link>
          <CustomerNavAuth />
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Mobile Horizontal Navigation Tabs */}
        <div className="mb-5 flex overflow-x-auto pb-2 gap-2 lg:hidden no-scrollbar">
          {MOBILE_TABS.map((tab) => {
            const isActive = currentTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
          {/* Left Sidebar */}
          <aside className="hidden lg:block sticky top-20">
            <CustomerProfileSidebar
              currentTab={currentTab}
              onTabChange={onTabChange}
              customer={customer}
              onLogoutClick={() => setShowLogoutModal(true)}
            />
          </aside>

          {/* Right Content Area */}
          <section className="min-w-0">{children}</section>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <CustomerLogoutDialog
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        isLoggingOut={isLoggingOut}
      />
    </main>
  );
};

export default CustomerProfileLayout;
