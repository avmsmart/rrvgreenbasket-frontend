"use client";

import React, { useState } from "react";
import { Breadcrumbs } from "@/components/layout";
import {
  DashboardWelcomeBanner,
  DashboardKpiCards,
  DashboardChartsRow,
  DashboardMiddleRow,
  DashboardOperationsBottomRow,
  AddProductModal,
  DashboardOrderDrawer,
  QuickStockAdjustModal,
  DashboardOrder,
  LowStockItem,
} from "@/components/dashboard";
import { Product } from "@/types";

export default function AdminDashboardPage() {
  // Modal & Drawer states
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedDrawerOrder, setSelectedDrawerOrder] = useState<DashboardOrder | null>(null);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);

  const [stockAdjustItem, setStockAdjustItem] = useState<LowStockItem | null>(null);
  const [isStockAdjustOpen, setIsStockAdjustOpen] = useState(false);

  // Dynamic KPI counters that update when actions occur
  const [totalProducts, setTotalProducts] = useState(156);
  const [lowStockCount, setLowStockCount] = useState(5);

  const handleOpenAddProduct = () => {
    setIsAddProductModalOpen(true);
  };

  const handleProductAdded = (_newProduct: Partial<Product>) => {
    setTotalProducts((prev) => prev + 1);
  };

  const handleSelectOrder = (order: DashboardOrder) => {
    setSelectedDrawerOrder(order);
    setIsOrderDrawerOpen(true);
  };

  const handleQuickAdjustStock = (item: LowStockItem) => {
    setStockAdjustItem(item);
    setIsStockAdjustOpen(true);
  };

  const handleRestockApplied = (_itemName: string, _addedQty: number) => {
    setLowStockCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Dashboard" }]} />

      {/* 1. Welcome Banner matching PDF Page 1 */}
      <DashboardWelcomeBanner />

      {/* 2. Top 5 KPI Stats Cards matching PDF Page 1 */}
      <DashboardKpiCards
        totalOrders={128}
        newCustomers={42}
        totalProducts={totalProducts}
        inventoryItems={78}
        lowStockCount={lowStockCount}
        todayRevenue={24560}
      />

      {/* 3. Interactive Charts & Quick Actions Row matching PDF Page 1 */}
      <DashboardChartsRow
        onOpenAddProductModal={handleOpenAddProduct}
      />

      {/* 4. Middle Row: Top Selling, Recent Orders, Low Stock Items matching PDF Page 1 */}
      <DashboardMiddleRow
        onSelectOrder={handleSelectOrder}
        onQuickAdjustStock={handleQuickAdjustStock}
      />

      {/* 5. Bottom Operations Row: Timeline, Order Cut-off, Procurement Reminder matching PDF Page 1 */}
      <DashboardOperationsBottomRow />

      {/* Modals & Drawers */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
      />

      <DashboardOrderDrawer
        order={selectedDrawerOrder}
        isOpen={isOrderDrawerOpen}
        onClose={() => setIsOrderDrawerOpen(false)}
      />

      <QuickStockAdjustModal
        item={stockAdjustItem}
        isOpen={isStockAdjustOpen}
        onClose={() => setIsStockAdjustOpen(false)}
        onRestockApplied={handleRestockApplied}
      />
    </div>
  );
}
