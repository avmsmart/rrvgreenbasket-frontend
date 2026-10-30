"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Plus,
  Package,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import { Product, ProductCategory } from "@/types";
import { Sector } from "@/types/sector";
import { getSavedSectors } from "@/data/shared-store";
import { ProduceImage } from "@/components/common";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: (product: Partial<Product>) => void;
}

const PRESET_PRODUCE_IMAGES = [
  { label: "Tomato", url: "/images/products/tomato.jpg", icon: "🍅" },
  { label: "Onion", url: "/images/products/onion.jpg", icon: "🧅" },
  { label: "Potato", url: "/images/products/potato.jpg", icon: "🥔" },
  { label: "Carrot", url: "/images/products/carrot.jpg", icon: "🥕" },
  { label: "Spinach", url: "/images/products/spinach.jpg", icon: "🥬" },
  { label: "Lemon", url: "/images/products/lemon.jpg", icon: "🍋" },
  { label: "Chilli", url: "/images/products/chilli.jpg", icon: "🌶️" },
  { label: "Coriander", url: "/images/products/coriander.jpg", icon: "🌿" },
  { label: "Ginger", url: "/images/products/ginger.jpg", icon: "🫚" },
  { label: "Capsicum", url: "/images/products/capsicum.jpg", icon: "🫑" },
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
}) => {
  const [sectorsList, setSectorsList] = useState<Sector[]>([]);
  const [name, setName] = useState("");
  const [excelName, setExcelName] = useState("");
  const [erpCode, setErpCode] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Indian Vegetables");

  React.useEffect(() => {
    setSectorsList(getSavedSectors());
    const handleSectors = (e: Event) => {
      const customEvent = e as CustomEvent<Sector[]>;
      if (customEvent.detail) setSectorsList(customEvent.detail);
      else setSectorsList(getSavedSectors());
    };
    window.addEventListener("rrv:sectors:updated", handleSectors);
    return () => window.removeEventListener("rrv:sectors:updated", handleSectors);
  }, []);
  const [hsnCode, setHsnCode] = useState("7101000");
  const [unit, setUnit] = useState("Kg");
  const [quotRate, setQuotRate] = useState<number | "">("");
  const [srmRate, setSrmRate] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [minStock, setMinStock] = useState<number | "">(10);

  // Product Image State
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadTab, setImageUploadTab] = useState<"file" | "url" | "presets">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setImagePreview(url.trim() ? url.trim() : null);
  };

  const handleSelectPreset = (url: string) => {
    setImageUrl(url);
    setImagePreview(url);
  };

  const handleClearImage = () => {
    setImageUrl("");
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !srmRate) return;

    const newProd: Partial<Product> = {
      name,
      excelName: excelName || name,
      erpCode: erpCode || `VGIV${Math.floor(100000 + Math.random() * 900000)}`,
      category,
      hsnCode,
      unit,
      originalPrice: Number(quotRate) || Number(srmRate),
      price: Number(srmRate),
      stock: Number(stock) || 50,
      minStock: Number(minStock) || 10,
      status: (Number(stock) || 50) <= (Number(minStock) || 10) ? "Low Stock" : "In Stock",
      imageUrl: imageUrl.trim() || undefined,
    };

    if (onProductAdded) {
      onProductAdded(newProd);
    }

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setName("");
      setExcelName("");
      setErpCode("");
      setQuotRate("");
      setSrmRate("");
      setStock("");
      setImageUrl("");
      setImagePreview(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00875a] text-white flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                Add New Master Product
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Add item to ERP Price Catalog, set image, &amp; initialize inventory
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 shadow-3xs transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-[#eaf8f0] border border-[#bbf7d0] text-[#00875a] flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Product with custom image added to master catalog successfully!</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* 1. PRODUCT IMAGE UPLOAD SECTION */}
            <div className="p-4 bg-gradient-to-br from-emerald-50/50 to-slate-50/80 rounded-2xl border border-emerald-100/90 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800">
                    Product Image (Required for Storefront Display)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Upload produce photo from device, enter URL, or pick from presets
                  </p>
                </div>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Image</span>
                  </button>
                )}
              </div>

              {/* Image Preview & Selector Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                {/* Live Thumbnail Preview */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 border-dashed border-emerald-300 flex items-center justify-center flex-shrink-0 shadow-inner group">
                  {imagePreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={imagePreview}
                      alt="Product Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400 flex flex-col items-center">
                      <ImageIcon className="w-6 h-6 text-emerald-600 mb-0.5" />
                      <span className="text-[9px] font-bold">No Image</span>
                    </div>
                  )}
                </div>

                {/* Tab Switcher & Upload Inputs */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageUploadTab("file")}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                        imageUploadTab === "file"
                          ? "bg-[#00875a] text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageUploadTab("url")}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                        imageUploadTab === "url"
                          ? "bg-[#00875a] text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Image URL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageUploadTab("presets")}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                        imageUploadTab === "presets"
                          ? "bg-[#00875a] text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>Presets</span>
                    </button>
                  </div>

                  {/* Tab 1: File Upload */}
                  {imageUploadTab === "file" && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelected}
                        className="hidden"
                        id="product-file-upload"
                      />
                      <label
                        htmlFor="product-file-upload"
                        className="w-full py-2 px-3 border border-emerald-300 bg-white hover:bg-emerald-50/50 rounded-xl text-xs font-bold text-[#00875a] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-3xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {imagePreview ? "Change Selected Image" : "Choose Image from Device"}
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Tab 2: URL Input */}
                  {imageUploadTab === "url" && (
                    <div>
                      <input
                        type="url"
                        placeholder="https://example.com/fresh-produce.jpg"
                        value={imageUrl.startsWith("data:") ? "" : imageUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  {/* Tab 3: Presets */}
                  {imageUploadTab === "presets" && (
                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                      {PRESET_PRODUCE_IMAGES.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleSelectPreset(preset.url)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                            imageUrl === preset.url
                              ? "bg-emerald-100 text-[#00875a] border-emerald-400"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span>{preset.icon}</span>
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. PRODUCT NAME DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name (ERP) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broccoli"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200/90 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Name in Excel
                </label>
                <input
                  type="text"
                  placeholder="e.g. Broccoli Fresh"
                  value={excelName}
                  onChange={(e) => setExcelName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200/90 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* 3. CODE, CATEGORY & UOM */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ERP Code
                </label>
                <input
                  type="text"
                  placeholder="VGEV000904"
                  value={erpCode}
                  onChange={(e) => setErpCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-semibold bg-slate-50 border border-slate-200/90 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-2.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200/90 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  <option value="English Vegetables">English Vegetables (Section A)</option>
                  <option value="Indian Vegetables">Indian Vegetables (Section B)</option>
                  {sectorsList
                    .filter((s) => s.name !== "English Vegetables" && s.name !== "Indian Vegetables")
                    .map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.icon ? `${s.icon} ` : ""}{s.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  UOM (Unit)
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200/90 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  <option value="Kg">Kg</option>
                  <option value="Nos">Nos</option>
                  <option value="Pkt">Pkt</option>
                  <option value="1 bunch">1 bunch</option>
                  <option value="1 kg">1 kg</option>
                </select>
              </div>
            </div>

            {/* 4. HSN & PRICING */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  HSN Code
                </label>
                <input
                  type="text"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200/90 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quot Rate (₹)
                </label>
                <input
                  type="number"
                  placeholder="85"
                  value={quotRate}
                  onChange={(e) => setQuotRate(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200/90 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1">
                  SRM Revised (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="85.00"
                  value={srmRate}
                  onChange={(e) => setSrmRate(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 text-xs font-black text-emerald-900 bg-emerald-50/60 border border-emerald-300 rounded-xl"
                />
              </div>
            </div>

            {/* 5. INITIAL STOCK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Stock Qty
                </label>
                <input
                  type="number"
                  placeholder="50"
                  value={stock}
                  onChange={(e) => setStock(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200/90 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Min Stock Alert Level
                </label>
                <input
                  type="number"
                  placeholder="10"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200/90 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={successMsg}
              className="px-5 py-2 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save &amp; Add to Catalog</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
