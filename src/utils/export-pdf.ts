import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface PdfColumn<T> {
  header: string;
  accessor: (item: T) => string | number | undefined | null;
}

/**
 * Exports data to a professionally styled PDF document using jsPDF and jspdf-autotable.
 *
 * @param filename Name of the file to save (e.g. 'selected-deliveries.pdf')
 * @param title Title displayed at the top of the PDF document
 * @param columns Array of columns with header and accessor function
 * @param data Array of items to export
 */
export function exportToPdf<T>(
  filename: string,
  title: string,
  columns: PdfColumn<T>[],
  data: T[]
): void {
  if (!data || data.length === 0) return;

  // Use landscape if more than 6 columns for optimal readability
  const orientation = columns.length > 6 ? "landscape" : "portrait";
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Header Banner Background (RRV Green Basket Emerald Theme)
  doc.setFillColor(0, 135, 90); // #00875a
  doc.rect(0, 0, pageWidth, 24, "F");

  // 2. Company Name & Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("RRV GREEN BASKET", 14, 11);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Fresh Produce & Grocery Admin Portal", 14, 18);

  // 3. Document Title & Timestamp on Right
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), pageWidth - 14, 11, { align: "right" });

  const generatedDate = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${generatedDate}`, pageWidth - 14, 18, { align: "right" });

  // 4. Subtitle / Summary info
  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Exported Records: ${data.length}`, 14, 32);

  // 5. Build AutoTable
  const head = [columns.map((c) => c.header)];
  const body = data.map((item) =>
    columns.map((col) => {
      const val = col.accessor(item);
      return val === undefined || val === null ? "--" : String(val);
    })
  );

  autoTable(doc, {
    head,
    body,
    startY: 36,
    theme: "striped",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2.5,
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
      fillColor: [248, 250, 252], // slate-50
    },
    margin: { left: 14, right: 14, bottom: 20 },
    didDrawPage: (dataInfo) => {
      // Footer with page numbering
      const str = `Page ${dataInfo.pageNumber} of ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(str, pageWidth / 2, pageHeight - 10, { align: "center" });
      doc.text("Confidential — RRV Green Basket Internal Management", 14, pageHeight - 10);
    },
  });

  // Ensure filename ends in .pdf
  const finalFilename = filename.endsWith(".pdf")
    ? filename
    : filename.replace(/\.[^/.]+$/, "") + ".pdf";

  doc.save(finalFilename);
}
