"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { RRVAuthBrandLogo } from "./RRVAuthBrandLogo";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { useAuth } from "@/context/AuthContext";
import { LoginCredentials } from "@/types";

interface LoginFormStepProps {
  onSuccessWithout2FA: () => void;
  onRequires2FA: (data: { tempToken?: string; email: string }) => void;
  onSwitchToRegister: () => void;
}

export const LoginFormStep: React.FC<LoginFormStepProps> = ({
  onSuccessWithout2FA,
  onRequires2FA,
  onSwitchToRegister,
}) => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const credentials: LoginCredentials = {
        email: email.trim(),
        password: password.trim(),
        rememberMe,
      };

      const result = await login(credentials);

      if (!result.success) {
        setErrorMessage(result.error || "Authentication failed. Please verify your credentials.");
        setIsSubmitting(false);
        return;
      }

      if (result.requires2FA) {
        onRequires2FA({
          tempToken: result.tempToken,
          email: result.targetEmail || email.trim(),
        });
      } else {
        onSuccessWithout2FA();
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected network error occurred."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full">
        {/* Top Centered Brand Logo */}
        <div className="flex justify-center mb-5">
          <RRVAuthBrandLogo centered size="md" />
        </div>

        {/* Heading & Subtitle matching reference */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Admin Login
          </h2>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
            Sign in to manage your store operations
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-[#16a34a] transition-all bg-slate-50/40 hover:bg-white"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-2xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-[#16a34a] transition-all bg-slate-50/40 hover:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between text-xs pt-0.5 select-none">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600 hover:text-slate-900">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#16a34a] focus:ring-emerald-500/30 border-slate-300 accent-[#16a34a]"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="font-bold text-[#16a34a] hover:text-[#15803d] hover:underline transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2.5 py-3 sm:py-3.5 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-700/20 disabled:opacity-50 transition-all group"
          >
            {isSubmitting ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Divider: or continue with */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            or continue with
          </span>
        </div>

        {/* Secure Access Information Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f0fdf4] border border-[#dcfce7] flex items-center gap-3 select-none">
          <div className="w-9 h-9 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <h4 className="text-xs font-bold text-slate-900">Secure Access</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Only authorized admin users can access this system.
            </p>
          </div>
        </div>

        {/* Real Admin Registration Switch */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            New administrator or store owner?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-bold text-[#16a34a] hover:text-[#15803d] hover:underline transition-colors"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={email}
      />
    </>
  );
};
