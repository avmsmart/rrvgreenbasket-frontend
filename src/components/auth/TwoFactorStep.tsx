"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  KeyRound,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { RRVAuthBrandLogo } from "./RRVAuthBrandLogo";
import { useAuth } from "@/context/AuthContext";
import { formatSecretKey } from "@/lib/totp-service";

interface TwoFactorStepProps {
  email: string;
  tempToken?: string;
  initialPreviewCode?: string;
  initialTotpSecret?: string;
  initialTotpQrCode?: string;
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export const TwoFactorStep: React.FC<TwoFactorStepProps> = ({
  email,
  tempToken = "",
  initialPreviewCode,
  initialTotpSecret = "JBSWY3DPEHPK3PXP",
  initialTotpQrCode,
  onSuccess,
  onBackToLogin,
}) => {
  const { verify2FA, getTotpSetup, getCurrentTotpCode } = useAuth();

  // 6 individual OTP digit boxes
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Google Authenticator Setup & QR Code State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(initialTotpQrCode || null);
  const [totpSecret, setTotpSecret] = useState<string>(initialTotpSecret);
  const [isCopied, setIsCopied] = useState(false);

  // Real-time TOTP synchronization
  const [currentCode, setCurrentCode] = useState<string | null>(initialPreviewCode || null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Fetch QR code & initial TOTP data if not already provided
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const setup = await getTotpSetup(email);
        if (isMounted) {
          setQrDataUrl(setup.qrDataUrl);
          setTotpSecret(setup.secret);
        }
        const live = await getCurrentTotpCode(setup.secret);
        if (isMounted) {
          setCurrentCode(live.code);
          setSecondsRemaining(live.secondsRemaining);
        }
      } catch (err) {
        console.warn("Could not load TOTP setup:", err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [email, getTotpSetup, getCurrentTotpCode]);

  // Live 30-second TOTP countdown timer
  const syncLiveCode = useCallback(async () => {
    try {
      const live = await getCurrentTotpCode(totpSecret);
      setCurrentCode(live.code);
      setSecondsRemaining(live.secondsRemaining);
    } catch {
      // Sync fallback
    }
  }, [getCurrentTotpCode, totpSecret]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          syncLiveCode();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [syncLiveCode]);

  // Copy secret key helper
  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(totpSecret.replace(/\s+/g, ""));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Clipboard fallback
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (!/^\d*$/.test(char)) return;

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
      setErrorMessage("Please enter all 6 digits from Google Authenticator.");
      return;
    }

    setErrorMessage(null);
    setIsVerifying(true);

    try {
      const result = await verify2FA(fullCode, tempToken, email);
      if (result.success) {
        onSuccess();
      } else {
        setErrorMessage(
          result.error ||
            "Invalid Google Authenticator code. Please check your authenticator app and try again."
        );
        setIsVerifying(false);
      }
    } catch {
      setErrorMessage("Verification request failed. Please check your network connection.");
      setIsVerifying(false);
    }
  };

  const isFull = digits.every((d) => d !== "");

  return (
    <div className="w-full">
      {/* Top Centered Brand Logo */}
      <div className="flex justify-center mb-5">
        <RRVAuthBrandLogo centered size="md" />
      </div>

      {/* Title & Subtitle */}
      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Two-Step Verification
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Enter the 6-digit code from your{" "}
          <span className="font-bold text-slate-800">Google Authenticator</span> app
        </p>
      </div>

      {/* Shield & Authenticator Illustration */}
      <div className="flex justify-center my-3">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-50/80 animate-pulse" />

          {/* Smartphone device icon */}
          <div className="relative w-12 h-18 bg-slate-900 rounded-[14px] p-1 shadow-md border-2 border-slate-700 flex flex-col items-center">
            <div className="w-3.5 h-1 bg-slate-600 rounded-full mb-1" />
            <div className="w-full flex-1 bg-white rounded-[8px] flex items-center justify-center relative overflow-hidden">
              <KeyRound className="w-4 h-4 text-[#16a34a]" />
            </div>
            <div className="w-4 h-0.5 bg-slate-600 rounded-full mt-0.5" />
          </div>

          {/* Floating Green Shield Check Badge */}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#16a34a] text-white flex items-center justify-center shadow-lg border-2 border-white">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* QR Code Pairing Accordion Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowQrModal(!showQrModal)}
          className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#16a34a]" />
            <span>Pair Google Authenticator (Scan QR Code)</span>
          </div>
          {showQrModal ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Expandable Setup Drawer */}
        {showQrModal && (
          <div className="mt-2.5 p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm animate-in fade-in duration-200">
            <div className="text-center mb-3">
              <h4 className="text-xs font-bold text-slate-900">
                Scan with Google Authenticator
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Open Google Authenticator on your phone, tap <strong>+</strong>, and scan this QR code.
              </p>
            </div>

            {/* QR Code Image */}
            {qrDataUrl ? (
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-xs inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUrl}
                    alt="Google Authenticator QR Code"
                    className="w-44 h-44 object-contain rounded-xl"
                  />
                </div>
              </div>
            ) : (
              <div className="w-44 h-44 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-3 text-slate-400">
                <QrCode className="w-8 h-8 animate-pulse" />
              </div>
            )}

            {/* Manual Secret Key */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">
                  Can&apos;t scan? Enter setup key manually:
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                  {formatSecretKey(totpSecret)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopySecret}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-[#16a34a]" />
                    <span className="text-[#16a34a]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Synchronized Code Helper (Desktop Developer Testing) */}
      {currentCode && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex items-center justify-between text-xs animate-in fade-in duration-200 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            <div>
              <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                <span>Current Authenticator Code:</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold">
                  <Clock className="w-3 h-3" />
                  {secondsRemaining}s
                </span>
              </div>
              <span className="font-mono text-base font-black text-emerald-900 tracking-widest">
                {currentCode}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setDigits(currentCode.split(""));
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
        <div
          className="flex items-center justify-center gap-2 sm:gap-2.5 on-paste"
          onPaste={handlePaste}
        >
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
              <span>Verify & Sign In</span>
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
          <label
            htmlFor="rememberDevice"
            className="cursor-pointer font-medium hover:text-slate-900"
          >
            Remember this device for 30 days
          </label>
        </div>
      </form>

      {/* Info Card matching Google Authenticator */}
      <div className="mt-5 p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#dcfce7] flex items-start gap-3 select-none">
        <div className="w-5 h-5 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <div className="text-[11px] leading-relaxed text-slate-600">
          <span className="font-bold text-slate-800">Time-based One-Time Password (TOTP)</span>.
          Codes rotate automatically every 30 seconds for maximum administrator security.
        </div>
      </div>

      {/* Back to Login action */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center text-xs">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 font-bold text-[#16a34a] hover:text-[#15803d] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Administrator Login</span>
        </button>
      </div>
    </div>
  );
};
