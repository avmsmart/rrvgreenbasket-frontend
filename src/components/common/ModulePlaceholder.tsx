"use client";

import React, { useState } from "react";
import { Breadcrumbs } from "@/components/layout";
import {
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit2,
  MoreVertical,
  Check,
  Sparkles,
} from "lucide-react";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  tabs?: string[];
  actionButtonLabel?: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  title,
  description,
  tabs = ["All Records", "Active", "Pending", "Completed"],
  actionButtonLabel = `+ Add ${title.endsWith("s") ? title.slice(0, -1) : title}`,
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const triggerAction = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: title }]} />

      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => triggerAction(`Exporting ${title} report...`)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-3xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => triggerAction(`${actionButtonLabel} modal triggered!`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00875a] hover:bg-[#00734d] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{actionButtonLabel}</span>
          </button>
        </div>
      </div>

      {/* Interactive Toast / Notification Banner if an action was clicked */}
      {feedbackMessage && (
        <div className="p-3.5 rounded-2xl bg-[#eaf8f0] border border-[#bbf7d0] text-[#00875a] text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#00875a]" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-[#00875a] hover:text-[#005c3e] font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Interactive Tabs Bar matching PDF Design */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#00875a] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Filter and In-Page Search Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${title.toLowerCase()}...`}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => triggerAction("Filter parameters updated")}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter</span>
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-slate-400 hover:text-slate-600 underline px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Module Content Readiness Container */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-3xs">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          {title} Management Ready
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
          Active Filter: <span className="font-bold text-emerald-700">{activeTab}</span>
          {searchQuery ? ` • Search: "${searchQuery}"` : ""}
        </p>
        <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
          Shared Admin Layout is fully interactive. This module&apos;s full data tables, forms,
          and workflows will be implemented in its respective step according to the UI/UX PDF reference.
        </p>

        {/* Interactive Sample Action Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => triggerAction("View Details modal opened")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Preview Details</span>
          </button>

          <button
            type="button"
            onClick={() => triggerAction("Edit record opened")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Mode</span>
          </button>

          <button
            type="button"
            onClick={() => triggerAction("More options dropdown")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
            <span>Options</span>
          </button>
        </div>
      </div>
    </div>
  );
};
