/**
 * Image URL resolver for RRV Green Basket produce catalog
 * Gracefully handles:
 * - Direct HTTPS CloudFront / S3 CDN URLs
 * - Unsplash photo keys (photo-...)
 * - Local static assets (/images/..., /...)
 * - Fallback transparent produce image when undefined or empty
 */
export function resolveImageUrl(img?: string, width = 600): string {
  if (!img || typeof img !== "string" || !img.trim()) {
    return "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=600&q=85";
  }

  const trimmed = img.trim();

  // Full URLs (CloudFront, AWS S3, External CDN, Data URIs, or Root-relative paths)
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }

  // Unsplash ID format (e.g. photo-1560806887-1e4cd0b6cbd6)
  if (trimmed.startsWith("photo-")) {
    return `https://images.unsplash.com/${trimmed}?auto=format&fit=crop&w=${width}&q=85`;
  }

  // Relative file paths or extensions
  if (/\.(png|jpe?g|webp|svg|gif|avif)$/i.test(trimmed)) {
    return `/${trimmed.replace(/^\/+/, "")}`;
  }

  return `https://images.unsplash.com/${trimmed}?auto=format&fit=crop&w=${width}&q=85`;
}

/**
 * Extracts all valid image URLs from a product (primary image + gallery images)
 */
export function getProductGalleryImages(product: {
  imageUrl?: string;
  image?: string;
  images?: Array<{ imageUrl?: string; url?: string } | string>;
  galleryImages?: Array<{ imageUrl?: string; url?: string } | string>;
}): string[] {
  const urls: string[] = [];

  // Primary image
  const primary = product.imageUrl || product.image;
  if (primary && typeof primary === "string" && primary.trim()) {
    urls.push(resolveImageUrl(primary));
  }

  // Additional gallery images from backend images array
  if (Array.isArray(product.images)) {
    for (const item of product.images) {
      const url =
        typeof item === "string"
          ? item
          : item && typeof item === "object"
          ? item.imageUrl || item.url
          : undefined;
      if (url && typeof url === "string" && url.trim()) {
        const resolved = resolveImageUrl(url);
        if (!urls.includes(resolved)) {
          urls.push(resolved);
        }
      }
    }
  }

  // GalleryImages array fallback
  if (Array.isArray(product.galleryImages)) {
    for (const item of product.galleryImages) {
      const url =
        typeof item === "string"
          ? item
          : item && typeof item === "object"
          ? item.imageUrl || item.url
          : undefined;
      if (url && typeof url === "string" && url.trim()) {
        const resolved = resolveImageUrl(url);
        if (!urls.includes(resolved)) {
          urls.push(resolved);
        }
      }
    }
  }

  if (urls.length === 0) {
    urls.push(resolveImageUrl(undefined));
  }

  return urls;
}
