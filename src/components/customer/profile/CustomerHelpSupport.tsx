"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { FAQ_LIST } from "@/data/customer-profile-mock";

export const CustomerHelpSupport: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [querySubject, setQuerySubject] = useState("");
  const [queryMessage, setQueryMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const categories = [
    "ALL",
    "Orders & Delivery",
    "Quality & Freshness",
    "Payments & Refunds",
    "Account & Sustainability",
  ];

  const filteredFaqs = FAQ_LIST.filter((faq) => {
    if (selectedCategory === "ALL") return true;
    return faq.category === selectedCategory;
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!querySubject.trim() || !queryMessage.trim()) return;

    setTicketSubmitted(true);
    setQuerySubject("");
    setQueryMessage("");
    setTimeout(() => setTicketSubmitted(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Contact Channels */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
        <div className="pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <HelpCircle className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Help &amp; Support
            </h1>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            We are here to assist with your farm produce orders, freshness guarantees, and questions
          </p>
        </div>

        {/* 3 Contact Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 transition hover:shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="mt-3 text-xs font-bold text-gray-900">WhatsApp Support</h3>
            <p className="mt-0.5 text-[11px] text-gray-600 leading-relaxed">
              Instant response from our farm care team
            </p>
            <a
              href="https://wa.me/919876500001"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3.5 inline-block rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-800 transition"
            >
              Chat on WhatsApp
            </a>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="mt-3 text-xs font-bold text-gray-900">Customer Helpline</h3>
            <p className="mt-0.5 text-[11px] text-gray-600 leading-relaxed">
              Toll-Free • 6:00 AM – 10:00 PM IST
            </p>
            <p className="mt-3.5 text-xs font-mono font-bold text-emerald-800">
              1800-419-4733
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="mt-3 text-xs font-bold text-gray-900">Email Assistance</h3>
            <p className="mt-0.5 text-[11px] text-gray-600 leading-relaxed">
              For billing, partnerships, and bulk orders
            </p>
            <p className="mt-3.5 text-xs font-bold text-emerald-800 truncate">
              support@rrvgreenbasket.com
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-1">
          Frequently Asked Questions
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Quick answers to common questions about farm produce and deliveries
        </p>

        {/* Filter categories */}
        <div className="flex flex-wrap gap-1.5 pb-4 border-b border-gray-100">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                selectedCategory === cat
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="mt-4 divide-y divide-gray-100">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className="py-3.5">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between text-left text-xs font-bold text-gray-900 hover:text-emerald-800 transition"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs text-gray-600 leading-relaxed pr-6 animate-in fade-in">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Ticket Form */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-1">
          Need More Help? Submit a Query
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Our customer happiness team will get back to you within 2 hours
        </p>

        {ticketSubmitted && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Your support ticket has been received! Ticket ID: #TKT-
              {Math.floor(100000 + Math.random() * 900000)}. Our team is looking into it.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmitTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700">Subject</label>
            <input
              type="text"
              required
              value={querySubject}
              onChange={(e) => setQuerySubject(e.target.value)}
              placeholder="e.g. Issue with morning milk delivery slot"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700">
              Message / Issue Details
            </label>
            <textarea
              required
              rows={4}
              value={queryMessage}
              onChange={(e) => setQueryMessage(e.target.value)}
              placeholder="Describe your query or problem in detail..."
              className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-800 transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Support Query</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerHelpSupport;
