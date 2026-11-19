"use client";

import React from "react";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";

export interface ZeptoPromoBannerProps {
  variant?: "seasonal" | "organic" | "express";
  onClick?: () => void;
}

export const ZeptoPromoBanner: React.FC<ZeptoPromoBannerProps> = ({
  variant = "seasonal",
  onClick,
}) => {
  if (variant === "seasonal") {
    return (
      <div className="px-3 my-2.5">
        <div
          onClick={onClick}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#8B1E3F] via-[#A83244] to-[#C94A29] p-3.5 text-white shadow-xs cursor-pointer transition active:scale-98"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-[70%]">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                <Sparkles size={11} />
                <span>Fresh Harvest</span>
              </div>
              <h4 className="mt-0.5 text-sm font-extrabold leading-tight text-white">
                Fresh Seasonal Launches
              </h4>
              <p className="mt-0.5 text-[10.5px] font-medium text-white/90">
                Explore daily harvested picks direct from farm
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl select-none" aria-hidden="true">🍎🥦</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs">
                <ArrowRight size={14} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "organic") {
    return (
      <div className="px-3 my-2.5">
        <div
          onClick={onClick}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#006039] to-[#00875a] p-3.5 text-white shadow-xs cursor-pointer transition active:scale-98"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-[70%]">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                <ShieldCheck size={11} />
                <span>100% Organically Sourced</span>
              </div>
              <h4 className="mt-0.5 text-sm font-extrabold leading-tight text-white">
                Zero Chemical Residues
              </h4>
              <p className="mt-0.5 text-[10.5px] font-medium text-white/90">
                Pure soil nutrition for healthier living
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl select-none" aria-hidden="true">🌱🧺</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs">
                <ArrowRight size={14} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 my-2.5">
      <div
        onClick={onClick}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-[#1e3a29] p-3.5 text-white shadow-xs cursor-pointer transition active:scale-98"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="max-w-[70%]">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <Zap size={11} />
              <span>Fast Daily Delivery</span>
            </div>
            <h4 className="mt-0.5 text-sm font-extrabold leading-tight text-white">
              Farm to Kitchen in 30–45 Mins
            </h4>
            <p className="mt-0.5 text-[10.5px] font-medium text-white/80">
              Same-day harvested fresh produce in Kurnool
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl select-none" aria-hidden="true">⚡🚚</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs">
              <ArrowRight size={14} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZeptoPromoBanner;
