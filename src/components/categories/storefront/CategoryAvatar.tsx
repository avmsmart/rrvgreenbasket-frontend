"use client";

import React, { useState } from "react";
import { resolveImageUrl } from "@/utils/image-utils";

interface CategoryAvatarProps {
  /** Image URL (can be null/empty - emoji is shown instead) */
  src?: string | null;
  /** Shown when there is no image or the image fails to load */
  emoji: string;
  alt: string;
  /** Diameter in px */
  size?: number;
  className?: string;
}

/**
 * Round category image with an emoji fallback.
 * Broken or missing images never leave an empty circle.
 */
export const CategoryAvatar: React.FC<CategoryAvatarProps> = ({
  src,
  emoji,
  alt,
  size = 56,
  className = "",
}) => {
  // Remember which URL failed, so a new image (e.g. updated in admin) gets a fresh try
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eaf8f0] ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolveImageUrl(src as string, size * 2)}
          alt={alt}
          loading="lazy"
          onError={() => setFailedSrc(src ?? null)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          role="img"
          aria-label={alt}
          className="leading-none"
          style={{ fontSize: size * 0.48 }}
        >
          {emoji}
        </span>
      )}
    </span>
  );
};

export default CategoryAvatar;