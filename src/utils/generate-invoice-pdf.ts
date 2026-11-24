import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Order, AdminOrder } from "@/types";
import {
  getDeliveryRecipient,
  getFormattedDeliveryAddress,
  formatOrderDateTime,
  formatOrderDateOnly,
} from "./order-helpers";

/**
 * Generates an official, tax-compliant PDF invoice for RRV Green Basket orders.
 *
 * CRITICAL PRIVACY REQUIREMENT:
 * - Identifies the actual DELIVERY RECIPIENT and delivery address.
 * - MUST NOT expose registered customer's name, registered mobile, or Customer Public ID
 *   unless the registered customer is also the recipient.
 * - Does NOT fall back to registered customer details for recipient.
 */
export function generateInvoicePdf(
  order: AdminOrder | Order,
  action: "download" | "print" = "download"
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const orderNum = order.orderNumber || order.id || "RRV-ORDER";
  const cleanId = orderNum.replace("#", "");
  const invoiceNo = `INV-${cleanId}`;

  // 1. Top Green Header Banner (Brand Emerald: #00875a)
  doc.setFillColor(0, 135, 90);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Logo / Store Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("RRV GREEN BASKET", 14, 12);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("Freshness Delivered Daily • Farm-Fresh Vegetables & Groceries", 14, 18);
  doc.text("Kurnool, Andhra Pradesh - 518001 | Helpline: +91 94401 23456", 14, 23);

  // Document Type Header on Top Right
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", pageWidth - 14, 13, { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Original for Recipient", pageWidth - 14, 19, { align: "right" });
  doc.text("GSTIN: 37AAECR1234F1Z5", pageWidth - 14, 24, { align: "right" });

  // 2. Metadata Grid: ONLY Delivery Recipient Details (No Account Owner Details)
  const metaY = 34;

  // Box Background
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, metaY, pageWidth - 28, 38, 2, 2, "FD");

  // Divider Line inside Box
  doc.setDrawColor(226, 232, 240);
  doc.line(pageWidth / 2, metaY + 2, pageWidth / 2, metaY + 36);

  // Left Column: Delivery Recipient (Billed / Delivered To)
  // PRIVACY: Only use recipient details!
  const recipient = getDeliveryRecipient(order);
  const deliveryAddress = getFormattedDeliveryAddress(order);

  doc.setTextColor(0, 135, 90);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("DELIVERY RECIPIENT & SHIPPING DETAILS", 18, metaY + 7);

  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(10);
  doc.text(
    recipient.isMissing ? "Delivery Recipient: Not Specified" : recipient.name,
    18,
    metaY + 14
  );

  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Mobile: ${recipient.mobile || "Not Provided"}`,
    18,
    metaY + 20
  );

  // Delivery Address lines
  const addressText = deliveryAddress.isMissing
    ? "Delivery Address: Not Provided"
    : `Address: ${deliveryAddress.fullAddress}`;
  const addressLines = doc.splitTextToSize(addressText, pageWidth / 2 - 26);
  doc.text(addressLines.slice(0, 2), 18, metaY + 26);

  if (deliveryAddress.zoneName) {
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Zone: ${deliveryAddress.zoneName}`, 18, metaY + 34);
  }

  // Right Column: Invoice & Order Summary
  const rightX = pageWidth / 2 + 6;
  doc.setTextColor(0, 135, 90);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE & ORDER SUMMARY", rightX, metaY + 7);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");

  doc.text("Invoice No:", rightX, metaY + 14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(invoiceNo, rightX + 25, metaY + 14);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Order Number:", rightX, metaY + 20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(orderNum, rightX + 25, metaY + 20);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Order Date:", rightX, metaY + 26);
  doc.setTextColor(30, 41, 59);
  const formattedDate = formatOrderDateTime(
    order.orderPlacedAt || order.orderDate,
    "orderTime" in order ? order.orderTime : undefined
  );
  doc.text(formattedDate, rightX + 25, metaY + 26);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Payment:", rightX, metaY + 32);
  doc.setFont("helvetica", "bold");
  const payMethod = order.paymentMethod || "COD";
  const payStatus = order.paymentStatus ? `[${order.paymentStatus}]` : "";
  doc.text(`${payMethod} ${payStatus}`, rightX + 25, metaY + 32);

  // 3. Products Table
  const rawItems = order.items && order.items.length > 0 ? order.items : [];

  const tableHead = [
    [
      { content: "#", styles: { halign: "center" as const } },
      "Item Description",
      { content: "HSN Code", styles: { halign: "center" as const } },
      { content: "Unit", styles: { halign: "center" as const } },
      { content: "Qty", styles: { halign: "center" as const } },
      { content: "Unit Price (₹)", styles: { halign: "right" as const } },
      { content: "Total (₹)", styles: { halign: "right" as const } },
    ],
  ];

  const tableBody = rawItems.map((it: any, idx: number) => {
    const unit = it.unitOfMeasure || it.unit || "KG";
    const qty = typeof it.quantity === "number" ? it.quantity : it.quantityKg || 1;
    const unitPrice = typeof it.unitPrice === "number" ? it.unitPrice : it.pricePerKg || 0;
    const totalPrice = typeof it.totalPrice === "number" ? it.totalPrice : unitPrice * qty;

    return [
      { content: String(idx + 1), styles: { halign: "center" as const } },
      it.productName || "Fresh Produce Item",
      { content: it.hsnCode || "07099990", styles: { halign: "center" as const } },
      { content: unit, styles: { halign: "center" as const } },
      { content: qty % 1 === 0 ? String(qty) : qty.toFixed(3), styles: { halign: "center" as const } },
      { content: unitPrice.toFixed(2), styles: { halign: "right" as const } },
      { content: totalPrice.toFixed(2), styles: { halign: "right" as const } },
    ];
  });

  autoTable(doc, {
    head: tableHead,
    body: tableBody.length > 0 ? tableBody : [
      [
        { content: "1", styles: { halign: "center" as const } },
        "Order Produce Item",
        { content: "07099990", styles: { halign: "center" as const } },
        { content: "KG", styles: { halign: "center" as const } },
        { content: "1", styles: { halign: "center" as const } },
        { content: (order.subtotal || order.totalAmount || 0).toFixed(2), styles: { halign: "right" as const } },
        { content: (order.subtotal || order.totalAmount || 0).toFixed(2), styles: { halign: "right" as const } },
      ]
    ],
    startY: 76,
    theme: "striped",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [0, 135, 90], // #00875a
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // 4. Financial Calculations & Totals Block
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // Left Note Box
  const summaryBoxWidth = 85;
  const summaryBoxX = pageWidth - 14 - summaryBoxWidth;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, finalY, summaryBoxX - 20, 38, 2, 2, "FD");

  doc.setTextColor(0, 135, 90);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("DELIVERY & COMPLIANCE NOTES", 18, finalY + 7);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("• All produce harvested & packaged following strict hygiene standards.", 18, finalY + 13);
  doc.text("• Perishable items must be inspected upon doorstep delivery.", 18, finalY + 18);
  doc.text("• Delivery recipient must verify package contents before signing.", 18, finalY + 23);
  doc.text("• FSSAI Central Registration No: 10123024000456.", 18, finalY + 28);
  doc.text("• E. & O.E. | Thank you for choosing RRV Green Basket!", 18, finalY + 33);

  // Right Totals Breakdown
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(summaryBoxX, finalY, summaryBoxWidth, 38, 2, 2, "FD");

  // Use API values directly!
  const calcSubtotal =
    order.subtotal !== undefined
      ? order.subtotal
      : order.subtotalAmount !== undefined
      ? order.subtotalAmount
      : rawItems.reduce((sum: number, it: any) => sum + (it.totalPrice || (it.unitPrice || 0) * (it.quantity || 1)), 0);

  const calcDelivery = order.deliveryCharge ?? 0;
  const calcDiscount = order.discountAmount ?? ("discount" in order && order.discount ? order.discount : 0);
  const calcGrandTotal = order.totalAmount ?? ("amount" in order ? order.amount : calcSubtotal + calcDelivery - calcDiscount);

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");

  doc.text("Items Subtotal:", summaryBoxX + 4, finalY + 7);
  doc.text(`₹ ${calcSubtotal.toFixed(2)}`, pageWidth - 18, finalY + 7, { align: "right" });

  doc.text("Delivery Charges:", summaryBoxX + 4, finalY + 13);
  doc.text(
    calcDelivery > 0 ? `₹ ${calcDelivery.toFixed(2)}` : "FREE (₹0.00)",
    pageWidth - 18,
    finalY + 13,
    { align: "right" }
  );

  doc.text("Discount Applied:", summaryBoxX + 4, finalY + 19);
  doc.setTextColor(22, 163, 74);
  doc.text(`- ₹ ${calcDiscount.toFixed(2)}`, pageWidth - 18, finalY + 19, { align: "right" });

  // Grand Total Highlight Banner
  doc.setFillColor(0, 135, 90);
  doc.rect(summaryBoxX, finalY + 24, summaryBoxWidth, 14, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("GRAND TOTAL:", summaryBoxX + 4, finalY + 33);
  doc.setFontSize(12);
  doc.text(`₹ ${calcGrandTotal.toFixed(2)}`, pageWidth - 18, finalY + 33, { align: "right" });

  // 5. Authorized Signatory & Footer
  const signY = finalY + 46;

  doc.setDrawColor(226, 232, 240);
  doc.line(14, signY, pageWidth - 14, signY);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("RRV GREEN BASKET OPERATIONS DESK", 14, signY + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Computer Generated Invoice • No Physical Signature Required", 14, signY + 11);

  doc.setFont("helvetica", "bold");
  doc.text("AUTHORIZED SIGNATORY", pageWidth - 14, signY + 6, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Kurnool Central Distribution Hub", pageWidth - 14, signY + 11, { align: "right" });

  // Footer Disclaimer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    "For recipient queries, write to support@rrvgreenbasket.com or call +91 94401 23456 | Powered by RRV Logistics Hub",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );

  // 6. Action Execution
  if (action === "print") {
    doc.autoPrint();
    const blobUrl = doc.output("bloburl");
    window.open(blobUrl, "_blank");
  } else {
    doc.save(`RRV_Invoice_${cleanId}.pdf`);
  }
}
