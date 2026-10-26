import { apiClient } from "./api-client";
import { Coupon } from "@/types";
import { MOCK_COUPONS_DATA } from "@/data";

export const couponService = {
  /**
   * Fetch active coupons & promotional offers
   */
  async getCoupons(): Promise<Coupon[]> {
    return apiClient.get<Coupon[]>(
      "/admin/coupons",
      {},
      MOCK_COUPONS_DATA
    );
  },

  /**
   * Create new discount coupon or free delivery offer
   */
  async createCoupon(coupon: Omit<Coupon, "id" | "usage">): Promise<Coupon> {
    const created: Coupon = {
      ...coupon,
      id: "CPN-" + String(Date.now()).slice(-4),
      usage: `0 / 200`,
    };

    return apiClient.post<Coupon>(
      "/admin/coupons",
      coupon,
      {},
      created
    );
  },

  /**
   * Toggle coupon active/inactive status
   */
  async updateCouponStatus(couponId: string, status: Coupon["status"]): Promise<Coupon> {
    const existing =
      MOCK_COUPONS_DATA.find((c) => c.id === couponId) || MOCK_COUPONS_DATA[0];

    const updated: Coupon = {
      ...existing,
      status,
    };

    return apiClient.patch<Coupon>(
      `/admin/coupons/${encodeURIComponent(couponId)}/status`,
      { status },
      {},
      updated
    );
  },
};
