
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";

import { useCustomerAuth } from "@/context/CustomerAuthContext";

export const CustomerNavAuth: React.FC = () => {
  const router = useRouter();

  const { customer, isAuthenticated, isLoading } = useCustomerAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch
  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="h-[22px] w-[22px] animate-pulse rounded-full bg-gray-200" />
        <div className="h-2.5 w-10 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  // Check authenticated customer details
  const hasAuth =
    isAuthenticated &&
    Boolean(customer?.email || customer?.mobileNumber);

  // Not authenticated: Show Login
  if (!hasAuth) {
    return (
      <Link
        href="/login"
        aria-label="Login"
        className="flex flex-col items-center justify-center gap-1
                   text-gray-800 transition-colors hover:text-emerald-700 cursor-pointer"
      >
        <UserRound size={23} strokeWidth={1.8} />
        <span className="text-xs font-medium">Login</span>
      </Link>
    );
  }

  // Authenticated: Show Profile
  return (
    <button
      type="button"
      onClick={() => router.push("/customer/profile?tab=overview")}
      aria-label="My Profile"
      className="flex flex-col items-center justify-center gap-1
                 border-0 bg-transparent p-0 cursor-pointer
                 text-gray-800 transition-colors hover:text-emerald-700"
    >
      <UserRound size={23} strokeWidth={1.8} />

      <span className="max-w-[65px] truncate text-xs font-medium">
        {customer?.fullName?.trim()
          ? customer.fullName.trim().split(" ")[0]
          : "Profile"}
      </span>
    </button>
  );
};

export default CustomerNavAuth;