/**
 * RRV Green Basket - Contact & Support Types
 */

export type ContactSubjectOption =
  | "General Enquiry"
  | "Order Related"
  | "Product Information"
  | "Delivery Related"
  | "Payment Related"
  | "Complaint"
  | "Other";

export interface ContactFormPayload {
  fullName: string;
  mobileNumber: string;
  email: string;
  subject: ContactSubjectOption | string;
  message: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  message: string;
  ticketId?: string;
  timestamp?: string;
}
