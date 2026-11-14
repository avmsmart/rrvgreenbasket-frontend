/**
 * RRV Green Basket - Contact Service
 * Submits customer inquiries, order assistance, and feedback to the backend.
 */

import { ContactFormPayload, ContactSubmissionResponse } from "@/types/contact";

export class ContactApiError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = "ContactApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ContactService {
  /**
   * Submit Contact Form
   * POST /api/contact
   */
  async submitContact(payload: ContactFormPayload): Promise<ContactSubmissionResponse> {
    // Basic client-side pre-validations
    if (!payload.fullName?.trim()) {
      throw new ContactApiError("Full name is required", 400);
    }
    if (!payload.mobileNumber?.trim()) {
      throw new ContactApiError("Mobile number is required", 400);
    }
    const cleanPhone = payload.mobileNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      throw new ContactApiError("Please enter a valid 10-digit mobile number", 400);
    }
    if (!payload.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
      throw new ContactApiError("Please enter a valid email address", 400);
    }
    if (!payload.subject?.trim()) {
      throw new ContactApiError("Please select a subject for your enquiry", 400);
    }
    if (!payload.message?.trim() || payload.message.trim().length < 10) {
      throw new ContactApiError("Please provide a message with at least 10 characters", 400);
    }
    if (payload.message.trim().length > 2000) {
      throw new ContactApiError("Message must not exceed 2,000 characters", 400);
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          fullName: payload.fullName.trim(),
          mobileNumber: payload.mobileNumber.trim(),
          email: payload.email.trim().toLowerCase(),
          subject: payload.subject.trim(),
          message: payload.message.trim(),
        }),
      });

      let json: any = null;
      try {
        json = await response.json();
      } catch {
        json = null;
      }

      if (!response.ok) {
        const errorMsg =
          json?.message ||
          json?.error ||
          `Submission failed with status ${response.status}. Please try again.`;
        throw new ContactApiError(String(errorMsg), response.status, json);
      }

      return {
        success: true,
        message:
          json?.message ||
          "Thank you for reaching out! We have received your inquiry and our team will get back to you shortly.",
        ticketId: json?.ticketId || json?.data?.ticketId || `TKT-${Date.now().toString().slice(-6)}`,
        timestamp: json?.timestamp || new Date().toISOString(),
      };
    } catch (err: unknown) {
      if (err instanceof ContactApiError) throw err;
      const msg = err instanceof Error ? err.message : "Network error contacting support server";
      throw new ContactApiError(msg, 503);
    }
  }
}

export const contactService = new ContactService();
