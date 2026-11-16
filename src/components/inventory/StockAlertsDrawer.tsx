"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  BellRing,
  RefreshCw,
  Check,
} from "lucide-react";
import { inventoryService } from "@/services/inventory.service";
import { StockAlertResponse, StockAlertsQueryParams } from "@/types";

interface StockAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertAcknowledged?: () => void;
}

export const StockAlertsDrawer: React.FC<StockAlertsDrawerProps> = ({
  isOpen,
  onClose,
  onAlertAcknowledged,
}) => {
  const [alerts, setAlerts] = useState<StockAlertResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: StockAlertsQueryParams = {
        size: 50,
        sort: "createdAt,desc",
      };
      if (statusFilter !== "All") {
        params.alertStatus = statusFilter;
      }
      const res = await inventoryService.getStockAlerts(params);
      setAlerts(res.content || []);
    } catch (err) {
      console.error("Failed to load stock alerts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen, loadAlerts]);

  if (!isOpen) return null;

  const handleAcknowledge = async (alertPublicId: string) => {
    setAcknowledgingId(alertPublicId);
    try {
      await inventoryService.acknowledgeStockAlert(alertPublicId);
      setAlerts((prev) =>
        prev.map((a) =>
          a.publicId === alertPublicId ? { ...a, alertStatus: "ACKNOWLEDGED" } : a
        )
      );
      if (onAlertAcknowledged) {
        onAlertAcknowledged();
      }
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
    } finally {
      setAcknowledgingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:justify-end justify-center p-0">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel: Mobile lo Bottom-Sheet | Desktop lo Right Drawer */}
      <div className="relative z-10 w-full max-h-[92dvh] sm:max-h-full sm:h-full sm:max-w-xl bg-white shadow-2xl flex flex-col rounded-t-3xl sm:rounded-none overflow-hidden border-t sm:border-t-0 sm:border-l border-slate-200 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:slide-in-from-right duration-200">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-10 h-1.5 rounded-full bg-slate-300 mx-auto mt-3 flex-shrink-0" aria-hidden="true" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50/50 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                Warehouse Stock Alerts
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                Low stock warnings and out of stock incidents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2">
            <button
              type="button"
              onClick={loadAlerts}
              disabled={isLoading}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-3xs flex items-center justify-center transition-colors"
              title="Refresh alerts"
              aria-label="Refresh alerts"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-600" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 shadow-3xs flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-100 bg-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              aria-label="Filter Alerts by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none"
            >
              <option value="ACTIVE">Active Alerts Only</option>
              <option value="ACKNOWLEDGED">Acknowledged Alerts</option>
              <option value="RESOLVED">Resolved Alerts</option>
              <option value="All">All Statuses</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Found: <strong className="text-slate-700">{alerts.length}</strong>
          </span>
        </div>

        {/* Alert Cards List */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-2xl w-full" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-700">All Clear!</p>
              <p className="text-xs text-slate-400">
                No {statusFilter === "ACTIVE" ? "active" : ""} stock alerts found.
              </p>
            </div>
          ) : (
            alerts.map((a) => {
              const isOut = a.alertType === "OUT_OF_STOCK";
              const isAcknowledged = a.alertStatus === "ACKNOWLEDGED";
              const isResolved = a.alertStatus === "RESOLVED";

              return (
                <div
                  key={a.publicId}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all shadow-3xs ${
                    isOut
                      ? "bg-rose-50/40 border-rose-200"
                      : "bg-amber-50/40 border-amber-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isOut ? (
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                          <XCircle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {isOut ? "OUT OF STOCK" : "LOW STOCK ALERT"}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isAcknowledged
                                ? "bg-blue-100 text-blue-700"
                                : isResolved
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-200 text-amber-900"
                            }`}
                          >
                            {a.alertStatus}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                          UUID: {a.productPublicId.slice(0, 16)}...
                        </p>
                      </div>
                    </div>

                    {/* Acknowledge Button */}
                    {!isAcknowledged && !isResolved && (
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(a.publicId)}
                        disabled={acknowledgingId === a.publicId}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold shadow-3xs flex items-center gap-1 transition-colors flex-shrink-0 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 text-amber-700" />
                        <span>
                          {acknowledgingId === a.publicId ? "Saving..." : "Acknowledge"}
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Current Available:</span>
                      <p className="font-black text-slate-800 text-xs sm:text-sm">
                        {a.currentQuantity} {a.unitOfMeasure}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Threshold Level:</span>
                      <p className="font-bold text-slate-600 text-xs sm:text-sm">
                        {a.thresholdQuantity} {a.unitOfMeasure}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400 font-mono">
                    Triggered at: {new Date(a.createdAt).toLocaleString("en-IN")}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAlertsDrawer;