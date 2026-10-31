"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RRVLogo } from "@/components/layout/RRVLogo";
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { getSavedSettings } from "@/data/shared-store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@rrvgreenbasket.in");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("RRV Green Basket");

  useEffect(() => {
    const s = getSavedSettings();
    if (s.storeName) setStoreName(s.storeName);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    // Simulate login verification
    setTimeout(() => {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("rrv_admin_logged_in", "true");
          localStorage.setItem("rrv_admin_last_login", new Date().toISOString());
        } catch (err) {
          console.error("Failed to save auth token", err);
        }
      }
      setIsLoading(false);
      router.push("/admin/dashboard");
    }, 400);
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("admin123");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <RRVLogo className="pointer-events-none scale-105" />
          <div className="pt-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Admin Portal Sign In
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Enter your administrative credentials to manage store operations, orders, and inventory.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rrvgreenbasket.in"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert("Demo Password is: admin123")}
                className="text-[11px] font-bold text-[#00875a] hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#00875a] rounded-sm focus:ring-[#00875a]"
              />
              <span className="text-xs font-semibold text-slate-600">
                Remember this device
              </span>
            </label>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              256-bit Secure
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#00875a] hover:bg-[#00744e] disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Credentials Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00875a]" />
              Quick Demo Login:
            </span>
            <span className="text-[10px] font-bold text-slate-400">Click to autofill</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@rrvgreenbasket.in")}
              className="p-2 rounded-xl bg-white border border-slate-200 text-left hover:border-[#00875a] hover:bg-emerald-50/50 transition-colors"
            >
              <span className="font-bold text-slate-800 block text-[11px]">Store Admin</span>
              <span className="text-[10px] text-slate-500 truncate block">admin@rrvgreenbasket.in</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("manager@rrvgreenbasket.in")}
              className="p-2 rounded-xl bg-white border border-slate-200 text-left hover:border-[#00875a] hover:bg-emerald-50/50 transition-colors"
            >
              <span className="font-bold text-slate-800 block text-[11px]">Store Manager</span>
              <span className="text-[10px] text-slate-500 truncate block">manager@rrvgreenbasket.in</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 font-medium">
          © {new Date().getFullYear()} {storeName} • All rights reserved
        </div>
      </div>
    </div>
  );
}
