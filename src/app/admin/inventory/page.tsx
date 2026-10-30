"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Breadcrumbs } from "@/components/layout";
import {
  InventoryStatsCards,
  InventoryFiltersBar,
  InventoryTable,
  StockAdjustmentModal,
} from "@/components/inventory";
import { MASTER_PRODUCTS_DATA } from "@/data";
import { getSavedSettings } from "@/data/shared-store";
import { Product } from "@/types";
import { StoreSettings } from "@/types/settings";
import { exportToCsv } from "@/utils/export-csv";

export default function InventoryManagementPage() {
  const [stockItems, setStockItems] = useState<Product[]>(MASTER_PRODUCTS_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);

  // Cross-page sync with Store Settings
  useEffect(() => {
    const settings = getSavedSettings();
    if (settings.lowStockThreshold) {
      setLowStockThreshold(settings.lowStockThreshold);
    }

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<StoreSettings>;
      if (customEvent.detail?.lowStockThreshold) {
        setLowStockThreshold(customEvent.detail.lowStockThreshold);
      }
    };

    window.addEventListener("rrv:settings:updated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("rrv:settings:updated", handleSettingsUpdate);
    };
  }, []);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modals
  const [selectedProductForInward, setSelectedProductForInward] = useState<Product | null>(null);
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);

  // Stats calculation
  const stats = useMemo(() => {
    const totalSkus = stockItems.length;
    const inStockCount = stockItems.filter((i) => i.stock > (i.minStock || lowStockThreshold)).length;
    const lowStockCount = stockItems.filter(
      (i) => i.stock <= (i.minStock || lowStockThreshold) && i.stock > 0
    ).length;
    const outOfStockCount = stockItems.filter((i) => i.stock === 0).length;
    const totalValuation = stockItems.reduce((acc, i) => acc + i.stock * i.price, 0);

    return { totalSkus, inStockCount, lowStockCount, outOfStockCount, totalValuation };
  }, [stockItems, lowStockThreshold]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return stockItems.filter((item) => {
      // Category
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;

      // Status
      if (selectedStatus === "In Stock" && item.stock <= (item.minStock || lowStockThreshold)) return false;
      if (
        selectedStatus === "Low Stock" &&
        !(item.stock <= (item.minStock || lowStockThreshold) && item.stock > 0)
      ) {
        return false;
      }
      if (selectedStatus === "Out of Stock" && item.stock !== 0) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesExcel = (item.excelName || "").toLowerCase().includes(q);
        const matchesCode = (item.erpCode || "").toLowerCase().includes(q);
        if (!matchesName && !matchesExcel && !matchesCode) return false;
      }

      return true;
    });
  }, [stockItems, selectedCategory, selectedStatus, searchQuery, lowStockThreshold]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Handlers
  const handleAdjustStock = (productId: string, delta: number) => {
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newStock = Math.max(0, item.stock + delta);
          const min = item.minStock || lowStockThreshold;
          const status = newStock === 0 ? "Out of Stock" : newStock <= min ? "Low Stock" : "In Stock";
          return { ...item, stock: newStock, status };
        }
        return item;
      })
    );
  };

  const handleOpenInward = (product: Product) => {
    setSelectedProductForInward(product);
    setIsInwardModalOpen(true);
  };

  const handleOpenGeneralInward = () => {
    setSelectedProductForInward(null);
    setIsInwardModalOpen(true);
  };

  const handleConfirmInward = (
    productId: string,
    addedQty: number,
    _supplier: string,
    _notes?: string
  ) => {
    handleAdjustStock(productId, addedQty);
  };

  const handleBatchInward = (
    items: { productId: string; qty: number }[],
    _supplier: string,
    _notes?: string
  ) => {
    setStockItems((prev) =>
      prev.map((item) => {
        const found = items.find((it) => it.productId === item.id);
        if (found) {
          const newStock = Math.max(0, item.stock + found.qty);
          const min = item.minStock || 10;
          const status = newStock === 0 ? "Out of Stock" : newStock <= min ? "Low Stock" : "In Stock";
          return { ...item, stock: newStock, status };
        }
        return item;
      })
    );
  };

  const handleExportCsv = () => {
    const columns = [
      { header: "Product Name", accessor: (item: Product) => item.excelName || item.name },
      { header: "ERP Code", accessor: (item: Product) => item.erpCode || item.id },
      { header: "Category", accessor: (item: Product) => item.category },
      { header: "Unit", accessor: (item: Product) => item.unit },
      { header: "Current Stock", accessor: (item: Product) => item.stock },
      { header: "Min Stock Alert", accessor: (item: Product) => item.minStock || 10 },
      { header: "Status", accessor: (item: Product) => item.status },
      { header: "Rate (₹)", accessor: (item: Product) => item.price.toFixed(2) },
    ];

    exportToCsv("RRV_Green_Basket_Inventory_Stock_Report.csv", columns, filteredItems);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Inventory" },
        ]}
      />

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Warehouse Inventory &amp; Stock Levels
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Live vegetable stock monitoring, minimum threshold alerts, and inward batch receipt
        </p>
      </div>

      {/* KPIs */}
      <InventoryStatsCards
        totalSkus={stats.totalSkus}
        inStockCount={stats.inStockCount}
        lowStockCount={stats.lowStockCount}
        outOfStockCount={stats.outOfStockCount}
        totalValuation={stats.totalValuation}
      />

      {/* Filters Bar */}
      <InventoryFiltersBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(s) => {
          setSelectedStatus(s);
          setCurrentPage(1);
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(c) => {
          setSelectedCategory(c);
          setCurrentPage(1);
        }}
        onOpenStockInward={handleOpenGeneralInward}
        onExportCsv={handleExportCsv}
      />

      {/* Inventory Table */}
      <InventoryTable
        items={paginatedItems}
        onAdjustStock={handleAdjustStock}
        onOpenInwardModal={handleOpenInward}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredItems.length}
        onPageChange={setCurrentPage}
      />

      {/* Inward Modal */}
      <StockAdjustmentModal
        product={selectedProductForInward}
        allProducts={stockItems}
        isOpen={isInwardModalOpen}
        onClose={() => setIsInwardModalOpen(false)}
        onConfirmInward={handleConfirmInward}
        onConfirmBatchInward={handleBatchInward}
      />
    </div>
  );
}
