
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  badge?: string;
};

const products: Product[] = [
  { id: 1, name: "Fresh Apples", category: "Fruits", price: 120, unit: "kg", image: "photo-1560806887-1e4cd0b6cbd6", badge: "Popular" },
  { id: 2, name: "Sweet Bananas", category: "Fruits", price: 60, unit: "dozen", image: "photo-1571771894821-ce9b6c11b08e" },
  { id: 3, name: "Green Grapes", category: "Fruits", price: 80, unit: "500 g", image: "photo-1537640538966-79f369143f8f" },
  { id: 4, name: "Fresh Mangoes", category: "Exotic & Seasonal", price: 100, unit: "kg", image: "photo-1553279768-865429fa0078", badge: "Seasonal" },
  { id: 5, name: "Red Tomatoes", category: "Vegetables", price: 36, unit: "kg", image: "photo-1546094096-0df4bcaaa337" },
  { id: 6, name: "Fresh Onions", category: "Vegetables", price: 28, unit: "kg", image: "photo-1508747703725-719777637510" },
  { id: 7, name: "Carrots", category: "Vegetables", price: 40, unit: "kg", image: "photo-1445282768818-728615cc910a" },
  { id: 8, name: "Fresh Cucumber", category: "Vegetables", price: 25, unit: "kg", image: "photo-1604977042946-1eecc30f269e" },
  { id: 9, name: "Fresh Spinach", category: "Leafy Greens", price: 20, unit: "bunch", image: "photo-1576045057995-568f588f82fb" },
  { id: 10, name: "Fresh Lettuce", category: "Leafy Greens", price: 35, unit: "bunch", image: "photo-1622206151226-18ca2c9ab4a1" },
  { id: 11, name: "Fresh Coriander", category: "Leafy Greens", price: 15, unit: "bunch", image: "photo-1615485290382-441e4d049cb5" },
  { id: 12, name: "Fresh Pineapple", category: "Exotic & Seasonal", price: 90, unit: "piece", image: "photo-1550258987-190a2d41a8ba" },
  { id: 13, name: "Dragon Fruit", category: "Exotic & Seasonal", price: 140, unit: "piece", image: "photo-1527325678964-54921661f888" },
  { id: 14, name: "Organic Tomatoes", category: "Organics", price: 50, unit: "kg", image: "photo-1546094096-0df4bcaaa337", badge: "Organic" },
  { id: 15, name: "Organic Spinach", category: "Organics", price: 30, unit: "bunch", image: "photo-1576045057995-568f588f82fb", badge: "Organic" },
  { id: 16, name: "Organic Apples", category: "Organics", price: 150, unit: "kg", image: "photo-1560806887-1e4cd0b6cbd6", badge: "Organic" },
  { id: 17, name: "Organic Carrots", category: "Organics", price: 55, unit: "kg", image: "photo-1445282768818-728615cc910a", badge: "Organic" },
  { id: 18, name: "Fresh Cow Milk", category: "Dairy Products", price: 32, unit: "500 ml", image: "photo-1563636619-e9143da7973b" },
  { id: 19, name: "Fresh Paneer", category: "Dairy Products", price: 90, unit: "200 g", image: "photo-1631452180519-c014fe946bc7" },
  { id: 20, name: "Farm Butter", category: "Dairy Products", price: 55, unit: "100 g", image: "photo-1589985270826-4b7bb135bc9d" },
  { id: 21, name: "Roasted Peanuts", category: "Snacks & Foods", price: 45, unit: "200 g", image: "photo-1567892737950-30c4db37cd89" },
  { id: 22, name: "Potato Chips", category: "Snacks & Foods", price: 30, unit: "pack", image: "photo-1566478989037-eec170784d0b" },
  { id: 23, name: "Mixed Nuts", category: "Snacks & Foods", price: 120, unit: "200 g", image: "photo-1599599810694-b5b37304c9d4" },
  { id: 24, name: "Orange Juice", category: "Beverages", price: 60, unit: "bottle", image: "photo-1600271886742-f049cd451bba" },
  { id: 25, name: "Coconut Water", category: "Beverages", price: 40, unit: "bottle", image: "photo-1525385133512-2f3bdd039054" },
  { id: 26, name: "Green Tea", category: "Beverages", price: 110, unit: "pack", image: "photo-1556679343-c7306c1976bc" },
  { id: 27, name: "Dishwashing Liquid", category: "Household Items", price: 85, unit: "bottle", image: "photo-1563453392212-326f5e854473" },
  { id: 28, name: "Laundry Detergent", category: "Household Items", price: 120, unit: "pack", image: "photo-1585421514738-01798e348b17" },
  { id: 29, name: "Paper Towels", category: "Household Items", price: 65, unit: "pack", image: "photo-1583947215259-38e31be8751f" },
];

const imageUrl = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const product = products.find((item) => item.id === id);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  function addToCart() {
    if (!product) return;

    try {
      const saved = JSON.parse(
        localStorage.getItem("rrv-cart") || "{}"
      );

      saved[product.id] = (Number(saved[product.id]) || 0) + quantity;

      localStorage.setItem("rrv-cart", JSON.stringify(saved));
      setMessage(`${product.name} added to cart!`);
    } catch {
      setMessage("Could not save your cart. Please try again.");
    }
  }

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6f9f3] p-6 text-center">
        <h1 className="text-3xl font-bold text-green-900">
          Product not found
        </h1>
        <p className="mt-3 text-gray-600">
          Please return to the store and choose a product.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white"
        >
          Back to Store
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f9f3] text-[#20392a]">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-green-100 bg-white px-5 py-4 sm:px-10">
        <button
          onClick={() => router.push("/")}
          className="text-xl font-extrabold text-green-800"
        >
          RRV Green Basket
        </button>

        <button
          onClick={() => router.push("/cart")}
          className="rounded-lg border border-green-700 px-4 py-2 font-semibold text-green-800"
        >
          🛒 View Cart
        </button>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <button
          onClick={() => router.push("/")}
          className="mb-6 font-semibold text-green-800 hover:underline"
        >
          ← Back to Store
        </button>

        <section className="grid gap-8 rounded-2xl border border-green-50 bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
          <div className="overflow-hidden rounded-xl bg-green-50">
            <img
              src={imageUrl(product.image)}
              alt={product.name}
              className="h-72 w-full object-cover sm:h-96"
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-2">
              <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                {product.category}
              </span>
              {product.badge && (
                <span className="w-fit rounded-full bg-lime-100 px-3 py-1 text-sm font-semibold text-green-800">
                  {product.badge}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 leading-7 text-gray-600">
              Fresh quality selected for your everyday needs.
            </p>

            <p className="mt-5 text-3xl font-extrabold text-green-800">
              ₹{product.price}
              <span className="text-base font-normal text-gray-500">
                {" "}/ {product.unit}
              </span>
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <span className="font-semibold">Quantity</span>

              <div className="flex items-center rounded-lg border border-green-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="px-4 py-2 text-xl text-green-800"
                >
                  −
                </button>
                <span className="min-w-10 text-center font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="px-4 py-2 text-xl text-green-800"
                >
                  +
                </button>
              </div>
            </div>

            <p className="mt-5 text-lg font-bold">
              Total: ₹{product.price * quantity}
            </p>

            <button
              onClick={addToCart}
              className="mt-6 w-full rounded-xl bg-green-700 px-6 py-4 font-bold text-white transition hover:bg-green-800"
            >
              + Add to Cart
            </button>

            {message && (
              <p role="status" className="mt-3 font-semibold text-green-700">
                {message}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
