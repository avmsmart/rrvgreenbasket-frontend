"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CustomerProfileLayout from "@/components/customer/profile/CustomerProfileLayout";
import CustomerAddressList from "@/components/customer/profile/CustomerAddressList";
import { ProfileTab } from "@/components/customer/profile/CustomerProfileSidebar";

export default function CustomerAddressesPage() {
  const router = useRouter();

  const handleTabChange = (tab: ProfileTab) => {
    if (tab === "addresses") return;
    router.push(`/customer/profile?tab=${tab}`);
  };

  return (
    <CustomerProfileLayout currentTab="addresses" onTabChange={handleTabChange}>
      <CustomerAddressList />
    </CustomerProfileLayout>
  );
}
