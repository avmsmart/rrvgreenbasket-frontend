"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import {
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  Leaf,
  Globe,
} from "lucide-react";
import { useStoreSettings } from "@/context/StoreSettingsContext";

export default function HomeFooter() {
  const { settings } = useStoreSettings();
  const [currentYear, setCurrentYear] = useState<number>(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-16 bg-[#f7faf7] text-gray-700">
      {/* Newsletter Section */}
      <div className="border-b border-green-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Freshness delivered to your inbox 🌱
            </h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Subscribe for fresh offers, seasonal picks, and updates.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for subscribing to our fresh grocery updates!");
            }}
            className="flex w-full max-w-md items-center rounded-full border border-gray-200 bg-white p-1.5 shadow-sm focus-within:border-green-500"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email address"
              className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-gray-400"
            />

            <button
              type="submit"
              className="flex shrink-0 items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Subscribe
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 sm:px-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="h-11 w-11 object-contain rounded-xl bg-white border border-green-100 p-1"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600 text-white">
                <Leaf size={25} />
              </div>
            )}

            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
                {settings.storeName || "RRV Green Basket"}
              </h2>
              <p className="text-xs font-medium text-gray-500">
                {settings.brandTagline || "Freshness Delivered Daily"}
              </p>
            </div>
          </Link>

          <p className="mt-5 max-w-xs text-sm leading-6 text-gray-500">
            Bringing farm-fresh fruits and vegetables straight to your doorstep.
            Eat fresh, live healthy, and support local farmers.
          </p>

          {/* Social Media */}
          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition hover:bg-blue-600 hover:text-white"
            >
              <FaFacebookF size={17} />
            </a>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition hover:bg-pink-600 hover:text-white"
            >
              <FaInstagram size={18} />
            </a>

            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition hover:bg-red-600 hover:text-white"
            >
              <FaYoutube size={19} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-5 text-base font-bold text-gray-900">
            Quick Links
          </h3>

          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/" className="transition hover:text-green-600">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="transition hover:text-green-600"
              >
                Shop Products
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition hover:text-green-600">
                My Cart
              </Link>
            </li>
            <li>
              <Link
                href="/customer/profile"
                className="transition hover:text-green-600"
              >
                My Account
              </Link>
            </li>
            {settings.websiteUrl && (
              <li>
                <a
                  href={settings.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition hover:text-green-600"
                >
                  <Globe size={14} />
                  <span>Official Website</span>
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h3 className="mb-5 text-base font-bold text-gray-900">
            Customer Support
          </h3>

          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/contact"
                className="transition hover:text-green-600"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="transition hover:text-green-600"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="transition hover:text-green-600"
              >
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link
                href="/return-policy"
                className="transition hover:text-green-600"
              >
                Return & Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="mb-5 text-base font-bold text-gray-900">
            Get in Touch
          </h3>

          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin
                size={18}
                className="mt-0.5 shrink-0 text-green-600"
              />
              <span>
                {settings.physicalAddress || "Serving your local community"}
              </span>
            </li>

            <li className="flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-green-600" />
              <a
                href={`tel:${settings.supportPhone || "+918978040537"}`}
                className="transition hover:text-green-600"
              >
                {settings.supportPhone || "+91 8978040537"}
              </a>
            </li>

            <li className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-green-600" />
              <a
                href={`mailto:${settings.supportEmail || "rrvgreenbasket@gmail.com"}`}
                className="break-all transition hover:text-green-600"
              >
                {settings.supportEmail || "rrvgreenbasket@gmail.com"}
              </a>
            </li>

            <li className="flex items-center gap-3">
              <Clock size={18} className="shrink-0 text-green-600" />
              <span>Daily fresh delivery</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-center sm:px-8 md:flex-row md:text-left">
        <p className="text-xs text-gray-500">
          © {currentYear} {settings.storeName || "RRV Green Basket"}. All rights reserved.
        </p>

        <p className="text-xs text-gray-500">
          Made with <span className="text-red-500">♥</span> for fresh living.
        </p>
      </div>
    </footer>
  );
}
