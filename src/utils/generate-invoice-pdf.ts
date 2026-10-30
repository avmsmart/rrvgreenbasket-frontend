import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Order, OrderItem } from "@/types";

/**
 * Generates an official, tax-compliant PDF invoice for RRV Green Basket orders.
 * Uses jsPDF and jspdf-autotable for pixel-perfect, printable A4 documentation.
 *
 * @param order Order entity containing customer, itemized breakdown, and payment details
 * @param action 'download' to save PDF file, 'print' to open in print preview window
 */
export function generateInvoicePdf(
  order: Partial<Order> & {
    id: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    amount: number;
  },
  action: "download" | "print" = "download"
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const cleanId = order.id.replace("#", "");
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
  doc.text("Kurnool, Andhra Pradesh - 518002 | Helpline: +91 94401 23456", 14, 23);

  // Document Type Header on Top Right
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", pageWidth - 14, 13, { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Original for Recipient", pageWidth - 14, 19, { align: "right" });
  doc.text("GSTIN: 37AAECR1234F1Z5", pageWidth - 14, 24, { align: "right" });

  // 2. Metadata Grid (Billed To vs Invoice Details)
  const metaY = 34;

  // Box Background
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, metaY, pageWidth - 28, 36, 2, 2, "FD");

  // Divider Line inside Box
  doc.setDrawColor(226, 232, 240);
  doc.line(pageWidth / 2, metaY + 2, pageWidth / 2, metaY + 34);

  // Left Column: Customer (Billed To)
  doc.setTextColor(0, 135, 90);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("BILLED TO / CUSTOMER DETAILS", 18, metaY + 7);

  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(10);
  doc.text(order.customerName, 18, metaY + 14);

  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Phone: ${order.customerPhone}`, 18, metaY + 20);

  // Truncate address if very long
  const addressLines = doc.splitTextToSize(
    `Delivery Address: ${order.customerAddress || "Kurnool Town"}`,
    pageWidth / 2 - 26
  );
  doc.text(addressLines, 18, metaY + 26);

  // Right Column: Invoice & Order Meta
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
  doc.text("Order ID:", rightX, metaY + 20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(order.id, rightX + 25, metaY + 20);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Date & Time:", rightX, metaY + 26);
  doc.setTextColor(30, 41, 59);
  const orderTimeStr = order.orderTime ? `(${order.orderTime})` : "";
  doc.text(
    `${order.orderDate || new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })} ${orderTimeStr}`,
    rightX + 25,
    metaY + 26
  );

  doc.setTextColor(71, 85, 105);
  doc.text("Payment Mode:", rightX, metaY + 32);
  doc.setFont("helvetica", "bold");
  const payStatus = order.paymentStatus ? `[${order.paymentStatus}]` : "";
  doc.text(`${order.paymentMethod || "COD"} ${payStatus}`, rightX + 25, metaY + 32);

  // 3. Products Table
  const defaultItems: OrderItem[] = [
    {
      id: "1",
      productId: "PRD-1",
      productName: "Fresh Hybrid Tomato",
      unit: "Kg",
      unitPrice: 34,
      quantity: 2,
      totalPrice: 68,
    },
    {
      id: "2",
      productId: "PRD-2",
      productName: "Red Onions (Nasik Grade)",
      unit: "Kg",
      unitPrice: 56,
      quantity: 2,
      totalPrice: 112,
    },
    {
      id: "3",
      productId: "PRD-3",
      productName: "Green Bell Pepper (Capsicum)",
      unit: "Kg",
      unitPrice: 46,
      quantity: 1,
      totalPrice: 46,
    },
  ];

  const items = order.items && order.items.length > 0 ? order.items : defaultItems;

  const tableHead = [
    [
      { content: "#", styles: { halign: "center" as const } },
      "Item Description",
      { content: "HSN Code", styles: { halign: "center" as const } },
      { content: "UOM", styles: { halign: "center" as const } },
      { content: "Qty", styles: { halign: "center" as const } },
      { content: "Rate (₹)", styles: { halign: "right" as const } },
      { content: "Amount (₹)", styles: { halign: "right" as const } },
    ],
  ];

  const tableBody = items.map((it, idx) => [
    { content: String(idx + 1), styles: { halign: "center" as const } },
    it.productName,
    { content: "7101000", styles: { halign: "center" as const } },
    { content: it.unit || "Kg", styles: { halign: "center" as const } },
    { content: String(it.quantity), styles: { halign: "center" as const } },
    { content: (it.unitPrice || 0).toFixed(2), styles: { halign: "right" as const } },
    { content: (it.totalPrice || it.unitPrice * it.quantity).toFixed(2), styles: { halign: "right" as const } },
  ]);

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 74,
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
  doc.text("• Issues or replacements must be raised within 6 hours of receipt.", 18, finalY + 23);
  doc.text("• FSSAI Central Registration No: 10123024000456.", 18, finalY + 28);
  doc.text("• E. & O.E. | Thank you for choosing RRV Green Basket!", 18, finalY + 33);

  // Right Totals Breakdown
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(summaryBoxX, finalY, summaryBoxWidth, 38, 2, 2, "FD");

  const calcSubtotal =
    order.subtotal ||
    items.reduce((sum, it) => sum + (it.totalPrice || it.unitPrice * it.quantity), 0);
  const calcDelivery = order.deliveryCharge ?? 0;
  const calcDiscount = order.discount ?? 0;
  const calcGrandTotal = order.amount || calcSubtotal + calcDelivery - calcDiscount;

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
    "For customer queries, write to support@rrvgreenbasket.com or call +91 94401 23456 | Powered by RRV Logistics Hub",
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
