import { apiClient } from "./api-client";
import {
  DashboardSummary,
  DashboardKPIs,
  RevenueHourlyPoint,
  TopProductMetric,
  ActivityLogItem,
} from "@/types";
import { MOCK_DASHBOARD_SUMMARY_DATA } from "@/data";

export const dashboardService = {
  /**
   * Get full dashboard summary including KPIs, hourly trends, top products, and recent orders
   */
  async getDashboardSummary(date?: string): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>(
      "/admin/dashboard/summary",
      { params: { date } },
      MOCK_DASHBOARD_SUMMARY_DATA
    );
  },

  /**
   * Get dashboard KPI metrics cards
   */
  async getKPIs(date?: string): Promise<DashboardKPIs> {
    return apiClient.get<DashboardKPIs>(
      "/admin/dashboard/kpis",
      { params: { date } },
      MOCK_DASHBOARD_SUMMARY_DATA.kpis
    );
  },

  /**
   * Get hourly sales & revenue performance
   */
  async getHourlyTrends(date?: string): Promise<RevenueHourlyPoint[]> {
    return apiClient.get<RevenueHourlyPoint[]>(
      "/admin/dashboard/hourly-trends",
      { params: { date } },
      MOCK_DASHBOARD_SUMMARY_DATA.hourlyTrends
    );
  },

  /**
   * Get best-selling vegetables & produce items
   */
  async getTopSellingProducts(limit: number = 5): Promise<TopProductMetric[]> {
    return apiClient.get<TopProductMetric[]>(
      "/admin/dashboard/top-products",
      { params: { limit } },
      MOCK_DASHBOARD_SUMMARY_DATA.topProducts.slice(0, limit)
    );
  },

  /**
   * Get recent store operational activity logs
   */
  async getRecentActivities(limit: number = 10): Promise<ActivityLogItem[]> {
    return apiClient.get<ActivityLogItem[]>(
      "/admin/dashboard/activities",
      { params: { limit } },
      MOCK_DASHBOARD_SUMMARY_DATA.recentActivities.slice(0, limit)
    );
  },
};
