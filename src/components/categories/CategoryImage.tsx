"use client";

import React, { useState } from "react";
import { FolderTree } from "lucide-react";

interface CategoryImageProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
}

export const CategoryImage: React.FC<CategoryImageProps> = ({
  name,
  imageUrl,
  size = 40,
  className = "",
}) => {
  const [error, setError] = useState(false);
  const cleanUrl = (imageUrl || "").trim();

  // If valid image URL provided and no load error, render image
  if (cleanUrl && !error) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100 shadow-3xs border border-slate-200/80 ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cleanUrl}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          onError={() => setError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: icon container with category initial and folder indicator
  const initial = (name || "C").charAt(0).toUpperCase();

  return (
    <div
      style={{ width: size, height: size }}
      className={`flex-shrink-0 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-800 font-black shadow-3xs group-hover:border-emerald-300 transition-colors ${className}`}
      title={name}
    >
      <div className="flex flex-col items-center justify-center">
        <FolderTree className="w-4 h-4 text-[#00875a]" />
      </div>
    </div>
  );
};
