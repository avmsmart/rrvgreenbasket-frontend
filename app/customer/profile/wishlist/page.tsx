"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CustomerProfileLayout from "@/components/customer/profile/CustomerProfileLayout";
import CustomerWishlist from "@/components/customer/profile/CustomerWishlist";
import { ProfileTab } from "@/components/customer/profile/CustomerProfileSidebar";

export default function CustomerWishlistPage() {
  const router = useRouter();

  const handleTabChange = (tab: ProfileTab) => {
    if (tab === "wishlist") return;
    router.push(`/customer/profile?tab=${tab}`);
  };

  return (
    <CustomerProfileLayout currentTab="wishlist" onTabChange={handleTabChange}>
      <CustomerWishlist />
    </CustomerProfileLayout>
  );
}
