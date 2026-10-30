"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProduceImageProps {
  name: string;
  src?: string;
  imageUrl?: string;
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
  src,
  imageUrl,
  size = 40,
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);
  const lower = name.toLowerCase();
  const customSrc = src || imageUrl;

  // 1. If custom owner-uploaded image or URL is provided, display it directly
  if (customSrc && !imgError) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100 shadow-3xs border border-slate-200/80 ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customSrc}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // 2. Find matching pre-bundled photographic asset
  let photoPath: string | null = null;
  for (const [key, path] of Object.entries(PRODUCE_PHOTO_MAP)) {
    if (lower.includes(key)) {
      photoPath = path;
      break;
    }
  }

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

  // 3. Fallback produce icons customized per produce family
  if (lower.includes("broccoli")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🥦
      </div>
    );
  }

  if (lower.includes("mushroom")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🍄
      </div>
    );
  }

  if (lower.includes("capsicum") || lower.includes("bell pepper")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🫑
      </div>
    );
  }

  if (lower.includes("chilli") || lower.includes("chili")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🌶️
      </div>
    );
  }

  if (lower.includes("corn")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🌽
      </div>
    );
  }

  if (lower.includes("brinjal") || lower.includes("eggplant")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🍆
      </div>
    );
  }

  if (lower.includes("cucumber")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🥒
      </div>
    );
  }

  if (
    lower.includes("gourd") ||
    lower.includes("parwal") ||
    lower.includes("parval") ||
    lower.includes("tendil")
  ) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🥒
      </div>
    );
  }

  if (lower.includes("garlic")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🧄
      </div>
    );
  }

  if (lower.includes("ginger")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🫚
      </div>
    );
  }

  if (lower.includes("onion") || lower.includes("shallot")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🧅
      </div>
    );
  }

  if (lower.includes("potato")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🥔
      </div>
    );
  }

  if (lower.includes("tomato")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🍅
      </div>
    );
  }

  if (lower.includes("carrot")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🥕
      </div>
    );
  }

  if (lower.includes("pumpkin")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🎃
      </div>
    );
  }

  if (lower.includes("lemon")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🍋
      </div>
    );
  }

  if (lower.includes("banana")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🍌
      </div>
    );
  }

  if (lower.includes("coconut")) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🥥
      </div>
    );
  }

  if (
    lower.includes("spinach") ||
    lower.includes("palak") ||
    lower.includes("cabbage") ||
    lower.includes("lettuce") ||
    lower.includes("bokchoy") ||
    lower.includes("pokchoy") ||
    lower.includes("leeks") ||
    lower.includes("celery")
  ) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl shadow-3xs ${className}`}
      >
        🥬
      </div>
    );
  }

  // Default produce icon with nice emerald backdrop
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl flex-shrink-0 shadow-3xs ${className}`}
    >
      🥬
    </div>
  );
};
