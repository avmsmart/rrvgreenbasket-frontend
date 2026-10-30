"use client";

import React, { useState } from "react";
import { 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  RefreshCw, 
  Printer,
  ChevronDown,
  CheckCircle2
} from "lucide-react";
import {
  ReportsKpiCards,
  ReportsTabsBar,
  ReportTabId,
  SalesOverviewChart,
  OrderStatusDonutChart,
  TopSellingProductsReport,
  CustomersTrendChart,
  DeliveryPerformanceReport,
  RevenueByCategoryDonut,
  MonthlyComparisonChart,
  ReportsRecentActivity,
} from "@/components/reports";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTabId>("overview");
  const [dateRange, setDateRange] = useState<string>("Last 7 Days");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          ["Metric", "Value", "Period", "Growth"],
          ["Total Revenue", "₹ 1,28,450", dateRange, "+18%"],
          ["Total Orders", "324", dateRange, "+12%"],
          ["Delivered Orders", "214", dateRange, "66%"],
          ["Out for Delivery", "55", dateRange, "17%"],
          ["Pending Orders", "32", dateRange, "10%"],
          ["Total Customers", "1248", dateRange, "+8%"],
          ["Repeat Customers", "312", dateRange, "25%"],
          ["Top Selling Produce", "Tomato Hybrid (340 Kg)", dateRange, "₹ 13,600"],
          ["Fresh Veggies Contribution", "42%", dateRange, "₹ 53,949"],
          ["Fresh Fruits Contribution", "28%", dateRange, "₹ 35,966"],
        ]
          .map((row) => row.join(","))
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `RRV_Analytics_Report_${dateRange.replace(/\s+/g, "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("CSV analytics exported successfully!");
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real-time sales performance, order distribution, and customer retention metrics.
          </p>
        </div>

        {/* Date Filter & Export Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-white border border-slate-200/90 text-slate-700 text-xs sm:text-sm font-bold pl-8 pr-8 py-2 rounded-xl shadow-3xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20"
            >
              <option value="Today">Today (25 Aug)</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Month">This Month (August)</option>
              <option value="Last Month">Last Month (July)</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-bold shadow-3xs transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#00875a] hover:bg-[#00704a] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* High-level KPI Cards */}
      <ReportsKpiCards
        totalRevenue={128450}
        totalOrders={324}
        totalCustomers={1248}
        totalProductsSold={1840}
      />

      {/* Tabs Navigation */}
      <ReportsTabsBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SalesOverviewChart />
            </div>
            <div>
              <OrderStatusDonutChart />
            </div>
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopSellingProductsReport />
            <RevenueByCategoryDonut />
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CustomersTrendChart />
            <DeliveryPerformanceReport />
            <ReportsRecentActivity />
          </div>

          {/* Monthly Historical Comparison */}
          <div>
            <MonthlyComparisonChart />
          </div>
        </div>
      )}

      {activeTab === "sales" && (
        <div className="space-y-6">
          <SalesOverviewChart />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueByCategoryDonut />
            <MonthlyComparisonChart />
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderStatusDonutChart />
            <DeliveryPerformanceReport />
          </div>
          <ReportsRecentActivity />
        </div>
      )}

      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopSellingProductsReport />
            <RevenueByCategoryDonut />
          </div>
        </div>
      )}

      {activeTab === "customers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomersTrendChart />
            <ReportsRecentActivity />
          </div>
        </div>
      )}

      {activeTab === "delivery" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DeliveryPerformanceReport />
            <OrderStatusDonutChart />
          </div>
        </div>
      )}

      {activeTab === "procurement" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopSellingProductsReport />
            <ReportsRecentActivity />
          </div>
        </div>
      )}
    </div>
  );
}
