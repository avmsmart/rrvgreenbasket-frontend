"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Sparkles, Plus, Star, Upload, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Sector } from "@/types/sector";

interface AddSectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sector: Omit<Sector, "id">) => void;
  nextDisplayOrder: number;
}

const ICON_PRESETS = ["🥦", "🍎", "🌾", "🥛", "🍪", "🧃", "🌿", "🧼", "🌶️", "🥔", "🍋", "🥕"];

export const AddSectorModal: React.FC<AddSectorModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  nextDisplayOrder,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🥦");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [visualTab, setVisualTab] = useState<"emoji" | "upload" | "url">("emoji");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayOrder, setDisplayOrder] = useState(nextDisplayOrder);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  // Sync state whenever modal opens or nextDisplayOrder updates
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setIcon("🥦");
      setImagePreview(null);
      setImageUrl("");
      setVisualTab("emoji");
      setDisplayOrder(nextDisplayOrder || 1);
      setIsFeatured(false);
      setStatus("Active");
    }
  }, [isOpen, nextDisplayOrder]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImagePreview(reader.result);
          setImageUrl("");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      description: description.trim(),
      icon: icon || "📦",
      image: imagePreview || (imageUrl.trim() ? imageUrl.trim() : undefined),
      displayOrder: Number(displayOrder) || nextDisplayOrder,
      isFeatured,
      status,
      productsCount: 0,
      totalOrders: 0,
      revenue: 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">Add New Sector</h3>
            <p className="text-xs text-slate-500 font-medium">
              Create a new category for products and mobile home screen navigation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Sector Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sector Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fresh Herbs & Microgreens"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. Daily harvest herbs, mint, and fresh garnishes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
            />
          </div>

          {/* Sector Icon / Image Selection */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Sector Icon / Display Graphic
              </label>

              {/* Mode Tabs */}
              <div className="flex items-center p-0.5 bg-slate-200/70 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setVisualTab("emoji")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    visualTab === "emoji" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-600"
                  }`}
                >
                  Emoji
                </button>
                <button
                  type="button"
                  onClick={() => setVisualTab("upload")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    visualTab === "upload" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-600"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setVisualTab("url")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    visualTab === "url" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-600"
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* Live Preview & Input Row */}
            <div className="flex items-center gap-3">
              {/* Preview Thumbnail */}
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-3xs">
                {imagePreview || imageUrl ? (
                  <img
                    src={imagePreview || imageUrl}
                    alt="Sector"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">{icon}</span>
                )}
              </div>

              {/* Tab Contents */}
              <div className="flex-1 min-w-0">
                {visualTab === "emoji" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={icon}
                        onChange={(e) => {
                          setIcon(e.target.value);
                          setImagePreview(null);
                          setImageUrl("");
                        }}
                        maxLength={4}
                        placeholder="🥦"
                        className="w-16 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-center text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00875a]"
                      />
                      <span className="text-[11px] text-slate-400">or click a preset below:</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {ICON_PRESETS.map((emoji) => (
                        <button
                          type="button"
                          key={emoji}
                          onClick={() => {
                            setIcon(emoji);
                            setImagePreview(null);
                            setImageUrl("");
                          }}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all ${
                            icon === emoji && !imagePreview && !imageUrl
                              ? "bg-emerald-100 border-2 border-[#00875a] scale-105"
                              : "bg-white hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {visualTab === "upload" && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-3xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Photo</span>
                      </button>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => setImagePreview(null)}
                          className="text-xs font-bold text-rose-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Upload JPEG or PNG from your computer (auto-previewed).
                    </p>
                  </div>
                )}

                {visualTab === "url" && (
                  <div>
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setImagePreview(null);
                        }}
                        placeholder="https://... image link"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#00875a]"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Paste a direct HTTPS URL to a banner or category picture.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Display Order & Initial Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:bg-white"
              />
              <span className="text-[10px] text-slate-400">Position in category lists</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <span className="text-[10px] text-slate-400">Visible to shoppers</span>
            </div>
          </div>

          {/* Featured on Home Screen */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${isFeatured ? "fill-amber-500 text-amber-500" : "text-amber-600"}`} />
              <div>
                <span className="text-xs font-bold text-amber-950">
                  Feature on Mobile Home Screen
                </span>
                <p className="text-[11px] text-amber-800">
                  Highlighted with prominent banner and top carousel ranking.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-[#00875a] rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00875a] hover:bg-[#00704a] text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Sector</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
