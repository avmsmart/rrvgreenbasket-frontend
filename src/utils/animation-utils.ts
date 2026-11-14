/**
 * RRV Green Basket - Flying Animation Utility
 * Creates a smooth flying item animation towards cart or wishlist icon
 * Supported across both Desktop and Mobile viewports
 */

export function triggerFlyAnimation(
  sourceElement: HTMLElement | null,
  targetType: "cart" | "wishlist",
  imageUrl?: string
) {
  if (typeof window === "undefined" || !sourceElement) return;

  // Determine target selector based on screen size & visibility
  const isMobile = window.innerWidth < 768;
  const targetSelectors =
    targetType === "cart"
      ? isMobile
        ? ['[data-nav-cart-mobile]', '[data-nav-cart]', '[data-cart-target]']
        : ['[data-nav-cart]', '[data-nav-cart-mobile]', '[data-cart-target]']
      : isMobile
      ? ['[data-nav-wishlist-mobile]', '[data-nav-wishlist]', '[data-wishlist-target]']
      : ['[data-nav-wishlist]', '[data-nav-wishlist-mobile]', '[data-wishlist-target]'];

  let targetElement: HTMLElement | null = null;
  for (const selector of targetSelectors) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el && el.offsetParent !== null) {
      targetElement = el;
      break;
    }
  }

  // Fallback if target element not found
  if (!targetElement) return;

  const startRect = sourceElement.getBoundingClientRect();
  const endRect = targetElement.getBoundingClientRect();

  // Create flying floating orb
  const flying = document.createElement("div");
  flying.className = "flying-item-animation pointer-events-none fixed z-[9999]";
  flying.style.left = `${startRect.left + startRect.width / 2 - 24}px`;
  flying.style.top = `${startRect.top + startRect.height / 2 - 24}px`;
  flying.style.width = "48px";
  flying.style.height = "48px";
  flying.style.borderRadius = "9999px";
  flying.style.backgroundColor = "#ffffff";
  flying.style.boxShadow =
    targetType === "wishlist"
      ? "0 10px 25px -5px rgba(244, 63, 94, 0.45)"
      : "0 10px 25px -5px rgba(0, 135, 90, 0.45)";
  flying.style.display = "flex";
  flying.style.alignItems = "center";
  flying.style.justifyContent = "center";
  flying.style.overflow = "hidden";
  flying.style.border =
    targetType === "wishlist" ? "2px solid #f43f5e" : "2px solid #00875a";
  flying.style.transition = "all 0.65s cubic-bezier(0.2, 0.8, 0.2, 1)";
  flying.style.transform = "scale(1)";
  flying.style.opacity = "1";

  if (targetType === "wishlist") {
    flying.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="#f43f5e" stroke="#f43f5e" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
  } else if (imageUrl) {
    flying.innerHTML = `<img src="${imageUrl}" alt="product" style="width:100%; height:100%; object-fit:contain; padding:4px;" />`;
  } else {
    flying.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00875a" stroke-width="2.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`;
  }

  document.body.appendChild(flying);

  // Force reflow
  flying.getBoundingClientRect();

  // Target coordinates
  const targetX = endRect.left + endRect.width / 2 - 14;
  const targetY = endRect.top + endRect.height / 2 - 14;

  requestAnimationFrame(() => {
    flying.style.left = `${targetX}px`;
    flying.style.top = `${targetY}px`;
    flying.style.width = "28px";
    flying.style.height = "28px";
    flying.style.transform = "scale(0.35) rotate(15deg)";
    flying.style.opacity = "0.7";
  });

  setTimeout(() => {
    if (flying.parentNode) {
      flying.parentNode.removeChild(flying);
    }
    // Target element pulse effect
    targetElement?.classList.add("scale-125");
    targetElement?.classList.add("transition-transform");
    targetElement?.classList.add("duration-150");
    setTimeout(() => {
      targetElement?.classList.remove("scale-125");
    }, 200);
  }, 660);
}
