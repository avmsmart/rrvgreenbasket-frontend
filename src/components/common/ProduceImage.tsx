"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProduceImageProps {
  name: string;
  size?: number;
  className?: string;
}

const PRODUCE_PHOTO_MAP: Record<string, string> = {
  tomato: "/images/products/tomato.jpg",
  onion: "/images/products/onion.jpg",
  potato: "/images/products/potato.jpg",
  carrot: "/images/products/carrot.jpg",
  spinach: "/images/products/spinach.jpg",
  palak: "/images/products/spinach.jpg",
  lemon: "/images/products/lemon.jpg",
  chilli: "/images/products/chilli.jpg",
  chili: "/images/products/chilli.jpg",
  coriander: "/images/products/coriander.jpg",
  ginger: "/images/products/ginger.jpg",
  capsicum: "/images/products/capsicum.jpg",
};

export const ProduceImage: React.FC<ProduceImageProps> = ({
  name,
  size = 40,
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);
  const lower = name.toLowerCase();

  // Find matching photographic asset
  let photoPath: string | null = null;
  for (const [key, path] of Object.entries(PRODUCE_PHOTO_MAP)) {
    if (lower.includes(key)) {
      photoPath = path;
      break;
    }
  }

  // If photo is available and hasn't errored, display the real photorealistic image
  if (photoPath && !imgError) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100 shadow-3xs border border-slate-200/80 ${className}`}
      >
        <Image
          src={photoPath}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover hover:scale-105 transition-transform duration-200"
          onError={() => setImgError(true)}
          unoptimized
        />
      </div>
    );
  }

  // Fallback realistic vector graphics if photo is loading or missing
  if (lower.includes("tomato")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🍅
      </div>
    );
  }

  if (lower.includes("onion")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🧅
      </div>
    );
  }

  if (lower.includes("potato")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🥔
      </div>
    );
  }

  if (lower.includes("carrot")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🥕
      </div>
    );
  }

  if (lower.includes("spinach") || lower.includes("palak")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🥬
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-xl flex-shrink-0 shadow-3xs ${className}`}
    >
      🥬
    </div>
  );
};
