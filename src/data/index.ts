/**
 * Central Data Repository
 *
 * Mock datasets matching the UI/UX Design Reference PDF screens and fallback for offline backend
 */

export * from "./mock-backend-data";
export * from "./procurement-data";

export const MOCK_ADMIN_USER = {
  name: "Admin",
  role: "Super Admin",
  avatarInitial: "A",
  email: "admin@rrvgreenbasket.com",
  phone: "+91 98765 43210",
  location: "Kurnool, Andhra Pradesh, India",
  storeName: "RRV Green Basket",
  operatingHours: "06:00 AM – 10:00 PM",
  orderCutoff: "10:00 PM",
  status: "Active (Accepting Orders)",
  permissions: ["All Modules Access", "Order Management", "Inventory Control", "Financial Reports"],
};
