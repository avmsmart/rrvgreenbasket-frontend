"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";

import { Breadcrumbs } from "@/components/layout";

import {
  ProductsStatsCards,
  ProductsFiltersBar,
  ProductsTable,
  EditProductModal,
  ProductDetailsDrawer,
} from "@/components/products";

import { AddProductModal } from "@/components/dashboard/AddProductModal";

import {
  Product,
  AdminProduct,
  AdminProductPageData,
  toApiProductStatus,
  toUiProductStatus,
} from "@/types";

import { exportToCsv, exportToPdf } from "@/utils";

import {
  adminProductService,
  mapAdminProductToUIProduct,
} from "@/services/product.service";

import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function ProductsManagementPage() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedUom, setSelectedUom] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Availability filter
  const [selectedAvailability, setSelectedAvailability] =
    useState("All");

  const [viewMode, setViewMode] = useState<"table" | "grid">(
    "table"
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals and drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedPublicId, setSelectedPublicId] =
    useState<string | null>(null);

  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] =
    useState(false);

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Global search URL parameter
  useEffect(() => {
    if (typeof window === "undefined") return;

    const search = new URLSearchParams(
      window.location.search
    ).get("search");

    if (search) {
      setSearchQuery(search);
      setActiveTab("All");
    }
  }, []);

  // Notifications
  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const pageIndex = Math.max(0, currentPage - 1);

      // Category filter
      const categoryFilter =
        activeTab !== "All"
          ? activeTab.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          : undefined;

      // Availability filter
      let availableFilter: boolean | undefined;

      if (selectedAvailability === "true") {
        availableFilter = true;
      }

      if (selectedAvailability === "false") {
        availableFilter = false;
      }

      // Status filter
      const statusFilter =
        selectedStatus !== "All"
          ? selectedStatus
          : undefined;

      const pageData: AdminProductPageData =
        await adminProductService.getProducts({
          page: pageIndex,
          size: pageSize,
          category: categoryFilter,
          search: debouncedSearch || undefined,
          available: availableFilter,
          status: statusFilter,
        });

      const mappedList: Product[] = (
        pageData.content || []
      ).map(mapAdminProductToUIProduct);

      // UOM filter
      const filtered =
        selectedUom !== "All"
          ? mappedList.filter(
              (product) =>
                product.unit.toLowerCase() ===
                selectedUom.toLowerCase()
            )
          : mappedList;

      setProductsList(filtered);

      setTotalElements(
        pageData.totalElements ?? filtered.length
      );

      setTotalPages(
  pageData.totalPages ??
    (Math.ceil(
      (pageData.totalElements ?? filtered.length) / pageSize
    ) || 1)
);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load products from database.";

      setErrorMessage(message);
      setProductsList([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    activeTab,
    currentPage,
    debouncedSearch,
    pageSize,
    selectedAvailability,
    selectedStatus,
    selectedUom,
  ]);

  // Fetch when filters or pagination change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter handlers
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleUomChange = (uom: string) => {
    setSelectedUom(uom);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleAvailabilityChange = (availability: string) => {
    setSelectedAvailability(availability);
    setCurrentPage(1);
  };

  // Add product
  const handleProductAdded = () => {
    showNotification("Product created successfully.");
    fetchProducts();
  };

  // Edit product
  const handleOpenEdit = (
    product: Product | AdminProduct
  ) => {
    setEditingProduct(product as Product);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    showNotification("Product updated successfully.");
    fetchProducts();
  };

  // View product details
  const handleOpenDetails = (product: Product) => {
    setSelectedPublicId(
      product.publicId || product.id
    );

    setIsDetailsDrawerOpen(true);
  };

  // Toggle availability (adminEnabled) with immediate optimistic UI update & rollback on error
  const handleToggleAvailability = async (product: Product) => {
    const publicId = product.publicId || product.id;
    if (!publicId) return;

    const previousEnabled = product.adminEnabled !== false;
    const nextEnabled = !previousEnabled;

    // 1. Immediate optimistic UI update
    setProductsList((prevList) =>
      prevList.map((item) =>
        (item.publicId || item.id) === publicId
          ? {
              ...item,
              adminEnabled: nextEnabled,
              available: nextEnabled,
            }
          : item
      )
    );

    try {
      // 2. Persist to backend database using PATCH /api/admin/products/{publicId}/availability
      const updated = await adminProductService.updateProductAvailability(
        publicId,
        nextEnabled
      );

      // 3. Confirm with updated backend values
      setProductsList((prevList) =>
        prevList.map((item) =>
          (item.publicId || item.id) === publicId
            ? {
                ...item,
                adminEnabled:
                  updated.adminEnabled !== undefined
                    ? updated.adminEnabled
                    : nextEnabled,
                available:
                  updated.available !== undefined
                    ? updated.available
                    : nextEnabled,
              }
            : item
        )
      );

      showNotification(
        `"${product.name}" is now ${nextEnabled ? "Available" : "Not Available"}.`
      );
    } catch (err: unknown) {
      // 4. Revert optimistic update on failure
      setProductsList((prevList) =>
        prevList.map((item) =>
          (item.publicId || item.id) === publicId
            ? {
                ...item,
                adminEnabled: previousEnabled,
                available: previousEnabled,
              }
            : item
        )
      );

      const errorMsg =
        err instanceof Error
          ? err.message
          : "Failed to update product availability.";
      showNotification(errorMsg, "error");
    }
  };

  // Delete product using the existing archive endpoint.
  const handleDelete = async (productId: string) => {
    const target = productsList.find(
      (product) =>
        (product.publicId || product.id) === productId
    );

    const productName = target?.name || productId;

    const confirmed = window.confirm(
      `WARNING: Permanently delete "${productName}"?\n\n` +
        "This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await adminProductService.archiveProduct(productId);

      showNotification(
        `"${productName}" deleted from the active catalog.`
      );

      fetchProducts();
    } catch (err: unknown) {
      showNotification(
        err instanceof Error
          ? err.message
          : "Failed to delete product.",
        "error"
      );
    }
  };

  // KPI counts
  const counts = useMemo(() => {
    const all = totalElements;

    const english = productsList.filter(
      (product) =>
        String(product.category) === "English Vegetables"
    ).length;

    const indian = productsList.filter(
      (product) =>
        String(product.category) === "Indian Vegetables"
    ).length;

    const inStock = productsList.filter(
      (product) => product.adminEnabled !== false
    ).length;

    const lowStock = productsList.filter(
      (product) =>
        product.stockStatus === "LOW_STOCK" ||
        product.status === "Low Stock"
    ).length;

    return {
      all,
      english,
      indian,
      inStock,
      lowStock,
    };
  }, [productsList, totalElements]);

  // CSV export
  const handleExportCsv = () => {
    const columns = [
      {
        header: "Product Name",
        accessor: (product: Product) => product.name,
      },
      {
        header: "Category",
        accessor: (product: Product) =>
          String(product.category || ""),
      },
      {
        header: "UOM",
        accessor: (product: Product) =>
          product.quantityUnit || product.unit,
      },
      {
        header: "Price / Kg",
        accessor: (product: Product) =>
          (product.pricePerKg ?? product.price).toFixed(2),
      },
      {
        header: "Total Price",
        accessor: (product: Product) =>
          (product.totalPrice ?? product.price).toFixed(2),
      },
      {
        header: "Stock Status",
        accessor: (product: Product) =>
          product.adminEnabled !== false
            ? "Available"
            : "Not Available",
      },
      {
        header: "Status",
        accessor: (product: Product) =>
          toUiProductStatus(product.status),
      },
    ];

    exportToCsv(
      "RRV_Green_Basket_Products_Catalog.csv",
      columns,
      productsList
    );
  };

  // PDF export
  const handleExportPdf = () => {
    const columns = [
      {
        header: "Product Name",
        accessor: (product: Product) => product.name,
      },
      {
        header: "Category",
        accessor: (product: Product) =>
          String(product.category || ""),
      },
      {
        header: "UOM",
        accessor: (product: Product) =>
          product.quantityUnit || product.unit,
      },
      {
        header: "Price/Kg",
        accessor: (product: Product) =>
          `₹${(
            product.pricePerKg ?? product.price
          ).toFixed(2)}`,
      },
      {
        header: "Pack Price",
        accessor: (product: Product) =>
          `₹${(
            product.totalPrice ?? product.price
          ).toFixed(2)}`,
      },
      {
        header: "Stock Status",
        accessor: (product: Product) =>
          product.adminEnabled !== false
            ? "Available"
            : "Not Available",
      },
      {
        header: "Status",
        accessor: (product: Product) =>
          toUiProductStatus(product.status),
      },
    ];

    exportToPdf(
      "RRV_Green_Basket_Products_Catalog.pdf",
      "RRV Green Basket - Master Product Catalog",
      columns,
      productsList
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          {
            label: "Dashboard",
            href: "/admin/dashboard",
          },
          {
            label: "Products Catalog",
          },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Products &amp; Master Price List
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Manage products, pricing, stock status and availability.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          disabled={isLoading}
          title="Refresh products from database"
          className="self-start sm:self-auto px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-3xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-[#00875a] ${
              isLoading ? "animate-spin" : ""
            }`}
          />

          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold border flex items-center gap-2.5 animate-in fade-in ${
            notification.type === "success"
              ? "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}

          <span>{notification.message}</span>
        </div>
      )}

      {/* Backend error */}
      {errorMessage && !isLoading && (
        <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />

            <div>
              <p className="font-bold">
                Failed to connect to backend product service
              </p>

              <p className="text-rose-600 mt-0.5">
                {errorMessage}
              </p>
            </div>
          </div>

          <button
            onClick={fetchProducts}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-300 font-bold hover:bg-rose-100 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Statistics */}
      <ProductsStatsCards
        totalCount={counts.all}
        englishVegCount={counts.english}
        indianVegCount={counts.indian}
        inStockCount={counts.inStock}
        lowStockCount={counts.lowStock}
      />

      {/* Filters */}
      <ProductsFiltersBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={counts}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedUom={selectedUom}
        onUomChange={handleUomChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        selectedAvailability={selectedAvailability}
        onAvailabilityChange={handleAvailabilityChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Products table */}
      <ProductsTable
        products={productsList}
        viewMode={viewMode}
        isLoading={isLoading}
        onViewDetails={handleOpenDetails}
        onEditProduct={handleOpenEdit}
        onDeleteProduct={handleDelete}
        onToggleAvailability={handleToggleAvailability}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalElements}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onProductUpdated={fetchProducts}
      />

      {/* Add modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={handleProductAdded}
      />

      {/* Edit modal */}
      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* Product details drawer */}
      <ProductDetailsDrawer
        publicId={selectedPublicId}
        isOpen={isDetailsDrawerOpen}
        onClose={() => {
          setIsDetailsDrawerOpen(false);
          setSelectedPublicId(null);
        }}
        onEdit={(product) => {
          setIsDetailsDrawerOpen(false);

          setEditingProduct(
            mapAdminProductToUIProduct(product)
          );

          setIsEditModalOpen(true);
        }}
        onProductUpdated={fetchProducts}
      />
    </div>
  );
}