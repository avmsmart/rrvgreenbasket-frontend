"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Edit3,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import { Product } from "@/types";

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Product) => void;
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

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  const [quotRate, setQuotRate] = useState<number>(0);
  const [srmRate, setSrmRate] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(10);
  const [unit, setUnit] = useState<string>("Kg");

  // Product Image State
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageTab, setImageTab] = useState<"file" | "url" | "presets">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setQuotRate(product.originalPrice || product.price);
      setSrmRate(product.price);
      setStock(product.stock);
      setMinStock(product.minStock || 10);
      setUnit(product.unit);
      setImageUrl(product.imageUrl || "");
      setImagePreview(product.imageUrl || null);
      setIsSaved(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

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
    const updated: Product = {
      ...product,
      originalPrice: quotRate,
      price: srmRate,
      stock,
      minStock,
      unit,
      imageUrl: imageUrl.trim() || undefined,
      status: stock === 0 ? "Out of Stock" : stock <= minStock ? "Low Stock" : "In Stock",
    };

    onSave(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00875a] text-white flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Edit Product Rates, Stock &amp; Photo
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {product.erpCode} • {product.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 shadow-3xs flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSaved ? (
          <div className="p-8 sm:p-10 text-center space-y-2 animate-in fade-in my-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#00875a] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">Product Changes Saved!</h4>
            <p className="text-xs text-slate-500">
              Image, revised rates, and inventory stock updated in master catalog.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Product Meta Card */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Excel Name</span>
                  <span className="font-bold text-slate-800">{product.excelName || product.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-medium">HSN Code</span>
                  <span className="font-mono font-bold text-slate-800">{product.hsnCode || "7101000"}</span>
                </div>
              </div>

              {/* IMAGE UPLOAD & PREVIEW */}
              <div className="p-3.5 bg-gradient-to-br from-emerald-50/50 to-slate-50 rounded-2xl border border-emerald-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Product Display Photo
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Upload from phone/PC, enter URL, or pick from presets
                    </p>
                  </div>

                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-inner">
                    {imagePreview ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imagePreview}
                        alt="Product Photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setImageTab("file")}
                        className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          imageTab === "file"
                            ? "bg-[#00875a] text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab("url")}
                        className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          imageTab === "url"
                            ? "bg-[#00875a] text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab("presets")}
                        className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          imageTab === "presets"
                            ? "bg-[#00875a] text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Presets
                      </button>
                    </div>

                    {imageTab === "file" && (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelected}
                          className="hidden"
                          id="edit-product-file-upload"
                        />
                        <label
                          htmlFor="edit-product-file-upload"
                          className="w-full py-1.5 px-3 border border-emerald-300 bg-white hover:bg-emerald-50/50 rounded-xl text-[11px] font-bold text-[#00875a] flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                        >
                          <Upload className="w-3 h-3" />
                          <span>{imagePreview ? "Change Photo" : "Upload File"}</span>
                        </label>
                      </div>
                    )}

                    {imageTab === "url" && (
                      <input
                        type="url"
                        placeholder="https://... image link"
                        value={imageUrl.startsWith("data:") ? "" : imageUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden"
                      />
                    )}

                    {imageTab === "presets" && (
                      <div className="flex flex-wrap gap-1 max-h-14 overflow-y-auto">
                        {PRESET_PRODUCE_IMAGES.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => handleSelectPreset(preset.url)}
                            className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                              imageUrl === preset.url
                                ? "bg-emerald-100 text-[#00875a] border-emerald-400"
                                : "bg-white text-slate-700 border-slate-200"
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

              {/* Rates */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quot Rate (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={quotRate}
                    onChange={(e) => setQuotRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    SRM REVISED Rate (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={srmRate}
                    onChange={(e) => setSrmRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs font-black text-emerald-900 bg-emerald-50/70 border border-emerald-300 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Stock & Unit */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min Stock Alert
                  </label>
                  <input
                    type="number"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    UOM Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Nos">Nos</option>
                    <option value="Pkt">Pkt</option>
                    <option value="1 bunch">1 bunch</option>
                    <option value="1 kg">1 kg</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
