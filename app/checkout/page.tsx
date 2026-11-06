
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Home,
  ChevronRight,
  ShoppingCart,
  CheckCircle2,
  PackageCheck,
  ShieldCheck,
  ArrowLeft,
  MapPin,
  Plus,
  Pencil,
  UserRound,
  Phone,
  Mail,
  X,
  Check,
} from "lucide-react";

/* ================= TYPES ================= */

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

type SavedAddress = {
  id: string | number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
};

/* ================= PRODUCTS ================= */

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

/* ================= COMPONENT ================= */

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [payment, setPayment] = useState("COD");

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
  });

  /* ================= LOAD CART + ADDRESSES ================= */

  useEffect(() => {
    try {
      // Load cart
      const savedCart = JSON.parse(
        localStorage.getItem("rrv-cart") || "{}"
      );

      const cartItems = products
        .map((product) => ({
          ...product,
          quantity: Math.max(
            0,
            Math.floor(Number(savedCart[product.id]) || 0)
          ),
        }))
        .filter((item) => item.quantity > 0);

      setItems(cartItems);

      // Load saved customer addresses
      const storedAddresses = JSON.parse(
        localStorage.getItem("rrv-addresses") || "[]"
      );

      if (Array.isArray(storedAddresses) && storedAddresses.length > 0) {
        const defaultAddress =
          storedAddresses.find((address: SavedAddress) => address.isDefault) ||
          storedAddresses[0];

        setSavedAddresses(storedAddresses);
        setSelectedAddressId(String(defaultAddress.id));

        setForm({
          name: defaultAddress.name || "",
          phone: defaultAddress.phone || "",
          email: defaultAddress.email || "",
          address: defaultAddress.address || "",
          city: defaultAddress.city || "",
          pincode: defaultAddress.pincode || "",
        });

        setIsAddingAddress(false);
      } else {
        // Fallback: load basic customer details if available
        const user = JSON.parse(
          localStorage.getItem("rrv-user") || "{}"
        );

        setForm((previous) => ({
          ...previous,
          name: user.name || user.fullName || "",
          phone: user.phone || user.mobile || "",
          email: user.email || "",
        }));

        setIsAddingAddress(true);
      }
    } catch (error) {
      console.error("Error loading checkout data:", error);
      setItems([]);
      setIsAddingAddress(true);
    } finally {
      setLoaded(true);
    }
  }, []);

  /* ================= PRICE CALCULATIONS ================= */

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const delivery = subtotal > 0 ? 0 : 0;
  const total = subtotal + delivery;

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  /* ================= FORM HANDLERS ================= */

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function selectAddress(address: SavedAddress) {
    setSelectedAddressId(String(address.id));
    setIsAddingAddress(false);

    setForm({
      name: address.name || "",
      phone: address.phone || "",
      email: address.email || "",
      address: address.address || "",
      city: address.city || "",
      pincode: address.pincode || "",
    });
  }

  function handleAddNewAddress() {
    setSelectedAddressId(null);
    setIsAddingAddress(true);

    setForm((previous) => ({
      ...previous,
      address: "",
      city: "",
      pincode: "",
    }));
  }

  function handleCancelNewAddress() {
    if (savedAddresses.length > 0) {
      const defaultAddress =
        savedAddresses.find((address) => address.isDefault) ||
        savedAddresses[0];

      selectAddress(defaultAddress);
    } else {
      setIsAddingAddress(false);
    }
  }

  /* ================= PLACE ORDER ================= */

  function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const order = {
      orderId: "RRV" + Date.now(),
      customer: form,
      addressId: selectedAddressId,
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

  /* ================= LOADING ================= */

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9f1]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />
          <p className="text-sm font-medium text-gray-500">
            Loading your checkout...
          </p>
        </div>
      </main>
    );
  }

  /* ================= EMPTY CART ================= */

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f5f9f1] px-4 py-12 text-center text-[#20392a]">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <ShoppingCart size={30} className="text-green-700" />
        </div>

        <h1 className="text-2xl font-extrabold sm:text-3xl">
          Your cart is empty
        </h1>

        <p className="mt-3 max-w-sm text-sm leading-6 text-gray-500">
          Add some fresh fruits and vegetables to your cart before proceeding
          to checkout.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800 active:scale-95"
        >
          <ShoppingCart size={18} />
          Continue Shopping
        </Link>

        <Link
          href="/cart"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-800 transition hover:text-green-600"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </Link>
      </main>
    );
  }

  /* ================= CHECKOUT UI ================= */

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f1f7ed] via-[#f7faf4] to-[#ffffff] px-4 pb-12 pt-5 text-[#20392a] sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* BREADCRUMB */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs sm:mb-8 sm:text-sm"
        >
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1.5 font-medium text-gray-500 transition hover:text-green-700"
          >
            <Home size={15} />
            Home
          </Link>

          <ChevronRight size={15} className="shrink-0 text-gray-400" />

          <Link
            href="/cart"
            className="inline-flex shrink-0 items-center gap-1.5 font-medium text-gray-500 transition hover:text-green-700"
          >
            <ShoppingCart size={15} />
            Shopping Cart
          </Link>

          <ChevronRight size={15} className="shrink-0 text-green-700" />

          <span className="shrink-0 font-bold text-green-800">
            Checkout
          </span>
        </nav>

        {/* HEADER */}
        <div className="mb-8 sm:mb-10">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-green-700 sm:text-sm">
            <CheckCircle2 size={16} />
            Secure Checkout
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#20392a] sm:text-3xl lg:text-4xl">
            Checkout & Billing
          </h1>

          <p className="mt-2 text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">
            Complete your details below to place your fresh order.
          </p>
        </div>

        {/* FORM + SUMMARY */}
        <form
          onSubmit={placeOrder}
          className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14"
        >
          {/* LEFT SIDE */}
          <div className="min-w-0">

            {/* DELIVERY INFORMATION */}
            <section className="rounded-2xl bg-white/45 px-4 py-5 sm:px-6 sm:py-7">
              <div className="mb-6 border-b border-green-200 pb-4">
                <h2 className="text-lg font-extrabold text-[#20392a] sm:text-xl">
                  <span className="mr-2 text-green-700">01.</span>
                  Delivery Information
                </h2>

                <p className="mt-1.5 text-xs leading-5 text-gray-500 sm:text-sm">
                  Where should we deliver your fresh order?
                </p>
              </div>

              {/* SAVED ADDRESSES */}
              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      <MapPin size={16} className="text-green-700" />
                      Your Saved Addresses
                    </h3>

                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 transition hover:text-green-900 sm:text-sm"
                    >
                      <Plus size={15} />
                      Add New Address
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {savedAddresses.map((address) => {
                      const isSelected =
                        selectedAddressId === String(address.id) &&
                        !isAddingAddress;

                      return (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => selectAddress(address)}
                          className={`relative w-full rounded-xl border p-4 text-left transition ${
                            isSelected
                              ? "border-green-600 bg-green-50/80 ring-2 ring-green-100"
                              : "border-gray-200 bg-white/70 hover:border-green-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                              <MapPin size={15} className="text-green-700" />
                              {address.isDefault ? "Default Address" : "Saved Address"}
                            </span>

                            {isSelected ? (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-700 text-white">
                                <Check size={12} />
                              </span>
                            ) : (
                              <span className="h-5 w-5 rounded-full border border-gray-300" />
                            )}
                          </div>

                          <p className="mt-2 text-sm font-semibold text-gray-800">
                            {address.name}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                            {address.address}, {address.city} - {address.pincode}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {address.phone}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ADD NEW ADDRESS / EDIT FORM */}
              {isAddingAddress && (
                <div className="mb-6 flex items-center justify-between border-b border-green-100 pb-3">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-green-800">
                    <Plus size={16} />
                    Add New Delivery Address
                  </h3>

                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCancelNewAddress}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 transition hover:text-red-500"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  )}
                </div>
              )}

              {/* CUSTOMER DETAILS */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">

                {/* NAME */}
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-1.5">
                    <UserRound size={14} className="text-green-700" />
                    Full Name <span className="text-red-500">*</span>
                  </span>

                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    placeholder="Enter your full name"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-normal text-gray-900 transition placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 sm:py-4"
                  />
                </label>

                {/* PHONE */}
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} className="text-green-700" />
                    Mobile Number <span className="text-red-500">*</span>
                  </span>

                  <input
                    required
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-normal text-gray-900 transition placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 sm:py-4"
                  />
                </label>

                {/* EMAIL */}
                <label className="block text-sm font-semibold text-gray-700 sm:col-span-2">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} className="text-green-700" />
                    Email Address
                    <span className="text-xs font-normal text-gray-400">
                      (Optional)
                    </span>
                  </span>

                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-normal text-gray-900 transition placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 sm:py-4"
                  />
                </label>

                {/* ADDRESS */}
                <label className="block text-sm font-semibold text-gray-700 sm:col-span-2">
                  Full Delivery Address <span className="text-red-500">*</span>

                  <textarea
                    required
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    autoComplete="street-address"
                    placeholder="House number, street, area, landmark"
                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-normal text-gray-900 transition placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                  />
                </label>

                {/* CITY */}
                <label className="block text-sm font-semibold text-gray-700">
                  City <span className="text-red-500">*</span>

                  <input
                    required
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    autoComplete="address-level2"
                    placeholder="Your city"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-normal text-gray-900 transition placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 sm:py-4"
                  />
                </label>

                {/* PINCODE */}
                <label className="block text-sm font-semibold text-gray-700">
                  PIN Code <span className="text-red-500">*</span>

                  <input
                    required
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    autoComplete="postal-code"
                    placeholder="6-digit PIN code"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-normal text-gray-900 transition placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 sm:py-4"
                  />
                </label>
              </div>
            </section>

            {/* PAYMENT METHOD */}
            <section className="mt-6 rounded-2xl bg-white/45 px-4 py-5 sm:mt-8 sm:px-6 sm:py-7">
              <div className="mb-6 border-b border-green-200 pb-4">
                <h2 className="text-lg font-extrabold text-[#20392a] sm:text-xl">
                  <span className="mr-2 text-green-700">02.</span>
                  Payment Method
                </h2>

                <p className="mt-1.5 text-xs leading-5 text-gray-500 sm:text-sm">
                  Choose how you would like to pay.
                </p>
              </div>

              <div className="space-y-3">

                {/* COD */}
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition sm:p-5 ${
                    payment === "COD"
                      ? "border-green-600 bg-green-50/80 ring-2 ring-green-100"
                      : "border-gray-200 bg-white/70 hover:border-green-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={payment === "COD"}
                    onChange={(e) => setPayment(e.target.value)}
                    className="h-4 w-4 shrink-0 accent-green-700"
                  />

                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-gray-900 sm:text-base">
                      Cash on Delivery
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-gray-500 sm:text-sm">
                      Pay when your order arrives.
                    </span>
                  </div>

                  <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-800 sm:text-xs">
                    Recommended
                  </span>
                </label>

                {/* ONLINE PAYMENT */}
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition sm:p-5 ${
                    payment === "Online Payment"
                      ? "border-green-600 bg-green-50/80 ring-2 ring-green-100"
                      : "border-gray-200 bg-white/70 hover:border-green-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Online Payment"
                    checked={payment === "Online Payment"}
                    onChange={(e) => setPayment(e.target.value)}
                    className="h-4 w-4 shrink-0 accent-green-700"
                  />

                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-gray-900 sm:text-base">
                      Online Payment
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-gray-500 sm:text-sm">
                      UPI, Cards & Net Banking
                    </span>
                  </div>
                </label>
              </div>

              {payment === "Online Payment" && (
                <p className="mt-3 rounded-lg bg-yellow-50 px-4 py-3 text-xs leading-5 text-yellow-800 sm:text-sm">
                  Online payment is currently in demo mode. No payment will be
                  charged until a payment gateway is integrated.
                </p>
              )}
            </section>

            {/* PRIVACY MESSAGE */}
            <div className="mt-6 flex items-center gap-3 px-1 text-xs text-gray-500 sm:mt-8">
              <ShieldCheck size={20} className="shrink-0 text-green-700" />
              <p>
                Your personal information is used only to process and deliver
                your order.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: ORDER SUMMARY */}
          <aside className="min-w-0 rounded-2xl border border-green-100 bg-white/65 p-5 sm:p-6 lg:sticky lg:top-6">

            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold text-[#20392a] sm:text-xl">
                Order Summary
              </h2>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                {itemCount} items
              </span>
            </div>

            {/* PRODUCTS */}
            <div className="mt-5 max-h-64 space-y-4 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={imageUrl(item.image)}
                    alt={item.name}
                    className="h-14 w-14 shrink-0 rounded-xl bg-white object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {item.name}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {item.quantity} × ₹{item.price}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-bold text-gray-900">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            {/* PRICE BREAKDOWN */}
            <div className="mt-5 space-y-3 border-t border-green-100 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-800">₹{subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Charges</span>
                <span className="font-semibold text-green-700">FREE</span>
              </div>

              <div className="flex items-center justify-between border-t border-green-100 pt-4">
                <span className="text-base font-extrabold text-[#20392a]">
                  Total Amount
                </span>

                <span className="text-xl font-extrabold text-green-800">
                  ₹{total}
                </span>
              </div>
            </div>

            {/* PLACE ORDER */}
            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 active:scale-[0.98] sm:text-base"
            >
              <PackageCheck size={19} />
              Place Order · ₹{total}
            </button>

            <p className="mt-3 text-center text-[11px] leading-5 text-gray-400 sm:text-xs">
              Your order details will be saved for confirmation.
            </p>

            {/* BACK TO CART */}
            <Link
              href="/cart"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 px-4 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-50"
            >
              <ArrowLeft size={16} />
              Return to Shopping Cart
            </Link>

          </aside>
        </form>
      </div>
    </main>
  );
}
