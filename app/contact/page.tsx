"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  MapPin,
  Truck,
  Send,
  MessageCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Home as HomeIcon,
  Loader2,
  Leaf,
  Heart,
  ShoppingCart,
  Search,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import CustomerNavAuth from "@/components/customer/CustomerNavAuth";
import HomeFooter from "@/components/HomeFooter";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { contactService, ContactApiError } from "@/services/contact.service";
import { ContactSubjectOption } from "@/types/contact";

// FAQ List for Customer Support
const FAQS = [
  {
    id: "faq-1",
    question: "What areas do you deliver to?",
    answer:
      "We currently deliver farm-fresh fruits, vegetables, and groceries across Kurnool and nearby residential clusters within a 5 km radius of our central packaging hub. Check the delivery location at the top of our website to confirm coverage for your specific area.",
  },
  {
    id: "faq-2",
    question: "How can I track my order?",
    answer:
      "Once your order is confirmed, our packaging team prepares your freshly harvested produce. You will receive live status updates via WhatsApp and SMS. You can also view real-time tracking under 'My Account > Orders' on our website.",
  },
  {
    id: "faq-3",
    question: "Can I cancel my order?",
    answer:
      "Yes, you can cancel an order free of charge before it enters the 'Packing' stage directly from your Order Details page. For orders already packed or out for delivery, please call or WhatsApp our support team immediately.",
  },
  {
    id: "faq-4",
    question: "What payment methods are accepted?",
    answer:
      "We accept all major UPI applications (Google Pay, PhonePe, Paytm, BHIM), Credit and Debit Cards (Visa, Mastercard, RuPay), Net Banking, and Cash on Delivery (COD) upon doorstep arrival.",
  },
  {
    id: "faq-5",
    question: "How can I report a damaged product?",
    answer:
      "We guarantee 100% farm freshness! If any item arrives damaged or does not meet quality expectations, take a photo within 12 hours of delivery and share it with us via WhatsApp or submit a message below. We will immediately replace the item or credit your wallet.",
  },
  {
    id: "faq-6",
    question: "How can I contact customer support?",
    answer:
      "Our support desk is active daily from 6:00 AM to 10:00 PM IST. You can reach us instantly via WhatsApp at +91 8978040537, through our helpline call, via email at rrvgreenbasket@gmail.com, or by submitting this contact form.",
  },
];

const SUBJECT_OPTIONS: ContactSubjectOption[] = [
  "General Enquiry",
  "Order Related",
  "Product Information",
  "Delivery Related",
  "Payment Related",
  "Complaint",
  "Other",
];

export default function ContactPage() {
  const router = useRouter();
  const { settings } = useStoreSettings();
  const { wishlistCount } = useWishlist();
  const { itemCount: cartCount } = useCart();

  const [headerSearch, setHeaderSearch] = useState<string>("");

  // Form State
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<ContactSubjectOption>("General Enquiry");
  const [message, setMessage] = useState("");

  // UI & Submission State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    ticketId?: string;
    message: string;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // FAQ Accordion State (open single item or multiple)
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  // Clean numbers for URLs
  const phoneFormatted = settings.supportPhone || "+91 8978040537";
  const phoneClean = phoneFormatted.replace(/\D/g, "");
  const whatsappNumber = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hello RRV Green Basket, I need assistance regarding your products and services."
  )}`;
  const emailAddress = settings.supportEmail || "rrvgreenbasket@gmail.com";
  const storeAddress = settings.physicalAddress || "Kurnool, Andhra Pradesh, India";
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(storeAddress)}`;

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters.";
    }

    const cleanMobile = mobileNumber.replace(/\D/g, "");
    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required.";
    } else if (cleanMobile.length < 10) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number.";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!subject) {
      newErrors.subject = "Please select an enquiry subject.";
    }

    if (!message.trim()) {
      newErrors.message = "Please write your message or enquiry.";
    } else if (message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long.";
    } else if (message.trim().length > 2000) {
      newErrors.message = "Message cannot exceed 2,000 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await contactService.submitContact({
        fullName,
        mobileNumber,
        email,
        subject,
        message,
      });

      setSubmissionSuccess({
        ticketId: res.ticketId,
        message: res.message,
      });

      // Reset form
      setFullName("");
      setMobileNumber("");
      setEmail("");
      setSubject("General Enquiry");
      setMessage("");
      setErrors({});
    } catch (err: unknown) {
      const msg = err instanceof ContactApiError ? err.message : "Failed to send message. Please try again.";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden flex flex-col">
      {/* =========================================================================
          1. TOP STORE HEADER NAVIGATION (Brand Consistent)
         ========================================================================= */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex min-h-[64px] items-center justify-between gap-3 lg:gap-6">
            {/* Logo & Platform Name */}
            <Link href="/" className="flex shrink-0 items-center gap-2.5 cursor-pointer">
              {settings.logoUrl ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-green-100 p-0.5 shadow-sm overflow-hidden">
                  <img
                    src={settings.logoUrl}
                    alt={settings.storeName}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00875a] text-white shadow-sm shadow-emerald-700/20">
                  <Leaf size={22} />
                </div>
              )}
              <div className="text-left leading-tight">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  {settings.storeName || "RRV Green Basket"}
                </h1>
                <p className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                  {settings.brandTagline || "FARM FRESH DAILY"}
                </p>
              </div>
            </Link>

            {/* Delivering Location Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-[#00875a]" />
              <span>
                Delivering in <strong className="text-slate-900">Kurnool</strong> (within 5 km)
              </span>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (headerSearch.trim()) {
                  router.push(`/?search=${encodeURIComponent(headerSearch.trim())}`);
                }
              }}
              className="hidden md:flex flex-1 max-w-sm items-center rounded-full bg-slate-100 px-3.5 py-2 border border-transparent focus-within:border-[#00875a] focus-within:bg-white transition-all"
            >
              <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search for fruits, vegetables and more..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none font-medium"
              />
            </form>

            {/* Right Action Icons: Wishlist, Cart, Account */}
            <div className="flex items-center gap-3 sm:gap-5">
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#00875a] transition-colors"
              >
                <div className="relative">
                  <Heart className={`w-5 h-5 ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-2xs">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Wishlist</span>
              </Link>

              <Link
                href="/cart"
                aria-label="Cart"
                className="relative flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#00875a] transition-colors"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-slate-800" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-black text-white shadow-2xs">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Cart</span>
              </Link>

              <div className="border-l border-slate-200 pl-3">
                <CustomerNavAuth />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. BREADCRUMB NAVIGATION
         ========================================================================= */}
      <div className="bg-[#f8faf7] border-b border-emerald-100/60 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-[#00875a] flex items-center gap-1 transition-colors">
              <HomeIcon className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="font-bold text-slate-800">Contact Us</span>
          </nav>
        </div>
      </div>

      {/* =========================================================================
          3. HERO SECTION
         ========================================================================= */}
      <section className="relative bg-gradient-to-b from-emerald-50/70 via-[#f8faf7] to-white py-8 sm:py-12 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-[#00875a] text-xs font-black tracking-wide shadow-3xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Care & Support</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            We&apos;d Love to Hear From You!
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-slate-600 font-medium leading-relaxed">
            Have questions about our fresh products, orders or delivery? Our team is here to help you.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-600">
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-3xs">
              <Clock className="w-3.5 h-3.5 text-[#00875a]" />
              <span>Daily 6:00 AM – 10:00 PM IST</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-3xs">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant WhatsApp Support</span>
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FOUR CONTACT INFORMATION CARDS
         ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 z-10 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Phone Support */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#00875a] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Phone Support</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Mon–Sun from 6:00 AM to 10:00 PM
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100">
              <a
                href={`tel:${phoneClean}`}
                className="text-xs sm:text-sm font-extrabold text-[#00875a] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{phoneFormatted}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 2: Email Support */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#00875a] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Email Support</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  We reply within 24 business hours
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100">
              <a
                href={`mailto:${emailAddress}`}
                className="text-xs sm:text-sm font-extrabold text-[#00875a] hover:underline break-all flex items-center gap-1 cursor-pointer"
              >
                <span>{emailAddress}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>

          {/* Card 3: Our Location */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#00875a] flex items-center justify-center group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Our Location</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Central produce packing & dispatch hub
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-extrabold text-[#00875a] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="truncate">{storeAddress}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>

          {/* Card 4: Delivery Area */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#00875a] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Delivery Area</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Kurnool & surrounding areas (within 5 km)
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Same-Day Slots</span>
              <span className="text-[10px] font-black text-[#00875a] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. MAIN CONTENT: CONTACT FORM & WHATSAPP SUPPORT
         ========================================================================= */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* -----------------------------------------------------------------------
              LEFT COLUMN: PREMIUM CONTACT FORM
             ----------------------------------------------------------------------- */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div>
              <span className="text-[11px] font-extrabold text-[#00875a] uppercase tracking-wider">
                Send Us a Message
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                How Can We Assist You Today?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Fill in the details below and our team will get in touch with you shortly.
              </p>
            </div>

            {/* Success Alert Banner */}
            {submissionSuccess && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#00875a] flex-shrink-0" />
                  <h4 className="text-sm font-black">Message Sent Successfully!</h4>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  {submissionSuccess.message}
                </p>
                {submissionSuccess.ticketId && (
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-[11px] font-extrabold text-[#00875a]">
                    Reference ID: {submissionSuccess.ticketId}
                  </div>
                )}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmissionSuccess(null)}
                    className="text-xs font-bold text-[#00875a] hover:underline cursor-pointer"
                  >
                    Send another message &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Server Error Alert */}
            {serverError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{serverError}</p>
                </div>
              </div>
            )}

            {/* The Form */}
            {!submissionSuccess && (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
                {/* Full Name */}
                <div>
                  <label htmlFor="contact-fullName" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                    placeholder="Enter your name"
                    className={`w-full h-11 sm:h-12 px-4 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all ${
                      errors.fullName
                        ? "border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                        : "border-slate-200 bg-slate-50/50 focus:border-[#00875a] focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Mobile & Email 2-col on Tablet/Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="contact-mobile" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-extrabold text-slate-500 select-none">
                        +91
                      </span>
                      <input
                        id="contact-mobile"
                        type="tel"
                        maxLength={10}
                        value={mobileNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setMobileNumber(val);
                          if (errors.mobileNumber) setErrors((prev) => ({ ...prev, mobileNumber: "" }));
                        }}
                        placeholder="9876543210"
                        className={`w-full h-11 sm:h-12 pl-12 pr-4 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all ${
                          errors.mobileNumber
                            ? "border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                            : "border-slate-200 bg-slate-50/50 focus:border-[#00875a] focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                        }`}
                      />
                    </div>
                    {errors.mobileNumber && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.mobileNumber}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      placeholder="you@example.com"
                      className={`w-full h-11 sm:h-12 px-4 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all ${
                        errors.email
                          ? "border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                          : "border-slate-200 bg-slate-50/50 focus:border-[#00875a] focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Subject Selector */}
                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Subject / Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as ContactSubjectOption)}
                      className="w-full h-11 sm:h-12 px-4 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-[#00875a] focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                    >
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.subject && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.subject}</p>
                  )}
                </div>

                {/* Message Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="contact-message" className="text-xs font-bold text-slate-700">
                      Your Message <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-semibold ${
                        message.length > 1800 ? "text-amber-600 font-bold" : "text-slate-400"
                      }`}
                    >
                      {message.length} / 2,000 characters
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={message}
                    maxLength={2000}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) setErrors((prev) => ({ ...prev, message: "" }));
                    }}
                    placeholder="Describe your inquiry, order details, feedback, or assistance required..."
                    className={`w-full p-4 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all resize-y min-h-[120px] ${
                      errors.message
                        ? "border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                        : "border-slate-200 bg-slate-50/50 focus:border-[#00875a] focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 sm:h-13 rounded-2xl bg-[#00875a] hover:bg-[#00734d] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Your Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* -----------------------------------------------------------------------
              RIGHT COLUMN: WHATSAPP CARD & QUICK SUPPORT HIGHLIGHTS
             ----------------------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-5">
            {/* WhatsApp Support Highlight Card */}
            <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#128C7E] to-[#075E54] text-white shadow-xl shadow-emerald-950/10 space-y-4 relative overflow-hidden group">
              {/* Subtle background graphic */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
                    Instant Chat Support
                  </span>
                  <h3 className="text-lg font-black tracking-tight leading-tight">
                    Need Quick Assistance?
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed font-medium">
                Chat with our support team directly on WhatsApp for real-time order inquiries, product availability, or address changes.
              </p>

              <div className="space-y-2 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-emerald-50 active:scale-95 text-[#075E54] font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                  <span>Chat on WhatsApp</span>
                </a>
                <p className="text-[10px] text-center text-emerald-200 font-medium">
                  Average response time: ~5 minutes
                </p>
              </div>
            </div>

            {/* Operating Hours Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00875a] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Operating Hours
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">Customer support & delivery times</p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 font-medium pt-1">
                <li className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Morning Fresh Delivery:</span>
                  <span className="font-extrabold text-slate-900">6:00 AM – 11:00 AM</span>
                </li>
                <li className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Evening Fresh Delivery:</span>
                  <span className="font-extrabold text-slate-900">5:00 PM – 8:00 PM</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Customer Helpline:</span>
                  <span className="font-extrabold text-[#00875a]">6:00 AM – 10:00 PM Daily</span>
                </li>
              </ul>
            </div>

            {/* Quality & Freshness Guarantee Card */}
            <div className="bg-[#f8faf7] rounded-3xl p-6 border border-emerald-100 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#00875a] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    100% Freshness Guarantee
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">Hassle-free replacement policy</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Every single item in your basket is hand-sorted at dawn. If any vegetable or fruit doesn&apos;t meet your standards, notify us for a quick refund or replacement.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            6. FREQUENTLY ASKED QUESTIONS (FAQ) SECTION
           ========================================================================= */}
        <section className="mt-14 sm:mt-20 pt-10 border-t border-slate-200/80 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#00875a] text-xs font-extrabold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Common Questions</span>
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Find quick answers to common questions about orders, payments, quality, and delivery.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? "border-emerald-300 bg-[#fbfdfa] shadow-xs"
                      : "border-slate-200/90 bg-white hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform shrink-0 ${
                        isOpen ? "bg-emerald-100 text-[#00875a] rotate-180" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-emerald-100/60 animate-in fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* =========================================================================
          7. FIXED MOBILE BOTTOM NAVIGATION
         ========================================================================= */}
      <nav className="fixed inset-x-3 bottom-2 z-[100] rounded-[26px] border border-white/70 bg-white/85 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_8px_32px_rgba(22,55,35,0.18)] backdrop-blur-2xl md:hidden">
        <div className="mx-auto flex h-[60px] max-w-md items-center justify-around">
          <Link
            href="/"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#00875a]"
          >
            <HomeIcon size={20} />
            <span className="text-[10px] font-semibold">Home</span>
          </Link>

          <Link
            href="/wishlist"
            className="relative flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#00875a]"
          >
            <span className="relative">
              <Heart
                size={20}
                className={wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}
              />
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold">Wishlist</span>
          </Link>

          <Link
            href="/cart"
            className="relative flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#00875a]"
          >
            <span className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-orange-500 px-1 text-[8px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold">Cart</span>
          </Link>

          <Link
            href="/contact"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[#00875a] font-bold"
          >
            <MessageCircle size={20} />
            <span className="text-[10px]">Contact</span>
          </Link>
        </div>
      </nav>

      {/* Global Storefront Footer */}
      <HomeFooter />
    </div>
  );
}
