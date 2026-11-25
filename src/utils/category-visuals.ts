import type { BackendCategory } from "@/types";

/**
 * Storefront visuals for categories.
 * Used by the customer categories page (rail, banner, avatars).
 *
 * Order of preference for a category image:
 *   1. imageUrl uploaded from the admin panel
 *   2. a stock photo matched by category name
 *   3. null  -> the UI falls back to the category emoji
 */

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=80`;

const DEFAULT_IMAGES: Record<string, string> = {
  fruits: unsplash("photo-1610832958506-aa56368176cf"),
  vegetables: unsplash("photo-1540420773420-3366772f4999"),
  "leafy vegetables": unsplash("photo-1576045057995-568f588f82fb"),
  "leafy greens": unsplash("photo-1576045057995-568f588f82fb"),
  "root vegetables": unsplash("photo-1445282768818-728615cc910a"),
  seasonings: unsplash("photo-1615485290382-441e4d049cb5"),
  mushrooms: unsplash("photo-1546094096-0df4bcaaa337"),
  "other items": unsplash("photo-1604977042946-1eecc30f269e"),
  "exotic & seasonal": unsplash("photo-1550258987-190a2d41a8ba"),
  organics: unsplash("photo-1540420773420-3366772f4999"),
  "dairy products": unsplash("photo-1563636619-e9143da7973b"),
  "snacks & foods": unsplash("photo-1566478989037-eec170784d0b"),
  beverages: unsplash("photo-1600271886742-f049cd451bba"),
  "household items": unsplash("photo-1563453392212-326f5e854473"),
};

const DEFAULT_EMOJI: Record<string, string> = {
  fruits: "🍎",
  vegetables: "🥦",
  "leafy vegetables": "🥬",
  "leafy greens": "🥬",
  "root vegetables": "🥕",
  seasonings: "🌿",
  mushrooms: "🍄",
  "other items": "📦",
  "exotic & seasonal": "🍍",
  organics: "🌱",
  "dairy products": "🥛",
  "snacks & foods": "🥜",
  beverages: "🧃",
  "household items": "🧺",
  groceries: "🛒",
  "dry fruits": "🥜",
};

const key = (name?: string | null) => (name || "").trim().toLowerCase();

export function getCategoryEmoji(name?: string | null): string {
  return DEFAULT_EMOJI[key(name)] || "🛒";
}

export function getCategoryImage(
  category: Pick<BackendCategory, "name" | "imageUrl"> | null | undefined
): string | null {
  if (!category) return null;
  const uploaded = category.imageUrl?.trim();
  if (uploaded) return uploaded;
  return DEFAULT_IMAGES[key(category.name)] || null;
}

/** URL-friendly identifier used in /categories?category=<slug> */
export function getCategorySlug(
  category: Pick<BackendCategory, "slug" | "publicId">
): string {
  return (category.slug || category.publicId || "").trim();
}