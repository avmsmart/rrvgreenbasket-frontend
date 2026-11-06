"use client";

import React from "react";

interface RRVAuthBrandLogoProps {
  centered?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const RRVAuthBrandLogo: React.FC<RRVAuthBrandLogoProps> = ({
  centered = false,
  className = "",
  size = "md",
}) => {
  const iconSizes = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-14 h-14",
  };

  const titleSizes = {
    sm: "text-[14px]",
    md: "text-[16px]",
    lg: "text-[19px]",
  };

  const subtitleSizes = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-[11px]",
  };

  return (
    <div
      className={`flex items-center gap-3 select-none ${
        centered ? "justify-center text-left" : "justify-start text-left"
      } ${className}`}
    >
      {/* Brand Icon: Green perforated basket with two sprouting leaves */}
      <div className={`${iconSizes[size]} flex items-center justify-center flex-shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sprouting Leaves (Fresh Bright Green) */}
          <path
            d="M 50 48 C 42 38 26 30 24 16 C 38 18 46 28 50 44 Z"
            fill="#52c41a"
          />
          <path
            d="M 50 48 C 58 38 74 30 76 16 C 62 18 54 28 50 44 Z"
            fill="#73d13d"
          />
          {/* Stem */}
          <path d="M 48 40 L 52 40 L 51 52 L 49 52 Z" fill="#389e0d" />

          {/* Perforated Basket Bowl (Dark Emerald Green) */}
          <path
            d="M 18 54 L 82 54 C 80 78 72 90 50 90 C 28 90 20 78 18 54 Z"
            fill="#065f46"
          />

          {/* Basket Top Rim */}
          <rect x="14" y="52" width="72" height="6" rx="3" fill="#047857" />

          {/* Perforations */}
          <circle cx="30" cy="65" r="3.2" fill="#ffffff" />
          <circle cx="43" cy="65" r="3.2" fill="#ffffff" />
          <circle cx="57" cy="65" r="3.2" fill="#ffffff" />
          <circle cx="70" cy="65" r="3.2" fill="#ffffff" />

          <circle cx="36" cy="76" r="3" fill="#ffffff" />
          <circle cx="50" cy="76" r="3" fill="#ffffff" />
          <circle cx="64" cy="76" r="3" fill="#ffffff" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <span className={`${titleSizes[size]} font-black text-slate-900 tracking-tight leading-tight`}>
          RRV
        </span>
        <span className={`${titleSizes[size]} font-black text-slate-900 tracking-tight leading-tight`}>
          Green Basket
        </span>
        <span className={`${subtitleSizes[size]} font-bold text-[#16a34a] tracking-tight mt-0.5 leading-none`}>
          Freshness Delivered Daily
        </span>
      </div>
    </div>
  );
};
