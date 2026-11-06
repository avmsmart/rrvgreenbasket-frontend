"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminLayout } from "./AdminLayout";
import { AuthGuard } from "@/components/auth";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export const AdminLayoutWrapper: React.FC<AdminLayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();

  // If on admin login page, render clean page without sidebar/header/bottom nav and without AuthGuard
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // All other admin routes are protected by AuthGuard and framed by AdminLayout
  return (
    <AuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AuthGuard>
  );
};
