export interface Coupon {
  id: string;
  code: string; // e.g. "FRESH20"
  offerName: string;
  discount: string; // "20% OFF", "₹100 OFF", "Free Delivery"
  minOrder: number;
  usage: string; // e.g. "180 / 300"
  validTill: string;
  status: "Active" | "Inactive" | "Scheduled" | "Expired";
}
