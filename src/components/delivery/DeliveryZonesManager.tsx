"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  IndianRupee,
  Shield,
  Loader2,
  X,
  Search,
  Check,
  ChevronRight,
  Layers,
} from "lucide-react";
import { deliveryService, DeliveryApiError } from "@/services/delivery.service";
import {
  DeliveryZoneResponse,
  CreateDeliveryZoneRequest,
  UpdateDeliveryZoneRequest,
  GeoJsonPolygon,
} from "@/types/delivery";

// Kurnool GeoJSON Polygon Presets
const KURNOOL_PRESETS: { label: string; coordinates: number[][][] }[] = [
  {
    label: "Kurnool Central (City Core)",
    coordinates: [
      [
        [78.025, 15.82],
        [78.055, 15.82],
        [78.055, 15.85],
        [78.025, 15.85],
        [78.025, 15.82],
      ],
    ],
  },
  {
    label: "C-Camp & Venkataramana Colony",
    coordinates: [
      [
        [78.03, 15.805],
        [78.065, 15.805],
        [78.065, 15.835],
        [78.03, 15.835],
        [78.03, 15.805],
      ],
    ],
  },
  {
    label: "Nandyal Checkpost & Bellary Road",
    coordinates: [
      [
        [78.04, 15.795],
        [78.085, 15.795],
        [78.085, 15.825],
        [78.04, 15.825],
        [78.04, 15.795],
      ],
    ],
  },
  {
    label: "Joharapuram & Old City",
    coordinates: [
      [
        [78.015, 15.825],
        [78.045, 15.825],
        [78.045, 15.86],
        [78.015, 15.86],
        [78.015, 15.825],
      ],
    ],
  },
];

export const DeliveryZonesManager: React.FC = () => {
  const [zones, setZones] = useState<DeliveryZoneResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingZone, setEditingZone] = useState<DeliveryZoneResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteTargetZone, setDeleteTargetZone] = useState<DeliveryZoneResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateDeliveryZoneRequest>({
    zoneName: "",
    zoneCode: "",
    description: "",
    city: "Kurnool",
    state: "Andhra Pradesh",
    pincode: "518001",
    deliveryCharge: 30,
    minimumOrderAmount: 150,
    freeDeliveryThreshold: 500,
    estimatedDeliveryTime: "Morning Harvest (6:00 AM - 10:00 AM)",
    active: true,
    boundary: {
      type: "Polygon",
      coordinates: KURNOOL_PRESETS[0].coordinates,
    },
  });

  const [rawCoordinatesText, setRawCoordinatesText] = useState<string>(
    JSON.stringify(KURNOOL_PRESETS[0].coordinates, null, 2)
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Zones from Spring Boot Delivery Service
  const loadZones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pageData = await deliveryService.getAdminZones({ size: 100 });
      const list = pageData?.content || (Array.isArray(pageData) ? pageData : []);
      setZones(list);
    } catch (err: unknown) {
      console.warn("[DeliveryZonesManager] Failed to load zones:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load delivery zones. Please check your connection."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingZone(null);
    setFormData({
      zoneName: "",
      zoneCode: `KRN-${Date.now().toString().slice(-4)}`,
      description: "",
      city: "Kurnool",
      state: "Andhra Pradesh",
      pincode: "518001",
      deliveryCharge: 30,
      minimumOrderAmount: 150,
      freeDeliveryThreshold: 500,
      estimatedDeliveryTime: "Morning Harvest (6:00 AM - 10:00 AM)",
      active: true,
      boundary: {
        type: "Polygon",
        coordinates: KURNOOL_PRESETS[0].coordinates,
      },
    });
    setRawCoordinatesText(JSON.stringify(KURNOOL_PRESETS[0].coordinates, null, 2));
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (zone: DeliveryZoneResponse) => {
    setEditingZone(zone);
    const coords = zone.boundary?.coordinates || KURNOOL_PRESETS[0].coordinates;
    setFormData({
      zoneName: zone.zoneName,
      zoneCode: zone.zoneCode,
      description: zone.description || "",
      city: zone.city,
      state: zone.state,
      pincode: zone.pincode || "518001",
      deliveryCharge: zone.deliveryCharge,
      minimumOrderAmount: zone.minimumOrderAmount,
      freeDeliveryThreshold: zone.freeDeliveryThreshold || 500,
      estimatedDeliveryTime: zone.estimatedDeliveryTime || "Morning Harvest (6:00 AM - 10:00 AM)",
      active: zone.active,
      boundary: {
        type: "Polygon",
        coordinates: coords,
      },
    });
    setRawCoordinatesText(JSON.stringify(coords, null, 2));
    setFormError(null);
    setIsModalOpen(true);
  };

  // Apply Preset Coordinates
  const handleApplyPreset = (coords: number[][][]) => {
    setFormData((prev) => ({
      ...prev,
      boundary: {
        type: "Polygon",
        coordinates: coords,
      },
    }));
    setRawCoordinatesText(JSON.stringify(coords, null, 2));
  };

  // Toggle Zone Status
  const handleToggleZoneStatus = async (zone: DeliveryZoneResponse) => {
    try {
      const nextStatus = !zone.active;
      await deliveryService.updateZoneStatus(zone.publicId, nextStatus);
      setZones((prev) =>
        prev.map((z) => (z.publicId === zone.publicId ? { ...z, active: nextStatus } : z))
      );
      showToast(`Zone "${zone.zoneName}" is now ${nextStatus ? "Active" : "Inactive"}`);
    } catch (err: unknown) {
      console.error("[DeliveryZonesManager] Status toggle failed:", err);
      showToast("Failed to update zone status");
    }
  };

  // Submit Create or Update
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.zoneName.trim()) {
      setFormError("Zone Name is required");
      return;
    }
    if (!formData.zoneCode.trim()) {
      setFormError("Zone Code is required");
      return;
    }

    // Parse coordinates
    let parsedCoords: number[][][];
    try {
      parsedCoords = JSON.parse(rawCoordinatesText);
      if (!Array.isArray(parsedCoords) || !Array.isArray(parsedCoords[0])) {
        throw new Error("Coordinates must be an array of rings: [[[lng, lat], ...]]");
      }
    } catch (parseErr) {
      setFormError(
        parseErr instanceof Error
          ? `Invalid GeoJSON coordinates: ${parseErr.message}`
          : "Invalid GeoJSON coordinates syntax"
      );
      return;
    }

    const payload: CreateDeliveryZoneRequest = {
      ...formData,
      boundary: {
        type: "Polygon",
        coordinates: parsedCoords,
      },
    };

    setIsSubmitting(true);
    try {
      if (editingZone) {
        const updated = await deliveryService.updateZone(editingZone.publicId, payload);
        setZones((prev) =>
          prev.map((z) => (z.publicId === editingZone.publicId ? updated : z))
        );
        showToast(`Zone "${updated.zoneName}" updated successfully`);
      } else {
        const created = await deliveryService.createZone(payload);
        setZones((prev) => [created, ...prev]);
        showToast(`Zone "${created.zoneName}" created successfully`);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      console.error("[DeliveryZonesManager] Save failed:", err);
      setFormError(
        err instanceof Error ? err.message : "Failed to save delivery zone. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete Zone
  const handleConfirmDelete = async () => {
    if (!deleteTargetZone) return;

    setIsDeleting(true);
    try {
      await deliveryService.deleteZone(deleteTargetZone.publicId);
      setZones((prev) => prev.filter((z) => z.publicId !== deleteTargetZone.publicId));
      showToast(`Zone "${deleteTargetZone.zoneName}" deleted successfully`);
      setDeleteTargetZone(null);
    } catch (err: unknown) {
      console.error("[DeliveryZonesManager] Delete failed:", err);
      showToast("Failed to delete zone");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered zones
  const filteredZones = zones.filter((z) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      z.zoneName.toLowerCase().includes(q) ||
      z.zoneCode.toLowerCase().includes(q) ||
      z.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-emerald-800 px-4 py-3 text-xs font-bold text-white shadow-lg animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-700" />
            <span>Delivery Zones & Geo-Fencing Management</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure delivery coverage polygons, minimum order thresholds, and charges across Kurnool.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Delivery Zone</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs max-w-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by zone name, code or city..."
          className="w-full bg-transparent focus:outline-none text-slate-800"
        />
      </div>

      {/* Loading & Error States */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          <p className="text-xs font-semibold">Loading delivery zones from Delivery Service...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-xs font-medium text-slate-700">{error}</p>
          <button
            type="button"
            onClick={loadZones}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
          >
            Retry
          </button>
        </div>
      ) : filteredZones.length === 0 ? (
        <div className="py-16 text-center space-y-3 rounded-3xl border border-gray-100 bg-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
            <MapPin className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Delivery Zones Found</h3>
          <p className="max-w-xs mx-auto text-xs text-slate-500">
            Add delivery coverage zones for Kurnool to start accepting customer orders in specific areas.
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create First Zone</span>
          </button>
        </div>
      ) : (
        /* Zones Table */
        <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-3xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-gray-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Zone Name & Code</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Delivery Fee</th>
                  <th className="py-3.5 px-4">Min. Order</th>
                  <th className="py-3.5 px-4">Free Above</th>
                  <th className="py-3.5 px-4">Est. Window</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {filteredZones.map((zone) => (
                  <tr key={zone.publicId} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{zone.zoneName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {zone.zoneCode}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{zone.city}, {zone.state}</div>
                      {zone.pincode && (
                        <div className="text-[10px] text-slate-400">PIN: {zone.pincode}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{zone.deliveryCharge}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{zone.minimumOrderAmount}
                    </td>
                    <td className="py-3.5 px-4">
                      {zone.freeDeliveryThreshold ? (
                        <span className="text-emerald-700 font-bold">
                          ₹{zone.freeDeliveryThreshold}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500 max-w-[150px] truncate">
                      {zone.estimatedDeliveryTime || "6:00 AM - 10:00 AM"}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleZoneStatus(zone)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                          zone.active
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            zone.active ? "bg-emerald-600" : "bg-slate-400"
                          }`}
                        />
                        <span>{zone.active ? "Active" : "Inactive"}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(zone)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                          title="Edit Zone"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetZone(zone)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                          title="Delete Zone"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE / EDIT DELIVERY ZONE MODAL
         ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingZone ? `Edit Delivery Zone: ${editingZone.zoneName}` : "Create New Delivery Zone"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zoneName}
                    onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                    placeholder="e.g. Kurnool Central"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Zone Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zoneCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zoneCode: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. KRN-CENTRAL"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode || ""}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="518001"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Base Delivery Fee (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.deliveryCharge}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryCharge: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Min Order Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.minimumOrderAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minimumOrderAmount: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Free Delivery Threshold (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.freeDeliveryThreshold || 500}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        freeDeliveryThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estimated Delivery Window / Slot *
                </label>
                <input
                  type="text"
                  required
                  value={formData.estimatedDeliveryTime || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedDeliveryTime: e.target.value })
                  }
                  placeholder="e.g. Morning Harvest (6:00 AM - 10:00 AM)"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* GeoJSON Polygon Coordinates Editor */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                    <span>GeoJSON Boundary Polygon [ [ [lng, lat], ... ] ] *</span>
                  </label>
                </div>

                {/* Preset shortcuts */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 self-center">Presets:</span>
                  {KURNOOL_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleApplyPreset(preset.coordinates)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 text-[10px] font-bold transition border border-slate-200"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  required
                  value={rawCoordinatesText}
                  onChange={(e) => setRawCoordinatesText(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2 text-[11px] font-mono focus:border-emerald-500 focus:outline-none bg-slate-50"
                />
                <p className="text-[10px] text-slate-400">
                  Coordinates must be in `[longitude, latitude]` order and form a closed ring.
                </p>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="font-bold text-slate-800">
                  Zone is Active & Open for Customer Checkout
                </span>
              </label>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2 font-bold text-white shadow-xs hover:bg-emerald-800 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Zone...</span>
                    </>
                  ) : (
                    <span>{editingZone ? "Update Zone" : "Create Zone"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE ZONE CONFIRMATION MODAL
         ========================================================================= */}
      {deleteTargetZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Delete Delivery Zone</span>
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete delivery zone <strong>"{deleteTargetZone.zoneName}"</strong> ({deleteTargetZone.zoneCode})?
              Customers located in this zone will no longer be serviceable.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTargetZone(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Zone</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
