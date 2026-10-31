"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  badge?: string;
};

const categories = [
  { name: "All Products", icon: "▦" },
  { name: "Fruits", icon: "🍊" },
  { name: "Vegetables", icon: "🥦" },
  { name: "Leafy Greens", icon: "🥬" },
  { name: "Exotic & Seasonal", icon: "🍍" },
  { name: "Organics", icon: "🌿" },
  { name: "Dairy Products", icon: "🥛" },
  { name: "Snacks & Foods", icon: "🥜" },
  { name: "Beverages", icon: "🧃" },
  { name: "Household Items", icon: "🧺" },
];

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

const imageUrl = (id: string, width = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

const categoryImages: Record<string, string> = {
  Fruits: imageUrl("photo-1610832958506-aa56368176cf"),
  Vegetables: imageUrl("photo-1540420773420-3366772f4999"),
  "Leafy Greens": imageUrl("photo-1576045057995-568f588f82fb"),
  "Exotic & Seasonal": imageUrl("photo-1550258987-190a2d41a8ba"),
  Organics: imageUrl("photo-1540420773420-3366772f4999"),
  "Dairy Products": imageUrl("photo-1563636619-e9143da7973b"),
  "Snacks & Foods": imageUrl("photo-1566478989037-eec170784d0b"),
  Beverages: imageUrl("photo-1600271886742-f049cd451bba"),
  "Household Items": imageUrl("photo-1563453392212-326f5e854473"),
};

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("rrv-cart") || "{}");
      setCart(saved);
    } catch {
      setCart({});
    }
  }, []);

  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((p) => {
      const categoryMatch =
        activeCategory === "All Products" || p.category === activeCategory;
      const searchMatch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term);
      const favoriteMatch =
        !showFavorites || favorites.includes(p.id);

      return categoryMatch && searchMatch && favoriteMatch;
    });
  }, [activeCategory, search, showFavorites, favorites]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = products.reduce(
    (sum, p) => sum + p.price * (cart[p.id] || 0),
    0
  );

  function selectCategory(name: string) {
    setActiveCategory(name);
    setSearch("");
    setShowFavorites(false);
    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function addToCart(p: Product) {
    const next = {
      ...cart,
      [p.id]: (cart[p.id] || 0) + 1,
    };

    setCart(next);
    localStorage.setItem("rrv-cart", JSON.stringify(next));
  }

  function changeQuantity(id: number, amount: number) {
    const next = { ...cart };
    const qty = (next[id] || 0) + amount;

    if (qty <= 0) {
      delete next[id];
    } else {
      next[id] = qty;
    }

    setCart(next);
    localStorage.setItem("rrv-cart", JSON.stringify(next));
  }

  function toggleFavorite(id: number) {
    setFavorites((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id]
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f9f3] text-[#20392a]">
      <header className="sticky top-0 z-40 border-b border-green-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-4 px-5 py-4">
          <button
            onClick={() => {
              setActiveCategory("All Products");
              setSearch("");
              setShowFavorites(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex min-w-[210px] items-center gap-3 text-left"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-3xl">🌱</span>
            <span>
              <strong className="block text-xl text-green-700">RRV</strong>
              <strong className="block text-sm">Green Basket</strong>
              <span className="text-xs text-gray-500">Freshness Delivered Daily</span>
            </span>
          </button>

          <div className="hidden text-xs sm:block">
            <span className="text-gray-500">⌖ Deliver to</span>
            <strong className="mt-1 block">Kurnool, AP</strong>
          </div>

          <form
            className="flex min-w-[230px] flex-1 overflow-hidden rounded-xl border border-green-100 bg-green-50/60"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="px-3 py-3 text-gray-400">⌕</span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveCategory("All Products");
                setShowFavorites(false);
              }}
              placeholder="Search fruits, vegetables, groceries..."
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button className="m-1 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white">
              Search
            </button>
          </form>

          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <button onClick={() => setNotice("Order history will be connected to the backend next.")}>Orders</button>
            <button
              onClick={() => {
                setShowFavorites((x) => !x);
                setSearch("");
                setActiveCategory("All Products");
                document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              ♡ Favorites ({favorites.length})
            </button>
            <button
              onClick={() => {
                window.location.href = "/cart";
              }}
            >
              🛒 Cart
              <span className="rounded-full bg-orange-600 px-2 py-1 text-white">
                {cartCount}
              </span>
              <span className="ml-1 font-semibold">₹{cartTotal}</span>
            </button>
            <a
              href="/login"
              className="rounded-xl border border-green-700 px-4 py-2 font-semibold text-green-800 transition hover:bg-green-50"
            >
              Login / Register
            </a>
          </nav>
        </div>
      </header>      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-5 py-5 lg:grid-cols-[245px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-green-100 bg-white p-4">
          <h2 className="mb-4 px-2 font-bold">Shop Categories</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {categories.map((c) => (
              <button
                key={c.name}
                onClick={() => selectCategory(c.name)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                  activeCategory === c.name && !showFavorites
                    ? "bg-green-700 font-semibold text-white"
                    : "text-gray-700 hover:bg-green-50"
                }`}
              >
                <span>{c.icon}</span>{c.name}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-gradient-to-br from-green-50 to-lime-100 p-4">
            <div className="mb-2 text-2xl">🌾</div>
            <strong className="text-sm">Support Local Farmers</strong>
            <p className="mt-2 text-xs leading-5 text-gray-600">
              Fresh choices that bring farm goodness closer to your home.
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          {/* Compact Green Basket Hero Banner */}
          {!search && !showFavorites && activeCategory === "All Products" && (
            <section className="relative mb-6 min-h-[270px] overflow-hidden rounded-2xl bg-[#123d29] shadow-md sm:min-h-[290px]">
              {/* Fresh produce background */}
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=85"
                alt="Fresh fruits and vegetables"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />

              {/* Dark green overlay for readable text */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#103b28] via-[#103b28]/90 to-[#103b28]/20" />

              {/* Editable content and working button */}
              <div className="relative z-10 flex min-h-[270px] items-center px-6 py-8 sm:min-h-[290px] sm:px-10 lg:px-14">
                <div className="max-w-xl">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-lime-300 sm:text-sm">
                    🌿 Fresh from local farms
                  </p>

                  <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                    Fresh & Healthy
                    <span className="block text-lime-300">
                      Fruits & Vegetables
                    </span>
                  </h1>

                  <p className="mt-3 max-w-md text-sm leading-6 text-white/90 sm:text-base">
                    Fresh fruits, crisp vegetables and everyday essentials
                    delivered for a healthier, happier family.
                  </p>

                  <button
                    onClick={() => selectCategory("All Products")}
                    className="mt-5 inline-flex items-center gap-3 rounded-lg bg-lime-300 px-6 py-3 font-bold text-green-950 transition hover:bg-lime-200"
                  >
                    Explore Fresh Produce
                    <span aria-hidden="true">→</span>
                  </button>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/90 sm:text-sm">
                    <span>🌱 Nature-inspired choices</span>
                    <span>🧺 Everyday freshness</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl border border-green-50 bg-white p-4 shadow-sm sm:grid-cols-4">
            {[
              ["🚚", "Free Delivery", "On eligible orders"],
              ["⚡", "Quick Delivery", "Convenience at home"],
              ["🌿", "Fresh Quality", "Carefully selected"],
              ["🤝", "Local Farmers", "Support local growers"],
            ].map(([icon, title, description]) => (
              <div key={title} className="flex gap-3 p-2">
                <span className="text-2xl">{icon}</span>
                <div>
                  <strong className="block text-sm">{title}</strong>
                  <span className="text-xs text-gray-500">{description}</span>
                </div>
              </div>
            ))}
          </div>

          <section id="products" className="scroll-mt-28">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
                  {showFavorites ? "Your saved items" : search ? "Search results" : "Fresh picks for you"}
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">
                  {showFavorites ? "Favorites" : search ? `Results for "${search}"` : activeCategory}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{filteredProducts.length} products available</p>
              </div>
              <button
                onClick={() => {
                  setActiveCategory("All Products");
                  setSearch("");
                  setShowFavorites(false);
                }}
                className="text-sm font-semibold text-green-700 hover:underline"
              >
                View All →
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-green-200 bg-white px-5 py-12 text-center">
                <div className="text-4xl">🔎</div>
                <h3 className="mt-4 font-bold">No products found</h3>
                <p className="mt-2 text-sm text-gray-500">Try another search or category.</p>
                <button
                  onClick={() => {
                    setActiveCategory("All Products");
                    setSearch("");
                    setShowFavorites(false);
                  }}
                  className="mt-5 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white"
                >
                  Show all products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((p) => (
                  <article key={p.id} className="overflow-hidden rounded-2xl border border-green-50 bg-white transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative bg-green-50">
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = `/products/${p.id}`;
                        }}
                        aria-label={`View details for ${p.name}`}
                        className="block w-full cursor-pointer text-left"
                      >
                        <img
                          src={imageUrl(p.image)}
                          alt={p.name}
                          loading="lazy"
                          className="h-40 w-full object-cover transition hover:opacity-90 sm:h-48"
                        />
                      </button>

                      {p.badge && (
                        <span className="absolute left-2 top-2 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                          {p.badge}
                        </span>
                      )}
                      <button
                        aria-label={`Toggle favorite for ${p.name}`}
                        onClick={() => toggleFavorite(p.id)}
                        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl shadow"
                      >
                        <span className={favorites.includes(p.id) ? "text-red-500" : "text-gray-500"}>
                          {favorites.includes(p.id) ? "♥" : "♡"}
                        </span>
                      </button>
                    </div>                    <div className="p-3">
                      <p className="text-xs text-gray-500">{p.category}</p>
                      <h3 className="mt-1 min-h-10 font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = `/products/${p.id}`;
                          }}
                          className="text-left hover:text-green-700 hover:underline"
                        >
                          {p.name}
                        </button>
                      </h3>
                      <div className="mt-2">
                        <strong className="text-lg">₹{p.price}</strong>
                        <span className="text-xs text-gray-500"> / {p.unit}</span>
                      </div>
                      {cart[p.id] ? (
                        <div className="mt-3 flex items-center justify-between rounded-lg border border-green-700 px-3 py-2">
                          <button onClick={() => changeQuantity(p.id, -1)} className="font-bold text-green-700">−</button>
                          <span className="font-semibold">{cart[p.id]}</span>
                          <button onClick={() => changeQuantity(p.id, 1)} className="font-bold text-green-700">+</button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(p)} className="mt-3 w-full rounded-lg bg-green-700 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800">
                          + Add to Cart
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {!search && !showFavorites && (
            <section className="mt-10">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">Explore our range</p>
                <h2 className="mt-1 text-2xl font-extrabold">Shop by Category</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {categories.filter((c) => c.name !== "All Products").map((c) => (
                  <button
                    key={c.name}
                    onClick={() => selectCategory(c.name)}
                    className="overflow-hidden rounded-2xl border border-green-100 bg-white text-left transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <img src={categoryImages[c.name]} alt={c.name} loading="lazy" className="h-28 w-full object-cover sm:h-36" />
                    <div className="flex items-center justify-between p-3 text-sm font-bold">
                      {c.name}<span className="text-green-700">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          <footer className="mt-10 border-t border-green-100 py-7 text-sm text-gray-500">
            <strong className="text-green-700">RRV Green Basket</strong>
            <p className="mt-2">Freshness Delivered Daily · Supporting local farmers</p>
            <p className="mt-3 text-xs">Demo product data and prices. Confirm official details with the client before launch.</p>
          </footer>
        </section>
      </div>

      {notice && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-xl bg-green-950 px-5 py-3 text-center text-sm font-semibold text-white shadow-xl">
          {notice}
          <button onClick={() => setNotice("")} className="ml-4 text-lime-300" aria-label="Dismiss notification">✕</button>
        </div>
      )}

      {cartCount > 0 && (
        <button
          onClick={() => { window.location.href = "/cart"; }}
          className="fixed bottom-5 right-5 z-30 rounded-full bg-green-700 px-5 py-4 font-bold text-white shadow-xl"
        >
          🛒 {cartCount} items · ₹{cartTotal}
        </button>
      )}
    </main>
  );
}