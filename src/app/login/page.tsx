"use client";

import React, { useState, Suspense, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag, Box, BarChart3 } from "lucide-react";
import {
  RRVAuthBrandLogo,
  LoginFormStep,
  RegisterFormStep,
  TwoFactorStep,
  SuccessStep,
} from "@/components/auth";
import { useAuth } from "@/context/AuthContext";
import { LoginStep } from "@/types";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/admin/dashboard";

  const { isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState<LoginStep>("credentials");
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [twoFactorSession, setTwoFactorSession] = useState<{
    email: string;
    tempToken?: string;
    previewCode?: string;
  }>({
    email: "admin@rrvgreenbasket.in",
  });

  // If user is already authenticated, redirect straight to dashboard/target
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, isLoading, redirectTarget, router]);

  const handleRequires2FA = (data: { tempToken?: string; email: string; previewCode?: string }) => {
    setTwoFactorSession(data);
    setStep("two_factor");
  };

  const handleSuccess = () => {
    setStep("success");
  };

  const handleRedirect = () => {
    router.replace(redirectTarget);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex items-center justify-center p-3 sm:p-6 lg:p-8">
      {/* Main Container: Split Desktop Hero (Left) + Card (Right) */}
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl shadow-slate-200/80 border border-slate-200/80 overflow-hidden flex flex-col lg:flex-row">
        
        {/* =========================================================================
            LEFT COLUMN: BRANDING HERO SECTION (Desktop Only)
           ========================================================================= */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-100/50 p-10 flex-col justify-between relative overflow-hidden select-none border-r border-slate-100">
          
          {/* Subtle Background Organic Farm Glow & Floating Leaves */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 left-10 w-60 h-60 bg-green-200/25 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <RRVAuthBrandLogo size="md" />
          </div>

          {/* Center Copy & Value Proposition */}
          <div className="relative z-10 my-auto py-8">
            <h1 className="text-3xl xl:text-4xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Fresh Food
              <span className="block text-[#16a34a] font-black mt-1">
                Happier Families
              </span>
            </h1>

            <p className="text-xs xl:text-sm text-slate-500 font-medium mt-3.5 max-w-sm leading-relaxed">
              Manage your store, orders, inventory and deliveries all in one place.
            </p>

            {/* 3 Value Proposition Highlight Pills matching reference */}
            <div className="mt-8 space-y-4 max-w-md">
              {/* Feature 1 */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-emerald-100/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-[#16a34a] flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <h3 className="text-xs font-bold text-slate-900">Track Orders</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Manage and monitor all customer orders
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-emerald-100/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-[#16a34a] flex items-center justify-center flex-shrink-0">
                  <Box className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <h3 className="text-xs font-bold text-slate-900">Manage Inventory</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Keep your stock updated in real time
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-emerald-100/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-[#16a34a] flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <h3 className="text-xs font-bold text-slate-900">Grow Your Business</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Get insights and serve more customers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Vegetable Basket Artwork & Curved "Farm Fresh" Ribbon */}
          <div className="relative z-10 mt-auto pt-4 -mx-10 -mb-10 overflow-hidden">
            <div className="relative w-full h-52">
              <Image
                src="/images/auth/farm-basket.png"
                alt="Farm Fresh Vegetables"
                fill
                priority
                className="object-cover object-left-bottom"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: INTERACTIVE AUTH STEPS (Step 1, Step 2, Step 3)
           ========================================================================= */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white relative">
          
          {/* Active Authentication Step */}
          <div className="my-auto py-2">
            {step === "credentials" && (
              authMode === "signin" ? (
                <LoginFormStep
                  onSuccessWithout2FA={handleSuccess}
                  onRequires2FA={handleRequires2FA}
                  onSwitchToRegister={() => setAuthMode("register")}
                />
              ) : (
                <RegisterFormStep
                  onSuccessWithout2FA={handleSuccess}
                  onRequires2FA={handleRequires2FA}
                  onSwitchToLogin={() => setAuthMode("signin")}
                />
              )
            )}

            {step === "two_factor" && (
              <TwoFactorStep
                email={twoFactorSession.email}
                tempToken={twoFactorSession.tempToken}
                initialPreviewCode={twoFactorSession.previewCode}
                onSuccess={handleSuccess}
                onBackToLogin={() => setStep("credentials")}
              />
            )}

            {step === "success" && (
              <SuccessStep onRedirect={handleRedirect} />
            )}
          </div>

          {/* Mobile Bottom Graphic matching the Mobile View in reference */}
          <div className="lg:hidden mt-8 pt-4 -mx-6 -mb-6 sm:-mx-10 sm:-mb-10 overflow-hidden">
            <div className="relative w-full h-36">
              <Image
                src="/images/auth/farm-basket.png"
                alt="Farm Fresh Vegetables"
                fill
                className="object-cover object-bottom"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#16a34a] animate-spin" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
