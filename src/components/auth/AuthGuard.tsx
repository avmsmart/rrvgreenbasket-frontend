"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RRVAuthBrandLogo } from "./RRVAuthBrandLogo";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && mounted && !isAuthenticated) {
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login";
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, isLoading, mounted, pathname, router]);

  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <RRVAuthBrandLogo centered size="lg" />
          <div className="mt-8 flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-[#16a34a] rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-500">
              Verifying admin session...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
