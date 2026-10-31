"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, ShieldCheck, ArrowLeft, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { RRVAuthBrandLogo } from "./RRVAuthBrandLogo";
import { useAuth } from "@/context/AuthContext";

interface TwoFactorStepProps {
  email: string;
  tempToken?: string;
  initialPreviewCode?: string;
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export const TwoFactorStep: React.FC<TwoFactorStepProps> = ({
  email,
  tempToken = "",
  initialPreviewCode,
  onSuccess,
  onBackToLogin,
}) => {
  const { verify2FA, resendOtp } = useAuth();

  // 6 individual OTP digit boxes
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState<string | null>(initialPreviewCode || null);
  const [successNotice, setSuccessNotice] = useState<string | null>(
    `A verification code has been dispatched to ${email}. Please check your inbox & spam folder.`
  );

  // Resend countdown timer
  const [countdown, setCountdown] = useState<number>(60);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1); // Take only latest entered character

    if (!/^\d*$/.test(char)) return; // Allow digits only

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance to next box if filled
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);
    setErrorMessage(null);

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = digits.join("");

    if (fullCode.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    setErrorMessage(null);
    setIsVerifying(true);

    try {
      const result = await verify2FA(fullCode, tempToken, email);
      if (result.success) {
        onSuccess();
      } else {
        setErrorMessage(result.error || "Invalid verification code. Please check your email.");
        setIsVerifying(false);
      }
    } catch {
      setErrorMessage("Verification request failed. Please check your network.");
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage(null);

    try {
      const res = await resendOtp(email);
      if (res.success) {
        setSuccessNotice(`Fresh verification code sent to ${email}. Check your inbox.`);
        if (res.previewCode) {
          setPreviewCode(res.previewCode);
        }
        setCountdown(60);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage("Failed to resend verification code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const isFull = digits.every((d) => d !== "");

  return (
    <div className="w-full">
      {/* Top Centered Brand Logo */}
      <div className="flex justify-center mb-5">
        <RRVAuthBrandLogo centered size="md" />
      </div>

      {/* Title & Subtitle matching reference */}
      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Two-Step Verification
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Enter the 6-digit code sent to{" "}
          <span className="font-bold text-slate-800 break-all">{email}</span>
        </p>
      </div>

      {/* Phone with Shield Check Illustration (Exact match to reference) */}
      <div className="flex justify-center my-3">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-50/80 animate-pulse" />

          {/* Phone body */}
          <div className="relative w-12 h-18 bg-slate-900 rounded-[14px] p-1 shadow-md border-2 border-slate-700 flex flex-col items-center">
            <div className="w-3.5 h-1 bg-slate-600 rounded-full mb-1" />
            <div className="w-full flex-1 bg-white rounded-[8px] flex items-center justify-center relative overflow-hidden">
              <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#16a34a] font-black text-xs">
                ✉️
              </div>
            </div>
            <div className="w-4 h-0.5 bg-slate-600 rounded-full mt-0.5" />
          </div>

          {/* Floating Green Shield Check Badge */}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#16a34a] text-white flex items-center justify-center shadow-lg border-2 border-white">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Success notification banner */}
      {successNotice && !errorMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-[#f0fdf4] border border-[#dcfce7] text-[#15803d] text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#16a34a]" />
          <span className="leading-tight">{successNotice}</span>
        </div>
      )}

      {/* Code Helper Card */}
      {previewCode && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex items-center justify-between text-xs animate-in fade-in duration-200 select-none">
          <div>
            <span className="text-slate-500 text-[11px] block font-medium">Your 6-Digit Verification Code:</span>
            <span className="font-mono text-base font-black text-emerald-900 tracking-widest">{previewCode}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setDigits(previewCode.split(""));
              setErrorMessage(null);
              inputRefs.current[5]?.focus();
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-[11px] font-bold shadow-xs transition-colors"
          >
            Auto-Enter Code
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 6 Digit Inputs */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 on-paste" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-10 h-12 sm:w-11 sm:h-13 text-center text-base sm:text-lg font-black text-slate-900 rounded-xl sm:rounded-2xl border transition-all select-none ${
                digit
                  ? "border-[#16a34a] bg-[#f0fdf4] ring-2 ring-emerald-500/20 shadow-xs"
                  : "border-slate-200/90 bg-slate-50/50 hover:bg-white focus:border-[#16a34a] focus:ring-2 focus:ring-emerald-500/25"
              } focus:outline-none`}
            />
          ))}
        </div>

        {/* Verify Code Button */}
        <button
          type="submit"
          disabled={isVerifying || !isFull}
          className="w-full inline-flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-700/20 disabled:opacity-50 transition-all group mt-2"
        >
          {isVerifying ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Verify Code</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        {/* Remember device checkbox */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-600 select-none pt-1">
          <input
            type="checkbox"
            id="rememberDevice"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            className="w-4 h-4 rounded text-[#16a34a] focus:ring-emerald-500/30 border-slate-300 accent-[#16a34a]"
          />
          <label htmlFor="rememberDevice" className="cursor-pointer font-medium hover:text-slate-900">
            Remember this device for 30 days
          </label>
        </div>
      </form>

      {/* Info Card matching reference */}
      <div className="mt-5 p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#dcfce7] flex items-start gap-3 select-none">
        <div className="w-5 h-5 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <div className="text-[11px] leading-relaxed text-slate-600">
          <span className="font-bold text-slate-800">Check your Email</span>. A 6-digit verification code has been dispatched. If not in your inbox, kindly check your spam/junk folder.
        </div>
      </div>

      {/* Action links row */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 font-bold text-[#16a34a] hover:text-[#15803d] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Use a different account</span>
        </button>

        <button
          type="button"
          disabled={countdown > 0 || isResending}
          onClick={handleResend}
          className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-emerald-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
          <span>
            {countdown > 0 ? `Resend code (${countdown}s)` : "Resend code"}
          </span>
        </button>
      </div>
    </div>
  );
};
