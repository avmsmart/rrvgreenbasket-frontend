"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CustomerProfileLayout from "@/components/customer/profile/CustomerProfileLayout";
import CustomerHelpSupport from "@/components/customer/profile/CustomerHelpSupport";
import { ProfileTab } from "@/components/customer/profile/CustomerProfileSidebar";

export default function CustomerSupportPage() {
  const router = useRouter();

  const handleTabChange = (tab: ProfileTab) => {
    if (tab === "support") return;
    router.push(`/customer/profile?tab=${tab}`);
  };

  return (
    <CustomerProfileLayout currentTab="support" onTabChange={handleTabChange}>
      <CustomerHelpSupport />
    </CustomerProfileLayout>
  );
}
