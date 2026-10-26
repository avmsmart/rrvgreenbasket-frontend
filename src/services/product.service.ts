import { apiClient } from "./api-client";
import { Product, ProductCategory } from "@/types";
import { MOCK_PRODUCTS_DATA } from "@/data";

export interface ProductQueryParams {
  category?: ProductCategory | "All";
  status?: "In Stock" | "Low Stock" | "Out of Stock" | "All";
  search?: string;
  isOrganic?: boolean;
}

export const productService = {
  /**
   * Fetch list of products/vegetables with optional filters
   */
  async getProducts(params?: ProductQueryParams): Promise<Product[]> {
    let filtered = [...MOCK_PRODUCTS_DATA];

    if (params?.category && params.category !== "All") {
      filtered = filtered.filter((p) => p.category === params.category);
    }
    if (params?.status && params.status !== "All") {
      filtered = filtered.filter((p) => p.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (params?.isOrganic !== undefined) {
      filtered = filtered.filter((p) => p.isOrganic === params.isOrganic);
    }

    return apiClient.get<Product[]>(
      "/admin/products",
      {
        params: {
          category: params?.category === "All" ? undefined : params?.category,
          status: params?.status === "All" ? undefined : params?.status,
          search: params?.search,
          isOrganic: params?.isOrganic,
        },
      },
      filtered
    );
  },

  /**
   * Fetch single product details
   */
  async getProductById(productId: string): Promise<Product | null> {
    const fallback =
      MOCK_PRODUCTS_DATA.find((p) => p.id === productId) || null;

    return apiClient.get<Product | null>(
      `/admin/products/${encodeURIComponent(productId)}`,
      {},
      fallback
    );
  },

  /**
   * Add a new product to catalogue
   */
  async createProduct(newProduct: Omit<Product, "id">): Promise<Product> {
    const created: Product = {
      ...newProduct,
      id: "PRD-" + String(Date.now()).slice(-4),
    };

    return apiClient.post<Product>(
      "/admin/products",
      newProduct,
      {},
      created
    );
  },

  /**
   * Update existing product details
   */
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const existing =
      MOCK_PRODUCTS_DATA.find((p) => p.id === productId) || MOCK_PRODUCTS_DATA[0];
    const updated: Product = {
      ...existing,
      ...updates,
      id: productId,
    };

    return apiClient.put<Product>(
      `/admin/products/${encodeURIComponent(productId)}`,
      updates,
      {},
      updated
    );
  },

  /**
   * Quick update product daily selling price
   */
  async updatePrice(
    productId: string,
    price: number,
    originalPrice?: number
  ): Promise<Product> {
    return this.updateProduct(productId, { price, originalPrice });
  },

  /**
   * Delete product
   */
  async deleteProduct(productId: string): Promise<{ success: boolean; id: string }> {
    return apiClient.delete<{ success: boolean; id: string }>(
      `/admin/products/${encodeURIComponent(productId)}`,
      {},
      { success: true, id: productId }
    );
  },
};
