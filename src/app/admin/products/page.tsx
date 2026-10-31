"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Breadcrumbs } from "@/components/layout";
import {
  ProductsStatsCards,
  ProductsFiltersBar,
  ProductsTable,
  EditProductModal,
  ProductCategoryTab,
  ProductDetailsDrawer,
} from "@/components/products";
import { AddProductModal } from "@/components/dashboard/AddProductModal";
import { MASTER_PRODUCTS_DATA } from "@/data";
import { Product } from "@/types";
import { exportToCsv, exportToPdf } from "@/utils";

export default function ProductsManagementPage() {
  const [productsList, setProductsList] = useState<Product[]>(MASTER_PRODUCTS_DATA);
  const [activeTab, setActiveTab] = useState<ProductCategoryTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUom, setSelectedUom] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Read URL search parameter if navigated from global search
  useEffect(() => {
    if (typeof window !== "undefined") {
      const s = new URLSearchParams(window.location.search).get("search");
      if (s) {
        setSearchQuery(s);
        setActiveTab("All");
      }
    }
  }, []);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modals & Drawer
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProductForDrawer, setSelectedProductForDrawer] = useState<Product | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  // Counts for tabs
  const counts = useMemo(() => {
    const all = productsList.length;
    const english = productsList.filter((p) => p.category === "English Vegetables").length;
    const indian = productsList.filter((p) => p.category === "Indian Vegetables").length;
    const inStock = productsList.filter((p) => p.status === "In Stock").length;
    const lowStock = productsList.filter((p) => p.status === "Low Stock").length;
    return { all, english, indian, inStock, lowStock };
  }, [productsList]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      // Category tab
      if (activeTab === "English Vegetables" && p.category !== "English Vegetables") return false;
      if (activeTab === "Indian Vegetables" && p.category !== "Indian Vegetables") return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesExcel = (p.excelName || "").toLowerCase().includes(q);
        const matchesCode = (p.erpCode || "").toLowerCase().includes(q);
        const matchesHsn = (p.hsnCode || "").toLowerCase().includes(q);
        if (!matchesName && !matchesExcel && !matchesCode && !matchesHsn) return false;
      }

      // UOM filter
      if (selectedUom !== "All" && p.unit !== selectedUom) return false;

      // Status filter
      if (selectedStatus !== "All" && p.status !== selectedStatus) return false;

      return true;
    });
  }, [productsList, activeTab, searchQuery, selectedUom, selectedStatus]);

  // Paginated slice
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Handlers
  const handleTabChange = (tab: ProductCategoryTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
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

  const handleProductAdded = (newProduct: Partial<Product>) => {
    const created: Product = {
      id: newProduct.id || `PRD-${Date.now()}`,
      name: newProduct.name || "Custom Vegetable",
      excelName: newProduct.excelName || newProduct.name || "Custom Vegetable",
      erpCode: newProduct.erpCode || `VGIV${Math.floor(100000 + Math.random() * 900000)}`,
      category: newProduct.category || "Indian Vegetables",
      hsnCode: newProduct.hsnCode || "7101000",
      unit: newProduct.unit || "Kg",
      originalPrice: newProduct.originalPrice || newProduct.price || 50,
      price: newProduct.price || 50,
      stock: newProduct.stock || 40,
      minStock: newProduct.minStock || 10,
      status: (newProduct.stock || 40) <= (newProduct.minStock || 10) ? "Low Stock" : "In Stock",
      imageUrl: newProduct.imageUrl,
    };

    setProductsList((prev) => [created, ...prev]);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updated: Product) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleDelete = (productId: string) => {
    if (confirm("Are you sure you want to remove this product from the master catalog?")) {
      setProductsList((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const handleExportCsv = () => {
    const columns = [
      { header: "Product Name in Excel", accessor: (p: Product) => p.excelName || p.name },
      { header: "ERP Product Name", accessor: (p: Product) => p.name },
      { header: "Product Code in ERP", accessor: (p: Product) => p.erpCode || p.id },
      { header: "HSN Code", accessor: (p: Product) => p.hsnCode || "7101000" },
      { header: "UOM", accessor: (p: Product) => p.unit },
      { header: "Quot Rate", accessor: (p: Product) => p.originalPrice || p.price },
      { header: "SRM REVISED", accessor: (p: Product) => p.price.toFixed(2) },
      { header: "Stock", accessor: (p: Product) => p.stock },
      { header: "Status", accessor: (p: Product) => p.status },
    ];

    exportToCsv("RRV_Green_Basket_Master_Product_Catalog.csv", columns, filteredProducts);
  };

  const handleExportPdf = () => {
    const pdfColumns = [
      { header: "Product Name in Excel", accessor: (p: Product) => p.excelName || p.name },
      { header: "ERP Product Name", accessor: (p: Product) => p.name },
      { header: "Product Code", accessor: (p: Product) => p.erpCode || p.id },
      { header: "Category", accessor: (p: Product) => p.category },
      { header: "HSN Code", accessor: (p: Product) => p.hsnCode || "7101000" },
      { header: "UOM", accessor: (p: Product) => p.unit },
      { header: "Quot Rate", accessor: (p: Product) => (p.originalPrice ? `₹${p.originalPrice}` : `₹${p.price}`) },
      { header: "SRM Revised", accessor: (p: Product) => `₹${p.price.toFixed(2)}` },
      { header: "Stock", accessor: (p: Product) => `${p.stock} ${p.unit}` },
      { header: "Status", accessor: (p: Product) => p.status },
    ];

    exportToPdf(
      "RRV_Green_Basket_Master_Product_Catalog.pdf",
      "SRM KTR ERP Price Catalog & Master Products",
      pdfColumns,
      filteredProducts
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Products Catalog" },
        ]}
      />

      {/* Page Title & Context */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Products &amp; Master Price List
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          SRM KTR ERP Price Catalog • Section A (English Vegetables) &amp; Section B (Indian Vegetables)
        </p>
      </div>

      {/* KPI Cards */}
      <ProductsStatsCards
        totalCount={counts.all}
        englishVegCount={counts.english}
        indianVegCount={counts.indian}
        inStockCount={counts.inStock}
        lowStockCount={counts.lowStock}
      />

      {/* Filters and Search Bar */}
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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Products Table & Grid */}
      <ProductsTable
        products={paginatedProducts}
        viewMode={viewMode}
        onEditProduct={handleOpenEdit}
        onDeleteProduct={handleDelete}
        onViewProduct={(p) => {
          setSelectedProductForDrawer(p);
          setIsDetailsDrawerOpen(true);
        }}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredProducts.length}
        onPageChange={setCurrentPage}
      />

      {/* Modals & Drawer */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={handleProductAdded}
      />

      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />

      <ProductDetailsDrawer
        product={selectedProductForDrawer}
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        onEdit={handleOpenEdit}
      />
    </div>
  );
}
