import { AdminOrder, Order, AdminDeliveryAddress, RegisteredCustomerDto } from "@/types";

export interface RegisteredCustomerInfo {
  name: string;
  mobile: string;
  customerPublicId?: string;
  hasCustomer: boolean;
}

export interface DeliveryRecipientInfo {
  name: string;
  mobile: string;
  isMissing: boolean;
}

/**
 * Extracts Registered Customer (Account Owner) information.
 * Prefer top-level registeredCustomerName/registeredCustomerMobile,
 * then fall back to customer.registeredName/customer.registeredMobile.
 */
export function getRegisteredCustomer(order: AdminOrder | Order | null | undefined): RegisteredCustomerInfo {
  if (!order) {
    return { name: "Unknown", mobile: "", customerPublicId: undefined, hasCustomer: false };
  }

  const name =
    (order.registeredCustomerName && order.registeredCustomerName.trim()) ||
    (order.customer?.registeredName && order.customer.registeredName.trim()) ||
    ("customerName" in order && order.customerName ? order.customerName.trim() : "") ||
    "Registered Customer";

  const mobile =
    (order.registeredCustomerMobile && order.registeredCustomerMobile.trim()) ||
    (order.customer?.registeredMobile && order.customer.registeredMobile.trim()) ||
    ("customerPhone" in order && order.customerPhone ? order.customerPhone.trim() : "") ||
    "";

  const customerPublicId =
    order.customerPublicId ||
    order.customer?.customerPublicId ||
    undefined;

  return {
    name,
    mobile,
    customerPublicId,
    hasCustomer: Boolean(name || mobile || customerPublicId),
  };
}

/**
 * Extracts Delivery Recipient information.
 * Prefer top-level recipientName/recipientMobile,
 * then fall back to deliveryAddress.recipientName/deliveryAddress.recipientMobile.
 *
 * CRITICAL RULE: NEVER fall back to registered customer details for recipient!
 */
export function getDeliveryRecipient(order: AdminOrder | Order | null | undefined): DeliveryRecipientInfo {
  if (!order) {
    return { name: "Not Provided", mobile: "", isMissing: true };
  }

  const deliveryAddr =
    typeof order.deliveryAddress === "object" && order.deliveryAddress !== null
      ? (order.deliveryAddress as AdminDeliveryAddress)
      : "deliveryAddressObj" in order && order.deliveryAddressObj
      ? order.deliveryAddressObj
      : undefined;

  const name =
    (order.recipientName && order.recipientName.trim()) ||
    (deliveryAddr?.recipientName && deliveryAddr.recipientName.trim()) ||
    "";

  const mobile =
    (order.recipientMobile && order.recipientMobile.trim()) ||
    (deliveryAddr?.recipientMobile && deliveryAddr.recipientMobile.trim()) ||
    "";

  const isMissing = !name && !mobile;

  return {
    name: name || (isMissing ? "Delivery Recipient Not Specified" : "Recipient"),
    mobile,
    isMissing,
  };
}

/**
 * Formats complete delivery address from order
 */
export function getFormattedDeliveryAddress(order: AdminOrder | Order | null | undefined): {
  fullAddress: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  zoneName: string;
  latitude?: number;
  longitude?: number;
  isMissing: boolean;
} {
  if (!order) {
    return {
      fullAddress: "Address Not Provided",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      zoneName: "",
      isMissing: true,
    };
  }

  const deliveryAddr =
    typeof order.deliveryAddress === "object" && order.deliveryAddress !== null
      ? (order.deliveryAddress as AdminDeliveryAddress)
      : "deliveryAddressObj" in order && order.deliveryAddressObj
      ? order.deliveryAddressObj
      : undefined;

  const rawAddressString =
    typeof order.deliveryAddress === "string" ? order.deliveryAddress : "";

  const addressLine =
    deliveryAddr?.addressLine1 ||
    deliveryAddr?.addressLine ||
    rawAddressString ||
    "";

  const addressLine2 = deliveryAddr?.addressLine2 || "";
  const city = deliveryAddr?.city || "";
  const state = deliveryAddr?.state || "";
  const pincode = deliveryAddr?.pincode || "";
  const country = deliveryAddr?.country || "India";
  const zoneName = order.deliveryZoneName || "";

  const lat = order.deliveryLatitude ?? deliveryAddr?.latitude;
  const lng = order.deliveryLongitude ?? deliveryAddr?.longitude;

  const parts = [addressLine, addressLine2, city, state, pincode, country].filter(
    (p) => typeof p === "string" && p.trim().length > 0
  );

  const fullAddress = parts.length > 0 ? parts.join(", ") : rawAddressString || "Address Not Provided";

  return {
    fullAddress,
    addressLine: addressLine2 ? `${addressLine}, ${addressLine2}` : addressLine,
    city,
    state,
    pincode,
    country,
    zoneName,
    latitude: lat,
    longitude: lng,
    isMissing: parts.length === 0 && !rawAddressString,
  };
}

/**
 * Returns Google Maps link for delivery location if latitude and longitude exist,
 * otherwise falls back to query with the formatted address.
 */
export function getGoogleMapsUrl(
  lat?: number,
  lng?: number,
  fallbackAddress?: string
): string | null {
  if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng)) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  if (fallbackAddress && fallbackAddress.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress.trim())}`;
  }
  return null;
}

/**
 * Safely format ISO date/time or date string for user display.
 * Avoids invalid dates or duplicated times.
 */
export function formatOrderDateTime(rawDate?: string, rawTime?: string): string {
  if (!rawDate && !rawTime) return "—";

  // If already formatted like "21 Nov 2026, 7:45 PM" or "25 Aug 2025"
  if (rawDate && (rawDate.includes(" ") || !rawDate.includes("-") && !rawDate.includes("T"))) {
    return rawTime ? `${rawDate}, ${rawTime}` : rawDate;
  }

  try {
    const isoString = rawDate?.includes("T") ? rawDate : rawDate;
    if (isoString) {
      const parsed = new Date(isoString);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
    }
  } catch {
    // fallback
  }

  if (rawDate && rawTime) return `${rawDate}, ${rawTime}`;
  return rawDate || rawTime || "—";
}

/**
 * Format date only (e.g. "22 Nov 2026")
 */
export function formatOrderDateOnly(rawDate?: string): string {
  if (!rawDate) return "—";
  try {
    const parsed = new Date(rawDate);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  } catch {
    // fallback
  }
  return rawDate;
}
