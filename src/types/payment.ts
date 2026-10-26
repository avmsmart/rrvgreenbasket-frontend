import { PaymentMethod, PaymentStatus } from "./order";

export interface PaymentTransaction {
  id: string; // e.g. "T240825091523"
  orderId: string; // e.g. "#ORD001234"
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  paymentDate: string;
  status: PaymentStatus;
}
