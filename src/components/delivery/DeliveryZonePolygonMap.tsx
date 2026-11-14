"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import {
  MapPin,
  Search,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Navigation,
  Info,
  Check,
  Undo2,
  Crosshair,
} from "lucide-react";
import { GeoJsonPolygon } from "@/types/delivery";

// Kurnool Key Landmarks for Quick Navigation Reference
const KURNOOL_REFERENCE_LANDMARKS: { name: string; lat: number; lng: number; desc: string }[] = [
  {
    name: "Rajivihar (Central Reference)",
    lat: 15.8285,
    lng: 78.038,
    desc: "Primary delivery hub & reference center",
  },
  {
    name: "Kondareddy Burj",
    lat: 15.834,
    lng: 78.0425,
    desc: "Historic landmark & market sector",
  },
  {
    name: "Checkpost (Nandyal Rd)",
    lat: 15.814,
    lng: 78.055,
    desc: "Eastern entry & commercial junction",
  },
  {
    name: "Kurnool Old Bus Stand",
    lat: 15.827,
    lng: 78.0335,
    desc: "Central transit hub",
  },
  {
    name: "Kurnool City Railway Station",
    lat: 15.832,
    lng: 78.026,
    desc: "Western railway corridor",
  },
];

interface DeliveryZonePolygonMapProps {
  initialBoundary?: GeoJsonPolygon;
  onChange: (boundary: GeoJsonPolygon) => void;
  zoneName?: string;
  className?: string;
}

export const DeliveryZonePolygonMap: React.FC<DeliveryZonePolygonMapProps> = ({
  initialBoundary,
  onChange,
  zoneName = "Delivery Zone",
  className = "",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layers refs
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Vertices stored in Leaflet [lat, lng] format
  const [vertices, setVertices] = useState<[number, number][]>(() => {
    if (
      initialBoundary &&
      initialBoundary.coordinates &&
      initialBoundary.coordinates[0] &&
      initialBoundary.coordinates[0].length >= 3
    ) {
      // Convert from GeoJSON [lng, lat] to Leaflet [lat, lng]
      const ring = initialBoundary.coordinates[0];
      // Exclude duplicate closing point if present for vertex array
      const pts = ring.slice(0, ring.length > 3 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1] ? ring.length - 1 : ring.length);
      return pts.map(([lng, lat]) => [lat, lng] as [number, number]);
    }
    return [];
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<string | null>("Rajivihar (Central Reference)");

  // Default center: Kurnool (Rajivihar reference point)
  const KURNOOL_CENTER: [number, number] = [15.8285, 78.038];

  // Helper to convert Leaflet vertices [lat, lng] to GeoJSON Polygon [[[lng, lat], ...]]
  const convertVerticesToGeoJson = useCallback((pts: [number, number][]): GeoJsonPolygon => {
    if (pts.length < 3) {
      return {
        type: "Polygon",
        coordinates: [[]],
      };
    }
    // GeoJSON coordinate order is [longitude, latitude]
    const closedRing: number[][] = pts.map(([lat, lng]) => [
      Number(lng.toFixed(6)),
      Number(lat.toFixed(6)),
    ]);
    // Automatically close the polygon: last point must match first point
    closedRing.push([closedRing[0][0], closedRing[0][1]]);

    return {
      type: "Polygon",
      coordinates: [closedRing],
    };
  }, []);

  // Update parent when vertices change
  useEffect(() => {
    if (vertices.length >= 3) {
      const geojson = convertVerticesToGeoJson(vertices);
      onChange(geojson);
      setValidationError(null);
    } else if (vertices.length > 0) {
      setValidationError("A delivery boundary requires at least 3 distinct boundary points.");
    } else {
      setValidationError("Click on the map to define the delivery zone boundary.");
    }
  }, [vertices, convertVerticesToGeoJson, onChange]);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter = vertices.length > 0 ? vertices[0] : KURNOOL_CENTER;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false,
      attributionControl: true,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Map click adds a vertex
    map.on("click", (e: L.LeafletMouseEvent) => {
      const newLat = Number(e.latlng.lat.toFixed(6));
      const newLng = Number(e.latlng.lng.toFixed(6));
      setVertices((prev) => [...prev, [newLat, newLng]]);
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Synchronize Polygon & Markers on Map whenever vertices change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old visual layers
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
    if (polylineLayerRef.current) {
      map.removeLayer(polylineLayerRef.current);
      polylineLayerRef.current = null;
    }
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }

    if (vertices.length === 0) return;

    // Draw connecting polyline while drawing (< 3 points)
    if (vertices.length < 3) {
      const polyline = L.polyline(vertices, {
        color: "#00875a",
        weight: 3,
        dashArray: "6, 6",
      }).addTo(map);
      polylineLayerRef.current = polyline;
    } else {
      // Draw completed polygon (>= 3 points)
      const polygon = L.polygon(vertices, {
        color: "#00875a",
        weight: 2.5,
        fillColor: "#10b981",
        fillOpacity: 0.35,
      }).addTo(map);
      polygonLayerRef.current = polygon;
    }

    // Add draggable vertex markers with numbers
    vertices.forEach(([lat, lng], index) => {
      const icon = L.divIcon({
        className: "custom-vertex-marker",
        html: `
          <div style="
            background: #00875a;
            color: white;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 800;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: grab;
          ">
            ${index + 1}
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([lat, lng], {
        icon,
        draggable: true,
      });

      marker.on("dragend", (e) => {
        const target = e.target as L.Marker;
        const newPos = target.getLatLng();
        setVertices((prev) => {
          const updated = [...prev];
          updated[index] = [
            Number(newPos.lat.toFixed(6)),
            Number(newPos.lng.toFixed(6)),
          ];
          return updated;
        });
      });

      markersGroupRef.current?.addLayer(marker);
    });
  }, [vertices]);

  // Actions
  const handleUndoPoint = () => {
    setVertices((prev) => prev.slice(0, prev.length - 1));
  };

  const handleClearPolygon = () => {
    setVertices([]);
    onChange({ type: "Polygon", coordinates: [[]] });
  };

  // Jump to Reference Landmark
  const handleJumpToLandmark = (lm: (typeof KURNOOL_REFERENCE_LANDMARKS)[0]) => {
    setSelectedLandmark(lm.name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lm.lat, lm.lng], 15, { duration: 1.0 });
    }
  };

  // Search Address / Locality via Nominatim
  const handleSearchLocality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const query = searchQuery.toLowerCase().includes("kurnool")
        ? searchQuery
        : `${searchQuery}, Kurnool, Andhra Pradesh`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`,
        { headers: { Accept: "application/json" } }
      );

      if (!response.ok) throw new Error("Search failed");
      const results = await response.json();

      if (results && results.length > 0) {
        const item = results[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
        }
      } else {
        setSearchError("No locality found matching this query in Kurnool.");
      }
    } catch {
      setSearchError("Could not complete locality search. Please zoom or pan manually.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Search & Reference Landmarks Bar */}
      <div className="space-y-2">
        <form onSubmit={handleSearchLocality} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locality in Kurnool (e.g. Rajivihar, Kondareddy Burj, Checkpost)..."
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>

        {searchError && (
          <p className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
            <AlertCircle className="h-3 w-3" />
            <span>{searchError}</span>
          </p>
        )}

        {/* Quick Reference Landmark Buttons (Rajivihar, Kondareddy Burj, Checkpost, Bus Stand, Railway Station) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Navigation className="h-3 w-3 text-emerald-700" />
            <span>Reference Points:</span>
          </span>
          {KURNOOL_REFERENCE_LANDMARKS.map((lm) => (
            <button
              key={lm.name}
              type="button"
              onClick={() => handleJumpToLandmark(lm)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition border ${
                selectedLandmark === lm.name
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800"
              }`}
              title={lm.desc}
            >
              {lm.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Box */}
      <div className="relative rounded-2xl border border-gray-200 overflow-hidden shadow-xs bg-slate-100">
        <div ref={mapContainerRef} className="h-80 w-full z-10" />

        {/* Map Drawing Controls Toolbar Overlay */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-md">
          <button
            type="button"
            onClick={handleUndoPoint}
            disabled={vertices.length === 0}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition disabled:opacity-40"
            title="Undo Last Point"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleClearPolygon}
            disabled={vertices.length === 0}
            className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition disabled:opacity-40"
            title="Clear Boundary"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="h-px bg-slate-200 my-0.5" />
          <button
            type="button"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo(KURNOOL_CENTER, 14);
              }
            }}
            className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-50 transition"
            title="Reset to Rajivihar / Kurnool Center"
          >
            <Crosshair className="h-4 w-4" />
          </button>
        </div>

        {/* Real-time Status Badge */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs">
          {vertices.length < 3 ? (
            <span className="text-amber-800 font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span>{vertices.length} point{vertices.length === 1 ? "" : "s"} added (click map to draw boundary)</span>
            </span>
          ) : (
            <span className="text-emerald-800 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <span>{vertices.length} vertices • Boundary Polygon Closed</span>
            </span>
          )}
        </div>
      </div>

      {/* Informative Guidance & Verification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-1">
        <p className="flex items-center gap-1.5 text-slate-600">
          <Info className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>Click on the map to add boundary points. Drag numbered markers to adjust corners.</span>
        </p>
        <span className="font-mono text-[11px] text-slate-400">
          Format: GeoJSON Polygon [lng, lat]
        </span>
      </div>

      {validationError && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
