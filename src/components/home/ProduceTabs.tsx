"use client";

import React from "react";

export type ProduceMode = "fruits" | "vegetables";

/**
 * One place for every colour used by the tab strip AND the panel below it.
 * Change a colour here and it updates everywhere.
 */
const GREEN = "#0b6b3a"; // selected tab + panel colour
const WHITE = "#ffffff"; // unselected tab colour
const MINT = "#e3f4ee"; // strip behind the tabs

export const PRODUCE_THEME = {
  fruits: {
    band: MINT,
    panel: GREEN, // area under the tabs is always green
    pillActiveBg: "#ffffff",
    pillActiveText: GREEN,
    pillIdleBg: "rgba(255,255,255,0.16)",
    pillIdleText: "#eafff3",
  },
  vegetables: {
    band: MINT,
    panel: GREEN,
    pillActiveBg: "#ffffff",
    pillActiveText: GREEN,
    pillIdleBg: "rgba(255,255,255,0.16)",
    pillIdleText: "#eafff3",
  },
} as const;

/**
 * Tab outline (viewBox 240 x 76): rounded top corners, slanted sides and
 * concave "flares" at the bottom that melt into the panel below.
 * Open path on purpose: the stroke skips the bottom edge.
 */
const TAB_PATH =
  "M0,76 C12,76 20,72 24,62 L36,26 C39,14 46,6 58,6 L182,6 C194,6 201,14 204,26 L216,62 C220,72 228,76 240,76";

const TABS: { id: ProduceMode; label: string; icon: string; side: "left" | "right" }[] = [
  { id: "vegetables", label: "Vegetables", icon: "🥦", side: "left" },
  { id: "fruits", label: "Fruits", icon: "🍎", side: "right" },
];

interface ProduceTabsProps {
  mode: ProduceMode;
  onChange: (mode: ProduceMode) => void;
}

export default function ProduceTabs({ mode, onChange }: ProduceTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Produce type"
      className="relative h-[84px] overflow-hidden px-0 pt-2"
      style={{ backgroundColor: PRODUCE_THEME[mode].band }}
    >
      {TABS.map((t) => {
        const selected = mode === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(t.id)}
            className="absolute bottom-0 h-[76px] w-[60%] cursor-pointer select-none outline-none"
            style={{
              [t.side]: 0,
              zIndex: selected ? 20 : 10,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <svg
              viewBox="0 0 240 76"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full overflow-visible"
              aria-hidden="true"
            >
              <path
                d={TAB_PATH}
                vectorEffect="non-scaling-stroke"
                style={{
                  // opposite colours: green tab -> white border, white tab -> green border
                  fill: selected ? GREEN : WHITE,
                  stroke: selected ? WHITE : GREEN,
                  strokeWidth: 2,
                }}
              />
            </svg>

            <span className="relative flex h-full flex-col items-center justify-center gap-0.5 pt-2">
              <span
                className="text-[30px] leading-none"
                style={{ transform: selected ? "scale(1.1)" : "scale(0.92)" }}
                aria-hidden="true"
              >
                {t.icon}
              </span>
              <span
                className={`text-[13px] tracking-tight ${
                  selected ? "font-extrabold" : "font-bold opacity-75"
                }`}
                style={{
                  // selected (green) tab = white text, unselected (white) tab = green text
                  color: selected ? WHITE : GREEN,
                }}
              >
                {t.label}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}