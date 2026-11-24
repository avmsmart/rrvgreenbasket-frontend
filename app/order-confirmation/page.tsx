"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, MapPin, ArrowRight, ShoppingBag, AlertCircle } from "lucide-react";
import { orderService } from "@/services/order.service";
import { OrderResponse } from "@/types/order";

function OrderSuccessAnimation() {
  return (
    <div
      className="order-success-animation"
      role="img"
      aria-label="Order placed successfully"
    >
      <span className="success-dot dot-one" />
      <span className="success-dot dot-two" />
      <span className="success-dot dot-three" />
      <span className="success-dot dot-four" />
      <span className="success-dot dot-five" />
      <span className="success-dot dot-six" />
      <span className="success-dot dot-seven" />
      <span className="success-dot dot-eight" />
      <div className="success-circle">
        <Check className="success-check" strokeWidth={4} />
      </div>

      <style jsx>{`
        .order-success-animation {
          position: relative;
          width: 190px;
          height: 190px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .success-circle {
          width: 88px;
          height: 88px;
          border-radius: 9999px;
          background: #16ce75;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(0);
          opacity: 0;
          animation: success-pop 650ms cubic-bezier(.2, 1.5, .5, 1) 100ms forwards;
        }
        .success-check {
          width: 54px;
          height: 54px;
          color: white;
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: check-draw 450ms ease 500ms forwards;
        }
        .success-dot {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #16ce75;
          opacity: 0;
          transform: scale(0);
          animation: dot-pop 500ms ease-out forwards;
        }
        .dot-one { top: 5px; left: 50%; animation-delay: 300ms; }
        .dot-two { top: 28px; right: 18px; animation-delay: 400ms; }
        .dot-three { top: 55px; right: 0; width: 10px; height: 10px; animation-delay: 500ms; }
        .dot-four { bottom: 30px; right: 28px; width: 13px; height: 13px; animation-delay: 600ms; }
        .dot-five { bottom: 25px; left: 30px; width: 6px; height: 6px; animation-delay: 650ms; }
        .dot-six { top: 55px; left: 5px; width: 6px; height: 6px; animation-delay: 450ms; }
        .dot-seven { top: 28px; left: 32px; animation-delay: 350ms; }
        .dot-eight { bottom: 25px; left: 50%; width: 8px; height: 8px; animation-delay: 550ms; }
        @keyframes success-pop {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes check-draw { to { stroke-dashoffset: 0; } }
        @keyframes dot-pop {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .success-circle, .success-check, .success-dot {
            animation: none !important;
            transform: scale(1);
            opacity: 1;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderPublicId = searchParams.get("orderPublicId") || searchParams.get("orderId");

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderPublicId) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    orderService
      .getOrderById(orderPublicId)
      .then((result) => {
        if (mounted) setOrder(result);
      })
      .catch((err: unknown) => {
        console.warn("[OrderConfirmation] Failed to load order:", err);
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to retrieve your order details right now."
          );
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [orderPublicId]);

  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-white px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          <p className="text-sm font-medium text-slate-500">Loading your order confirmation...</p>
        </div>
      </main>
    );
  }

  if (!orderPublicId) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-white px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-600" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Order reference not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            Please check your orders to view the latest order status.
          </p>
          <Link
            href="/customer/profile?tab=orders"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Track your order
          </Link>
        </div>
      </main>
    );
  }

  const address = order?.deliveryAddress;
  const addressLines = address
    ? [
        address.addressLine,
        address.landmark ? `Near ${address.landmark}` : null,
        [address.city, address.state, address.pincode].filter(Boolean).join(", "),
        order?.customerPhone ? `Mobile: ${order.customerPhone}` : null,
      ].filter(Boolean)
    : [];

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
        <OrderSuccessAnimation />

        <div className="-mt-1 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            RRV Green Basket
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-emerald-700 sm:text-3xl">
            Order Placed Successfully!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Thank you{order?.customerName ? `, ${order.customerName}` : ""}. Your order has been received.
          </p>
        </div>

        {error && (
          <p className="mt-5 max-w-lg text-center text-sm text-amber-700">
            Your order was submitted, but we couldn't load its details. You can still check its status in My Orders.
          </p>
        )}

        {order && (
          <div className="mt-8 w-full max-w-xl divide-y divide-slate-200 border-y border-slate-200">
            {addressLines.length > 0 && (
              <section className="py-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  Delivery address
                </h2>
                <div className="mt-2 space-y-1 pl-6 text-sm leading-relaxed text-slate-600">
                  {addressLines.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </section>
            )}

            <section className="flex items-center justify-between gap-4 py-5">
              <span className="text-sm font-semibold text-slate-700">Total amount</span>
              <span className="text-2xl font-extrabold tabular-nums text-emerald-700">
                ₹{order.totalAmount}
              </span>
            </section>
          </div>
        )}

        <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <Link
            href="/customer/profile?tab=orders"
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Track order <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-700 px-5 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <ShoppingBag className="h-4 w-4" /> Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
            <p className="text-sm font-medium text-slate-500">Loading order details...</p>
          </div>
        </main>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
