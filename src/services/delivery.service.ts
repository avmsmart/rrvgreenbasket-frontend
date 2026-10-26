import { apiClient } from "./api-client";
import { DeliveryPartner } from "@/types";
import { MOCK_DELIVERY_PARTNERS_DATA } from "@/data";

export const deliveryService = {
  /**
   * Fetch list of delivery partners
   */
  async getDeliveryPartners(status?: string): Promise<DeliveryPartner[]> {
    let fallback = [...MOCK_DELIVERY_PARTNERS_DATA];
    if (status && status !== "All") {
      fallback = fallback.filter((p) => p.status === status);
    }

    return apiClient.get<DeliveryPartner[]>(
      "/admin/delivery-partners",
      { params: { status: status === "All" ? undefined : status } },
      fallback
    );
  },

  /**
   * Add a new delivery rider
   */
  async registerDeliveryPartner(
    partner: Omit<DeliveryPartner, "id" | "totalDeliveries" | "rating">
  ): Promise<DeliveryPartner> {
    const created: DeliveryPartner = {
      ...partner,
      id: "DP-" + String(Date.now()).slice(-4),
      totalDeliveries: 0,
      rating: 5.0,
    };

    return apiClient.post<DeliveryPartner>(
      "/admin/delivery-partners",
      partner,
      {},
      created
    );
  },

  /**
   * Update partner availability status
   */
  async updatePartnerStatus(
    partnerId: string,
    status: DeliveryPartner["status"]
  ): Promise<DeliveryPartner> {
    const existing =
      MOCK_DELIVERY_PARTNERS_DATA.find((p) => p.id === partnerId) ||
      MOCK_DELIVERY_PARTNERS_DATA[0];

    const updated: DeliveryPartner = {
      ...existing,
      status,
    };

    return apiClient.patch<DeliveryPartner>(
      `/admin/delivery-partners/${encodeURIComponent(partnerId)}/status`,
      { status },
      {},
      updated
    );
  },
};
