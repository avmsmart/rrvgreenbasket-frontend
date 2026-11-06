import { Order } from "./order";

export interface DashboardKPIs {
  todayOrders: {
    value: number;
    changeText: string;
    isPositive: boolean;
  };
  todayRevenue: {
    value: number;
    changeText: string;
    isPositive: boolean;
  };
  pendingPacking: {
    value: number;
    alertText: string;
  };
  activeDeliveries: {
    value: number;
    partnerCount: number;
  };
  lowStockItems: {
    value: number;
    urgentCount: number;
  };
}

export interface RevenueHourlyPoint {
  time: string; // e.g. "06 AM", "08 AM", "10 AM", etc.
  revenue: number;
  orders: number;
}

export interface TopProductMetric {
  id: string;
  name: string;
  category: string;
  soldQuantity: number;
  unit: string;
  revenue: number;
  stockLeft: number;
  trend: "up" | "down" | "neutral";
}

export interface ActivityLogItem {
  id: string;
  type: "order" | "stock" | "delivery" | "payment" | "alert";
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
}

export interface DashboardSummary {
  kpis: DashboardKPIs;
  hourlyTrends: RevenueHourlyPoint[];
  topProducts: TopProductMetric[];
  recentActivities: ActivityLogItem[];
  recentOrders: Order[];
}
