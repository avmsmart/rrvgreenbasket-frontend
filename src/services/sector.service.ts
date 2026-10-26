import { apiClient } from "./api-client";
import { Sector } from "@/types";
import { MOCK_SECTORS_DATA } from "@/data";

export const sectorService = {
  /**
   * Fetch city delivery sectors and pincode coverage
   */
  async getSectors(): Promise<Sector[]> {
    return apiClient.get<Sector[]>(
      "/admin/sectors",
      {},
      MOCK_SECTORS_DATA
    );
  },

  /**
   * Update delivery parameters for a sector
   */
  async updateSector(sectorId: string, updates: Partial<Sector>): Promise<Sector> {
    const existing =
      MOCK_SECTORS_DATA.find((s) => s.id === sectorId) || MOCK_SECTORS_DATA[0];

    const updated: Sector = {
      ...existing,
      ...updates,
      id: sectorId,
    };

    return apiClient.put<Sector>(
      `/admin/sectors/${encodeURIComponent(sectorId)}`,
      updates,
      {},
      updated
    );
  },
};
