"use client";

import { Coupon, CouponActivity } from "@/types/coupon";
import { Sector } from "@/types/sector";
import { StoreSettings } from "@/types/settings";

/* =========================================================================
   1. COUPONS INITIAL REFERENCE DATA (PDF PAGE 11)
   ========================================================================= */
export const INITIAL_COUPONS_DATA: Coupon[] = [
  {
    id: "CPN-01",
    code: "WELCOME10",
    offerName: "Welcome Offer",
    discount: "10% OFF",
    discountType: "percentage",
    discountValue: 10,
    minOrder: 199,
    usage: "245 / 500",
    currentUsage: 245,
    maxUsage: 500,
    totalSaved: 3920,
    validTill: "30 Aug 2025",
    status: "Active",
    description: "Flat 10% discount on first order above ₹199",
  },
  {
    id: "CPN-02",
    code: "FRESH20",
    offerName: "Fresh Fruits Special",
    discount: "20% OFF",
    discountType: "percentage",
    discountValue: 20,
    minOrder: 299,
    usage: "180 / 300",
    currentUsage: 180,
    maxUsage: 300,
    totalSaved: 5400,
    validTill: "28 Aug 2025",
    status: "Active",
    description: "20% instant discount on all seasonal fresh fruits",
  },
  {
    id: "CPN-03",
    code: "VEG15",
    offerName: "Vegetables Discount",
    discount: "15% OFF",
    discountType: "percentage",
    discountValue: 15,
    minOrder: 199,
    usage: "320 / 1000",
    currentUsage: 320,
    maxUsage: 1000,
    totalSaved: 4800,
    validTill: "31 Aug 2025",
    status: "Active",
    description: "15% discount on daily kitchen green vegetables",
  },
  {
    id: "CPN-04",
    code: "PAYTM50",
    offerName: "Paytm Cashback",
    discount: "₹50 OFF",
    discountType: "fixed",
    discountValue: 50,
    minOrder: 299,
    usage: "94 / 200",
    currentUsage: 94,
    maxUsage: 200,
    totalSaved: 4700,
    validTill: "26 Aug 2025",
    status: "Active",
    description: "Flat ₹50 cashback when paying with Paytm UPI",
  },
  {
    id: "CPN-05",
    code: "FREESHIP",
    offerName: "Free Delivery",
    discount: "Free Shipping",
    discountType: "free_shipping",
    discountValue: 25,
    minOrder: 499,
    usage: "512 / 1000",
    currentUsage: 512,
    maxUsage: 1000,
    totalSaved: 10240,
    validTill: "30 Aug 2025",
    status: "Active",
    description: "Zero delivery fees on orders above ₹499",
  },
  {
    id: "CPN-06",
    code: "MONDAY15",
    offerName: "Monday Special",
    discount: "15% OFF",
    discountType: "percentage",
    discountValue: 15,
    minOrder: 199,
    usage: "88 / 500",
    currentUsage: 88,
    maxUsage: 500,
    totalSaved: 1320,
    validTill: "25 Aug 2025",
    status: "Inactive",
    description: "Monday morning produce restock savings",
  },
  {
    id: "CPN-07",
    code: "COMBO30",
    offerName: "Combo Offer",
    discount: "30% OFF",
    discountType: "percentage",
    discountValue: 30,
    minOrder: 599,
    usage: "156 / 300",
    currentUsage: 156,
    maxUsage: 300,
    totalSaved: 4680,
    validTill: "29 Aug 2025",
    status: "Active",
    description: "Super family vegetable and fruit combo basket savings",
  },
  {
    id: "CPN-08",
    code: "FIRSTORDER",
    offerName: "First Order",
    discount: "₹100 OFF",
    discountType: "fixed",
    discountValue: 100,
    minOrder: 299,
    usage: "420 / 500",
    currentUsage: 420,
    maxUsage: 500,
    totalSaved: 42000,
    validTill: "27 Aug 2025",
    status: "Scheduled",
    description: "Introductory promotional reward for new verified mobile users",
  },
  {
    id: "CPN-09",
    code: "LOYALTY10",
    offerName: "Loyalty Offer",
    discount: "10% OFF",
    discountType: "percentage",
    discountValue: 10,
    minOrder: 199,
    usage: "62 / 1000",
    currentUsage: 62,
    maxUsage: 1000,
    totalSaved: 1240,
    validTill: "05 Sep 2025",
    status: "Active",
    description: "Exclusive reward for customers with more than 10 completed orders",
  },
  {
    id: "CPN-10",
    code: "FESTIVE25",
    offerName: "Festive Special",
    discount: "25% OFF",
    discountType: "percentage",
    discountValue: 25,
    minOrder: 499,
    usage: "200 / 500",
    currentUsage: 200,
    maxUsage: 500,
    totalSaved: 6250,
    validTill: "10 Sep 2025",
    status: "Scheduled",
    description: "Festival season discount on bulk festive items and sweets",
  },
];

export const INITIAL_COUPON_ACTIVITIES: CouponActivity[] = [
  {
    id: "ACT-01",
    customerName: "Priya S",
    couponCode: "VEG15",
    savingsText: "Saved ₹42 on order #ORD001234",
    orderId: "#ORD001234",
    timestamp: "25 Aug 09:15 AM",
  },
  {
    id: "ACT-02",
    customerName: "Arun K",
    couponCode: "WELCOME10",
    savingsText: "Saved ₹32 on order #ORD001233",
    orderId: "#ORD001233",
    timestamp: "25 Aug 08:40 AM",
  },
  {
    id: "ACT-03",
    customerName: "Meena R",
    couponCode: "FREESHIP",
    savingsText: "Free delivery on order #ORD001232",
    orderId: "#ORD001232",
    timestamp: "25 Aug 08:20 AM",
  },
  {
    id: "ACT-04",
    customerName: "Karthik V",
    couponCode: "FRESH20",
    savingsText: "Saved ₹68 on order #ORD001231",
    orderId: "#ORD001231",
    timestamp: "25 Aug 07:55 AM",
  },
  {
    id: "ACT-05",
    customerName: "Sneha M",
    couponCode: "PAYTM50",
    savingsText: "Saved ₹50 on order #ORD001230",
    orderId: "#ORD001230",
    timestamp: "25 Aug 07:30 AM",
  },
];

/* =========================================================================
   2. SECTORS INITIAL REFERENCE DATA (PDF PAGE 13)
   ========================================================================= */
export const INITIAL_SECTORS_DATA: Sector[] = [
  {
    id: "SEC-01",
    name: "Fresh Vegetables",
    description: "Farm fresh seasonal vegetables",
    icon: "🥦",
    productsCount: 86,
    status: "Active",
    isFeatured: true,
    displayOrder: 1,
    totalOrders: 120,
    revenue: 48250,
  },
  {
    id: "SEC-02",
    name: "Fresh Fruits",
    description: "Fresh and juicy seasonal fruits",
    icon: "🍎",
    productsCount: 64,
    status: "Active",
    isFeatured: true,
    displayOrder: 2,
    totalOrders: 98,
    revenue: 36480,
  },
  {
    id: "SEC-03",
    name: "Groceries",
    description: "Daily essentials and groceries",
    icon: "🌾",
    productsCount: 38,
    status: "Active",
    isFeatured: false,
    displayOrder: 3,
    totalOrders: 56,
    revenue: 18670,
  },
  {
    id: "SEC-04",
    name: "Dairy Products",
    description: "Milk, curd, paneer and more",
    icon: "🥛",
    productsCount: 22,
    status: "Active",
    isFeatured: false,
    displayOrder: 4,
    totalOrders: 38,
    revenue: 12420,
  },
  {
    id: "SEC-05",
    name: "Snacks & Foods",
    description: "Healthy snacks and ready foods",
    icon: "🍪",
    productsCount: 18,
    status: "Active",
    isFeatured: true,
    displayOrder: 5,
    totalOrders: 28,
    revenue: 8540,
  },
  {
    id: "SEC-06",
    name: "Beverages",
    description: "Juices, drinks and refreshments",
    icon: "🧃",
    productsCount: 12,
    status: "Active",
    isFeatured: false,
    displayOrder: 6,
    totalOrders: 18,
    revenue: 5400,
  },
  {
    id: "SEC-07",
    name: "Organic Products",
    description: "Chemical-free organic items",
    icon: "🌿",
    productsCount: 6,
    status: "Active",
    isFeatured: false,
    displayOrder: 7,
    totalOrders: 12,
    revenue: 3200,
  },
  {
    id: "SEC-08",
    name: "Household Items",
    description: "Cleaning and home essentials",
    icon: "🧼",
    productsCount: 2,
    status: "Active",
    isFeatured: false,
    displayOrder: 8,
    totalOrders: 6,
    revenue: 1100,
  },
];

/* =========================================================================
   3. STORE SETTINGS INITIAL REFERENCE DATA (PDF PAGE 14)
   ========================================================================= */
export const INITIAL_SETTINGS_DATA: StoreSettings = {
  storeName: "RRV Green Basket",
  tagline: "Freshness Delivered Daily",
  supportEmail: "rrvgreenbasket@gmail.com",
  supportPhone: "+91 98765 43210",
  address: "Kurnool, Andhra Pradesh, India",
  websiteUrl: "https://www.rrvgreenbasket.in",
  platformLogo: "",
  appFavicon: "/favicon.ico",

  businessHours: [
    { id: "BH-1", day: "Monday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
    { id: "BH-2", day: "Tuesday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
    { id: "BH-3", day: "Wednesday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
    { id: "BH-4", day: "Thursday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
    { id: "BH-5", day: "Friday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
    { id: "BH-6", day: "Saturday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
    { id: "BH-7", day: "Sunday", openTime: "07:00 AM", closeTime: "09:00 PM", isOpen: true },
  ],
  timeZone: "(GMT+05:30) India Standard Time (IST)",

  currency: "INR (₹) - Indian Rupee",
  language: "English",
  dateFormat: "DD/MM/YYYY",
  currencies: [
    { id: "CUR-01", name: "Indian Rupee", code: "INR", symbol: "₹", rate: 1.0, isDefault: true },
    { id: "CUR-02", name: "US Dollar", code: "USD", symbol: "$", rate: 86.50, isDefault: false },
    { id: "CUR-03", name: "Euro", code: "EUR", symbol: "€", rate: 92.20, isDefault: false },
    { id: "CUR-04", name: "UAE Dirham", code: "AED", symbol: "د.إ", rate: 23.50, isDefault: false },
  ],
  regionalZones: [
    { id: "REG-01", name: "Telangana & AP Hub", code: "TS-AP-01", language: "Telugu / English", dateFormat: "DD/MM/YYYY", status: "Active" },
    { id: "REG-02", name: "Karnataka Urban Hub", code: "KA-BLR-01", language: "Kannada / English", dateFormat: "DD/MM/YYYY", status: "Active" },
    { id: "REG-03", name: "Maharashtra Metro Hub", code: "MH-MUM-01", language: "Marathi / Hindi", dateFormat: "DD/MM/YYYY", status: "Active" },
    { id: "REG-04", name: "Pan-India Dispatch", code: "IN-ALL-01", language: "English / Hindi", dateFormat: "DD/MM/YYYY", status: "Active" },
  ],

  allowCod: true,
  minimumOrderAmount: 199,
  enableScheduledDelivery: true,
  allowCustomerCancellation: true,
  autoAssignDeliveryPartner: true,
  orderCutoffTime: "22:00",

  lowStockAlertEnabled: true,
  lowStockThreshold: 10,
  autoUpdateStockAfterOrder: true,
  allowOutOfStockPurchase: false,

  operatingHours: {
    opensAt: "06:00 AM",
    closesAt: "10:00 PM",
  },
  deliverySlots: [
    "06:30 AM – 08:30 AM",
    "08:30 AM – 10:30 AM",
    "05:00 PM – 07:00 PM",
  ],
  freeDeliveryThreshold: 299,
  standardDeliveryFee: 20,
  taxPercentage: 0,
  acceptingOrders: true,
  mandiProcurementAutoCalculate: true,
};

/* =========================================================================
   4. REACTIVE LOCAL STORAGE REPOSITORY WITH CROSS-PAGE SYNC
   ========================================================================= */
const KEYS = {
  COUPONS: "rrv_store_coupons_v1",
  SECTORS: "rrv_store_sectors_v1",
  SETTINGS: "rrv_store_settings_v1",
  COUPON_ACTIVITIES: "rrv_store_coupon_acts_v1",
};

// Safe localStorage helper
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, data: T, eventName: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  } catch (err) {
    console.error(`Failed to persist ${key}`, err);
  }
}

// Coupons
export function getSavedCoupons(): Coupon[] {
  return safeGet<Coupon[]>(KEYS.COUPONS, INITIAL_COUPONS_DATA);
}

export function saveCoupons(coupons: Coupon[]): void {
  safeSet(KEYS.COUPONS, coupons, "rrv:coupons:updated");
}

export function getSavedCouponActivities(): CouponActivity[] {
  return safeGet<CouponActivity[]>(KEYS.COUPON_ACTIVITIES, INITIAL_COUPON_ACTIVITIES);
}

export function recordCouponRedemption(
  code: string,
  discount: number,
  orderId: string,
  customerName: string
): void {
  const coupons = getSavedCoupons();
  const updatedCoupons = coupons.map((c) => {
    if (c.code.toUpperCase() === code.toUpperCase()) {
      return {
        ...c,
        currentUsage: (c.currentUsage || 0) + 1,
        totalSaved: (c.totalSaved || 0) + discount,
      };
    }
    return c;
  });
  saveCoupons(updatedCoupons);

  const activities = getSavedCouponActivities();
  const newActivity: CouponActivity = {
    id: `ACT-${Date.now()}`,
    customerName: customerName || "Customer",
    couponCode: code.toUpperCase(),
    savingsText: `Saved ₹${Math.round(discount)} on order ${orderId}`,
    orderId,
    timestamp: "Just now",
  };
  safeSet(KEYS.COUPON_ACTIVITIES, [newActivity, ...activities], "rrv:coupons:updated");
}

// Sectors
export function getSavedSectors(): Sector[] {
  return safeGet<Sector[]>(KEYS.SECTORS, INITIAL_SECTORS_DATA);
}

export function saveSectors(sectors: Sector[]): void {
  safeSet(KEYS.SECTORS, sectors, "rrv:sectors:updated");
}

// Settings
export function getSavedSettings(): StoreSettings {
  return safeGet<StoreSettings>(KEYS.SETTINGS, INITIAL_SETTINGS_DATA);
}

export function saveSettings(settings: StoreSettings): void {
  safeSet(KEYS.SETTINGS, settings, "rrv:settings:updated");
}

export function getCurrencySymbol(): string {
  const s = getSavedSettings();
  if (s.currency) {
    if (s.currency.includes("$")) return "$";
    if (s.currency.includes("€")) return "€";
    if (s.currency.includes("£")) return "£";
    if (s.currency.includes("AED") || s.currency.includes("د.إ")) return "AED ";
    if (s.currency.includes("₹")) return "₹";
    const m = s.currency.match(/\((.*?)\)/);
    if (m && m[1]) return m[1];
  }
  return "₹";
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  const sym = getCurrencySymbol();
  return `${sym} ${num.toLocaleString("en-IN")}`;
}
