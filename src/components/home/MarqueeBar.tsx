"use client";

const OFFERS = [
  "First Order 40% OFF",
  "Use Code WELCOME40",
  "Free Delivery over ₹499",
  "Fresh Daily",
  "New Arrivals Every Week",
];

export function MarqueeBar() {
  // Duplicate the list so the marquee loops seamlessly
  const items = [...OFFERS, ...OFFERS];

  return (
    <div
      className="mt-12 w-screen overflow-hidden border-y border-emerald-800/30 bg-emerald-700 text-white"
      style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
    >
      <div className="marquee-track">
        {items.map((text, i) => (
          <span key={i} className="marquee-item">
            <span className="text-amber-300">✦</span>
            <span>{text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}