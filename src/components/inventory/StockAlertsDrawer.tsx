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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Warehouse Stock Alerts
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Low stock warnings and out of stock incidents
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAlerts}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-600" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              aria-label="Filter Alerts by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="ACTIVE">Active Alerts Only</option>
              <option value="ACKNOWLEDGED">Acknowledged Alerts</option>
              <option value="RESOLVED">Resolved Alerts</option>
              <option value="All">All Statuses</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Found: <strong>{alerts.length}</strong>
          </span>
        </div>

        {/* Alert Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-2xl w-full" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-12 text-center space-y-2">
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
                  className={`p-4 rounded-2xl border transition-all ${
                    isOut
                      ? "bg-rose-50/40 border-rose-200"
                      : "bg-amber-50/40 border-amber-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isOut ? (
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                          <XCircle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {isOut ? "OUT OF STOCK" : "LOW STOCK ALERT"}
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${
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
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          Product UUID: {a.productPublicId.slice(0, 16)}...
                        </p>
                      </div>
                    </div>

                    {/* Acknowledge Button */}
                    {!isAcknowledged && !isResolved && (
                      <button
                        onClick={() => handleAcknowledge(a.publicId)}
                        disabled={acknowledgingId === a.publicId}
                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold shadow-3xs flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 text-amber-700" />
                        <span>
                          {acknowledgingId === a.publicId ? "Saving..." : "Acknowledge"}
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Current Available:</span>
                      <p className="font-black text-slate-800">
                        {a.currentQuantity} {a.unitOfMeasure}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Threshold Level:</span>
                      <p className="font-bold text-slate-600">
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
