"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Breadcrumbs } from "@/components/layout";
import {
  InventoryStatsCards,
  InventoryFiltersBar,
  InventoryTable,
  StockInModal,
  StockOutModal,
  StockAdjustmentModal,
  InitializeStockModal,
  UpdateThresholdModal,
  CorrectInitialStockModal,
  StockMovementsDrawer,
  StockAlertsDrawer,
} from "@/components/inventory";
import { inventoryService } from "@/services/inventory.service";
import {
  EnrichedInventoryItem,
  InventoryOverviewStats,
  InventoryQueryParams,
} from "@/types";
import { exportToCsv } from "@/utils/export-csv";
import { AlertCircle } from "lucide-react";

export default function InventoryManagementPage() {
  // Live Data State
  const [items, setItems] = useState<EnrichedInventoryItem[]>([]);
  const [allCatalogueItems, setAllCatalogueItems] = useState<EnrichedInventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryOverviewStats>({
    totalItems: 0,
    initializedCount: 0,
    uninitializedCount: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    activeAlertsCount: 0,
    totalPhysicalQuantity: 0,
    totalAvailableQuantity: 0,
    totalReservedQuantity: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(0); // 0-based for Spring Boot
  const [pageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedUnit, setSelectedUnit] = useState("All");
  const [selectedInitialized, setSelectedInitialized] = useState("All");

  // Modals & Drawers State
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [stockInItem, setStockInItem] = useState<EnrichedInventoryItem | null>(null);

  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [stockOutItem, setStockOutItem] = useState<EnrichedInventoryItem | null>(null);

  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [adjustmentItem, setAdjustmentItem] = useState<EnrichedInventoryItem | null>(null);

  const [isInitializeOpen, setIsInitializeOpen] = useState(false);
  const [initializeItem, setInitializeItem] = useState<EnrichedInventoryItem | null>(null);

  const [isThresholdOpen, setIsThresholdOpen] = useState(false);
  const [thresholdItem, setThresholdItem] = useState<EnrichedInventoryItem | null>(null);

  const [isCorrectInitialOpen, setIsCorrectInitialOpen] = useState(false);
  const [correctInitialItem, setCorrectInitialItem] = useState<EnrichedInventoryItem | null>(null);

  const [isMovementsOpen, setIsMovementsOpen] = useState(false);
  const [movementsProduct, setMovementsProduct] = useState<{ id?: string; name?: string }>({});

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Fetch live inventory data
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams: InventoryQueryParams = {
        page: currentPage,
        size: pageSize,
      };

      if (searchQuery.trim()) {
        queryParams.search = searchQuery.trim();
      }
      if (selectedStatus !== "All") {
        queryParams.stockStatus = selectedStatus;
      }
      if (selectedUnit !== "All") {
        queryParams.unitOfMeasure = selectedUnit;
      }
      if (selectedInitialized !== "All") {
        queryParams.initialized = selectedInitialized === "true";
      }

      const res = await inventoryService.getEnrichedInventory(queryParams);
      setItems(res.items);
      setAllCatalogueItems(res.allItems || res.items);
      setStats(res.stats);
      setTotalElements(res.pageData.totalElements || res.items.length);
    } catch (err: any) {
      console.error("Failed to load enriched inventory:", err);
      setError(
        err.message || "Failed to load inventory records from backend service. Please check connection."
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedStatus, selectedUnit, selectedInitialized]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Handlers for Modals
  const handleOpenStockIn = (item?: EnrichedInventoryItem) => {
    setStockInItem(item || null);
    setIsStockInOpen(true);
  };

  const handleOpenStockOut = (item?: EnrichedInventoryItem) => {
    setStockOutItem(item || null);
    setIsStockOutOpen(true);
  };

  const handleOpenAdjustment = (item?: EnrichedInventoryItem) => {
    setAdjustmentItem(item || null);
    setIsAdjustmentOpen(true);
  };

  const handleOpenInitialize = (item?: EnrichedInventoryItem) => {
    setInitializeItem(item || null);
    setIsInitializeOpen(true);
  };

  const handleOpenThreshold = (item: EnrichedInventoryItem) => {
    setThresholdItem(item);
    setIsThresholdOpen(true);
  };

  const handleOpenCorrectInitial = (item: EnrichedInventoryItem) => {
    setCorrectInitialItem(item);
    setIsCorrectInitialOpen(true);
  };

  const handleOpenMovements = (item?: EnrichedInventoryItem) => {
    if (item) {
      const name =
        item.product?.name ||
        (item.product as any)?.excelName ||
        `Product (${item.inventory.productPublicId.slice(0, 8)}...)`;
      setMovementsProduct({ id: item.inventory.productPublicId, name });
    } else {
      setMovementsProduct({});
    }
    setIsMovementsOpen(true);
  };

  const handleOpenAlerts = () => {
    setIsAlertsOpen(true);
  };

  // CSV Export
  const handleExportCsv = () => {
    const columns = [
      {
        header: "Product Name",
        accessor: (item: EnrichedInventoryItem) =>
          item.product?.name || (item.product as any)?.excelName || `Product (${item.inventory.productPublicId})`,
      },
      {
        header: "Product UUID",
        accessor: (item: EnrichedInventoryItem) => item.inventory.productPublicId,
      },
      {
        header: "Category",
        accessor: (item: EnrichedInventoryItem) =>
          typeof item.product?.category === "string"
            ? item.product.category
            : (item.product?.category as any)?.name || "Produce",
      },
      {
        header: "Unit of Measure",
        accessor: (item: EnrichedInventoryItem) => item.inventory.unitOfMeasure,
      },
      {
        header: "Physical Quantity",
        accessor: (item: EnrichedInventoryItem) => item.inventory.physicalQuantity,
      },
      {
        header: "Reserved Quantity",
        accessor: (item: EnrichedInventoryItem) => item.inventory.reservedQuantity,
      },
      {
        header: "Available Quantity",
        accessor: (item: EnrichedInventoryItem) => item.inventory.availableQuantity,
      },
      {
        header: "Low Stock Threshold",
        accessor: (item: EnrichedInventoryItem) => item.inventory.lowStockThreshold,
      },
      {
        header: "Stock Status",
        accessor: (item: EnrichedInventoryItem) => item.inventory.stockStatus,
      },
      {
        header: "Initialized",
        accessor: (item: EnrichedInventoryItem) => (item.inventory.initialized ? "Yes" : "No"),
      },
    ];

    exportToCsv("RRV_Green_Basket_Live_Inventory_Report.csv", columns, items);
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
          Real-time stock monitoring, threshold alerts, stock-inward, adjustments &amp; audit history
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchInventory}
            className="px-3 py-1 bg-white border border-rose-300 rounded-xl font-bold hover:bg-rose-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Overview Statistics Cards */}
      <InventoryStatsCards stats={stats} />

      {/* Filters and Actions Bar */}
      <InventoryFiltersBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(0);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(s) => {
          setSelectedStatus(s);
          setCurrentPage(0);
        }}
        selectedUnit={selectedUnit}
        onUnitChange={(u) => {
          setSelectedUnit(u);
          setCurrentPage(0);
        }}
        selectedInitialized={selectedInitialized}
        onInitializedChange={(val) => {
          setSelectedInitialized(val);
          setCurrentPage(0);
        }}
        activeAlertsCount={stats.activeAlertsCount}
        onOpenStockIn={() => handleOpenStockIn()}
        onOpenStockOut={() => handleOpenStockOut()}
        onOpenAdjustment={() => handleOpenAdjustment()}
        onOpenInitialize={() => handleOpenInitialize()}
        onOpenMovements={() => handleOpenMovements()}
        onOpenAlerts={handleOpenAlerts}
        onExportCsv={handleExportCsv}
        onRefresh={fetchInventory}
        isLoading={isLoading}
      />

      {/* Inventory Table */}
      <InventoryTable
        items={items}
        isLoading={isLoading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalElements={totalElements}
        onPageChange={setCurrentPage}
        onStockIn={handleOpenStockIn}
        onStockOut={handleOpenStockOut}
        onAdjust={handleOpenAdjustment}
        onInitialize={handleOpenInitialize}
        onUpdateThreshold={handleOpenThreshold}
        onCorrectInitial={handleOpenCorrectInitial}
        onViewMovements={handleOpenMovements}
      />

      {/* Modals & Drawers */}
      <StockInModal
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
        selectedItem={stockInItem}
        allItems={allCatalogueItems.length > 0 ? allCatalogueItems : items}
        onSuccess={fetchInventory}
      />

      <StockOutModal
        isOpen={isStockOutOpen}
        onClose={() => setIsStockOutOpen(false)}
        selectedItem={stockOutItem}
        allItems={allCatalogueItems.length > 0 ? allCatalogueItems : items}
        onSuccess={fetchInventory}
      />

      <StockAdjustmentModal
        isOpen={isAdjustmentOpen}
        onClose={() => setIsAdjustmentOpen(false)}
        selectedItem={adjustmentItem}
        allItems={allCatalogueItems.length > 0 ? allCatalogueItems : items}
        onSuccess={fetchInventory}
      />

      <InitializeStockModal
        isOpen={isInitializeOpen}
        onClose={() => setIsInitializeOpen(false)}
        selectedItem={initializeItem}
        allItems={allCatalogueItems.length > 0 ? allCatalogueItems : items}
        onSuccess={fetchInventory}
        isLoadingCatalogue={isLoading}
      />

      <UpdateThresholdModal
        isOpen={isThresholdOpen}
        onClose={() => setIsThresholdOpen(false)}
        item={thresholdItem}
        onSuccess={fetchInventory}
      />

      <CorrectInitialStockModal
        isOpen={isCorrectInitialOpen}
        onClose={() => setIsCorrectInitialOpen(false)}
        item={correctInitialItem}
        onSuccess={fetchInventory}
      />

      <StockMovementsDrawer
        isOpen={isMovementsOpen}
        onClose={() => setIsMovementsOpen(false)}
        productPublicId={movementsProduct.id}
        productName={movementsProduct.name}
      />

      <StockAlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onAlertAcknowledged={fetchInventory}
      />
    </div>
  );
}
