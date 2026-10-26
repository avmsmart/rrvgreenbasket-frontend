export interface PaginationParams {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface MetricCardData {
  id: string;
  label: string;
  value: string | number;
  changeText?: string;
  isPositiveChange?: boolean;
  alertText?: string;
  icon?: string;
  themeColor?: "green" | "blue" | "amber" | "red" | "purple";
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface StatusTabItem {
  id: string;
  label: string;
  count: number;
}

/**
 * Standard generic response envelope returned by backend APIs
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
  errorCode?: string;
}

/**
 * Standard paginated list response envelope
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Backend service health check status
 */
export interface BackendHealthStatus {
  online: boolean;
  service: string;
  status: "UP" | "DOWN";
  version?: string;
  timestamp: string;
  environment?: string;
}
