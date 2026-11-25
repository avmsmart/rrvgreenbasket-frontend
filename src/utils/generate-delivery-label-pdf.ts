import { jsPDF } from "jspdf";
import { Order, AdminOrder } from "@/types";
import {
  getDeliveryRecipient,
  getFormattedDeliveryAddress,
  formatOrderDateOnly,
} from "./order-helpers";

/**
 * Generates an official, compact Delivery / Shipping Label for package packing and logistics.
 *
 * CRITICAL PRIVACY REQUIREMENT:
 * - Displays ONLY delivery recipient and delivery address.
 * - NEVER exposes registered customer account information.
 * - Formatted for standard 4x6 inch (100mm x 150mm) parcel label.
 */
export function generateDeliveryLabelPdf(
  order: AdminOrder | Order,
  action: "download" | "print" = "print"
): void {
  // 100mm width x 150mm height standard label
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [100, 150],
  });

  const pageWidth = 100;
  const pageHeight = 150;
  const margin = 5;

  const orderNum = order.orderNumber || order.id || "RRV-ORDER";
  const cleanId = orderNum.replace("#", "");
  const recipient = getDeliveryRecipient(order);
  const deliveryAddr = getFormattedDeliveryAddress(order);

  // 1. Outer Border
  doc.setDrawColor(0, 135, 90);
  doc.setLineWidth(0.8);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

  // 2. Header: Brand Banner
  doc.setFillColor(0, 135, 90);
  doc.rect(margin, margin, pageWidth - margin * 2, 16, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("RRV GREEN BASKET", pageWidth / 2, margin + 6.5, { align: "center" });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("FARM-FRESH GROCERY DELIVERY DISPATCH", pageWidth / 2, margin + 12, { align: "center" });

  // 3. Order Number & Delivery Zone Box
  let currY = margin + 19;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin + 2, currY, pageWidth - (margin + 2) * 2, 16, 1.5, 1.5, "FD");

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("ORDER NUMBER:", margin + 5, currY + 5);

  doc.setTextColor(0, 135, 90);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(orderNum, margin + 5, currY + 11.5);

  // Zone on Right
  const rightColX = pageWidth - margin - 5;
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7);
  doc.text("DELIVERY ZONE:", rightColX, currY + 5, { align: "right" });

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  const zoneLabel = deliveryAddr.zoneName || "Kurnool Central Hub";
  doc.text(zoneLabel.length > 22 ? zoneLabel.substring(0, 22) + "..." : zoneLabel, rightColX, currY + 11.5, { align: "right" });

  // 4. DELIVER TO (RECIPIENT) BLOCK - LARGEST AND MOST PROMINENT
  currY += 19;

  doc.setFillColor(254, 252, 232); // amber-50 highlight background
  doc.setDrawColor(250, 204, 21); // amber-400
  doc.setLineWidth(0.5);
  doc.roundedRect(margin + 2, currY, pageWidth - (margin + 2) * 2, 46, 2, 2, "FD");

  doc.setTextColor(180, 83, 9); // amber-800
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("SHIP TO / DELIVERY RECIPIENT:", margin + 5, currY + 6);

  // Recipient Name
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(recipient.name, margin + 5, currY + 13);

  // Recipient Mobile Phone (Huge & Clear for Delivery Driver)
  doc.setTextColor(0, 135, 90);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  const phoneStr = recipient.mobile ? `PHONE: ${recipient.mobile}` : "PHONE: Not Provided";
  doc.text(phoneStr, margin + 5, currY + 19);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 4, currY + 22, pageWidth - margin - 4, currY + 22);

  // Delivery Address
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  const addressText = deliveryAddr.isMissing
    ? "No address provided"
    : deliveryAddr.fullAddress;
  const wrappedAddress = doc.splitTextToSize(addressText, pageWidth - (margin + 4) * 2);
  doc.text(wrappedAddress.slice(0, 3), margin + 5, currY + 27);

  // PINCODE Badge
  if (deliveryAddr.pincode) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`PINCODE: ${deliveryAddr.pincode}`, margin + 5, currY + 41);
  }

  // 5. Package & Dispatch Details
  currY += 49;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin + 2, currY, pageWidth - (margin + 2) * 2, 24, 1.5, 1.5, "FD");

  // Promised Delivery Date
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Promised Delivery Date:", margin + 5, currY + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  const deliveryDateFormatted = formatOrderDateOnly(order.promisedDeliveryDate || order.orderDate);
  doc.text(deliveryDateFormatted, margin + 5, currY + 11);

  // Items Summary
  const items = order.items || [];
  const itemsCount = items.length;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Items in Package:", rightColX, currY + 6, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${itemsCount} item(s)`, rightColX, currY + 11, { align: "right" });

  // Brief items list
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  const itemsSummary = items
    .slice(0, 3)
    .map((it: any) => `${it.productName} (${it.quantity || 1} ${it.unitOfMeasure || it.unit || "KG"})`)
    .join(", ");
  const truncatedSummary =
    itemsSummary.length > 55 ? itemsSummary.substring(0, 52) + "..." : itemsSummary;
  doc.text(truncatedSummary || "Fresh Produce Selection", margin + 5, currY + 18);

  // 6. Payment Action Box (Cash On Delivery instructions)
  currY += 27;

  const isCod =
    String(order.paymentMethod).toUpperCase().includes("COD") ||
    String(order.paymentStatus).toUpperCase().includes("PENDING");
  const totalAmount = order.totalAmount ?? ("amount" in order ? order.amount : 0);

  if (isCod) {
    doc.setFillColor(254, 242, 242); // rose-50
    doc.setDrawColor(248, 113, 113); // rose-400
    doc.roundedRect(margin + 2, currY, pageWidth - (margin + 2) * 2, 14, 1.5, 1.5, "FD");

    doc.setTextColor(185, 28, 28); // rose-700
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text("COLLECT CASH ON DELIVERY (COD)", margin + 5, currY + 5.5);

    doc.setFontSize(11);
    doc.text(`₹ ${Number(totalAmount).toFixed(2)}`, rightColX, currY + 9.5, { align: "right" });
  } else {
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(74, 222, 128); // emerald-400
    doc.roundedRect(margin + 2, currY, pageWidth - (margin + 2) * 2, 14, 1.5, 1.5, "FD");

    doc.setTextColor(21, 128, 61); // emerald-700
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text("PREPAID ORDER - DO NOT COLLECT CASH", margin + 5, currY + 5.5);

    doc.setFontSize(10);
    doc.text("PAID ONLINE", rightColX, currY + 9.5, { align: "right" });
  }

  // 7. Footer Barcode & Handling Notes
  currY += 16.5;

  // Simple simulated barcode lines
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  const barcodeX = margin + 12;
  const barcodeWidth = pageWidth - (margin + 12) * 2;
  const barCount = 38;
  const step = barcodeWidth / barCount;
  for (let i = 0; i < barCount; i++) {
    const isThick = (i % 3 === 0 || i % 7 === 0);
    doc.setLineWidth(isThick ? 0.7 : 0.3);
    doc.line(barcodeX + i * step, currY, barcodeX + i * step, currY + 6);
  }

  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text(`*${cleanId}*`, pageWidth / 2, currY + 9.5, { align: "center" });

  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text(
    "FRAGILE PRODUCE • HANDLE WITH CARE • KEEP UPRIGHT",
    pageWidth / 2,
    pageHeight - margin - 2,
    { align: "center" }
  );

  // 8. Output action
  if (action === "print") {
    doc.autoPrint();
    const blobUrl = doc.output("bloburl");
    window.open(blobUrl, "_blank");
  } else {
    doc.save(`DeliveryLabel_${cleanId}.pdf`);
  }
}
