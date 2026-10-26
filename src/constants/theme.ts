/**
 * Brand Design Tokens & Theme Constants for RRV Green Basket
 * Extracted directly from UI/UX Design Reference PDF & Screenshot
 */

export const BRAND_COLORS = {
  primary: {
    DEFAULT: "#00875a", // Primary Green used across UI/UX reference
    hover: "#00734d",   // Darker green for hover states
    active: "#005c3e",  // Active button state
    light: "#eaf8f0",   // Soft mint green background for active navigation items
    subtle: "#f0fdf4",  // Section / card tint
  },
  accent: {
    green: "#00875a",
    teal: "#0d9488",
    amber: "#f59e0b",
    blue: "#3b82f6",
    red: "#ef4444",
    purple: "#8b5cf6",
  },
  neutral: {
    background: "#f8fafc",    // Canvas background
    card: "#ffffff",          // Surface / Card background
    border: "#e2e8f0",        // Subdued borders
    textNavy: "#0f2942",      // Brand dark navy for headings & bold text
    textPrimary: "#1e293b",   // Main sidebar & content typography
    textSecondary: "#64748b", // Muted slate typography
    textMuted: "#94a3b8",     // Faint chevrons & placeholders
  },
} as const;

export const STATUS_BADGE_STYLES = {
  // Order & Payment Statuses
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  inStock: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  
  // In-progress / Transition Statuses
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  outForDelivery: "bg-blue-100 text-blue-700 border-blue-200",
  inPacking: "bg-blue-100 text-blue-700 border-blue-200",
  
  // Pending / Alert Statuses
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  lowStock: "bg-amber-100 text-amber-700 border-amber-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  scheduled: "bg-amber-100 text-amber-700 border-amber-200",

  // Danger / Inactive Statuses
  cancelled: "bg-red-100 text-red-700 border-red-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  outOfStock: "bg-red-100 text-red-700 border-red-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
  refunded: "bg-purple-100 text-purple-700 border-purple-200",
} as const;
