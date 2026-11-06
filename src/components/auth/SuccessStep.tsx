"use client";

import React, { useEffect } from "react";
import { Check } from "lucide-react";

interface SuccessStepProps {
  onRedirect: () => void;
  redirectDelayMs?: number;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({
  onRedirect,
  redirectDelayMs = 1500,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRedirect();
    }, redirectDelayMs);

    return () => clearTimeout(timer);
  }, [onRedirect, redirectDelayMs]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-6 text-center select-none animate-in fade-in duration-300">
      {/* Big Green Circle with Checkmark & Floating Confetti Dots (Exact match to reference) */}
      <div className="relative w-32 h-32 flex items-center justify-center mb-6">
        {/* Soft emerald outer pulse */}
        <div className="absolute inset-0 rounded-full bg-emerald-100/50 animate-ping opacity-30" />

        {/* Decorative Confetti Dots (Yellow, Blue, Green, Orange dots) */}
        <span className="absolute top-1 left-7 w-2 h-2 rounded-full bg-amber-400" />
        <span className="absolute top-6 left-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
        <span className="absolute top-0 right-10 w-2 h-2 rounded-full bg-emerald-600" />
        <span className="absolute top-8 right-2 w-2.5 h-2.5 rounded-full bg-sky-400" />
        <span className="absolute bottom-5 left-3 w-2 h-2 rounded-full bg-sky-500" />
        <span className="absolute bottom-1 left-12 w-2 h-2 rounded-full bg-amber-500" />
        <span className="absolute bottom-4 right-5 w-2 h-2 rounded-full bg-orange-400" />
        <span className="absolute bottom-0 right-12 w-2.5 h-2.5 rounded-full bg-emerald-400" />

        {/* Main Checkmark Circle */}
        <div className="relative w-20 h-20 rounded-full bg-[#16a34a] text-white flex items-center justify-center shadow-xl shadow-emerald-600/30">
          <Check strokeWidth={3.5} className="w-10 h-10 animate-in zoom-in-75 duration-200" />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
        Verification Successful!
      </h2>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5 max-w-xs mx-auto leading-relaxed">
        You will be redirected to the dashboard...
      </p>

      {/* Circular Loading Spinner matching reference image */}
      <div className="mt-8 flex items-center justify-center">
        <div className="w-9 h-9 rounded-full border-3 border-slate-200 border-t-[#16a34a] animate-spin" />
      </div>
    </div>
  );
};
