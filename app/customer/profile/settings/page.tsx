"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CustomerProfileLayout from "@/components/customer/profile/CustomerProfileLayout";
import CustomerAccountSettings from "@/components/customer/profile/CustomerAccountSettings";
import { ProfileTab } from "@/components/customer/profile/CustomerProfileSidebar";

export default function CustomerSettingsPage() {
  const router = useRouter();

  const handleTabChange = (tab: ProfileTab) => {
    if (tab === "settings") return;
    router.push(`/customer/profile?tab=${tab}`);
  };

  return (
    <CustomerProfileLayout currentTab="settings" onTabChange={handleTabChange}>
      <CustomerAccountSettings />
    </CustomerProfileLayout>
  );
}
