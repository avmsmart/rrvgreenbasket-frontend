import React from "react";
import Link from "next/link";

interface RRVLogoProps {
  collapsed?: boolean;
  className?: string;
}

export const RRVLogo: React.FC<RRVLogoProps> = ({ collapsed = false, className = "" }) => {
  return (
    <Link
      href="/admin/dashboard"
      className={`flex items-center gap-3 transition-all duration-200 group select-none ${className}`}
      title="RRV Green Basket"
    >
      {/* Brand Icon: Green perforated basket with two sprouting leaves */}
      <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sprouting Leaves (Bright Fresh Green) */}
          {/* Left Leaf */}
          <path
            d="M 50 48 C 42 38 26 30 24 16 C 38 18 46 28 50 44 Z"
            fill="#52c41a"
          />
          {/* Right Leaf */}
          <path
            d="M 50 48 C 58 38 74 30 76 16 C 62 18 54 28 50 44 Z"
            fill="#73d13d"
          />
          {/* Stem */}
          <path
            d="M 48 40 L 52 40 L 51 52 L 49 52 Z"
            fill="#389e0d"
          />

          {/* Perforated Basket / Bowl (Dark Emerald Green) */}
          <path
            d="M 18 54 L 82 54 C 80 78 72 90 50 90 C 28 90 20 78 18 54 Z"
            fill="#065f46"
          />

          {/* Basket Top Rim */}
          <rect x="14" y="52" width="72" height="6" rx="3" fill="#047857" />

          {/* Perforation Holes (White Circular Dots) */}
          {/* Row 1 */}
          <circle cx="30" cy="65" r="3.2" fill="#ffffff" />
          <circle cx="43" cy="65" r="3.2" fill="#ffffff" />
          <circle cx="57" cy="65" r="3.2" fill="#ffffff" />
          <circle cx="70" cy="65" r="3.2" fill="#ffffff" />

          {/* Row 2 */}
          <circle cx="36" cy="76" r="3" fill="#ffffff" />
          <circle cx="50" cy="76" r="3" fill="#ffffff" />
          <circle cx="64" cy="76" r="3" fill="#ffffff" />
        </svg>
      </div>

      {/* Brand Typography matching user's exact screenshot */}
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="text-[17px] font-black text-slate-900 tracking-tight leading-tight">
            RRV
          </span>
          <span className="text-[15px] font-black text-slate-900 tracking-tight leading-tight">
            Green Basket
          </span>
          <span className="text-[10px] font-bold text-[#16a34a] tracking-tight mt-1 leading-none">
            Freshness Delivered Daily
          </span>
        </div>
      )}
    </Link>
  );
};
