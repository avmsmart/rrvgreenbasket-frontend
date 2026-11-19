
"use client";

import React from "react";
import Link from "next/link";

const CartIllustration: React.FC = () => (
  <svg
    viewBox="0 0 220 200"
    className="h-full w-full"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M18 96h36c8 0 12-6 12-11s-4-10-10-10"
      stroke="#94a3b8"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M28 112h30"
      stroke="#94a3b8"
      strokeWidth="3"
      strokeLinecap="round"
    />

    <g className="empty-cart-float">
      <path
        d="M96 62c-4-26 6-42 26-42s28 16 24 40"
        stroke="#334155"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="M80 58h92l8 92c.4 5-3.5 9-8.5 9H80.5c-5 0-8.9-4-8.5-9L80 58z"
        fill="#ff4b78"
        transform="rotate(6 126 108)"
      />

      <g transform="rotate(6 126 108)">
        <circle cx="98" cy="68" r="3.5" fill="#fff" />
        <circle cx="154" cy="68" r="3.5" fill="#fff" />

        <path
          d="M126 140c-20-4-28-20-24-40 22-2 38 8 40 26-6-6-12-10-20-12 8 6 12 12 14 20-3 4-6 6-10 6z"
          fill="#fff"
        />
      </g>
    </g>

    <ellipse cx="124" cy="182" rx="46" ry="5" fill="#e2e8f0" />

    <style>{`
      .empty-cart-float {
        animation: empty-cart-float 3.2s ease-in-out infinite;
        transform-origin: center;
      }

      @keyframes empty-cart-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }

      @media (prefers-reduced-motion: reduce) {
        .empty-cart-float { animation: none; }
      }
    `}</style>
  </svg>
);

export const EmptyCart: React.FC = () => {
  return (
    <section className="mx-auto flex min-h-[65vh] w-full max-w-lg flex-col items-center justify-center px-5 py-10 text-center sm:min-h-[70vh]">

      {/* Shopping bag illustration */}
      <div className="h-44 w-48 sm:h-48 sm:w-52">
        <CartIllustration />
      </div>

      {/* Empty cart message */}
      <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        Hey, it feels so light!
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 sm:text-base">
        There is nothing in your cart. Let&apos;s add some items.
      </p>

      {/* Simple wishlist button */}
      <Link
            href="/wishlist"
            className="mt-7 inline-flex min-h-12 items-center justify-center border border-[#2f6f5e] px-6 py-3 text-sm font-semibold tracking-wide text-[#2f6f5e] transition-colors hover:bg-[#2f6f5e] hover:text-white active:scale-[0.98] sm:min-w-72 sm:text-base"
          >
            ADD ITEMS FROM WISHLIST
      </Link>

    </section>
  );
};
