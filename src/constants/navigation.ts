export interface NavItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  badge?: string;
  hasSubmenu?: boolean;
}

/**
 * Admin Sidebar Navigation Items matching exact UI/UX Reference Screenshot
 */
export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    iconName: "Home",
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    iconName: "Box",
  },
  {
    id: "inventory",
    label: "Inventory",
    path: "/admin/inventory",
    iconName: "Package",
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    iconName: "ShoppingCart",
  },
  {
    id: "procurement",
    label: "Procurement",
    path: "/admin/procurement",
    iconName: "ShoppingBasket",
  },
  {
    id: "packing",
    label: "Packing",
    path: "/admin/packing",
    iconName: "PackageCheck",
  },
  {
    id: "delivery",
    label: "Delivery",
    path: "/admin/delivery",
    iconName: "Truck",
  },
  {
    id: "customers",
    label: "Customers",
    path: "/admin/customers",
    iconName: "UserCheck",
  },
  {
    id: "delivery-partners",
    label: "Delivery Partners",
    path: "/admin/delivery-partners",
    iconName: "Share2",
  },
  {
    id: "payments",
    label: "Payments",
    path: "/admin/payments",
    iconName: "CreditCard",
  },
  {
    id: "coupons",
    label: "Coupons & Offers",
    path: "/admin/coupons",
    iconName: "Ticket",
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    path: "/admin/reports",
    iconName: "BarChart3",
  },
  {
    id: "sectors",
    label: "Sectors",
    path: "/admin/sectors",
    iconName: "Layers",
  },
  {
    id: "settings",
    label: "Settings",
    path: "/admin/settings",
    iconName: "Settings",
  },
];
