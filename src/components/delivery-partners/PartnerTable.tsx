"use client";

import React, { useState } from "react";
import {
  Star,
  Eye,
  MoreVertical,
  Bike,
  Car,
  Phone,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Edit2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { DeliveryPartner } from "@/types";
import { SelectionToolbar, IndeterminateCheckbox, PaginationBar } from "@/components/common";
import { exportToCsv, exportToPdf } from "@/utils";

interface PartnerTableProps {
  partners: DeliveryPartner[];
  selectedPartner: DeliveryPartner | null;
  onSelectPartner: (partner: DeliveryPartner) => void;
  onEditPartner?: (partner: DeliveryPartner) => void;
  onToggleStatus?: (partner: DeliveryPartner) => void;
  selectedPartnerIds?: string[];
  onToggleSelectPartner?: (id: string) => void;
  onToggleSelectAll?: () => void;
  onClearSelection?: () => void;
  currentPage?: number;
  pageSize?: number;
  totalPartners?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const PartnerTable: React.FC<PartnerTableProps> = ({
  partners,
  selectedPartner,
  onSelectPartner,
  onEditPartner,
  onToggleStatus,
  selectedPartnerIds,
  onToggleSelectPartner,
  onToggleSelectAll,
  onClearSelection,
  currentPage = 1,
  pageSize = 10,
  totalPartners,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedIds = selectedPartnerIds ?? internalSelectedIds;

  const toggleSelectAll = () => {
    if (onToggleSelectAll) {
      onToggleSelectAll();
      return;
    }
    if (selectedIds.length === partners.length) {
      setInternalSelectedIds([]);
    } else {
      setInternalSelectedIds(partners.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onToggleSelectPartner) {
      onToggleSelectPartner(id);
      return;
    }
    setInternalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClear = () => {
    if (onClearSelection) {
      onClearSelection();
    } else {
      setInternalSelectedIds([]);
    }
  };

  const isAllSelected =
    partners.length > 0 && partners.every((p) => selectedIds.includes(p.id));
  const isIndeterminate =
    partners.some((p) => selectedIds.includes(p.id)) && !isAllSelected;

  const handleExportSelected = () => {
    const selected = partners.filter((p) => selectedIds.includes(p.id));
    if (selected.length === 0) return;

    exportToCsv<DeliveryPartner>(
      "selected-delivery-partners.csv",
      [
        { header: "Partner ID", accessor: (p) => p.id },
        { header: "Name", accessor: (p) => p.name },
        { header: "Contact Number", accessor: (p) => p.phone },
        { header: "Email", accessor: (p) => p.email || "--" },
        { header: "Assigned Area", accessor: (p) => p.area },
        { header: "Vehicle Details", accessor: (p) => p.vehicleDetails || p.vehicleType || "Two Wheeler" },
        { header: "Vehicle Number", accessor: (p) => p.vehicleNumber || "--" },
        { header: "Status", accessor: (p) => p.status },
        { header: "Rating", accessor: (p) => p.rating },
        { header: "Total Deliveries", accessor: (p) => p.totalDeliveries },
        { header: "Joined Date", accessor: (p) => p.joinedDate || "--" },
      ],
      selected
    );

    setToastMessage(`Exported ${selected.length} partner(s) to selected-delivery-partners.csv`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportPdf = () => {
    const selected = partners.filter((p) => selectedIds.includes(p.id));
    if (selected.length === 0) return;

    exportToPdf<DeliveryPartner>(
      "selected-delivery-partners.pdf",
      "Delivery Partners Report",
      [
        { header: "Partner ID", accessor: (p) => p.id },
        { header: "Name", accessor: (p) => p.name },
        { header: "Phone", accessor: (p) => p.phone },
        { header: "Area", accessor: (p) => p.area },
        { header: "Vehicle", accessor: (p) => `${p.vehicleType || "Bike"} - ${p.vehicleNumber || "--"}` },
        { header: "Status", accessor: (p) => p.status },
        { header: "Rating", accessor: (p) => p.rating },
        { header: "Deliveries", accessor: (p) => p.totalDeliveries },
      ],
      selected
    );

    setToastMessage(`Exported ${selected.length} partner(s) to selected-delivery-partners.pdf`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getStatusBadge = (status: DeliveryPartner["status"]) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "On Delivery":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
            <Truck className="w-3 h-3 text-blue-500" />
            On Delivery
          </span>
        );
      case "Idle":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
            <Clock className="w-3 h-3 text-amber-500" />
            Idle
          </span>
        );
      case "Inactive":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-400" />
            Inactive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getVehicleIcon = (vehicleType?: string) => {
    const v = vehicleType?.toLowerCase() || "";
    if (v.includes("van") || v.includes("auto") || v.includes("three")) {
      return <Car className="w-3.5 h-3.5 text-slate-400" />;
    }
    return <Bike className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs overflow-hidden flex flex-col">
      {/* Selection Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-3 sm:px-4 bg-slate-50 border-b border-slate-200">
          <SelectionToolbar
            selectedCount={selectedIds.length}
            entityName="delivery partners"
            onExportSelected={handleExportSelected}
            onExportPdf={handleExportPdf}
            onClearSelection={handleClear}
          />
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="mx-4 mt-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-[#00875a] text-xs font-semibold rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-2 w-8 text-center">
                <IndeterminateCheckbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={toggleSelectAll}
                  ariaLabel="Select all delivery partners on page"
                />
              </th>
              <th className="py-2.5 px-2.5 text-slate-600">Partner</th>
              <th className="py-2.5 px-2 text-slate-600">Phone</th>
              <th className="py-2.5 px-2 text-slate-600">Area</th>
              <th className="py-2.5 px-2 text-slate-600">Vehicle</th>
              <th className="py-2.5 px-2 text-slate-600">Status</th>
              <th className="py-2.5 px-2 text-right text-slate-600">Deliveries</th>
              <th className="py-2.5 px-2 text-center text-slate-600">Rating</th>
              <th className="py-2.5 px-2 text-center text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {partners.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                  No delivery partners found matching criteria
                </td>
              </tr>
            ) : (
              partners.map((partner) => {
                const isSelected = selectedPartner?.id === partner.id;
                const isChecked = selectedIds.includes(partner.id);

                return (
                  <tr
                    key={partner.id}
                    onClick={() => onSelectPartner(partner)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-emerald-50/60 font-medium"
                        : "hover:bg-slate-50/70"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        onClick={(e) => toggleSelect(partner.id, e)}
                        className="rounded border-slate-300 text-[#00875a] focus:ring-[#00875a] cursor-pointer"
                        aria-label={`Select delivery partner ${partner.name}`}
                      />
                    </td>

                    {/* Partner Name & ID */}
                    <td className="py-2.5 px-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100/80 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                          {partner.avatar || partner.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 leading-tight truncate">
                            {partner.name}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400">
                            #{partner.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-2.5 px-2 text-slate-600 text-xs font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{partner.phone}</span>
                      </div>
                    </td>

                    {/* Assigned Area */}
                    <td className="py-2.5 px-2">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold whitespace-nowrap">
                        {partner.area}
                      </span>
                    </td>

                    {/* Vehicle */}
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        {getVehicleIcon(partner.vehicleType)}
                        <span className="font-medium truncate max-w-[110px]">
                          {partner.vehicleDetails || partner.vehicleType || "Two Wheeler"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      {getStatusBadge(partner.status)}
                    </td>

                    {/* Total Deliveries */}
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900 whitespace-nowrap">
                      {partner.totalDeliveries.toLocaleString()}
                    </td>

                    {/* Rating */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-bold text-xs">
                        <Star className="w-3 h-3 fill-emerald-500 text-emerald-600" />
                        <span>{partner.rating.toFixed(1)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-2.5 px-2 text-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => onSelectPartner(partner)}
                          className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="View Partner Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === partner.id ? null : partner.id
                              )
                            }
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {openMenuId === partner.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectPartner(partner);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>View Profile</span>
                              </button>
                              {onEditPartner && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onEditPartner(partner);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Edit Partner</span>
                                </button>
                              )}
                              {onToggleStatus && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onToggleStatus(partner);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                                >
                                  {partner.status === "Inactive" ? (
                                    <>
                                      <ToggleRight className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-emerald-700">Activate</span>
                                    </>
                                  ) : (
                                    <>
                                      <ToggleLeft className="w-3.5 h-3.5 text-rose-500" />
                                      <span className="text-rose-600">Deactivate</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Dynamic Pagination Bar (No 'Showing X to Y' text) */}
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages ?? (Math.ceil((totalPartners ?? partners.length) / pageSize) || 1)}
        onPageChange={onPageChange ?? (() => {})}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50]}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
