"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { BackendCategory } from "@/types";
import { getCategoryId } from "@/services/product.service";
import { resolveImageUrl } from "@/utils/image-utils";

interface ImageSliderProps {
  categories: BackendCategory[];
  onSelect?: (cat: BackendCategory) => void;
}

const SLIDER_FALLBACKS: Record<string, string> = {
  Fruits: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80",
  Vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
  "Leafy Vegetables": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=1200&q=80",
  "Leafy Greens": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=1200&q=80",
  "Root Vegetables": "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=1200&q=80",
  Seasonings: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80",
  Mushrooms: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=1200&q=80",
  "Other Items": "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=1200&q=80",
  "Exotic & Seasonal": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=1200&q=80",
  Organics: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
  "Dairy Products": "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1200&q=80",
  "Snacks & Foods": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=1200&q=80",
  Beverages: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1200&q=80",
  "Household Items": "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=80",
};

export function ImageSlider({ categories, onSelect }: ImageSliderProps) {
  const slides = categories.length > 0 ? categories : [];
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((i) => (slides.length === 0 ? 0 : (i + 1) % slides.length));
  }, [slides.length]);

  const prev = useCallback(() => {
    setActive((i) => (slides.length === 0 ? 0 : (i - 1 + slides.length) % slides.length));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="mx-auto mt-1 max-w-[1600px] px-3 sm:px-5 lg:px-6">
        <div className="h-44 w-full animate-pulse rounded-3xl bg-gradient-to-r from-green-100 to-emerald-200 sm:h-56 lg:h-72" />
      </div>
    );
  }

  const current = slides[active];
  const img = resolveImageUrl(current.imageUrl || SLIDER_FALLBACKS[current.name] || SLIDER_FALLBACKS.Vegetables, 1200);

  return (
    <div className="mx-auto mt-1 max-w-[1600px] px-3 sm:px-5 lg:px-6">
      <div className="relative overflow-hidden rounded-3xl shadow-md shadow-emerald-900/10">
        {/* Slides track */}
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {slides.map((cat) => {
            const cImg = resolveImageUrl(cat.imageUrl || SLIDER_FALLBACKS[cat.name] || SLIDER_FALLBACKS.Vegetables, 1200);
            return (
              <div key={getCategoryId(cat)} className="relative h-44 w-full shrink-0 sm:h-56 lg:h-72">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cImg} alt={cat.name} className="h-full w-full object-cover" />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/45" />
                {/* Text */}
                                {/* Text — centered both ways */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300 sm:text-xs">
                    Fresh from farm
                  </p>
                  <h2 className="text-xl font-extrabold leading-tight text-white drop-shadow-md sm:text-3xl lg:text-5xl">
                    {cat.name}
                  </h2>
                  <p className="hidden max-w-[80%] text-xs text-white/85 sm:line-clamp-2 sm:text-sm lg:text-base">
                    Hand-picked {cat.name.toLowerCase()} delivered to your door, every single day.
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelect?.(cat)}
                    className="mt-1 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-[11px] font-bold text-white shadow-md shadow-emerald-900/30 transition hover:bg-emerald-500 sm:px-6 sm:py-2.5 sm:text-sm"
                  >
                    Shop Now <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Arrows (desktop only) */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-800 backdrop-blur transition hover:bg-white md:block"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-800 backdrop-blur transition hover:bg-white md:block"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}