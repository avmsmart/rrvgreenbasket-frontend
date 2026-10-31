"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import CustomerProfileLayout from "@/components/customer/profile/CustomerProfileLayout";
import CustomerOverview from "@/components/customer/profile/CustomerOverview";
import { ProfileTab } from "@/components/customer/profile/CustomerProfileSidebar";

export default function CustomerOverviewPage() {
  const router = useRouter();
  const { customer } = useCustomerAuth();

  const handleTabChange = (tab: ProfileTab) => {
    if (tab === "overview") return;
    router.push(`/customer/profile?tab=${tab}`);
  };

  return (
    <CustomerProfileLayout currentTab="overview" onTabChange={handleTabChange}>
      <CustomerOverview customer={customer} onNavigateTab={handleTabChange} />
    </CustomerProfileLayout>
  );
}
