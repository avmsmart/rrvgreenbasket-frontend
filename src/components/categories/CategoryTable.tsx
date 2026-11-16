"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Edit3, Eye, CheckCircle2, XCircle, FolderTree, MoreVertical } from "lucide-react";
import { Category } from "@/types/category";
import { CategoryImage } from "./CategoryImage";

interface CategoryTableProps {
  categories: Category[];
  isLoading?: boolean;
  onViewDetails: (category: Category) => void;
  onEdit: (category: Category) => void;
  onRequestToggleStatus: (category: Category) => void;
  statusLoadingId?: string | null;
  onOpenAddModal?: () => void;
  viewMode?: "list" | "grid";
}

/* ── design tokens (mirror globals.css vars with inline fallbacks) ── */
const T = {
  primary:      "#0B8A4F",
  primaryDark:  "#076B3D",
  primaryTint:  "#E7F6EE",
  accent:       "#F59E0B",
  danger:       "#E23744",
  bg:           "#F6F8F7",
  card:         "#FFFFFF",
  border:       "#E6EBE8",
  text:         "#111827",
  text2:        "#5B6770",
  text3:        "#9AA5AD",
};

const shadow = "0 1px 3px rgba(0,0,0,0.06)";

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  isLoading = false,
  onViewDetails,
  onEdit,
  onRequestToggleStatus,
  statusLoadingId = null,
  onOpenAddModal,
  viewMode = "list",
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const handleMenuToggle = useCallback((e: React.MouseEvent, publicId: string) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === publicId ? null : publicId));
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return dateStr; }
  };

  /* ── Toggle switch (shared) ── */
  const Toggle = ({ cat, isOperating }: { cat: Category; isOperating: boolean }) => (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button
        type="button"
        role="switch"
        aria-checked={cat.isActive}
        disabled={isOperating}
        onClick={(e) => { e.stopPropagation(); onRequestToggleStatus(cat); }}
        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 disabled:opacity-50 cursor-pointer flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-1"
        style={{
          backgroundColor: cat.isActive ? T.primary : "#CBD5D1",
          // @ts-ignore
          "--tw-ring-color": T.primary,
        }}
      >
        <span
          className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: cat.isActive ? "translateX(18px)" : "translateX(2px)" }}
        />
        {isOperating && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-2 w-2 rounded-full border border-white border-t-transparent animate-spin" />
          </span>
        )}
      </button>
      {/* Mobile: "Available" */}
      <span className="text-[10px] font-semibold md:hidden" style={{ color: cat.isActive ? T.primary : T.text3 }}>
        {cat.isActive ? "Available" : "Unavailable"}
      </span>
      {/* Desktop: "Active" */}
      <span className="text-[10px] font-semibold hidden md:inline" style={{ color: cat.isActive ? T.primary : T.text3 }}>
        {cat.isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );

  /* ── Loading skeletons ── */
  if (isLoading) {
    return (
      <>
        <div className="md:hidden">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}`, boxShadow: shadow }}>
                  <div className="aspect-square bg-[#F6F8F7] animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-[#E6EBE8] rounded animate-pulse w-3/4" />
                    <div className="h-2.5 bg-[#F6F8F7] rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}`, boxShadow: shadow }}>
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0" style={{ borderColor: T.border }}>
                  <div className="w-11 h-11 rounded-2xl animate-pulse flex-shrink-0" style={{ backgroundColor: T.bg }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 rounded animate-pulse w-2/3" style={{ backgroundColor: T.border }} />
                    <div className="h-2.5 rounded animate-pulse w-1/3" style={{ backgroundColor: T.bg }} />
                  </div>
                  <div className="w-9 h-5 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: T.border }} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="hidden md:block bg-white rounded-3xl p-6 space-y-3" style={{ border: `1px solid ${T.border}`, boxShadow: shadow }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ backgroundColor: T.bg }} />
          ))}
        </div>
      </>
    );
  }

  /* ── Empty state ── */
  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center" style={{ border: `1px solid ${T.border}`, boxShadow: shadow }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: T.primaryTint }}>
          <FolderTree className="w-6 h-6" style={{ color: T.primary }} />
        </div>
        <h4 className="text-base font-extrabold mb-1" style={{ color: T.text }}>No Categories Found</h4>
        <p className="text-xs max-w-sm mx-auto mb-4" style={{ color: T.text2 }}>
          No categories match your search or filter. Create your first category to get started.
        </p>
        {onOpenAddModal && (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-2xl text-white font-bold text-xs transition-all cursor-pointer"
            style={{ backgroundColor: T.primary }}
          >
            + Add New Category
          </button>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════
     MOBILE — LIST VIEW
  ══════════════════════════════════ */
  const MobileList = () => (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}`, boxShadow: shadow }}>
      {categories.map((cat) => {
        const isOperating = statusLoadingId === cat.publicId;
        const isMenuOpen = openMenuId === cat.publicId;
        const isInactive = !cat.isActive;

        return (
          <div
            key={cat.publicId}
            className="relative flex items-center gap-3 px-4 py-3 border-b last:border-b-0 transition-colors hover:bg-[#F6F8F7] active:bg-[#F0F4F2]"
            style={{
              borderColor: T.border,
              opacity: isInactive ? 0.6 : 1,
            }}
          >
            {/* Image */}
            <button type="button" onClick={() => onViewDetails(cat)} className="flex-shrink-0 cursor-pointer">
              <CategoryImage name={cat.name} imageUrl={cat.imageUrl} size={44} />
            </button>

            {/* Text */}
            <button type="button" onClick={() => onViewDetails(cat)} className="flex-1 min-w-0 text-left cursor-pointer">
              <p className="text-sm font-bold truncate leading-tight" style={{ color: T.text }}>
                {cat.name}
              </p>
              <p className="text-[11px] font-mono truncate mt-0.5" style={{ color: T.text3 }}>
                {cat.slug}
              </p>
            </button>

            {/* Toggle */}
            <Toggle cat={cat} isOperating={isOperating} />

            {/* ⋮ Menu */}
            <div className="relative flex-shrink-0" ref={isMenuOpen ? menuRef : undefined}>
              <button
                type="button"
                onClick={(e) => handleMenuToggle(e, cat.publicId)}
                className="p-1.5 rounded-lg transition-colors cursor-pointer"
                style={{ color: T.text3 }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-36 bg-white rounded-2xl z-30 overflow-hidden py-1"
                  style={{ border: `1px solid ${T.border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
                >
                  <MenuBtn
                    icon={<Eye className="w-3.5 h-3.5" />}
                    label="View Details"
                    color={T.text2}
                    hoverBg="#F6F8F7"
                    onClick={() => { setOpenMenuId(null); onViewDetails(cat); }}
                  />
                  <MenuBtn
                    icon={<Edit3 className="w-3.5 h-3.5" />}
                    label="Edit"
                    color="#2563EB"
                    hoverBg="#EFF6FF"
                    onClick={() => { setOpenMenuId(null); onEdit(cat); }}
                  />
                  <div style={{ borderTop: `1px solid ${T.border}`, margin: "4px 0" }} />
                  <MenuBtn
                    icon={cat.isActive
                      ? <XCircle className="w-3.5 h-3.5" />
                      : <CheckCircle2 className="w-3.5 h-3.5" />}
                    label={cat.isActive ? "Deactivate" : "Activate"}
                    color={cat.isActive ? T.danger : T.primary}
                    hoverBg={cat.isActive ? "#FFF1F2" : T.primaryTint}
                    onClick={() => { setOpenMenuId(null); onRequestToggleStatus(cat); }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  /* ══════════════════════════════════
     MOBILE — GRID VIEW (2-column)
  ══════════════════════════════════ */
  const MobileGrid = () => (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((cat) => {
        const isOperating = statusLoadingId === cat.publicId;

        return (
          <div
            key={cat.publicId}
            className="bg-white rounded-2xl overflow-hidden transition-transform active:scale-[0.98]"
            style={{
              border: `1px solid ${T.border}`,
              boxShadow: shadow,
              opacity: !cat.isActive ? 0.65 : 1,
            }}
          >
            <button type="button" onClick={() => onViewDetails(cat)} className="relative w-full block cursor-pointer">
              <div className="aspect-square w-full overflow-hidden">
                <CategoryImage name={cat.name} imageUrl={cat.imageUrl} className="!rounded-none" />
              </div>
              {/* Status dot */}
              <span
                className="absolute top-2 left-2 w-2 h-2 rounded-full border-2 border-white"
                style={{ backgroundColor: cat.isActive ? T.primary : T.text3 }}
              />
            </button>

            <div className="px-3 pt-2 pb-3">
              <button type="button" onClick={() => onViewDetails(cat)} className="block w-full text-left cursor-pointer mb-2">
                <p className="text-xs font-bold line-clamp-2 leading-tight" style={{ color: T.text }}>
                  {cat.name}
                </p>
              </button>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono truncate pr-2" style={{ color: T.text3 }}>{cat.slug}</p>
                <Toggle cat={cat} isOperating={isOperating} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  /* ══════════════════════════════════
     DESKTOP TABLE
  ══════════════════════════════════ */
  const DesktopTable = () => (
    <div className="hidden md:block bg-white rounded-3xl overflow-hidden" style={{ border: `1px solid ${T.border}`, boxShadow: shadow }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: T.bg, borderBottom: `1px solid ${T.border}` }}
              className="text-[11px] font-bold uppercase tracking-wider"
            >
              {["#", "Category", "Slug", "Description", "Sort", "Status", "Updated", "Actions"].map((h, i) => (
                <th
                  key={h}
                  className={`py-3 px-4 font-bold ${i === 0 || i === 4 || i === 5 || i === 6 ? "text-center" : i === 7 ? "text-right" : ""}`}
                  style={{ color: T.text2 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, idx) => {
              const isOperating = statusLoadingId === cat.publicId;
              return (
                <tr
                  key={cat.publicId}
                  className="group transition-colors"
                  style={{
                    borderBottom: `1px solid ${T.border}`,
                    opacity: !cat.isActive ? 0.65 : 1,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = T.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                >
                  <td className="py-3.5 px-4 text-center font-bold text-[11px]" style={{ color: T.text3 }}>{idx + 1}</td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewDetails(cat)}>
                      <CategoryImage name={cat.name} imageUrl={cat.imageUrl} size={36} />
                      <div>
                        <span className="font-bold block leading-tight" style={{ color: T.text }}>{cat.name}</span>
                        <span className="text-[10px] font-mono" style={{ color: T.text3 }}>{cat.publicId.slice(0, 8)}…</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-lg font-mono text-[11px]"
                      style={{ backgroundColor: T.bg, color: T.text2 }}>
                      {cat.slug}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="truncate text-[11px]" title={cat.description || ""} style={{ color: T.text2 }}>
                      {cat.description || <span style={{ color: T.text3 }} className="italic">No description</span>}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-6 rounded-lg font-bold text-xs"
                      style={{ backgroundColor: T.bg, color: T.text2 }}>
                      {cat.sortOrder}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center">
                      <Toggle cat={cat} isOperating={isOperating} />
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center text-[11px]" style={{ color: T.text2 }}>
                    {formatDate(cat.updatedAt || cat.createdAt)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ActionBtn icon={<Eye className="w-4 h-4" />} color={T.primary} hoverBg={T.primaryTint} onClick={() => onViewDetails(cat)} />
                      <ActionBtn icon={<Edit3 className="w-4 h-4" />} color="#2563EB" hoverBg="#EFF6FF" onClick={() => onEdit(cat)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="md:hidden">
        {viewMode === "grid" ? <MobileGrid /> : <MobileList />}
      </div>
      <DesktopTable />
    </div>
  );
};

/* ── small helper components ── */
const MenuBtn: React.FC<{
  icon: React.ReactNode; label: string; color: string; hoverBg: string; onClick: () => void;
}> = ({ icon, label, color, hoverBg, onClick }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer"
    style={{ color }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
  >
    {icon}
    {label}
  </button>
);

const ActionBtn: React.FC<{
  icon: React.ReactNode; color: string; hoverBg: string; onClick: () => void;
}> = ({ icon, color, hoverBg, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-1.5 rounded-lg transition-colors cursor-pointer"
    style={{ color: "#9AA5AD" }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = color;
      e.currentTarget.style.backgroundColor = hoverBg;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = "#9AA5AD";
      e.currentTarget.style.backgroundColor = "";
    }}
  >
    {icon}
  </button>
);
