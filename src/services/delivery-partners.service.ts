import { apiClient } from "./api-client";
import {
  DeliveryPartner,
  DeliveryPartnersSummary,
  AreaDeliveryStat,
} from "@/types";
import {
  MOCK_DELIVERY_PARTNERS_PAGE19,
  MOCK_PARTNERS_SUMMARY_PAGE19,
  MOCK_AREA_DELIVERY_STATS,
} from "@/data";

let partnersCache: DeliveryPartner[] = [...MOCK_DELIVERY_PARTNERS_PAGE19];

export const deliveryPartnersService = {
  /**
   * Fetch delivery partner list with search, filter tabs, areas, and sorting
   */
  async getDeliveryPartners(params?: {
    search?: string;
    status?: string;
    area?: string;
    sortBy?: string;
    tab?: string;
  }): Promise<DeliveryPartner[]> {
    let list = [...partnersCache];

    if (params) {
      if (params.search && params.search.trim()) {
        const query = params.search.toLowerCase().trim();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.phone.toLowerCase().includes(query) ||
            p.area.toLowerCase().includes(query) ||
            (p.vehicleDetails && p.vehicleDetails.toLowerCase().includes(query))
        );
      }

      if (params.tab && params.tab !== "All Partners") {
        list = list.filter(
          (p) => p.status.toLowerCase() === params.tab!.toLowerCase()
        );
      }

      if (params.status && params.status !== "All Status") {
        list = list.filter(
          (p) => p.status.toLowerCase() === params.status!.toLowerCase()
        );
      }

      if (params.area && params.area !== "All Areas") {
        list = list.filter((p) =>
          p.area.toLowerCase().includes(params.area!.toLowerCase())
        );
      }

      if (params.sortBy) {
        if (params.sortBy.includes("Rating")) {
          list.sort((a, b) => b.rating - a.rating);
        } else if (params.sortBy.includes("Total Deliveries")) {
          list.sort((a, b) => b.totalDeliveries - a.totalDeliveries);
        } else if (params.sortBy.includes("Name")) {
          list.sort((a, b) => a.name.localeCompare(b.name));
        }
      }
    }

    return apiClient.get<DeliveryPartner[]>(
      "/admin/delivery-partners/manage",
      { params },
      list
    );
  },

  /**
   * Fetch summary KPIs
   */
  async getPartnersSummary(): Promise<DeliveryPartnersSummary> {
    const totalPartners = partnersCache.length;
    const activePartners = partnersCache.filter((p) => p.status === "Active" || p.status === "On Delivery").length;
    const onDelivery = partnersCache.filter((p) => p.status === "On Delivery").length;
    const idlePartners = partnersCache.filter((p) => p.status === "Idle").length;
    const inactivePartners = partnersCache.filter((p) => p.status === "Inactive").length;

    return apiClient.get<DeliveryPartnersSummary>(
      "/admin/delivery-partners/summary",
      {},
      {
        totalPartners,
        activePartners,
        onDelivery,
        idlePartners,
        inactivePartners,
      }
    );
  },

  /**
   * Fetch area delivery statistics
   */
  async getAreaDeliveryStats(): Promise<AreaDeliveryStat[]> {
    return apiClient.get<AreaDeliveryStat[]>(
      "/admin/delivery-partners/area-stats",
      {},
      MOCK_AREA_DELIVERY_STATS
    );
  },

  /**
   * Add new delivery partner
   */
  async addPartner(
    partner: Omit<DeliveryPartner, "id" | "totalDeliveries" | "rating">
  ): Promise<DeliveryPartner> {
    const newId = "DP-" + String(Date.now()).slice(-4);
    const created: DeliveryPartner = {
      ...partner,
      id: newId,
      totalDeliveries: 0,
      rating: 5.0,
      avatar: partner.name.charAt(0).toUpperCase(),
      joinedDate: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      monthlyDeliveries: 0,
      onTimeDeliveries: 0,
      onTimeRate: "100%",
      monthlyEarnings: 0,
    };

    partnersCache = [created, ...partnersCache];

    return apiClient.post<DeliveryPartner>(
      "/admin/delivery-partners/manage",
      partner,
      {},
      created
    );
  },

  /**
   * Update partner details
   */
  async updatePartner(
    id: string,
    updates: Partial<DeliveryPartner>
  ): Promise<DeliveryPartner> {
    const index = partnersCache.findIndex((p) => p.id === id);
    if (index !== -1) {
      const updated = { ...partnersCache[index], ...updates };
      partnersCache[index] = updated;

      return apiClient.patch<DeliveryPartner>(
        `/admin/delivery-partners/manage/${encodeURIComponent(id)}`,
        updates,
        {},
        updated
      );
    }
    throw new Error(`Partner ${id} not found`);
  },

  /**
   * Update partner availability
   */
  async updateStatus(
    id: string,
    status: DeliveryPartner["status"]
  ): Promise<DeliveryPartner> {
    const index = partnersCache.findIndex((p) => p.id === id);
    if (index !== -1) {
      const updated = { ...partnersCache[index], status };
      partnersCache[index] = updated;

      return apiClient.patch<DeliveryPartner>(
        `/admin/delivery-partners/manage/${encodeURIComponent(id)}/status`,
        { status },
        {},
        updated
      );
    }
    throw new Error(`Partner ${id} not found`);
  },
};
