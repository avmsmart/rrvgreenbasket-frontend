"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";

import { useCustomerAuth } from "@/context/CustomerAuthContext";

/** Round outlined profile icon: ring + filled person (head & shoulders) */
const ProfileCircleIcon: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <clipPath id="profileCircleClip">
        <circle cx="18" cy="18" r="15" />
      </clipPath>
    </defs>
    <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="2.5" />
    <g clipPath="url(#profileCircleClip)" fill="currentColor">
      <circle cx="18" cy="14" r="5.5" />
      <ellipse cx="18" cy="31" rx="11" ry="8.5" />
    </g>
  </svg>
);

interface CustomerNavAuthProps {
  /** "icon" = round profile icon only (no name / no label), used on mobile top bar */
  variant?: "default" | "icon";
}

export const CustomerNavAuth: React.FC<CustomerNavAuthProps> = ({
  variant = "default",
}) => {
  const router = useRouter();

  const { customer, isAuthenticated, isLoading } = useCustomerAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch
  if (!mounted || isLoading) {
    if (variant === "icon") {
      return <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />;
    }
    return (
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="h-[22px] w-[22px] animate-pulse rounded-full bg-gray-200" />
        <div className="h-2.5 w-10 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  // Round icon-only button (mobile top bar)
  if (variant === "icon") {
    const hasAuthIcon =
      isAuthenticated && Boolean(customer?.email || customer?.mobileNumber);
    const iconClass =
      "flex h-9 w-9 items-center justify-center text-slate-900 transition-colors hover:text-emerald-700 cursor-pointer";
    return hasAuthIcon ? (
      <button
        type="button"
        onClick={() => router.push("/customer/profile?tab=overview")}
        aria-label="My Profile"
        className={`${iconClass} border-0 bg-transparent p-0`}
      >
        <ProfileCircleIcon />
      </button>
    ) : (
      <Link href="/login" aria-label="Login" className={iconClass}>
        <ProfileCircleIcon />
      </Link>
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