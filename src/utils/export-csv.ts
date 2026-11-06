/**
 * RRV Green Basket - Reusable CSV Export Utility
 *
 * Implements RFC 4180 compliant CSV serialization with UTF-8 BOM for Excel compatibility.
 * Safely handles commas, double quotes, line breaks, and nullish values.
 */

export interface CsvColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

export function exportToCsv<T>(
  filename: string,
  columns: CsvColumn<T>[],
  data: T[]
): boolean {
  if (!data || data.length === 0) {
    return false;
  }

  // Helper to escape values according to CSV standard RFC 4180
  const escapeValue = (val: unknown): string => {
    if (val === null || val === undefined) {
      return "";
    }
    const str = String(val);
    if (
      str.includes(",") ||
      str.includes('"') ||
      str.includes("\n") ||
      str.includes("\r")
    ) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = columns.map((c) => escapeValue(c.header)).join(",");
  const rowLines = data.map((row) =>
    columns.map((c) => escapeValue(c.accessor(row))).join(",")
  );

  // \uFEFF ensures proper UTF-8 character encoding in Microsoft Excel
  const csvContent = "\uFEFF" + [headerLine, ...rowLines].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
