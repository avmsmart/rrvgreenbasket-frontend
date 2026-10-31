
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
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=200&q=80`;

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [payment, setPayment] = useState("COD");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("rrv-cart") || "{}");

      const cartItems = products
        .map((product) => ({
          ...product,
          quantity: Math.max(0, Math.floor(Number(saved[product.id]) || 0)),
        }))
        .filter((item) => item.quantity > 0);

      setItems(cartItems);
    } catch {
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const delivery = subtotal > 0 ? 0 : 0;
  const total = subtotal + delivery;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const order = {
      orderId: "RRV" + Date.now(),
      customer: form,
      items,
      subtotal,
      delivery,
      total,
      paymentMethod: payment,
      orderDate: new Date().toISOString(),
      status: "Order Placed",
    };

    localStorage.setItem("rrv-order", JSON.stringify(order));
    localStorage.removeItem("rrv-cart");

    window.location.href = "/order-confirmation";
  }

  if (!loaded) {
    return <main className="p-8">Loading checkout...</main>;
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f6f9f3] p-8 text-center text-[#20392a]">
        <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-3 text-gray-600">Add products before checkout.</p>
        <a href="/" className="mt-6 inline-block rounded-xl bg-green-700 px-6 py-3 font-bold text-white">
          Continue Shopping
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f9f3] px-4 py-8 text-[#20392a] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-green-700">RRV GREEN BASKET</p>
            <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">
              Checkout & Billing
            </h1>
          </div>
          <a href="/cart" className="rounded-xl border border-green-700 px-5 py-3 font-semibold text-green-800 hover:bg-green-50">
            ← Back to Cart
          </a>
        </div>

        <form onSubmit={placeOrder} className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-extrabold">1. Delivery Information</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Full Name *
                  <input required name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-normal outline-none focus:border-green-700" />
                </label>

                <label className="text-sm font-semibold">
                  Mobile Number *
                  <input required name="phone" value={form.phone} onChange={handleChange} type="tel" pattern="[0-9]{10}" maxLength={10} placeholder="10-digit mobile number" className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-normal outline-none focus:border-green-700" />
                </label>

                <label className="text-sm font-semibold sm:col-span-2">
                  Email Address
                  <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Enter your email address" className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-normal outline-none focus:border-green-700" />
                </label>

                <label className="text-sm font-semibold sm:col-span-2">
                  Full Delivery Address *
                  <textarea required name="address" value={form.address} onChange={handleChange} rows={3} placeholder="House number, street, area, landmark" className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-normal outline-none focus:border-green-700" />
                </label>

                <label className="text-sm font-semibold">
                  City *
                  <input required name="city" value={form.city} onChange={handleChange} placeholder="Your city" className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-normal outline-none focus:border-green-700" />
                </label>

                <label className="text-sm font-semibold">
                  PIN Code *
                  <input required name="pincode" value={form.pincode} onChange={handleChange} pattern="[0-9]{6}" maxLength={6} placeholder="6-digit PIN code" className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-normal outline-none focus:border-green-700" />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-extrabold">2. Payment Method</h2>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-green-200 p-4 hover:bg-green-50">
                <input type="radio" name="payment" value="COD" checked={payment === "COD"} onChange={(e) => setPayment(e.target.value)} />
                <span>
                  <span className="block font-bold">Cash on Delivery</span>
                  <span className="text-sm text-gray-500">Pay when your order arrives</span>
                </span>
              </label>

              <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-green-200 p-4 hover:bg-green-50">
                <input type="radio" name="payment" value="Online Payment" checked={payment === "Online Payment"} onChange={(e) => setPayment(e.target.value)} />
                <span>
                  <span className="block font-bold">Online Payment</span>
                  <span className="text-sm text-gray-500">Payment gateway integration required</span>
                </span>
              </label>

              {payment === "Online Payment" && (
                <p className="mt-3 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                  Online payment is currently a demo selection. No money will be charged until a payment gateway is integrated.
                </p>
              )}
            </section>
          </div>

          <aside className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-xl font-extrabold">Order Summary</h2>

            <div className="mt-4 max-h-64 space-y-4 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={imageUrl(item.image)} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.quantity} × ₹{item.price}</p>
                  </div>
                  <p className="font-bold">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-semibold text-green-700">Free</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-extrabold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button type="submit" className="mt-6 w-full rounded-xl bg-green-700 px-5 py-4 font-bold text-white hover:bg-green-800">
              Place Order – ₹{total}
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              Your order details will be saved for confirmation.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}
