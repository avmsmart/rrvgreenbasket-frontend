export type ProductCategory =
  | "Vegetables"
  | "Fruits"
  | "Leafy Greens"
  | "Groceries"
  | "Dairy Products"
  | "Snacks & Foods"
  | "Beverages"
  | "Organic Products"
  | "Household Items";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  unit: string; // "1 kg", "1 bunch", "500 g", etc.
  stock: number;
  minStock?: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  imageUrl?: string;
  description?: string;
  isOrganic?: boolean;
  featured?: boolean;
}
