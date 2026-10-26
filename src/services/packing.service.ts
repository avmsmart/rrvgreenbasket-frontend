import { apiClient } from "./api-client";
import { PackingOrder } from "@/types";
import { MOCK_PACKING_ORDERS_DATA } from "@/data";

export const packingService = {
  /**
   * Fetch current packing queue
   */
  async getPackingQueue(date?: string): Promise<PackingOrder[]> {
    return apiClient.get<PackingOrder[]>(
      "/admin/packing/queue",
      { params: { date } },
      MOCK_PACKING_ORDERS_DATA
    );
  },

  /**
   * Toggle packed checkbox for individual item in an order
   */
  async toggleItemPacked(
    orderId: string,
    itemId: string,
    isPacked: boolean
  ): Promise<PackingOrder> {
    const order =
      MOCK_PACKING_ORDERS_DATA.find((o) => o.orderId === orderId) ||
      MOCK_PACKING_ORDERS_DATA[0];

    const updatedItems = order.items.map((it) =>
      it.itemId === itemId ? { ...it, isPacked, packedQty: isPacked ? it.orderedQty : 0 } : it
    );

    const allPacked = updatedItems.every((it) => it.isPacked);
    const updatedOrder: PackingOrder = {
      ...order,
      items: updatedItems,
      status: allPacked ? "Packed" : "Packing",
    };

    return apiClient.patch<PackingOrder>(
      `/admin/packing/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}`,
      { isPacked },
      {},
      updatedOrder
    );
  },

  /**
   * Complete entire order packing and move to dispatch ready
   */
  async completeOrderPacking(orderId: string): Promise<PackingOrder> {
    const order =
      MOCK_PACKING_ORDERS_DATA.find((o) => o.orderId === orderId) ||
      MOCK_PACKING_ORDERS_DATA[0];

    const completed: PackingOrder = {
      ...order,
      status: "Packed",
      items: order.items.map((it) => ({ ...it, isPacked: true, packedQty: it.orderedQty })),
    };

    return apiClient.post<PackingOrder>(
      `/admin/packing/${encodeURIComponent(orderId)}/complete`,
      {},
      {},
      completed
    );
  },
};
