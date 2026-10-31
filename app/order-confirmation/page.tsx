
"use client";

import { useEffect, useState } from "react";

type Order = {
  orderId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    pincode: string;
  };
  items: {
    id: number;
    name: string;
    price: number;
    unit: string;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  delivery: number;
  total: number;
  paymentMethod: string;
  orderDate: string;
  status: string;
};

const imageUrl = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=200&q=80`;

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem("rrv-order");
      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
      }
    } catch {
      setOrder(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return <main className="p-8">Loading order details...</main>;
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f9f3] px-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#20392a]">
            No Order Found
          </h1>
          <p className="mt-3 text-gray-600">
            We couldn't find a recent order. Please place an order first.
          </p>
          <a href="/" className="mt-6 inline-block rounded-xl bg-green-700 px-6 py-3 font-bold text-white hover:bg-green-800">
            Continue Shopping
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f9f3] px-4 py-10 text-[#20392a] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-2xl border border-green-100 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-5xl text-green-700">
            ✓
          </div>

          <p className="mt-5 font-bold tracking-widest text-green-700">
            RRV GREEN BASKET
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Order Placed Successfully!
          </h1>

          <p className="mt-3 text-gray-600">
            Thank you, {order.customer.name}. Your order has been received.
          </p>

          <div className="mt-7 rounded-xl bg-green-50 p-4">
            <p className="text-sm text-gray-600">Your Order ID</p>
            <p className="mt-1 text-xl font-extrabold text-green-800">
              {order.orderId}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold">Order Details</h2>

          <div className="mt-4 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <img
                  src={imageUrl(item.image)}
                  alt={item.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} × ₹{item.price} / {item.unit}
                  </p>
                </div>
                <p className="font-bold">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>{order.delivery === 0 ? "Free" : `₹${order.delivery}`}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-extrabold">
              <span>Total Paid / Payable</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
            <h2 className="font-extrabold">Delivery Address</h2>
            <p className="mt-3 font-semibold">{order.customer.name}</p>
            <p className="mt-1 text-sm text-gray-600">{order.customer.phone}</p>
            <p className="mt-2 text-sm text-gray-600">{order.customer.address}</p>
            <p className="text-sm text-gray-600">
              {order.customer.city} – {order.customer.pincode}
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
            <h2 className="font-extrabold">Payment & Status</h2>
            <p className="mt-3 text-sm text-gray-600">Payment Method</p>
            <p className="font-semibold">{order.paymentMethod}</p>
            <p className="mt-4 text-sm text-gray-600">Order Status</p>
            <p className="mt-1 font-bold text-green-700">{order.status}</p>
            <p className="mt-4 text-sm text-gray-600">Order Date</p>
            <p className="mt-1 text-sm font-semibold">
              {new Date(order.orderDate).toLocaleString("en-IN")}
            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="/" className="rounded-xl bg-green-700 px-7 py-3 font-bold text-white hover:bg-green-800">
            Continue Shopping
          </a>
          <button
            onClick={() => window.print()}
            className="rounded-xl border border-green-700 px-7 py-3 font-bold text-green-800 hover:bg-green-50"
          >
            Print Order
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Thank you for shopping with RRV Green Basket!
        </p>
      </div>
    </main>
  );
}
