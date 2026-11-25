"use client";

import React, { useEffect, useState } from "react";
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
  ChevronRight,
  LogOut,
  KeyRound,
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

type MobileMenuAction =
  | { kind: "tab"; id: ProfileTab; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }
  | { kind: "cart"; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }
  | { kind: "account"; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }
  | { kind: "logout"; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> };

const MOBILE_MENU_ITEMS: MobileMenuAction[] = [
  { kind: "account", label: "Account Information", icon: User },
  { kind: "tab", id: "orders", label: "My Orders", icon: Package },
  { kind: "tab", id: "addresses", label: "Address Management", icon: MapPin },
  { kind: "tab", id: "wishlist", label: "My Wishlist", icon: Heart },
  { kind: "cart", label: "My Cart", icon: ShoppingBag },
  { kind: "tab", id: "settings", label: "Password Manager", icon: KeyRound },
  { kind: "tab", id: "support", label: "Help & Support", icon: HelpCircle },
  { kind: "logout", label: "Logout", icon: LogOut },
];

const MOBILE_BOTTOM_TABS: {
  id: ProfileTab | "shop";
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "profile", label: "Profile", icon: User },
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
  const [showAccountInformation, setShowAccountInformation] = useState(false);

  useEffect(() => {
    setShowAccountInformation(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [currentTab]);

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
      <main className="flex min-h-screen items-center justify-center bg-white p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-green-700" />
          <p className="text-xs font-semibold text-green-900">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  // Email-based customer authentication: rely on the authenticated session,
  // not the presence of a mobile number.
  const hasAuth = isAuthenticated && Boolean(customer);

  if (!hasAuth) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <header className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-slate-100 bg-white px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/images/auth/logo1.png"
              alt="RRV Green Basket"
              className="h-10 w-10 object-contain"
            />
            <span className="text-base font-extrabold tracking-tight text-green-950 sm:text-lg">
              RRV Green Basket
            </span>
          </Link>
          <CustomerNavAuth />
        </header>

        <section className="mx-auto flex min-h-[calc(100vh-68px)] w-full max-w-md items-start justify-center px-5 py-12 sm:items-center sm:py-16">
          <div className="w-full border border-slate-100 bg-white px-6 py-8 text-center shadow-sm sm:px-9 sm:py-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-700">
              <User className="h-7 w-7" strokeWidth={2.2} />
            </div>

            <h1 className="mt-5 text-xl font-extrabold tracking-tight text-slate-900">
              Customer Account
            </h1>

            <Link
              href="/login?redirect=/customer/profile"
              className="mt-7 flex min-h-11 w-full items-center justify-center rounded-lg bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Sign In with Email <span className="ml-2" aria-hidden="true">→</span>
            </Link>

            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-green-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Storefront
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const customerName = customer?.fullName?.trim() || "Customer";
  const initials = customerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleMobileMenuClick = (item: MobileMenuAction) => {
    if (item.kind === "logout") {
      setShowLogoutModal(true);
      return;
    }

    if (item.kind === "cart") {
      router.push("/cart");
      return;
    }

    if (item.kind === "account") {
      // Reveal the Personal Information content without switching to Overview.
      setShowAccountInformation(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    onTabChange(item.id);
  };

  const handleMobileBack = () => {
    if (currentTab === "profile" && showAccountInformation) {
      setShowAccountInformation(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (currentTab !== "profile") {
      onTabChange("profile");
      return;
    }
    onTabChange("overview");
  };

  const isMobileProfileMenu =
    currentTab === "profile" && !showAccountInformation;

  return (
    <main className="min-h-screen bg-white pb-20 text-gray-900 lg:pb-0">
      {/* Mobile header: one back arrow and page title only */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-100 bg-white/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={handleMobileBack}
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-full text-green-700 transition hover:bg-green-50"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.4} />
        </button>
        <h1 className="text-base font-semibold text-slate-900">
          {showAccountInformation ? "Account Information" : currentTab === "profile" ? "Profile" : "My Account"}
        </h1>
      </header>

      {/* Desktop header: retain existing desktop navigation */}
      <header className="sticky top-0 z-40 hidden items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-8 lg:flex">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="text-3xl">🧺</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-black leading-tight text-green-950 sm:text-base">
                RRV Green Basket
              </span>
              <span className="hidden text-[10px] font-semibold text-green-700 sm:block">
                Customer Account
              </span>
            </span>
          </Link>
          <span className="text-gray-200">|</span>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-green-800 transition hover:text-green-950"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Storefront
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/cart"
            aria-label="Shopping cart"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-green-200 hover:bg-green-50"
          >
            <ShoppingBag className="h-4 w-4 text-green-700" />
            Cart
          </Link>
          <CustomerNavAuth />
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="sticky top-20 hidden lg:block">
            <CustomerProfileSidebar
              currentTab={currentTab}
              onTabChange={onTabChange}
              customer={customer}
              onLogoutClick={() => setShowLogoutModal(true)}
            />
          </aside>

          {/* Mobile profile menu */}
          {isMobileProfileMenu && (
            <section className="mx-auto w-full max-w-xl lg:hidden">
              <div className="border-b border-green-100 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white ring-4 ring-green-100">
                    {initials || <User className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-slate-900">
                      {customerName}
                    </h2>
                    <p className="truncate text-xs text-slate-500">
                      {customer?.email || ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white">
                <p className="px-4 pb-1 pt-4 text-xs font-semibold text-green-800">
                  Account
                </p>
                <nav aria-label="Profile menu">
                  {MOBILE_MENU_ITEMS.filter((item) => item.kind !== "logout").map((item) => {
                    const Icon = item.icon;
                    const iconTheme =
                      item.kind === "account"
                        ? "bg-emerald-50 text-emerald-700"
                        : item.kind === "cart"
                          ? "bg-orange-50 text-orange-600"
                          : item.kind === "tab" && item.id === "orders"
                            ? "bg-blue-50 text-blue-600"
                            : item.kind === "tab" && item.id === "addresses"
                              ? "bg-violet-50 text-violet-600"
                              : item.kind === "tab" && item.id === "wishlist"
                                ? "bg-pink-50 text-pink-600"
                                : item.kind === "tab" && item.id === "settings"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-sky-50 text-sky-600";
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleMobileMenuClick(item)}
                        className="flex min-h-[56px] w-full items-center gap-3.5 border-b border-green-100 px-4 py-2 text-left transition-colors hover:bg-green-50 active:bg-green-50"
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconTheme}`}>
                          <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                        </span>
                        <span className="flex-1 text-sm font-semibold text-slate-800">
                          {item.label}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-green-600" strokeWidth={2.5} />
                      </button>
                    );
                  })}
                </nav>

                <p className="px-4 pb-1 pt-4 text-xs font-semibold text-green-800">
                  Support
                </p>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="flex min-h-[56px] w-full items-center gap-3.5 border-b border-green-100 px-4 py-2 text-left text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <LogOut className="h-[18px] w-[18px]" strokeWidth={2.4} />
                  </span>
                  <span className="flex-1 text-sm font-semibold">Logout</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-rose-400" strokeWidth={2.5} />
                </button>
              </div>
            </section>
          )}

          {/* Main account content. Account Information reveals the existing
              Personal Information child while keeping the Profile tab selected. */}
          <section
            className={`min-w-0 ${
              currentTab === "profile" && !showAccountInformation
                ? "hidden lg:block"
                : ""
            }`}
          >
            {children}
          </section>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Mobile account navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-green-100 bg-white px-1 pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <div className="mx-auto grid max-w-xl grid-cols-5">
          {MOBILE_BOTTOM_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id !== "shop" && currentTab === tab.id;
            const tabColor =
              tab.id === "shop"
                ? "text-orange-600"
                : tab.id === "orders"
                  ? "text-blue-600"
                  : tab.id === "wishlist"
                    ? "text-pink-600"
                    : tab.id === "addresses"
                      ? "text-violet-600"
                      : "text-emerald-700";

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === "shop") {
                    router.push("/");
                    return;
                  }
                  setShowAccountInformation(false);
                  onTabChange(tab.id);
                }}
                className={`flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold transition ${
                  isActive ? tabColor : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon
                  className={`h-[20px] w-[20px] ${isActive ? tabColor : "text-slate-400"}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

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