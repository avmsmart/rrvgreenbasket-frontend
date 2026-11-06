"use client";

import React from "react";
import dynamic from "next/dynamic";
import { DeliveryOrder, DeliveryPartner } from "@/types";
import { Loader2 } from "lucide-react";

interface LiveDeliveryMapProps {
  orders: DeliveryOrder[];
  partners: DeliveryPartner[];
  selectedOrderId?: string | null;
  onSelectOrder?: (order: DeliveryOrder) => void;
  onSelectPartner?: (partner: DeliveryPartner) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

// Dynamically import Leaflet component with SSR disabled (Standard Next.js Best Practice)
const DynamicLeafletMap = dynamic(
  () =>
    import("./InteractiveLeafletMap").then((mod) => mod.InteractiveLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs p-6 h-[480px] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-[#00875a] animate-spin mb-3" />
        <p className="font-bold text-slate-800 text-sm">
          Loading Interactive Delivery Map...
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Initializing OpenStreetMap tile engine and live delivery markers for Kurnool Region
        </p>
      </div>
    ),
  }
);

export const LiveDeliveryMap: React.FC<LiveDeliveryMapProps> = (props) => {
  return <DynamicLeafletMap {...props} />;
};
