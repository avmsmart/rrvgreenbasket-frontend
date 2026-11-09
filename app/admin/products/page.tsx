"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";

import { Breadcrumbs } from "@/components/layout";

import {
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
  BackendCategory,
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
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Category & Search Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("category-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals and drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPublicId, setSelectedPublicId] = useState<string | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  // Load backend categories from API (GET /api/products/categories)
  useEffect(() => {
    let isMounted = true;
    adminProductService
      .getCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories for product filter:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Global search URL parameter
  useEffect(() => {
    if (typeof window === "undefined") return;

    const search = new URLSearchParams(window.location.search).get("search");
    if (search) {
      setSearchQuery(search);
      setSelectedCategory("All");
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

      // Determine category filter parameter
      let categoryIdParam: string | undefined;
      let categoryNameParam: string | undefined;

      if (selectedCategory && selectedCategory !== "All") {
        // Check if selectedCategory is a publicId UUID
        const matched = categories.find(
          (c) =>
            c.publicId === selectedCategory ||
            c.name.toLowerCase() === selectedCategory.toLowerCase() ||
            c.slug === selectedCategory
        );
        if (matched) {
          categoryIdParam = matched.publicId;
        } else {
          categoryNameParam = selectedCategory;
        }
      }

      const pageData: AdminProductPageData =
        await adminProductService.getProducts({
          page: pageIndex,
          size: pageSize,
          categoryId: categoryIdParam,
          category: categoryNameParam,
          search: debouncedSearch || undefined,
        });

      let mappedList: Product[] = (
        pageData.content || []
      ).map(mapAdminProductToUIProduct);

      // Sort items based upon chosen sort criteria (category sorting first)
      mappedList.sort((a, b) => {
        if (sortBy === "category-asc") {
          const catA = String(a.category || "").toLowerCase();
          const catB = String(b.category || "").toLowerCase();
          const comp = catA.localeCompare(catB);
          if (comp !== 0) return comp;
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "category-desc") {
          const catA = String(a.category || "").toLowerCase();
          const catB = String(b.category || "").toLowerCase();
          const comp = catB.localeCompare(catA);
          if (comp !== 0) return comp;
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "price-asc") {
          return (a.pricePerKg ?? a.price ?? 0) - (b.pricePerKg ?? b.price ?? 0);
        }
        if (sortBy === "price-desc") {
          return (b.pricePerKg ?? b.price ?? 0) - (a.pricePerKg ?? a.price ?? 0);
        }
        return 0;
      });

      setProductsList(mappedList);

      setTotalElements(pageData.totalElements ?? mappedList.length);

      setTotalPages(
        pageData.totalPages ??
          (Math.ceil((pageData.totalElements ?? mappedList.length) / pageSize) || 1)
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
    selectedCategory,
    categories,
    currentPage,
    debouncedSearch,
    pageSize,
    sortBy,
  ]);

  // Fetch when filters or pagination change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter handlers
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortByChange = (sort: string) => {
    setSortBy(sort);
  };

  // Add product
  const handleProductAdded = () => {
    showNotification("Product created successfully.");
    fetchProducts();
  };

  // Edit product
  const handleOpenEdit = (product: Product | AdminProduct) => {
    setEditingProduct(product as Product);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    showNotification("Product updated successfully.");
    fetchProducts();
  };

  // View product details
  const handleOpenDetails = (product: Product) => {
    setSelectedPublicId(product.publicId || product.id);
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
      await adminProductService.updateProductAvailability(
        publicId,
        nextEnabled
      );

      showNotification(
        `Product marked as ${nextEnabled ? "Available" : "Not Available"}.`
      );
    } catch (err) {
      // Rollback on failure
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

      showNotification("Failed to update availability.", "error");
    }
  };

  // Delete product
  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await adminProductService.deleteProduct(productId);
      showNotification("Product deleted successfully.");
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

  // CSV export
  const handleExportCsv = () => {
    const columns = [
      {
        header: "Product Name",
        accessor: (product: Product) => product.name,
      },
      {
        header: "Category",
        accessor: (product: Product) => String(product.category || ""),
      },
      {
        header: "UOM",
        accessor: (product: Product) => product.quantityUnit || product.unit,
      },
      {
        header: "Price / Kg",
        accessor: (product: Product) =>
          (product.pricePerKg ?? product.price ?? 0).toFixed(2),
      },
      {
        header: "Total Price",
        accessor: (product: Product) =>
          (product.totalPrice ?? product.price ?? 0).toFixed(2),
      },
      {
        header: "Stock Status",
        accessor: (product: Product) =>
          product.adminEnabled !== false ? "Available" : "Not Available",
      },
      {
        header: "Status",
        accessor: (product: Product) => toUiProductStatus(product.status),
      },
    ];

    exportToCsv("RRV_Green_Basket_Products_Catalog.csv", columns, productsList);
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
        accessor: (product: Product) => String(product.category || ""),
      },
      {
        header: "UOM",
        accessor: (product: Product) => product.quantityUnit || product.unit,
      },
      {
        header: "Price/Kg",
        accessor: (product: Product) =>
          `₹${(product.pricePerKg ?? product.price ?? 0).toFixed(2)}`,
      },
      {
        header: "Pack Price",
        accessor: (product: Product) =>
          `₹${(product.totalPrice ?? product.price ?? 0).toFixed(2)}`,
      },
      {
        header: "Stock Status",
        accessor: (product: Product) =>
          product.adminEnabled !== false ? "Available" : "Not Available",
      },
      {
        header: "Status",
        accessor: (product: Product) => toUiProductStatus(product.status),
      },
    ];

    exportToPdf(
      "RRV_Green_Basket_Products_Catalog.pdf",
      "RRV Green Basket - Product Management Catalog",
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
            label: "Product Management",
          },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Product Management
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Manage products, pricing, categories, stock status and availability.
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

              <p className="text-rose-600 mt-0.5">{errorMessage}</p>
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

      {/* Category Tabs, Search & Sorter */}
      <ProductsFiltersBar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        totalProductsCount={totalElements}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
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

          setEditingProduct(mapAdminProductToUIProduct(product));

          setIsEditModalOpen(true);
        }}
        onProductUpdated={fetchProducts}
      />
    </div>
  );
}
