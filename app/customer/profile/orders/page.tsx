"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CustomerProfileLayout from "@/components/customer/profile/CustomerProfileLayout";
import CustomerOrders from "@/components/customer/profile/CustomerOrders";
import { ProfileTab } from "@/components/customer/profile/CustomerProfileSidebar";

export default function CustomerOrdersPage() {
  const router = useRouter();

  const handleTabChange = (tab: ProfileTab) => {
    if (tab === "orders") return;
    router.push(`/customer/profile?tab=${tab}`);
  };

  return (
    <CustomerProfileLayout currentTab="orders" onTabChange={handleTabChange}>
      <CustomerOrders />
    </CustomerProfileLayout>
  );
}
