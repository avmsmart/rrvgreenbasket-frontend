"use client";

import React, { useState } from "react";
import { User, Mail, Lock, Phone, Store, Eye, EyeOff, ArrowRight, Shield, AlertCircle } from "lucide-react";
import { RRVAuthBrandLogo } from "./RRVAuthBrandLogo";
import { useAuth } from "@/context/AuthContext";
import { RegisterAdminData } from "@/types";

interface RegisterFormStepProps {
  onSuccessWithout2FA: () => void;
  onRequires2FA: (data: { tempToken?: string; email: string }) => void;
  onSwitchToLogin: () => void;
}

export const RegisterFormStep: React.FC<RegisterFormStepProps> = ({
  onSuccessWithout2FA,
  onRequires2FA,
  onSwitchToLogin,
}) => {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("RRV Green Basket");
  const [role, setRole] = useState("Super Admin");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (!email.includes("@")) {
      setErrorMessage("Please provide a valid work email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters in length.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify both password fields.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const data: RegisterAdminData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || "+91 98765 43210",
        storeName: storeName.trim(),
        role,
        password: password.trim(),
        twoFactorEnabled,
      };

      const result = await register(data);

      if (!result.success) {
        setErrorMessage(result.error || "Failed to create administrator account.");
        setIsSubmitting(false);
        return;
      }

      if (result.requires2FA) {
        onRequires2FA({
          tempToken: result.tempToken,
          email: email.trim(),
        });
      } else {
        onSuccessWithout2FA();
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Account registration failed. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Top Centered Brand Logo */}
      <div className="flex justify-center mb-4">
        <RRVAuthBrandLogo centered size="md" />
      </div>

      {/* Heading & Subtitle */}
      <div className="text-center mb-5">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Create Admin Account
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Register a new administrator to manage store operations
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Karan Vandana"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-[#16a34a] bg-slate-50/40 hover:bg-white"
            />
          </div>
        </div>

        {/* Work Email Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Work Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your personal or work email"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-[#16a34a] bg-slate-50/40 hover:bg-white"
            />
          </div>
        </div>

        {/* Phone & Store Name Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-[#16a34a] bg-slate-50/40 hover:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Admin Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-[#16a34a] bg-slate-50/40 hover:bg-white"
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Store Manager">Store Manager</option>
              <option value="Delivery Operations Lead">Delivery Operations Lead</option>
              <option value="Procurement Head">Mandi Procurement Head</option>
            </select>
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-[#16a34a] bg-slate-50/40 hover:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-[#16a34a] bg-slate-50/40 hover:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 2FA Security Setting Checkbox */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3 select-none">
          <input
            type="checkbox"
            id="reg2fa"
            checked={twoFactorEnabled}
            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded text-[#16a34a] focus:ring-emerald-500/30 border-slate-300 accent-[#16a34a]"
          />
          <label htmlFor="reg2fa" className="cursor-pointer">
            <span className="block text-xs font-bold text-slate-900">
              Enable Two-Factor Authentication (2FA) via Email OTP
            </span>
            <span className="block text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Sends a real 6-digit verification code to your email when signing in.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-700/20 disabled:opacity-50 transition-all mt-2"
        >
          {isSubmitting ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Admin Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch back to sign in */}
      <div className="mt-5 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-600">
          Already have an administrator account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#16a34a] hover:text-[#15803d] hover:underline transition-colors"
          >
            Sign In here
          </button>
        </p>
      </div>
    </div>
  );
};
