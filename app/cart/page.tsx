
"use client";

import { useEffect, useState } from "react";

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
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=300&q=80`;

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

  if (!loaded) {
    return (
      <main className="min-h-screen p-8">
        Loading cart...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f9f3] px-4 py-8 text-[#20392a] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Your Shopping Cart
          </h1>

          <a
            href="/"
            className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            Continue Shopping
          </a>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-semibold">
              Your cart is empty.
            </p>
            <p className="mt-2 text-gray-600">
              Add some fresh products to get started!
            </p>
            <a
              href="/"
              className="mt-5 inline-block rounded-xl bg-green-700 px-6 py-3 font-bold text-white"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="grid items-start gap-6 md:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-green-100 bg-white p-4 shadow-sm"
                >
                  <img
                    src={imageUrl(item.image)}
                    alt={item.name}
                    className="h-24 w-24 rounded-xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-gray-900">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      ₹{item.price} / {item.unit}
                    </p>
                    <p className="mt-1 font-semibold text-green-800">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      aria-label={`Decrease ${item.name} quantity`}
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="rounded-lg border border-green-200 px-3 py-2 hover:bg-green-50"
                    >
                      −
                    </button>

                    <span className="min-w-6 text-center font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      aria-label={`Increase ${item.name} quantity`}
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="rounded-lg border border-green-200 px-3 py-2 hover:bg-green-50"
                    >
                      +
                    </button>

                    <button
                      onClick={() => updateQuantity(item.id, 0)}
                      className="ml-1 font-semibold text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm md:sticky md:top-6">
              <h2 className="text-xl font-extrabold">
                Order Summary
              </h2>

              <div className="mt-5 flex justify-between text-gray-600">
                <span>Items</span>
                <span>{itemCount}</span>
              </div>

              <div className="mt-3 flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-extrabold">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  window.location.href = "/checkout";
                }}
                className="mt-6 w-full rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800"
              >
                Proceed to Checkout
              </button>

              <p className="mt-3 text-xs text-gray-500">
                Delivery charges, if applicable, will be shown at checkout.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
