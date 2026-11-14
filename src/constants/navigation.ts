export interface NavItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  badge?: string;
  hasSubmenu?: boolean;
}

/**
 * Admin Sidebar Navigation Items
 * Order: Dashboard -> Products -> Inventory -> Orders -> Customers -> Category Management -> Reviews ... -> Settings
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
    id: "delivery",
    label: "Delivery Management",
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
    id: "categories",
    label: "Category Management",
    path: "/admin/categories",
    iconName: "FolderTree",
  },
  {
    id: "reviews",
    label: "Reviews",
    path: "/admin/reviews",
    iconName: "Star",
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
    id: "settings",
    label: "Settings",
    path: "/admin/settings",
    iconName: "Settings",
  },
];
