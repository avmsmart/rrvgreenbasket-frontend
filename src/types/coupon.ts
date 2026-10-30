export type CouponDiscountType = "percentage" | "fixed" | "free_shipping";

export interface Coupon {
  id: string;
  code: string; // e.g. "WELCOME10", "FRESH20"
  offerName: string;
  discount: string; // "10% OFF", "₹50 OFF", "Free Delivery"
  minOrder: number; // e.g. 199
  usage: string; // e.g. "245 / 500"
  validTill: string; // e.g. "30 Aug 2025"
  status: "Active" | "Inactive" | "Scheduled" | "Expired";
  discountType?: CouponDiscountType;
  discountValue?: number;
  maxUsage?: number;
  currentUsage?: number;
  totalSaved?: number; // total amount saved by customers
  createdAt?: string;
  description?: string;
}

export interface CouponActivity {
  id: string;
  customerName: string;
  couponCode: string;
  savingsText: string;
  orderId: string;
  timestamp: string;
}
