/**
 * Mock data and localStorage persistence helpers for the Customer Profile module.
 * Separated cleanly from backend authentication APIs.
 */

export interface CustomerOrderItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  image: string;
}

export interface CustomerOrderTrackingEvent {
  title: string;
  time: string;
  done: boolean;
}

export interface CustomerOrder {
  id: string;
  date: string;
  total: number;
  status: "DELIVERED" | "IN_TRANSIT" | "PROCESSING" | "CANCELLED";
  paymentStatus: "PAID" | "PENDING" | "COD";
  paymentMethod: string;
  deliveryAddress: string;
  deliverySlot: string;
  items: CustomerOrderItem[];
  trackingEvents: CustomerOrderTrackingEvent[];
}

export interface CustomerAddress {
  id: string;
  fullName: string;
  phone: string;
  flatHouse: string;
  streetArea: string;
  landmark?: string;
  city: string;
  state: string;
  pin: string;
  type: "HOME" | "WORK" | "OTHER";
  isDefault: boolean;
}

export interface CustomerWishlistItem {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  inStock: boolean;
  badge?: string;
}

export interface CustomerSettings {
  deliverySlot: string;
  language: string;
  zeroPlastic: boolean;
  whatsappNotifications: boolean;
  smsUpdates: boolean;
  emailPromotions: boolean;
}

export interface CustomerFaq {
  category: "Orders & Delivery" | "Quality & Freshness" | "Payments & Refunds" | "Account & Sustainability";
  question: string;
  answer: string;
}

export const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: "RRV-ORD-89421",
    date: "Oct 28, 2026",
    total: 312,
    status: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "UPI (Google Pay)",
    deliveryAddress: "Flat 402, Green Meadows, MG Road, Bengaluru - 560001",
    deliverySlot: "Early Morning (6:00 AM - 8:00 AM)",
    items: [
      {
        id: 5,
        name: "Red Tomatoes",
        quantity: 2,
        unit: "kg",
        price: 36,
        image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: 9,
        name: "Fresh Spinach",
        quantity: 2,
        unit: "bunch",
        price: 20,
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: 1,
        name: "Fresh Apples",
        quantity: 1,
        unit: "kg",
        price: 120,
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: 19,
        name: "Fresh Paneer",
        quantity: 1,
        unit: "200 g",
        price: 90,
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=300&q=80",
      },
    ],
    trackingEvents: [
      { title: "Order Confirmed", time: "Oct 27, 8:30 PM", done: true },
      { title: "Packed at Farm Hub", time: "Oct 28, 4:45 AM", done: true },
      { title: "Out for Delivery with Partner", time: "Oct 28, 6:15 AM", done: true },
      { title: "Delivered to Doorstep", time: "Oct 28, 7:10 AM", done: true },
    ],
  },
  {
    id: "RRV-ORD-88210",
    date: "Oct 30, 2026",
    total: 260,
    status: "IN_TRANSIT",
    paymentStatus: "PAID",
    paymentMethod: "UPI (PhonePe)",
    deliveryAddress: "Flat 402, Green Meadows, MG Road, Bengaluru - 560001",
    deliverySlot: "Morning (8:00 AM - 11:00 AM)",
    items: [
      {
        id: 6,
        name: "Fresh Onions",
        quantity: 2,
        unit: "kg",
        price: 28,
        image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: 7,
        name: "Carrots",
        quantity: 1,
        unit: "kg",
        price: 40,
        image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: 18,
        name: "Fresh Cow Milk",
        quantity: 2,
        unit: "500 ml",
        price: 32,
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: 26,
        name: "Green Tea",
        quantity: 1,
        unit: "pack",
        price: 110,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=300&q=80",
      },
    ],
    trackingEvents: [
      { title: "Order Confirmed", time: "Oct 29, 9:15 PM", done: true },
      { title: "Harvested & Packaged", time: "Oct 30, 5:00 AM", done: true },
      { title: "Dispatched with Driver (Suresh M.)", time: "Oct 30, 7:45 AM", done: true },
      { title: "Arriving Soon", time: "Estimated 9:15 AM", done: false },
    ],
  },
  {
    id: "RRV-ORD-87153",
    date: "Oct 19, 2026",
    total: 185,
    status: "DELIVERED",
    paymentStatus: "COD",
    paymentMethod: "Cash on Delivery",
    deliveryAddress: "Flat 402, Green Meadows, MG Road, Bengaluru - 560001",
    deliverySlot: "Evening (5:00 PM - 8:00 PM)",
    items: [
      {
        id: 8,
        name: "Fresh Cucumber",
        quantity: 1,
        unit: "kg",
        price: 25,
        image: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: 11,
        name: "Fresh Coriander",
        quantity: 2,
        unit: "bunch",
        price: 15,
        image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: 14,
        name: "Organic Tomatoes",
        quantity: 2,
        unit: "kg",
        price: 50,
        image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: 20,
        name: "Farm Butter",
        quantity: 1,
        unit: "100 g",
        price: 55,
        image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=300&q=80",
      },
    ],
    trackingEvents: [
      { title: "Order Confirmed", time: "Oct 19, 11:00 AM", done: true },
      { title: "Packed at Farm Hub", time: "Oct 19, 2:30 PM", done: true },
      { title: "Out for Delivery", time: "Oct 19, 5:10 PM", done: true },
      { title: "Delivered & Payment Received", time: "Oct 19, 6:40 PM", done: true },
    ],
  },
];

export const INITIAL_ADDRESSES: CustomerAddress[] = [
  {
    id: "addr-1",
    fullName: "Mahendra Kumar",
    phone: "+91 98765 00001",
    flatHouse: "Flat 402, Green Meadows",
    streetArea: "MG Road, Indiranagar",
    landmark: "Opposite Metro Pillar 124",
    city: "Bengaluru",
    state: "Karnataka",
    pin: "560038",
    type: "HOME",
    isDefault: true,
  },
  {
    id: "addr-2",
    fullName: "Mahendra Kumar",
    phone: "+91 98765 00001",
    flatHouse: "Floor 3, Tech Park Towers",
    streetArea: "Outer Ring Road, Bellandur",
    landmark: "Near Ecospace Gate 2",
    city: "Bengaluru",
    state: "Karnataka",
    pin: "560103",
    type: "WORK",
    isDefault: false,
  },
];

export const INITIAL_WISHLIST: CustomerWishlistItem[] = [
  {
    id: 4,
    name: "Fresh Mangoes",
    category: "Exotic & Seasonal",
    price: 100,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80",
    inStock: true,
    badge: "Seasonal",
  },
  {
    id: 13,
    name: "Dragon Fruit",
    category: "Exotic & Seasonal",
    price: 140,
    unit: "piece",
    image: "https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&w=400&q=80",
    inStock: true,
  },
  {
    id: 16,
    name: "Organic Apples",
    category: "Organics",
    price: 150,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80",
    inStock: true,
    badge: "Organic",
  },
  {
    id: 25,
    name: "Coconut Water",
    category: "Beverages",
    price: 40,
    unit: "bottle",
    image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=400&q=80",
    inStock: false,
  },
];

export const INITIAL_SETTINGS: CustomerSettings = {
  deliverySlot: "Early Morning (6:00 AM - 8:00 AM)",
  language: "English",
  zeroPlastic: true,
  whatsappNotifications: true,
  smsUpdates: true,
  emailPromotions: false,
};

export const FAQ_LIST: CustomerFaq[] = [
  {
    category: "Orders & Delivery",
    question: "When are daily orders harvested and packed?",
    answer:
      "All produce is harvested in the early morning directly from partner local farms, quality graded at our local distribution hub, and dispatched for morning or evening delivery slots within 6 hours of picking.",
  },
  {
    category: "Orders & Delivery",
    question: "Can I choose my delivery time slot?",
    answer:
      "Yes! You can choose between Early Morning (6:00 AM - 8:00 AM), Morning (8:00 AM - 11:00 AM), and Evening (5:00 PM - 8:00 PM) during checkout or in your Account Settings.",
  },
  {
    category: "Quality & Freshness",
    question: "What is the RRV Freshness Guarantee?",
    answer:
      "If you receive any vegetable or fruit that does not meet our high standards of freshness or quality, take a photo within 12 hours of delivery and we will instantly credit your account or replace the item with no hassle.",
  },
  {
    category: "Quality & Freshness",
    question: "Are your organic products certified?",
    answer:
      "Yes, items marked with our 'Organic' badge come from NPOP (National Programme for Organic Production) certified farms with zero chemical pesticides or artificial growth enhancers.",
  },
  {
    category: "Payments & Refunds",
    question: "What payment methods are supported?",
    answer:
      "We support all major UPI apps (Google Pay, PhonePe, Paytm, BHIM), Credit and Debit Cards (Visa, Mastercard, RuPay), Net Banking, and Cash on Delivery (COD).",
  },
  {
    category: "Payments & Refunds",
    question: "How do refunds work for canceled or returned items?",
    answer:
      "Refunds for UPI and cards are processed within 2-4 hours and reflected in your bank account in 24 hours. COD refunds are credited immediately to your RRV Green Basket wallet.",
  },
  {
    category: "Account & Sustainability",
    question: "What is your Zero-Plastic Packaging initiative?",
    answer:
      "When you enable the 'Zero-Plastic Packaging' toggle in your Account Settings, all your produce is packed in reusable breathable cotton pouches and 100% recycled biodegradable paper crates.",
  },
];

// LocalStorage helpers
const STORAGE_PREFIX = "rrv_customer_data_";

export function getStoredAddresses(): CustomerAddress[] {
  if (typeof window === "undefined") return INITIAL_ADDRESSES;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}addresses`);
    return raw ? JSON.parse(raw) : INITIAL_ADDRESSES;
  } catch {
    return INITIAL_ADDRESSES;
  }
}

export function saveStoredAddresses(addresses: CustomerAddress[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}addresses`, JSON.stringify(addresses));
  } catch (e) {
    console.error("Failed to save addresses:", e);
  }
}

export function getStoredWishlist(): CustomerWishlistItem[] {
  if (typeof window === "undefined") return INITIAL_WISHLIST;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}wishlist`);
    return raw ? JSON.parse(raw) : INITIAL_WISHLIST;
  } catch {
    return INITIAL_WISHLIST;
  }
}

export function saveStoredWishlist(items: CustomerWishlistItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}wishlist`, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save wishlist:", e);
  }
}

export function getStoredSettings(): CustomerSettings {
  if (typeof window === "undefined") return INITIAL_SETTINGS;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}settings`);
    return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(settings: CustomerSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}settings`, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
}
