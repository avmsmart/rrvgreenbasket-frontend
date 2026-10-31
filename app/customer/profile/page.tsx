"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import CustomerProfileLayout from "@/components/customer/profile/CustomerProfileLayout";
import { ProfileTab } from "@/components/customer/profile/CustomerProfileSidebar";
import CustomerOverview from "@/components/customer/profile/CustomerOverview";
import CustomerAddressList from "@/components/customer/profile/CustomerAddressList";
import CustomerPersonalInformation from "@/components/customer/profile/CustomerPersonalInformation";
import CustomerOrders from "@/components/customer/profile/CustomerOrders";
import CustomerWishlist from "@/components/customer/profile/CustomerWishlist";
import CustomerAccountSettings from "@/components/customer/profile/CustomerAccountSettings";
import CustomerHelpSupport from "@/components/customer/profile/CustomerHelpSupport";
import { Loader2 } from "lucide-react";

const VALID_TABS: ProfileTab[] = [
  "overview",
  "profile",
  "orders",
  "addresses",
  "wishlist",
  "settings",
  "support",
];

function CustomerProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab") as ProfileTab | null;

  const { customer, updateProfile } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  // Sync tab state with URL query parameter
  useEffect(() => {
    if (queryTab && VALID_TABS.includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    router.push(`/customer/profile?tab=${tab}`, { scroll: false });
  };

  return (
    <CustomerProfileLayout currentTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === "overview" && (
        <CustomerOverview
          customer={customer}
          onNavigateTab={handleTabChange}
        />
      )}

      {activeTab === "addresses" && <CustomerAddressList />}

      {activeTab === "profile" && (
        <CustomerPersonalInformation
          customer={customer}
          onUpdate={updateProfile}
        />
      )}

      {activeTab === "orders" && <CustomerOrders />}

      {activeTab === "wishlist" && <CustomerWishlist />}

      {activeTab === "settings" && <CustomerAccountSettings />}

      {activeTab === "support" && <CustomerHelpSupport />}
    </CustomerProfileLayout>
  );
}

export default function CustomerProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8faf7] p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
        </div>
      }
    >
      <CustomerProfileContent />
    </Suspense>
  );
}
