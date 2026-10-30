export type { PaymentStatus } from "./order";
import { PaymentStatus } from "./order";

export type PaymentTransactionMethod =
  | "UPI (PhonePe)"
  | "UPI (Google Pay)"
  | "Cash on Delivery"
  | "Card (Razorpay)"
  | "Wallet (Paytm)"
  | "Net Banking"
  | string;

export interface PaymentTransaction {
  id: string; // e.g. "TXN-89214710"
  orderId: string; // e.g. "ORD-001"
  customerName: string;
  customerPhone?: string;
  customerAvatar?: string;
  amount: number;
  method?: PaymentTransactionMethod;
  paymentMethod?: string;
  status: PaymentStatus;
  date?: string; // e.g. "27 Oct 2026, 08:30 AM"
  paymentDate?: string;
  timestamp?: string; // ISO string for sorting
  gatewayRef?: string;
  transactionId?: string;
  failureReason?: string;
  refundAmount?: number;
  refundDate?: string;
  itemsCount?: number;
  deliveryAddress?: string;
}

export interface PaymentsSummary {
  totalRevenue: number; // e.g. 124580
  revenueGrowth: string; // "+12.4%"
  paidOrders: number; // 296
  paidSuccessRate: string; // "91.4%"
  pendingPayments: number; // 18
  failedPayments: number; // 5
  refundedAmount: number; // 2450
  refundedCount: number; // 8
}

export interface PaymentMethodShare {
  method: string;
  percentage: number;
  amount: number;
  color: string;
}

export interface DailyCollectionStat {
  day: string;
  amount: number;
  orders: number;
}

export interface PaymentActivityLog {
  id: string;
  transactionId: string;
  orderId: string;
  customerName: string;
  amount: number;
  type: "success" | "failure" | "refund" | "pending";
  description: string;
  timeAgo: string;
}
