"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Bike,
  MapPin,
  Compass,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Crosshair,
} from "lucide-react";
import { DeliveryOrder, DeliveryPartner } from "@/types";

interface InteractiveLeafletMapProps {
  orders: DeliveryOrder[];
  partners: DeliveryPartner[];
  selectedOrderId?: string | null;
  onSelectOrder?: (order: DeliveryOrder) => void;
  onSelectPartner?: (partner: DeliveryPartner) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

export const InteractiveLeafletMap: React.FC<InteractiveLeafletMapProps> = ({
  orders,
  partners,
  selectedOrderId,
  onSelectOrder,
  onSelectPartner,
  isExpanded = false,
  onToggleExpand,
  className = "",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const orderMarkerMapRef = useRef<Map<string, L.Marker>>(new Map());

  const [activeLegendFilter, setActiveLegendFilter] = useState<string>("All");
  const [missingCoordsCount, setMissingCoordsCount] = useState<number>(0);
  const [activeMarkerInfo, setActiveMarkerInfo] = useState<string | null>(null);

  // Kurnool Benchmark Center Coordinates
  const DEFAULT_CENTER: [number, number] = [15.8281, 78.0373];
  const DEFAULT_ZOOM = 13;

  // 1. Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Map Instance
    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false, // Custom styled controls
      attributionControl: true,
    });

    // OpenStreetMap Tile Provider with Required Attribution
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Invalidate Map Size on resize or expand
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
  }, [isExpanded]);

  // Helper: Create HTML Marker Icon with SVG pin and distinct status styling
  const createOrderIcon = (status: DeliveryOrder["status"], isSelected: boolean) => {
    let pinColor = "#10b981"; // Delivered (emerald)
    let badgeText = "D";
    let pulseClass = "";

    if (status === "Out for Delivery") {
      pinColor = "#2563eb"; // Blue
      badgeText = "OFD";
      pulseClass = "animate-pulse";
    } else if (status === "Pending") {
      pinColor = "#f59e0b"; // Amber/Orange
      badgeText = "P";
    } else if (status === "Failed") {
      pinColor = "#ef4444"; // Red
      badgeText = "!";
    }

    const ringEffect = isSelected
      ? "ring-4 ring-emerald-400 ring-offset-2 scale-125 z-50 shadow-xl"
      : "shadow-md hover:scale-110";

    const html = `
      <div class="relative flex items-center justify-center transition-transform duration-200 ${ringEffect} ${pulseClass}" style="width: 32px; height: 32px;">
        <div style="background-color: ${pinColor};" class="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-[10px] border-2 border-white shadow-sm">
          ${badgeText}
        </div>
        <div style="border-top-color: ${pinColor};" class="absolute -bottom-1 w-0 h-0 border-x-4 border-x-transparent border-t-6"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "custom-leaflet-marker",
      iconSize: [32, 38],
      iconAnchor: [16, 38],
      popupAnchor: [0, -36],
    });
  };

  // Helper: Create Delivery Partner Location Icon
  const createPartnerIcon = (partnerName: string) => {
    const initial = partnerName.charAt(0).toUpperCase();
    const html = `
      <div class="relative flex items-center justify-center shadow-lg hover:scale-110 transition-transform" style="width: 34px; height: 34px;">
        <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
        <div class="relative w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center border-2 border-white shadow font-bold text-xs">
          🏍️
        </div>
        <div class="absolute -top-2 -right-1 px-1 py-0.2 rounded bg-slate-900 text-[9px] text-white font-bold leading-none shadow">
          ${initial}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "partner-leaflet-marker",
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
    });
  };

  // 3. Render Markers whenever orders, partners or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    orderMarkerMapRef.current.clear();

    const bounds: [number, number][] = [];
    let missingCount = 0;

    // Filter orders based on legend filter if active
    const visibleOrders = orders.filter((o) => {
      if (activeLegendFilter === "All") return true;
      return o.status === activeLegendFilter;
    });

    // A. Render Customer Delivery Destination Pins
    visibleOrders.forEach((order) => {
      if (!order.coordinates || !order.coordinates.lat || !order.coordinates.lng) {
        missingCount++;
        return;
      }

      const { lat, lng } = order.coordinates;
      bounds.push([lat, lng]);

      const isSelected = selectedOrderId === order.id;
      const icon = createOrderIcon(order.status, isSelected);

      const marker = L.marker([lat, lng], { icon });

      // Build rich informative popup content
      const partnerDisplay = order.assignedPartnerName
        ? `${order.assignedPartnerName} (${order.assignedPartnerPhone || "Available"})`
        : '<span class="text-amber-600 font-semibold">Unassigned</span>';

      const updateTime = order.lastLocationUpdate || order.deliveryTime || order.orderTime || "Unavailable";
      const addressDisplay = order.customerAddress || order.area || "Location details unavailable";

      let statusColorBadge = "bg-emerald-100 text-emerald-800 border-emerald-200";
      if (order.status === "Out for Delivery") statusColorBadge = "bg-blue-100 text-blue-800 border-blue-200";
      else if (order.status === "Pending") statusColorBadge = "bg-amber-100 text-amber-800 border-amber-200";
      else if (order.status === "Failed") statusColorBadge = "bg-rose-100 text-rose-800 border-rose-200";

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #1e293b; min-width: 220px;" class="p-1">
          <div class="flex items-center justify-between border-b pb-1.5 mb-2 gap-2">
            <span class="font-mono font-bold text-emerald-700 text-xs">${order.id}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColorBadge}">
              ${order.status}
            </span>
          </div>
          
          <div class="space-y-1 text-slate-600">
            <div><strong class="text-slate-800">Customer:</strong> ${order.customerName}</div>
            <div><strong class="text-slate-800">Partner:</strong> ${partnerDisplay}</div>
            <div><strong class="text-slate-800">Destination:</strong> <span class="text-slate-500">${addressDisplay}</span></div>
            <div><strong class="text-slate-800">Amount:</strong> ₹${order.amount} (${order.paymentMethod} • ${order.paymentStatus})</div>
            <div class="text-[10px] text-slate-400 pt-1 border-t mt-1">
              <strong>Last Status Ping:</strong> ${updateTime}
            </div>
          </div>
          
          <button id="view-order-btn-${order.id.replace("#", "")}" class="mt-2.5 w-full py-1 px-2 rounded-lg bg-emerald-700 text-white font-bold text-[11px] text-center hover:bg-emerald-800 transition-colors shadow-3xs cursor-pointer">
            View Details & Track
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });

      marker.on("popupopen", () => {
        setActiveMarkerInfo(`${order.id} • ${order.customerName}`);
        const btn = document.getElementById(`view-order-btn-${order.id.replace("#", "")}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectOrder) onSelectOrder(order);
          };
        }
      });

      marker.on("click", () => {
        if (onSelectOrder) onSelectOrder(order);
      });

      marker.addTo(markersLayer);
      orderMarkerMapRef.current.set(order.id, marker);
    });

    // B. Render Delivery Partner Current Location Markers (if not filtered out)
    if (activeLegendFilter === "All" || activeLegendFilter === "Partners") {
      partners.forEach((partner) => {
        if (!partner.currentLocation || !partner.currentLocation.lat || !partner.currentLocation.lng) return;

        const { lat, lng } = partner.currentLocation;
        bounds.push([lat, lng]);

        const partnerIcon = createPartnerIcon(partner.name);
        const partnerMarker = L.marker([lat, lng], { icon: partnerIcon });

        const partnerPopupHtml = `
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #1e293b; min-width: 210px;" class="p-1">
            <div class="flex items-center justify-between border-b pb-1.5 mb-2 gap-2">
              <span class="font-bold text-slate-900 text-xs">${partner.name}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ${partner.status}
              </span>
            </div>
            
            <div class="space-y-1 text-slate-600 text-xs">
              <div><strong class="text-slate-800">Partner ID:</strong> ${partner.id}</div>
              <div><strong class="text-slate-800">Contact:</strong> ${partner.phone}</div>
              <div><strong class="text-slate-800">Assigned Area:</strong> ${partner.area}</div>
              <div><strong class="text-slate-800">Vehicle:</strong> ${partner.vehicleDetails || "Two Wheeler"}</div>
              <div class="text-[10px] text-slate-400 pt-1 border-t mt-1">
                <strong>GPS Status Ping:</strong> ${partner.currentLocation.lastUpdated || "Live stream ready"}
              </div>
            </div>
          </div>
        `;

        partnerMarker.bindPopup(partnerPopupHtml, { maxWidth: 260 });
        partnerMarker.on("click", () => {
          if (onSelectPartner) onSelectPartner(partner);
        });

        partnerMarker.addTo(markersLayer);
      });
    }

    setMissingCoordsCount(missingCount);

    // Auto-fit bounds if we have coordinates and no specific order is selected
    if (bounds.length > 0 && !selectedOrderId) {
      try {
        map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30], maxZoom: 15 });
      } catch (e) {
        // Fallback to default
        map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      }
    }
  }, [orders, partners, activeLegendFilter]);

  // 4. Center and open popup when selectedOrderId changes from Table
  useEffect(() => {
    if (!selectedOrderId || !mapInstanceRef.current) return;
    const marker = orderMarkerMapRef.current.get(selectedOrderId);
    if (marker) {
      const latLng = marker.getLatLng();
      mapInstanceRef.current.flyTo(latLng, 15, { animate: true, duration: 1 });
      marker.openPopup();
    }
  }, [selectedOrderId]);

  // Map Controls Handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true });
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markers: L.Marker[] = [];
    markersLayerRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) markers.push(layer);
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [30, 30], maxZoom: 15 });
    } else {
      handleResetView();
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-3xs overflow-hidden flex flex-col ${className}`}>
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Live Delivery Map
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Kurnool Region
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFitAll}
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-50 transition-colors"
            title="Fit all markers"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              title={isExpanded ? "Collapse map" : "Expand map full width"}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Demo Simulation Notice Banner (Requirement: clearly label mock/demo coordinates) */}
      <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5 truncate">
          <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate font-medium">
            Demo Coordinates (Sample Delivery Zone) • Ready for Java Backend GPS Stream
          </span>
        </div>
        {missingCoordsCount > 0 && (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
            {missingCoordsCount} missing GPS
          </span>
        )}
      </div>

      {/* Map Viewport Area */}
      <div className="relative w-full h-[340px] sm:h-[380px] lg:h-[420px] bg-slate-100 overflow-hidden">
        {/* Leaflet DOM Node */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Custom Map Controls */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-slate-200/90 p-1">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 my-0.5" />
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 my-0.5" />
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
            title="Reset View"
            aria-label="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* Selected Order Toast Overlay when active */}
        {selectedOrderId && (
          <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-xl shadow-md text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>Focused on Order {selectedOrderId}</span>
          </div>
        )}
      </div>

      {/* Interactive Status Legend (Synchronized with real values) */}
      <div className="p-3 bg-white border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Map Legend & Filter
          </span>
          <span className="text-[10px] text-slate-400">Click to filter markers</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
          {/* Delivered */}
          <button
            type="button"
            onClick={() => setActiveLegendFilter(activeLegendFilter === "Delivered" ? "All" : "Delivered")}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-left transition-all ${
              activeLegendFilter === "Delivered"
                ? "bg-emerald-50 border-emerald-400 font-bold text-emerald-900 shadow-3xs"
                : "bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0" />
            <span className="truncate text-[11px]">Delivered</span>
          </button>

          {/* Out for Delivery */}
          <button
            type="button"
            onClick={() =>
              setActiveLegendFilter(activeLegendFilter === "Out for Delivery" ? "All" : "Out for Delivery")
            }
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-left transition-all ${
              activeLegendFilter === "Out for Delivery"
                ? "bg-blue-50 border-blue-400 font-bold text-blue-900 shadow-3xs"
                : "bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shrink-0 animate-pulse" />
            <span className="truncate text-[11px]">Out for Delivery</span>
          </button>

          {/* Pending */}
          <button
            type="button"
            onClick={() => setActiveLegendFilter(activeLegendFilter === "Pending" ? "All" : "Pending")}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-left transition-all ${
              activeLegendFilter === "Pending"
                ? "bg-amber-50 border-amber-400 font-bold text-amber-900 shadow-3xs"
                : "bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0" />
            <span className="truncate text-[11px]">Pending</span>
          </button>

          {/* Failed */}
          <button
            type="button"
            onClick={() => setActiveLegendFilter(activeLegendFilter === "Failed" ? "All" : "Failed")}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-left transition-all ${
              activeLegendFilter === "Failed"
                ? "bg-rose-50 border-rose-400 font-bold text-rose-900 shadow-3xs"
                : "bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shrink-0" />
            <span className="truncate text-[11px]">Failed</span>
          </button>

          {/* Delivery Partner */}
          <button
            type="button"
            onClick={() => setActiveLegendFilter(activeLegendFilter === "Partners" ? "All" : "Partners")}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-left transition-all ${
              activeLegendFilter === "Partners"
                ? "bg-emerald-50 border-emerald-400 font-bold text-emerald-900 shadow-3xs"
                : "bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 shrink-0 flex items-center justify-center text-[7px] text-white font-bold">
              🏍️
            </span>
            <span className="truncate text-[11px]">Partner GPS</span>
          </button>

          {/* Reset All */}
          <button
            type="button"
            onClick={() => setActiveLegendFilter("All")}
            className={`flex items-center justify-center px-2 py-1 rounded-lg border text-center transition-all ${
              activeLegendFilter === "All"
                ? "bg-slate-900 border-slate-900 font-bold text-white shadow-3xs"
                : "bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="text-[11px]">Show All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
