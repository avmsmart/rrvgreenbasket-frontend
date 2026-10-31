"use client";

import React, { useState } from "react";
import { StoreSettings, DaySchedule } from "@/types/settings";
import {
  Clock,
  CheckCircle2,
  Copy,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  Check,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface BusinessHoursCardProps {
  settings: StoreSettings;
  onChange: (updated: Partial<StoreSettings>) => void;
}

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { id: "BH-1", day: "Monday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
  { id: "BH-2", day: "Tuesday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
  { id: "BH-3", day: "Wednesday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
  { id: "BH-4", day: "Thursday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
  { id: "BH-5", day: "Friday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
  { id: "BH-6", day: "Saturday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
  { id: "BH-7", day: "Sunday", openTime: "07:00 AM", closeTime: "09:00 PM", isOpen: true },
];

export const BusinessHoursCard: React.FC<BusinessHoursCardProps> = ({
  settings,
  onChange,
}) => {
  const schedule =
    settings.businessHours && settings.businessHours.length > 0
      ? settings.businessHours
      : DEFAULT_SCHEDULE;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formDay, setFormDay] = useState("");
  const [formOpenTime, setFormOpenTime] = useState("06:00 AM");
  const [formCloseTime, setFormCloseTime] = useState("10:00 PM");
  const [formIsOpen, setFormIsOpen] = useState(true);

  // Delete confirm state
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  // Open modal for editing
  const handleOpenEdit = (index: number) => {
    const item = schedule[index];
    setEditingIndex(index);
    setFormDay(item.day);
    setFormOpenTime(item.openTime);
    setFormCloseTime(item.closeTime);
    setFormIsOpen(item.isOpen);
    setIsModalOpen(true);
  };

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormDay("");
    setFormOpenTime("06:00 AM");
    setFormCloseTime("10:00 PM");
    setFormIsOpen(true);
    setIsModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDay.trim()) return;

    const updated = [...schedule];
    if (editingIndex !== null) {
      // Edit
      updated[editingIndex] = {
        ...updated[editingIndex],
        day: formDay.trim(),
        openTime: formOpenTime.trim() || "06:00 AM",
        closeTime: formCloseTime.trim() || "10:00 PM",
        isOpen: formIsOpen,
      };
    } else {
      // Add
      updated.push({
        id: `BH-${Date.now()}`,
        day: formDay.trim(),
        openTime: formOpenTime.trim() || "06:00 AM",
        closeTime: formCloseTime.trim() || "10:00 PM",
        isOpen: formIsOpen,
      });
    }

    onChange({ businessHours: updated });
    setIsModalOpen(false);
  };

  // Delete
  const handleConfirmDelete = () => {
    if (deleteIndex === null) return;
    const updated = schedule.filter((_, idx) => idx !== deleteIndex);
    onChange({ businessHours: updated });
    setDeleteIndex(null);
  };

  // Quick toggle open/closed
  const handleQuickToggle = (index: number) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], isOpen: !updated[index].isOpen };
    onChange({ businessHours: updated });
  };

  // Apply Mon to All
  const handleApplyToAll = () => {
    if (schedule.length === 0) return;
    const base = schedule[0];
    const updated = schedule.map((s) => ({
      ...s,
      openTime: base.openTime,
      closeTime: base.closeTime,
      isOpen: true,
    }));
    onChange({ businessHours: updated });
  };

  // Reset to standard 7 days
  const handleResetToDefault = () => {
    if (confirm("Reset business hours to standard 7-day schedule (Mon-Sun)?")) {
      onChange({ businessHours: DEFAULT_SCHEDULE });
    }
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs space-y-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900">Operating & Delivery Hours</h3>
          <p className="text-xs text-slate-500 font-medium">
            Define daily store opening and closing times for order dispatch and customer support.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00875a] hover:bg-[#00744e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Day / Shift</span>
          </button>

          <button
            type="button"
            onClick={handleApplyToAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            title="Copy Monday hours to all active days"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Apply Mon to All</span>
            <span className="sm:hidden">Apply Mon</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl transition-colors"
            title="Reset to default 7 days"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Schedule Table/Cards */}
      {schedule.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No Operating Hours Defined</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Add custom operating days or reset to the standard 7-day weekly schedule.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-[#00875a] text-white text-xs font-bold rounded-xl"
            >
              + Add Operating Day
            </button>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Restore 7-Day Default
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {schedule.map((item, idx) => (
            <div
              key={item.id || `${item.day}-${idx}`}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-colors ${
                item.isOpen
                  ? "bg-slate-50/70 border-slate-200/80 hover:border-slate-300"
                  : "bg-slate-100/50 border-slate-200 opacity-60 hover:opacity-80"
              }`}
            >
              {/* Day and Open toggle */}
              <div className="flex items-center justify-between sm:justify-start gap-3 sm:w-48">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {item.day}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickToggle(idx)}
                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full transition-all ${
                    item.isOpen
                      ? "bg-emerald-100 text-[#00875a] hover:bg-emerald-200"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                  title="Click to toggle Open / Closed"
                >
                  {item.isOpen ? "Open" : "Closed"}
                </button>
              </div>

              {/* Time display */}
              <div className="flex-1 sm:text-center">
                {item.isOpen ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-3xs">
                    <Clock className="w-3.5 h-3.5 text-[#00875a]" />
                    <span>{item.openTime}</span>
                    <span className="text-slate-400">to</span>
                    <span>{item.closeTime}</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400 italic">
                    Store Closed on {item.day}
                  </span>
                )}
              </div>

              {/* Actions: Edit & Delete */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(idx)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-3xs transition-colors"
                  title={`Edit ${item.day} hours`}
                >
                  <Pencil className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteIndex(idx)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold rounded-xl border border-slate-200 hover:border-rose-200 shadow-3xs transition-colors"
                  title={`Delete ${item.day}`}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timezone */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-700">Platform Timezone</span>
          <p className="text-[11px] text-slate-400">
            Used for delivery slot scheduling and daily order cutoff calculations.
          </p>
        </div>
        <div className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          {settings.timeZone || "(GMT+05:30) India Standard Time (IST)"}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-[#00875a]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingIndex !== null ? "Edit Operating Hours" : "Add Operating Day / Shift"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {editingIndex !== null
                      ? `Update timing for ${formDay || "this day"}`
                      : "Configure new day or festival schedule"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-5 space-y-4">
              {/* Day Label */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Day / Schedule Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monday, Sunday Express, Festival Shift"
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
                />
              </div>

              {/* Status Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Operating Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormIsOpen(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      formIsOpen
                        ? "bg-emerald-50 border-emerald-300 text-[#00875a] shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#00875a]" />
                    <span>Open for Orders</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormIsOpen(false)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      !formIsOpen
                        ? "bg-rose-50 border-rose-300 text-rose-700 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <X className="w-4 h-4 text-rose-500" />
                    <span>Store Closed</span>
                  </button>
                </div>
              </div>

              {/* Time Pickers */}
              {formIsOpen && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Opening Time *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="06:00 AM"
                      value={formOpenTime}
                      onChange={(e) => setFormOpenTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-center focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Closing Time *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="10:00 PM"
                      value={formCloseTime}
                      onChange={(e) => setFormCloseTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-center focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
                    />
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#00875a] hover:bg-[#00744e] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingIndex !== null ? "Update Schedule" : "Add Day"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">Delete Operating Day?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete{" "}
                <span className="font-bold text-slate-800">
                  {schedule[deleteIndex]?.day}
                </span>{" "}
                from business hours? You can restore default days anytime.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteIndex(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
