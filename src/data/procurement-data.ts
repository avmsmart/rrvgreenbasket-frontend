import {
  ProcurementItem,
  ProcurementStatus,
  SupplierOrder,
  PendingProcurementItem,
  CategoryProcurementSummary,
  ProcurementSummary,
} from "@/types";
import { getSystemDateFormatted, getOffsetDateFormatted } from "@/utils";

// Base 35 items for 26 Aug 2025 (matching PDF page 5 design exactly)
export const MOCK_PROCUREMENT_ITEMS_26_AUG: ProcurementItem[] = [
  {
    id: "PROC-001",
    productName: "Tomato",
    category: "Fruits",
    requiredQty: 120,
    procuredQty: 100,
    pendingQty: 20,
    unit: "kg",
    supplier: "Raju Traders",
    status: "Partial",
    estimatedCost: 2400,
    priority: "High Priority",
    date: "26 Aug 2025",
    notes: "Grade A Hybrid Red Tomatoes for morning deliveries",
  },
  {
    id: "PROC-002",
    productName: "Onion",
    category: "Vegetables",
    requiredQty: 80,
    procuredQty: 80,
    pendingQty: 0,
    unit: "kg",
    supplier: "Fresh Farms",
    status: "Completed",
    estimatedCost: 1600,
    priority: "Medium",
    date: "26 Aug 2025",
    notes: "Medium Nasik Red Onion, properly cured",
  },
  {
    id: "PROC-003",
    productName: "Potato",
    category: "Vegetables",
    requiredQty: 100,
    procuredQty: 60,
    pendingQty: 40,
    unit: "kg",
    supplier: "Sri Sai Supplies",
    status: "Partial",
    estimatedCost: 1800,
    priority: "High Priority",
    date: "26 Aug 2025",
    notes: "Jyoti variety, clean surface with no sprouts",
  },
  {
    id: "PROC-004",
    productName: "Carrot",
    category: "Vegetables",
    requiredQty: 60,
    procuredQty: 60,
    pendingQty: 0,
    unit: "kg",
    supplier: "Raju Traders",
    status: "Completed",
    estimatedCost: 1500,
    priority: "Medium",
    date: "26 Aug 2025",
    notes: "Fresh Ooty carrots, sweet and washed",
  },
  {
    id: "PROC-005",
    productName: "Spinach",
    category: "Leafy",
    requiredQty: 40,
    procuredQty: 20,
    pendingQty: 20,
    unit: "bunch",
    supplier: "Green Valley",
    status: "Partial",
    estimatedCost: 800,
    priority: "Medium",
    date: "26 Aug 2025",
    notes: "Tender Palak with vibrant roots and no yellow leaves",
  },
  {
    id: "PROC-006",
    productName: "Coriander",
    category: "Leafy",
    requiredQty: 30,
    procuredQty: 0,
    pendingQty: 30,
    unit: "bunch",
    supplier: "Local Market",
    status: "Not Started",
    estimatedCost: 600,
    priority: "Medium",
    date: "26 Aug 2025",
    notes: "Aromatic Desi Kothimeera bunches",
  },
  {
    id: "PROC-007",
    productName: "Green Chilli",
    category: "Vegetables",
    requiredQty: 25,
    procuredQty: 25,
    pendingQty: 0,
    unit: "kg",
    supplier: "Fresh Farms",
    status: "Completed",
    estimatedCost: 750,
    priority: "Low",
    date: "26 Aug 2025",
    notes: "Spicy dark green G4 chillies",
  },
  {
    id: "PROC-008",
    productName: "Lemon",
    category: "Fruits",
    requiredQty: 40,
    procuredQty: 30,
    pendingQty: 10,
    unit: "kg",
    supplier: "Local Market",
    status: "Partial",
    estimatedCost: 1200,
    priority: "Medium",
    date: "26 Aug 2025",
    notes: "Juicy yellow Kagzi lemons",
  },
  {
    id: "PROC-009",
    productName: "Ginger",
    category: "Vegetables",
    requiredQty: 20,
    procuredQty: 0,
    pendingQty: 20,
    unit: "kg",
    supplier: "Sri Sai Supplies",
    status: "Not Started",
    estimatedCost: 1000,
    priority: "Medium",
    date: "26 Aug 2025",
    notes: "Fresh old-crop Adrak, washed without excess soil",
  },
  {
    id: "PROC-010",
    productName: "Capsicum",
    category: "Vegetables",
    requiredQty: 25,
    procuredQty: 10,
    pendingQty: 15,
    unit: "kg",
    supplier: "Raju Traders",
    status: "Partial",
    estimatedCost: 1250,
    priority: "Medium",
    date: "26 Aug 2025",
    notes: "Crisp blocky green bell peppers",
  },
  {
    id: "PROC-011",
    productName: "Cauliflower",
    category: "Vegetables",
    requiredQty: 35,
    procuredQty: 35,
    pendingQty: 0,
    unit: "kg",
    supplier: "Fresh Farms",
    status: "Completed",
    estimatedCost: 1050,
    priority: "Medium",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-012",
    productName: "Cabbage",
    category: "Vegetables",
    requiredQty: 30,
    procuredQty: 30,
    pendingQty: 0,
    unit: "kg",
    supplier: "Fresh Farms",
    status: "Completed",
    estimatedCost: 600,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-013",
    productName: "Brinjal (Vankaya)",
    category: "Vegetables",
    requiredQty: 25,
    procuredQty: 15,
    pendingQty: 10,
    unit: "kg",
    supplier: "Sri Sai Supplies",
    status: "Partial",
    estimatedCost: 750,
    priority: "Medium",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-014",
    productName: "Ladies Finger (Bhindi)",
    category: "Vegetables",
    requiredQty: 25,
    procuredQty: 25,
    pendingQty: 0,
    unit: "kg",
    supplier: "Raju Traders",
    status: "Completed",
    estimatedCost: 875,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-015",
    productName: "Bottle Gourd (Sorakaya)",
    category: "Vegetables",
    requiredQty: 20,
    procuredQty: 20,
    pendingQty: 0,
    unit: "kg",
    supplier: "Green Valley",
    status: "Completed",
    estimatedCost: 500,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-016",
    productName: "Bitter Gourd (Kakarakaya)",
    category: "Vegetables",
    requiredQty: 15,
    procuredQty: 10,
    pendingQty: 5,
    unit: "kg",
    supplier: "Local Market",
    status: "Partial",
    estimatedCost: 600,
    priority: "Medium",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-017",
    productName: "Ridge Gourd (Beerakaya)",
    category: "Vegetables",
    requiredQty: 18,
    procuredQty: 18,
    pendingQty: 0,
    unit: "kg",
    supplier: "Green Valley",
    status: "Completed",
    estimatedCost: 720,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-018",
    productName: "Beetroot",
    category: "Vegetables",
    requiredQty: 20,
    procuredQty: 20,
    pendingQty: 0,
    unit: "kg",
    supplier: "Raju Traders",
    status: "Completed",
    estimatedCost: 700,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-019",
    productName: "Radish (Mooli)",
    category: "Vegetables",
    requiredQty: 15,
    procuredQty: 15,
    pendingQty: 0,
    unit: "kg",
    supplier: "Local Market",
    status: "Completed",
    estimatedCost: 450,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-020",
    productName: "Cucumber",
    category: "Vegetables",
    requiredQty: 25,
    procuredQty: 25,
    pendingQty: 0,
    unit: "kg",
    supplier: "Fresh Farms",
    status: "Completed",
    estimatedCost: 625,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-021",
    productName: "Sweet Potato",
    category: "Vegetables",
    requiredQty: 12,
    procuredQty: 12,
    pendingQty: 0,
    unit: "kg",
    supplier: "Sri Sai Supplies",
    status: "Completed",
    estimatedCost: 480,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-022",
    productName: "Cluster Beans (Goru Chikkudu)",
    category: "Vegetables",
    requiredQty: 10,
    procuredQty: 0,
    pendingQty: 10,
    unit: "kg",
    supplier: "Local Market",
    status: "Not Started",
    estimatedCost: 400,
    priority: "Medium",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-023",
    productName: "Garlic (Vellulli)",
    category: "Vegetables",
    requiredQty: 15,
    procuredQty: 15,
    pendingQty: 0,
    unit: "kg",
    supplier: "Raju Traders",
    status: "Completed",
    estimatedCost: 1500,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-024",
    productName: "Fresh Methi (Menthi Kura)",
    category: "Leafy",
    requiredQty: 25,
    procuredQty: 25,
    pendingQty: 0,
    unit: "bunch",
    supplier: "Green Valley",
    status: "Completed",
    estimatedCost: 500,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-025",
    productName: "Curry Leaves (Karivepaku)",
    category: "Leafy",
    requiredQty: 20,
    procuredQty: 20,
    pendingQty: 0,
    unit: "bunch",
    supplier: "Local Market",
    status: "Completed",
    estimatedCost: 200,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-026",
    productName: "Mint Leaves (Pudina)",
    category: "Leafy",
    requiredQty: 20,
    procuredQty: 10,
    pendingQty: 10,
    unit: "bunch",
    supplier: "Green Valley",
    status: "Partial",
    estimatedCost: 300,
    priority: "Medium",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-027",
    productName: "Apple (Shimla)",
    category: "Fruits",
    requiredQty: 30,
    procuredQty: 30,
    pendingQty: 0,
    unit: "kg",
    supplier: "Sri Sai Supplies",
    status: "Completed",
    estimatedCost: 3600,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-028",
    productName: "Pomegranate (Anar)",
    category: "Fruits",
    requiredQty: 20,
    procuredQty: 15,
    pendingQty: 5,
    unit: "kg",
    supplier: "Raju Traders",
    status: "Partial",
    estimatedCost: 2400,
    priority: "Medium",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-029",
    productName: "Sweet Lime (Mosambi)",
    category: "Fruits",
    requiredQty: 25,
    procuredQty: 25,
    pendingQty: 0,
    unit: "kg",
    supplier: "Fresh Farms",
    status: "Completed",
    estimatedCost: 1250,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-030",
    productName: "Guava (Amrud)",
    category: "Fruits",
    requiredQty: 15,
    procuredQty: 15,
    pendingQty: 0,
    unit: "kg",
    supplier: "Local Market",
    status: "Completed",
    estimatedCost: 600,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-031",
    productName: "Watermelon",
    category: "Fruits",
    requiredQty: 40,
    procuredQty: 40,
    pendingQty: 0,
    unit: "kg",
    supplier: "Fresh Farms",
    status: "Completed",
    estimatedCost: 800,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-032",
    productName: "Banana (Yellaki)",
    category: "Fruits",
    requiredQty: 30,
    procuredQty: 30,
    pendingQty: 0,
    unit: "dozen",
    supplier: "Local Market",
    status: "Completed",
    estimatedCost: 1200,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-033",
    productName: "Fresh Coconut",
    category: "Others",
    requiredQty: 30,
    procuredQty: 30,
    pendingQty: 0,
    unit: "pcs",
    supplier: "Local Market",
    status: "Completed",
    estimatedCost: 900,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-034",
    productName: "Raw Banana (Aratikaya)",
    category: "Others",
    requiredQty: 15,
    procuredQty: 15,
    pendingQty: 0,
    unit: "kg",
    supplier: "Green Valley",
    status: "Completed",
    estimatedCost: 450,
    priority: "Low",
    date: "26 Aug 2025",
  },
  {
    id: "PROC-035",
    productName: "Spices & Dry Items",
    category: "Others",
    requiredQty: 10,
    procuredQty: 0,
    pendingQty: 10,
    unit: "kg",
    supplier: "Sri Sai Supplies",
    status: "Not Started",
    estimatedCost: 800,
    priority: "Medium",
    date: "26 Aug 2025",
  },
];

// Items for 25 Aug 2025 (Today's fulfilled morning procurement)
export const MOCK_PROCUREMENT_ITEMS_25_AUG: ProcurementItem[] = MOCK_PROCUREMENT_ITEMS_26_AUG.map(
  (item, idx) => {
    // 25 Aug: Almost everything procured (92% completion)
    const isPending = idx === 5 || idx === 8; // Only Coriander & Ginger had small pending
    const requiredQty = Math.round(item.requiredQty * 1.1); // Slightly higher volume today
    const procuredQty = isPending ? Math.round(requiredQty * 0.7) : requiredQty;
    const pendingQty = requiredQty - procuredQty;
    const status = pendingQty === 0 ? "Completed" : "Partial";

    return {
      ...item,
      id: `PROC-25-${String(idx + 1).padStart(3, "0")}`,
      date: "25 Aug 2025",
      requiredQty,
      procuredQty,
      pendingQty,
      status,
      estimatedCost: Math.round(item.estimatedCost * 1.08),
    };
  }
);

// Items for 24 Aug 2025 (Yesterday - 100% completed)
export const MOCK_PROCUREMENT_ITEMS_24_AUG: ProcurementItem[] = MOCK_PROCUREMENT_ITEMS_26_AUG.slice(
  0,
  32
).map((item, idx) => {
  const requiredQty = Math.round(item.requiredQty * 0.92);
  return {
    ...item,
    id: `PROC-24-${String(idx + 1).padStart(3, "0")}`,
    date: "24 Aug 2025",
    requiredQty,
    procuredQty: requiredQty,
    pendingQty: 0,
    status: "Completed" as const,
    estimatedCost: Math.round(item.estimatedCost * 0.95),
  };
});

// Items for 23 Aug 2025 (100% completed)
export const MOCK_PROCUREMENT_ITEMS_23_AUG: ProcurementItem[] = MOCK_PROCUREMENT_ITEMS_26_AUG.slice(
  0,
  30
).map((item, idx) => {
  const requiredQty = Math.round(item.requiredQty * 0.88);
  return {
    ...item,
    id: `PROC-23-${String(idx + 1).padStart(3, "0")}`,
    date: "23 Aug 2025",
    requiredQty,
    procuredQty: requiredQty,
    pendingQty: 0,
    status: "Completed" as const,
    estimatedCost: Math.round(item.estimatedCost * 0.9),
  };
});

// Items for 22 Aug 2025 (100% completed)
export const MOCK_PROCUREMENT_ITEMS_22_AUG: ProcurementItem[] = MOCK_PROCUREMENT_ITEMS_26_AUG.slice(
  0,
  28
).map((item, idx) => {
  const requiredQty = Math.round(item.requiredQty * 0.82);
  return {
    ...item,
    id: `PROC-22-${String(idx + 1).padStart(3, "0")}`,
    date: "22 Aug 2025",
    requiredQty,
    procuredQty: requiredQty,
    pendingQty: 0,
    status: "Completed" as const,
    estimatedCost: Math.round(item.estimatedCost * 0.85),
  };
});

// Default exported dataset (default 26 Aug 2025)
export const MOCK_PROCUREMENT_ITEMS = MOCK_PROCUREMENT_ITEMS_26_AUG;

export const MOCK_PROCUREMENT_SUMMARY: ProcurementSummary = {
  totalItems: 35,
  totalQuantity: 420,
  productsCount: 18,
  estimatedCost: 28450,
  procurementPercentage: 60,
  completedItemsCount: 21,
  totalItemsCount: 35,
};

export const MOCK_CATEGORY_BREAKDOWN: CategoryProcurementSummary[] = [
  {
    category: "Vegetables",
    count: 18,
    percentage: 51,
    color: "#00875a",
  },
  {
    category: "Fruits",
    count: 8,
    percentage: 23,
    color: "#eab308",
  },
  {
    category: "Leafy Greens",
    count: 5,
    percentage: 14,
    color: "#22c55e",
  },
  {
    category: "Others",
    count: 4,
    percentage: 12,
    color: "#ef4444",
  },
];

export const MOCK_SUPPLIER_ORDERS: SupplierOrder[] = [
  {
    id: "#SUP000123",
    supplierName: "Raju Traders",
    date: "25 Aug 10:15 AM",
    itemCount: 12,
    totalAmount: 8450,
    status: "Ordered",
  },
  {
    id: "#SUP000122",
    supplierName: "Fresh Farms",
    date: "25 Aug 09:30 AM",
    itemCount: 8,
    totalAmount: 4200,
    status: "Received",
  },
  {
    id: "#SUP000121",
    supplierName: "Sri Sai Supplies",
    date: "24 Aug 05:20 PM",
    itemCount: 10,
    totalAmount: 6800,
    status: "Partially Received",
  },
];

export const MOCK_PENDING_ITEMS: PendingProcurementItem[] = [
  {
    id: "PEND-01",
    productName: "Tomato",
    pendingQty: 20,
    unit: "kg",
    priority: "High Priority",
  },
  {
    id: "PEND-02",
    productName: "Potato",
    pendingQty: 40,
    unit: "kg",
    priority: "High Priority",
  },
  {
    id: "PEND-03",
    productName: "Spinach",
    pendingQty: 20,
    unit: "bunches",
    priority: "Medium",
  },
  {
    id: "PEND-04",
    productName: "Coriander",
    pendingQty: 30,
    unit: "bunches",
    priority: "Medium",
  },
  {
    id: "PEND-05",
    productName: "Ginger",
    pendingQty: 20,
    unit: "kg",
    priority: "Medium",
  },
];

export interface DateProcurementData {
  date: string;
  items: ProcurementItem[];
  summary: ProcurementSummary;
  categoryBreakdown: CategoryProcurementSummary[];
  supplierOrders: SupplierOrder[];
  pendingItems: PendingProcurementItem[];
}

/**
 * Returns date-specific procurement data dynamically for ANY selected date
 */
export function getProcurementDataByDate(rawDate?: string): DateProcurementData {
  const d = (rawDate || "").trim();

  // Normalize date string (Default: Present Date)
  let targetDate = "26 Oct 2026";
  const systemToday = getSystemDateFormatted();
  const systemTomorrow = getOffsetDateFormatted(1);
  const systemYesterday = getOffsetDateFormatted(-1);

  if (
    d.includes("26 Oct") ||
    d.toLowerCase() === "today" ||
    d.toLowerCase().includes("today") ||
    d === systemToday
  ) {
    targetDate = "26 Oct 2026";
  } else if (
    d.includes("27 Oct") ||
    d.toLowerCase() === "tomorrow" ||
    d.toLowerCase().includes("tomorrow") ||
    d === systemTomorrow
  ) {
    targetDate = "27 Oct 2026";
  } else if (
    d.includes("25 Oct") ||
    d.toLowerCase() === "yesterday" ||
    d.toLowerCase().includes("yesterday") ||
    d === systemYesterday
  ) {
    targetDate = "25 Oct 2026";
  } else if (d.includes("24 Oct")) {
    targetDate = "24 Oct 2026";
  } else if (d.includes("23 Oct")) {
    targetDate = "23 Oct 2026";
  } else if (d.includes("26 Aug")) {
    targetDate = "26 Aug 2025";
  } else if (d.includes("25 Aug")) {
    targetDate = "25 Aug 2025";
  } else if (d.includes("24 Aug")) {
    targetDate = "24 Aug 2025";
  } else if (rawDate) {
    targetDate = rawDate;
  }

  // 1. TODAY (Present Date - 26 Oct 2026)
  if (targetDate === "26 Oct 2026" || targetDate === "26 Aug 2025") {
    const items = MOCK_PROCUREMENT_ITEMS_26_AUG.map((item) => ({
      ...item,
      date: targetDate,
    }));
    return {
      date: targetDate,
      items,
      summary: {
        totalItems: 35,
        totalQuantity: 420,
        productsCount: 18,
        estimatedCost: 28450,
        procurementPercentage: 60,
        completedItemsCount: 21,
        totalItemsCount: 35,
      },
      categoryBreakdown: MOCK_CATEGORY_BREAKDOWN,
      supplierOrders: [
        {
          id: "#SUP000123",
          supplierName: "Raju Traders",
          date: `${targetDate.split(" ")[0]} ${targetDate.split(" ")[1]} 10:15 AM`,
          itemCount: 12,
          totalAmount: 8450,
          status: "Ordered" as const,
        },
        {
          id: "#SUP000122",
          supplierName: "Fresh Farms",
          date: `${targetDate.split(" ")[0]} ${targetDate.split(" ")[1]} 09:30 AM`,
          itemCount: 8,
          totalAmount: 4200,
          status: "Received" as const,
        },
        {
          id: "#SUP000121",
          supplierName: "Sri Sai Supplies",
          date: `25 Oct 05:20 PM`,
          itemCount: 10,
          totalAmount: 6800,
          status: "Partially Received" as const,
        },
      ],
      pendingItems: MOCK_PENDING_ITEMS,
    };
  }

  // 2. TOMORROW (Planning for Next Morning - 27 Oct 2026)
  if (targetDate === "27 Oct 2026") {
    const items = MOCK_PROCUREMENT_ITEMS_26_AUG.map((item, idx) => ({
      ...item,
      id: `PROC-27-${String(idx + 1).padStart(3, "0")}`,
      date: "27 Oct 2026",
      procuredQty: Math.round(item.requiredQty * 0.4),
      pendingQty: Math.round(item.requiredQty * 0.6),
      status: (item.requiredQty * 0.4 === 0 ? "Not Started" : "Partial") as ProcurementStatus,
    }));
    return {
      date: "27 Oct 2026",
      items,
      summary: {
        totalItems: 35,
        totalQuantity: 420,
        productsCount: 18,
        estimatedCost: 28450,
        procurementPercentage: 40,
        completedItemsCount: 14,
        totalItemsCount: 35,
      },
      categoryBreakdown: MOCK_CATEGORY_BREAKDOWN,
      supplierOrders: [
        {
          id: "#SUP000125",
          supplierName: "Raju Traders",
          date: `26 Oct 10:00 PM`,
          itemCount: 14,
          totalAmount: 9200,
          status: "Ordered" as const,
        },
        {
          id: "#SUP000124",
          supplierName: "Fresh Farms",
          date: `26 Oct 09:45 PM`,
          itemCount: 8,
          totalAmount: 4800,
          status: "Ordered" as const,
        },
      ],
      pendingItems: [
        { id: "PEND-27-01", productName: "Tomato", pendingQty: 45, unit: "kg", priority: "High Priority" },
        { id: "PEND-27-02", productName: "Potato", pendingQty: 60, unit: "kg", priority: "High Priority" },
        { id: "PEND-27-03", productName: "Onion", pendingQty: 50, unit: "kg", priority: "Medium" },
      ],
    };
  }

  // 3. YESTERDAY (Fulfilled History - 25 Oct 2026 / 24 Aug 2025)
  if (targetDate === "25 Oct 2026" || targetDate === "24 Aug 2025" || targetDate === "25 Aug 2025") {
    const items = MOCK_PROCUREMENT_ITEMS_24_AUG.map((item, idx) => ({
      ...item,
      id: `PROC-YEST-${String(idx + 1).padStart(3, "0")}`,
      date: targetDate,
      procuredQty: item.requiredQty,
      pendingQty: 0,
      status: "Completed" as const,
    }));
    return {
      date: targetDate,
      items,
      summary: {
        totalItems: 32,
        totalQuantity: 390,
        productsCount: 17,
        estimatedCost: 26800,
        procurementPercentage: 100,
        completedItemsCount: 32,
        totalItemsCount: 32,
      },
      categoryBreakdown: [
        { category: "Vegetables", count: 16, percentage: 50, color: "#00875a" },
        { category: "Fruits", count: 7, percentage: 22, color: "#eab308" },
        { category: "Leafy Greens", count: 5, percentage: 16, color: "#22c55e" },
        { category: "Others", count: 4, percentage: 12, color: "#ef4444" },
      ],
      supplierOrders: [
        {
          id: "#SUP000115",
          supplierName: "Raju Traders",
          date: `${targetDate.split(" ")[0]} ${targetDate.split(" ")[1]} 06:00 AM`,
          itemCount: 12,
          totalAmount: 8900,
          status: "Received" as const,
        },
        {
          id: "#SUP000114",
          supplierName: "Fresh Farms",
          date: `${targetDate.split(" ")[0]} ${targetDate.split(" ")[1]} 05:30 AM`,
          itemCount: 9,
          totalAmount: 5400,
          status: "Received" as const,
        },
        {
          id: "#SUP000113",
          supplierName: "Sri Sai Supplies",
          date: `${targetDate.split(" ")[0]} ${targetDate.split(" ")[1]} 05:00 AM`,
          itemCount: 11,
          totalAmount: 12500,
          status: "Received" as const,
        },
      ],
      pendingItems: [] as PendingProcurementItem[],
    };
  }

  // 4. 24 Oct 2026
  if (targetDate === "24 Oct 2026") {
    const items = MOCK_PROCUREMENT_ITEMS_24_AUG.map((item, idx) => ({
      ...item,
      id: `PROC-24-${String(idx + 1).padStart(3, "0")}`,
      date: "24 Oct 2026",
      procuredQty: item.requiredQty,
      pendingQty: 0,
      status: "Completed" as const,
    }));
    return {
      date: "24 Oct 2026",
      items,
      summary: {
        totalItems: 32,
        totalQuantity: 390,
        productsCount: 17,
        estimatedCost: 26800,
        procurementPercentage: 100,
        completedItemsCount: 32,
        totalItemsCount: 32,
      },
      categoryBreakdown: [
        { category: "Vegetables", count: 16, percentage: 50, color: "#00875a" },
        { category: "Fruits", count: 7, percentage: 22, color: "#eab308" },
        { category: "Leafy Greens", count: 5, percentage: 16, color: "#22c55e" },
        { category: "Others", count: 4, percentage: 12, color: "#ef4444" },
      ],
      supplierOrders: [
        {
          id: "#SUP000115",
          supplierName: "Raju Traders",
          date: "24 Oct 06:00 AM",
          itemCount: 12,
          totalAmount: 8900,
          status: "Received" as const,
        },
        {
          id: "#SUP000114",
          supplierName: "Fresh Farms",
          date: "24 Oct 05:30 AM",
          itemCount: 9,
          totalAmount: 5400,
          status: "Received" as const,
        },
      ],
      pendingItems: [] as PendingProcurementItem[],
    };
  }

  // 5. 23 Oct 2026
  if (targetDate === "23 Oct 2026") {
    const items = MOCK_PROCUREMENT_ITEMS_23_AUG.map((item, idx) => ({
      ...item,
      id: `PROC-23-${String(idx + 1).padStart(3, "0")}`,
      date: "23 Oct 2026",
      procuredQty: item.requiredQty,
      pendingQty: 0,
      status: "Completed" as const,
    }));
    return {
      date: "23 Oct 2026",
      items,
      summary: {
        totalItems: 30,
        totalQuantity: 360,
        productsCount: 16,
        estimatedCost: 24150,
        procurementPercentage: 100,
        completedItemsCount: 30,
        totalItemsCount: 30,
      },
      categoryBreakdown: [
        { category: "Vegetables", count: 15, percentage: 50, color: "#00875a" },
        { category: "Fruits", count: 7, percentage: 23, color: "#eab308" },
        { category: "Leafy Greens", count: 4, percentage: 14, color: "#22c55e" },
        { category: "Others", count: 4, percentage: 13, color: "#ef4444" },
      ],
      supplierOrders: [
        {
          id: "#SUP000110",
          supplierName: "Raju Traders",
          date: "23 Oct 06:10 AM",
          itemCount: 10,
          totalAmount: 7500,
          status: "Received" as const,
        },
      ],
      pendingItems: [] as PendingProcurementItem[],
    };
  }

  if (targetDate === "24 Aug 2025") {
    return {
      date: "24 Aug 2025",
      items: MOCK_PROCUREMENT_ITEMS_24_AUG,
      summary: {
        totalItems: 32,
        totalQuantity: 390,
        productsCount: 17,
        estimatedCost: 26800,
        procurementPercentage: 100,
        completedItemsCount: 32,
        totalItemsCount: 32,
      },
      categoryBreakdown: [
        { category: "Vegetables", count: 16, percentage: 50, color: "#00875a" },
        { category: "Fruits", count: 7, percentage: 22, color: "#eab308" },
        { category: "Leafy Greens", count: 5, percentage: 16, color: "#22c55e" },
        { category: "Others", count: 4, percentage: 12, color: "#ef4444" },
      ],
      supplierOrders: [
        {
          id: "#SUP000115",
          supplierName: "Raju Traders",
          date: "24 Aug 06:00 AM",
          itemCount: 12,
          totalAmount: 8900,
          status: "Received",
        },
        {
          id: "#SUP000114",
          supplierName: "Fresh Farms",
          date: "24 Aug 05:30 AM",
          itemCount: 9,
          totalAmount: 5400,
          status: "Received",
        },
        {
          id: "#SUP000113",
          supplierName: "Sri Sai Supplies",
          date: "23 Aug 11:00 PM",
          itemCount: 11,
          totalAmount: 12500,
          status: "Received",
        },
      ],
      pendingItems: [],
    };
  }

  if (targetDate === "23 Aug 2025") {
    return {
      date: "23 Aug 2025",
      items: MOCK_PROCUREMENT_ITEMS_23_AUG,
      summary: {
        totalItems: 30,
        totalQuantity: 360,
        productsCount: 16,
        estimatedCost: 24150,
        procurementPercentage: 100,
        completedItemsCount: 30,
        totalItemsCount: 30,
      },
      categoryBreakdown: [
        { category: "Vegetables", count: 15, percentage: 50, color: "#00875a" },
        { category: "Fruits", count: 7, percentage: 23, color: "#eab308" },
        { category: "Leafy Greens", count: 4, percentage: 14, color: "#22c55e" },
        { category: "Others", count: 4, percentage: 13, color: "#ef4444" },
      ],
      supplierOrders: [
        {
          id: "#SUP000110",
          supplierName: "Raju Traders",
          date: "23 Aug 06:10 AM",
          itemCount: 10,
          totalAmount: 7500,
          status: "Received",
        },
        {
          id: "#SUP000109",
          supplierName: "Green Valley",
          date: "23 Aug 05:40 AM",
          itemCount: 8,
          totalAmount: 4800,
          status: "Received",
        },
        {
          id: "#SUP000108",
          supplierName: "Fresh Farms",
          date: "22 Aug 10:45 PM",
          itemCount: 12,
          totalAmount: 11850,
          status: "Received",
        },
      ],
      pendingItems: [],
    };
  }

  // Dynamic deterministic generator for any other calendar date
  const hash = targetDate.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const totalItemsCount = 28 + (hash % 8); // 28 to 35 items
  const totalWeight = 340 + (hash % 110); // 340 to 450 kg
  const estimatedCost = 22000 + (hash % 9000);
  const percentage = 100; // past dates completed

  const customItems: ProcurementItem[] = MOCK_PROCUREMENT_ITEMS_26_AUG.slice(
    0,
    totalItemsCount
  ).map((item, idx) => ({
    ...item,
    id: `PROC-${targetDate.replace(/\s+/g, "")}-${String(idx + 1).padStart(3, "0")}`,
    date: targetDate,
    procuredQty: item.requiredQty,
    pendingQty: 0,
    status: "Completed" as const,
  }));

  return {
    date: targetDate,
    items: customItems,
    summary: {
      totalItems: totalItemsCount,
      totalQuantity: totalWeight,
      productsCount: 16 + (hash % 4),
      estimatedCost,
      procurementPercentage: percentage,
      completedItemsCount: totalItemsCount,
      totalItemsCount: totalItemsCount,
    },
    categoryBreakdown: [
      { category: "Vegetables", count: Math.round(totalItemsCount * 0.5), percentage: 50, color: "#00875a" },
      { category: "Fruits", count: Math.round(totalItemsCount * 0.23), percentage: 23, color: "#eab308" },
      { category: "Leafy Greens", count: Math.round(totalItemsCount * 0.15), percentage: 15, color: "#22c55e" },
      { category: "Others", count: Math.round(totalItemsCount * 0.12), percentage: 12, color: "#ef4444" },
    ],
    supplierOrders: [
      {
        id: `#SUP-${(hash % 900) + 100}`,
        supplierName: "Raju Traders",
        date: `${targetDate} 06:15 AM`,
        itemCount: 12,
        totalAmount: Math.round(estimatedCost * 0.45),
        status: "Received" as const,
      },
      {
        id: `#SUP-${(hash % 900) + 101}`,
        supplierName: "Fresh Farms",
        date: `${targetDate} 05:50 AM`,
        itemCount: 8,
        totalAmount: Math.round(estimatedCost * 0.3),
        status: "Received" as const,
      },
      {
        id: `#SUP-${(hash % 900) + 102}`,
        supplierName: "Sri Sai Supplies",
        date: `${targetDate} 05:20 AM`,
        itemCount: 10,
        totalAmount: Math.round(estimatedCost * 0.25),
        status: "Received" as const,
      },
    ],
    pendingItems: [] as PendingProcurementItem[],
  };
}
