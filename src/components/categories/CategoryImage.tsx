"use client";

import React, { useState } from "react";

interface CategoryImageProps {
  name: string;
  imageUrl?: string | null;
  /**
   * Fixed size in px. Omit (or pass 0) for fill-parent mode.
   */
  size?: number;
  className?: string;
}

/*
  Per-category palette — deterministic from first char of name.
  Uses the design system tints aligned to BigBasket-style tiles.
*/
const PALETTES = [
  { bg: "#E7F6EE", emoji: "🥦" },   // emerald tint — Vegetables
  { bg: "#FFF1E6", emoji: "🥕" },   // orange tint  — Fruits/Root
  { bg: "#FBF3E4", emoji: "🌽" },   // amber tint   — Grains
  { bg: "#FDECEC", emoji: "🍅" },   // red tint     — Seasonings
  { bg: "#F3EEE8", emoji: "🍄" },   // brown tint   — Mushrooms
  { bg: "#EEF2FF", emoji: "🫐" },   // indigo tint  — Berries
  { bg: "#FDF2F8", emoji: "🍓" },   // pink tint    — Soft fruits
  { bg: "#F0FDF4", emoji: "🥝" },   // lime tint    — Exotic
  { bg: "#FFFBEB", emoji: "🍋" },   // yellow tint  — Citrus
  { bg: "#F0FDFA", emoji: "🥬" },   // teal tint    — Leafy
] as const;

function getPalette(name: string) {
  const idx = (name || "C").charCodeAt(0) % PALETTES.length;
  return PALETTES[idx];
}

export const CategoryImage: React.FC<CategoryImageProps> = ({
  name,
  imageUrl,
  size,
  className = "",
}) => {
  const [error, setError] = useState(false);
  const cleanUrl = (imageUrl || "").trim();

  const isFill = !size || size === 0;
  const sizeStyle = isFill ? {} : { width: size, height: size };
  const sizeClass = isFill ? "w-full h-full" : "";
  const emojiSize = !size ? "text-4xl" : size < 36 ? "text-sm" : size < 48 ? "text-xl" : "text-2xl";

  if (cleanUrl && !error) {
    return (
      <div
        style={sizeStyle}
        className={`${sizeClass} relative flex-shrink-0 rounded-2xl overflow-hidden bg-[#F6F8F7] ${className}`}
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

  const palette = getPalette(name);

  return (
    <div
      style={{ ...sizeStyle, backgroundColor: palette.bg }}
      className={`${sizeClass} flex-shrink-0 rounded-2xl flex items-center justify-center ${className}`}
      title={name}
    >
      <span className={emojiSize} role="img" aria-label={name}>
        {palette.emoji}
      </span>
    </div>
  );
};
