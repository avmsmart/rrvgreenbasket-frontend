
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Leaf,
  ChevronRight,
  Tag,
  Heart,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
};

type CartItem = Product & {
  quantity: number;
};

const products: Product[] = [
  { id: 1, name: "Fresh Apples", price: 120, unit: "kg", image: "photo-1560806887-1e4cd0b6cbd6" },
  { id: 2, name: "Sweet Bananas", price: 60, unit: "dozen", image: "photo-1571771894821-ce9b6c11b08e" },
  { id: 3, name: "Green Grapes", price: 80, unit: "500 g", image: "photo-1537640538966-79f369143f8f" },
  { id: 4, name: "Fresh Mangoes", price: 100, unit: "kg", image: "photo-1553279768-865429fa0078" },
  { id: 5, name: "Red Tomatoes", price: 36, unit: "kg", image: "photo-1546094096-0df4bcaaa337" },
  { id: 6, name: "Fresh Onions", price: 28, unit: "kg", image: "photo-1508747703725-719777637510" },
  { id: 7, name: "Carrots", price: 40, unit: "kg", image: "photo-1445282768818-728615cc910a" },
  { id: 8, name: "Fresh Cucumber", price: 25, unit: "kg", image: "photo-1604977042946-1eecc30f269e" },
  { id: 9, name: "Fresh Spinach", price: 20, unit: "bunch", image: "photo-1576045057995-568f588f82fb" },
  { id: 10, name: "Fresh Lettuce", price: 35, unit: "bunch", image: "photo-1622206151226-18ca2c9ab4a1" },
  { id: 11, name: "Fresh Coriander", price: 15, unit: "bunch", image: "photo-1615485290382-441e4d049cb5" },
  { id: 12, name: "Fresh Pineapple", price: 90, unit: "piece", image: "photo-1550258987-190a2d41a8ba" },
  { id: 13, name: "Dragon Fruit", price: 140, unit: "piece", image: "photo-1527325678964-54921661f888" },
  { id: 14, name: "Organic Tomatoes", price: 50, unit: "kg", image: "photo-1546094096-0df4bcaaa337" },
  { id: 15, name: "Organic Spinach", price: 30, unit: "bunch", image: "photo-1576045057995-568f588f82fb" },
  { id: 16, name: "Organic Apples", price: 150, unit: "kg", image: "photo-1560806887-1e4cd0b6cbd6" },
  { id: 17, name: "Organic Carrots", price: 55, unit: "kg", image: "photo-1445282768818-728615cc910a" },
  { id: 18, name: "Fresh Cow Milk", price: 32, unit: "500 ml", image: "photo-1563636619-e9143da7973b" },
  { id: 19, name: "Fresh Paneer", price: 90, unit: "200 g", image: "photo-1631452180519-c014fe946bc7" },
  { id: 20, name: "Farm Butter", price: 55, unit: "100 g", image: "photo-1589985270826-4b7bb135bc9d" },
  { id: 21, name: "Roasted Peanuts", price: 45, unit: "200 g", image: "photo-1567892737950-30c4db37cd89" },
  { id: 22, name: "Potato Chips", price: 30, unit: "pack", image: "photo-1566478989037-eec170784d0b" },
  { id: 23, name: "Mixed Nuts", price: 120, unit: "200 g", image: "photo-1599599810694-b5b37304c9d4" },
  { id: 24, name: "Orange Juice", price: 60, unit: "bottle", image: "photo-1600271886742-f049cd451bba" },
  { id: 25, name: "Coconut Water", price: 40, unit: "bottle", image: "photo-1525385133512-2f3bdd039054" },
  { id: 26, name: "Green Tea", price: 110, unit: "pack", image: "photo-1556679343-c7306c1976bc" },
  { id: 27, name: "Dishwashing Liquid", price: 85, unit: "bottle", image: "photo-1563453392212-326f5e854473" },
  { id: 28, name: "Laundry Detergent", price: 120, unit: "pack", image: "photo-1585421514738-01798e348b17" },
  { id: 29, name: "Paper Towels", price: 65, unit: "pack", image: "photo-1583947215259-38e31be8751f" },
];

const imageUrl = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=85`;

const FREE_DELIVERY_LIMIT = 299;

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("rrv-cart") || "{}"
      );

      const cartItems = products
        .map((product) => ({
          ...product,
          quantity: Math.max(
            0,
            Math.floor(Number(saved[product.id]) || 0)
          ),
        }))
        .filter((item) => item.quantity > 0);

      setItems(cartItems);
    } catch {
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const remainingForFreeDelivery = Math.max(
    0,
    FREE_DELIVERY_LIMIT - total
  );

  const deliveryProgress = Math.min(
    100,
    (total / FREE_DELIVERY_LIMIT) * 100
  );

  function updateQuantity(id: number, quantity: number) {
    const next = items
      .map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      )
      .filter((item) => item.quantity > 0);

    setItems(next);

    localStorage.setItem(
      "rrv-cart",
      JSON.stringify(
        Object.fromEntries(
          next.map((item) => [item.id, item.quantity])
        )
      )
    );
  }

  function clearCart() {
    setItems([]);
    localStorage.setItem("rrv-cart", JSON.stringify({}));
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#f7f9f5] px-4 py-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-gray-200" />
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="h-64 rounded-2xl bg-gray-200" />
            <div className="h-64 rounded-2xl bg-gray-200" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9f5] pb-28 text-[#20392a] sm:pb-12">
      <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* Breadcrumb navigation */}
        <nav className="mb-5 flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
          <Link
            href="/"
            className="transition hover:text-green-700"
          >
            Home
          </Link>

          <ChevronRight size={14} />

          <span className="font-semibold text-gray-800">
            Shopping Cart
          </span>
        </nav>

        {/* Page heading */}
        <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              <ShoppingCart className="text-green-700" size={27} />
              My Cart
            </h1>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          {/* {items.length > 0 && (
            // <Link
            //   href="/"
            //   className="flex shrink-0 items-center gap-1.5 rounded-xl border border-green-200 bg-white px-3 py-2 text-xs font-bold text-green-800 transition hover:bg-green-50 sm:px-4 sm:text-sm"
            // >
            //   <ArrowLeft size={15} />
            //   <span>Continue Shopping</span>
            // </Link>
          )} */}
        </div>

        {/* Empty cart */}
        
{/* Empty cart */}
{items.length === 0 ? (
  <div className="flex flex-col items-center px-4 py-8 text-center sm:py-10">

    {/* Empty cart image */}
    <img
      src="/images/auth/empty-cart.png"
      alt="Your shopping cart is empty"
      className="mx-auto h-36 w-36 object-contain sm:h-44 sm:w-44"
    />

    {/* Heading */}
    <h2 className="mt-3 text-lg font-extrabold text-gray-900 sm:text-xl">
      Your cart is empty!
    </h2>

    {/* Description */}
    <p className="mt-2 max-w-xs text-xs leading-5 text-gray-500 sm:text-sm">
      Looks like you haven't added anything yet.
      Explore our fresh fruits and vegetables!
    </p>

    {/* Continue shopping button */}
    <Link
      href="/"
      className="mt-5 inline-flex items-center gap-2 rounded-lg
                 bg-green-700 px-4 py-2.5 text-xs font-bold
                 text-white transition hover:bg-green-800
                 active:scale-95 sm:text-sm"
    >
      <ShoppingBag size={15} />
      Continue Shopping
    </Link>

  </div>
) : (
  

          <div className="grid items-start gap-5 lg:grid-cols-[1fr_360px] lg:gap-8">

            {/* Cart items */}
            <section className="min-w-0">

              {/* Delivery progress */}
              <div className="mb-4 rounded-2xl border border-green-100 bg-white p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50">
                    <Truck size={18} className="text-green-700" />
                  </div>

                  <div className="min-w-0 flex-1">
                    {remainingForFreeDelivery > 0 ? (
                      <p className="text-xs font-semibold text-gray-700 sm:text-sm">
                        Add{" "}
                        <span className="font-extrabold text-green-700">
                          ₹{remainingForFreeDelivery}
                        </span>{" "}
                        more for free delivery!
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-green-700 sm:text-sm">
                        Congratulations! You've unlocked free delivery.
                      </p>
                    )}

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-green-600 transition-all duration-300"
                        style={{ width: `${deliveryProgress}%` }}
                      />
                    </div>

                    <div className="mt-1.5 flex justify-between text-[10px] text-gray-400 sm:text-xs">
                      <span>₹0</span>
                      <span>Free delivery at ₹{FREE_DELIVERY_LIMIT}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cart list heading */}
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-base font-extrabold sm:text-lg">
                  Cart Items ({items.length})
                </h2>

                <button
                  type="button"
                  onClick={clearCart}
                  className="flex items-center gap-1 text-xs font-semibold text-red-500 transition hover:text-red-700 sm:text-sm"
                >
                  <Trash2 size={14} />
                  Clear Cart
                </button>
              </div>

              {/* Individual product cards */}
              <div className="space-y-3">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="flex gap-3 rounded-2xl border border-green-100 bg-white p-3 shadow-sm transition hover:border-green-200 sm:gap-5 sm:p-4"
                  >
                    {/* Product image */}
                    <Link
                      href="/"
                      className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-green-50 sm:h-28 sm:w-28"
                    >
                      <img
                        src={imageUrl(item.image)}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    </Link>

                    {/* Product details */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <h3 className="line-clamp-2 text-sm font-bold text-gray-900 sm:text-base">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-[11px] text-gray-500 sm:text-xs">
                          ₹{item.price} / {item.unit}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        {/* Quantity control */}
                        <div className="flex items-center overflow-hidden rounded-lg border border-green-200 bg-white">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center text-green-800 transition hover:bg-green-50 active:bg-green-100 sm:h-9 sm:w-9"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="min-w-7 text-center text-xs font-extrabold text-gray-800 sm:text-sm">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            aria-label={`Increase ${item.name} quantity`}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center text-green-800 transition hover:bg-green-50 active:bg-green-100 sm:h-9 sm:w-9"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Remove product */}
                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => updateQuantity(item.id, 0)}
                          className="flex items-center gap-1 rounded-lg px-1 py-1 text-[11px] font-semibold text-gray-400 transition hover:bg-red-50 hover:text-red-600 sm:text-xs"
                        >
                          <Trash2 size={13} />
                          <span className="hidden xs:inline">Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Item total */}
                    <div className="flex shrink-0 flex-col items-end justify-between py-0.5">
                      <span className="text-sm font-extrabold text-green-800 sm:text-base">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {/* Bottom continue shopping */}
              <Link
                href="/"
                className="mt-5 hidden items-center gap-2 text-sm font-bold text-green-800 transition hover:text-green-600 sm:inline-flex"
              >
                <ArrowLeft size={16} />
                Add more products to your basket
              </Link>
            </section>

            {/* Order summary */}
            <aside className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-6">

              <h2 className="text-lg font-extrabold sm:text-xl">
                Order Summary
              </h2>

              {/* Item count */}
              <div className="mt-5 flex justify-between text-sm text-gray-600">
                <span>Items ({itemCount})</span>
                <span className="font-semibold text-gray-800">
                  ₹{total}
                </span>
              </div>

              {/* Delivery */}
              <div className="mt-3 flex justify-between text-sm text-gray-600">
                <span>Delivery charges</span>
                <span className="font-semibold text-green-700">
                  {total >= FREE_DELIVERY_LIMIT ? "FREE" : "At checkout"}
                </span>
              </div>

              {/* Savings message */}
              {total >= FREE_DELIVERY_LIMIT && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs font-semibold text-green-800">
                  <Tag size={15} />
                  You're enjoying free delivery!
                </div>
              )}

              {/* Total */}
              <div className="mt-5 border-t border-dashed border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-gray-900">
                    Subtotal
                  </span>

                  <span className="text-xl font-extrabold text-green-800 sm:text-2xl">
                    ₹{total}
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-gray-400">
                  Taxes and delivery charges calculated at checkout.
                </p>
              </div>

              {/* Desktop checkout button */}
              <Link
                href="/checkout"
                className="mt-5 hidden w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-green-800 active:scale-[0.98] lg:flex"
              >
                Proceed to Checkout
                <ChevronRight size={18} />
              </Link>

              {/* Trust information */}
              {/* <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2.5 text-xs text-gray-500">
                  <ShieldCheck size={17} className="shrink-0 text-green-700" />
                  <span>Safe & secure checkout</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-gray-500">
                  <Leaf size={17} className="shrink-0 text-green-700" />
                  <span>Freshness guaranteed</span>
                </div>
              </div> */}
            </aside>
          </div>
        )}
      </div>

      {/* Mobile sticky checkout bar */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-green-100 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-gray-500">
                Total ({itemCount} {itemCount === 1 ? "item" : "items"})
              </p>

              <p className="text-lg font-extrabold text-green-800">
                ₹{total}
              </p>
            </div>

            <Link
              href="/checkout"
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-green-800 active:scale-[0.98]"
            >
              Proceed to Checkout
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
