"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Truck,
  Leaf,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import CustomerNavAuth from "@/components/customer/CustomerNavAuth";
import { getStoredWishlist, saveStoredWishlist, CustomerWishlistItem } from "@/data/customer-profile-mock";
import { MASTER_PRODUCTS_DATA } from "@/data/master-products";
import { adminProductService } from "@/services/product.service";
import { inventoryService } from "@/services/inventory.service";

interface StorefrontProduct {
  id: number | string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  unit: string;
  image: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
  description: string;
  inStock: boolean;
  maxStock: number;
  origin?: string;
  shelfLife?: string;
  storage?: string;
}

// 29 Comprehensive Storefront Products with rich descriptions, ratings & pricing
const STOREFRONT_PRODUCTS: StorefrontProduct[] = [
  {
    id: 1,
    name: "Fresh Apples",
    category: "Fruits",
    price: 120,
    originalPrice: 145,
    unit: "kg",
    image: "photo-1560806887-1e4cd0b6cbd6",
    badge: "Popular",
    rating: 4.8,
    reviewsCount: 256,
    description: "Crisp, naturally sweet apples handpicked from premium orchard trees. Packed with natural antioxidants, dietary fiber, and essential vitamin C for daily family vitality.",
    inStock: true,
    maxStock: 50,
    origin: "Himachal Pradesh Orchards",
    shelfLife: "7-10 days",
    storage: "Store in a cool, dry place or refrigerate",
  },
  {
    id: 2,
    name: "Sweet Bananas",
    category: "Fruits",
    price: 60,
    originalPrice: 75,
    unit: "dozen",
    image: "photo-1571771894821-ce9b6c11b08e",
    badge: "Fresh Daily",
    rating: 4.9,
    reviewsCount: 312,
    description: "Naturally ripened Robusta bananas, sweet, creamy, and energy-dense. Rich in potassium and vitamin B6, ideal for wholesome snacking, smoothies, and breakfast bowls.",
    inStock: true,
    maxStock: 80,
    origin: "Karnataka Farms",
    shelfLife: "3-5 days",
    storage: "Store at ambient room temperature",
  },
  {
    id: 3,
    name: "Green Grapes",
    category: "Fruits",
    price: 80,
    originalPrice: 95,
    unit: "500 g",
    image: "photo-1537640538966-79f369143f8f",
    rating: 4.7,
    reviewsCount: 184,
    description: "Seedless, juicy sweet green grapes with a refreshing snap. Harvested fresh and chilled immediately to preserve crispness, hydration, and natural bioflavonoids.",
    inStock: true,
    maxStock: 40,
    origin: "Nashik Vineyards",
    shelfLife: "4-6 days",
    storage: "Refrigerate in a ventilated container",
  },
  {
    id: 4,
    name: "Fresh Mangoes",
    category: "Exotic & Seasonal",
    price: 100,
    originalPrice: 130,
    unit: "kg",
    image: "photo-1553279768-865429fa0078",
    badge: "Seasonal",
    rating: 4.9,
    reviewsCount: 420,
    description: "Aromatic, premium sweet mangoes naturally tree-ripened without artificial chemicals. Renowned for rich golden pulp, low fiber, and authentic tropical aroma.",
    inStock: true,
    maxStock: 35,
    origin: "Ratnagiri Farms",
    shelfLife: "4-5 days",
    storage: "Store at room temperature until ripe",
  },
  {
    id: 5,
    name: "Red Tomatoes",
    category: "Vegetables",
    price: 36,
    originalPrice: 45,
    unit: "kg",
    image: "photo-1546094096-0df4bcaaa337",
    badge: "Best Seller",
    rating: 4.8,
    reviewsCount: 512,
    description: "Firm, glossy red hybrid tomatoes picked fresh from local farms. Perfect for curries, salads, gravies, and soups with abundant lycopene and vitamin C.",
    inStock: true,
    maxStock: 100,
    origin: "Kolar Hydroponic Farms",
    shelfLife: "5-7 days",
    storage: "Keep in a cool ventilated basket",
  },
  {
    id: 6,
    name: "Fresh Onions",
    category: "Vegetables",
    price: 28,
    originalPrice: 35,
    unit: "kg",
    image: "photo-1508747703725-719777637510",
    rating: 4.6,
    reviewsCount: 390,
    description: "Pungent, high-flavor dried red onions with tight papery skins and crisp interior layers. The essential base for Indian gravies, tadkas, and daily culinary preparations.",
    inStock: true,
    maxStock: 150,
    origin: "Maharashtra Produce Market",
    shelfLife: "14-20 days",
    storage: "Store in a dry, ventilated basket away from sunlight",
  },
  {
    id: 7,
    name: "Carrots",
    category: "Vegetables",
    price: 40,
    originalPrice: 50,
    unit: "kg",
    image: "photo-1445282768818-728615cc910a",
    rating: 4.7,
    reviewsCount: 210,
    description: "Crunchy, sweet orange carrots rich in beta-carotene and dietary fiber. Freshly washed and trimmed, ideal for healthy salads, warm halwas, and vegetable stir-fries.",
    inStock: true,
    maxStock: 60,
    origin: "Ooty Mountain Farms",
    shelfLife: "7-10 days",
    storage: "Keep refrigerated in vegetable crisper",
  },
  {
    id: 8,
    name: "Fresh Cucumber",
    category: "Vegetables",
    price: 25,
    originalPrice: 32,
    unit: "kg",
    image: "photo-1604977042946-1eecc30f269e",
    rating: 4.8,
    reviewsCount: 165,
    description: "Cool, crisp local cucumbers with tender seeds and high natural hydration. Great for weight-conscious diets, refreshing summer salads, and detox juices.",
    inStock: true,
    maxStock: 50,
    origin: "Hosur Polyhouse Farms",
    shelfLife: "4-6 days",
    storage: "Refrigerate in a produce bag",
  },
  {
    id: 9,
    name: "Fresh Spinach",
    category: "Leafy Greens",
    price: 20,
    originalPrice: 28,
    unit: "bunch",
    image: "photo-1576045057995-568f588f82fb",
    badge: "Harvested Today",
    rating: 4.9,
    reviewsCount: 288,
    description: "Tender, iron-rich dark green palak bunches harvested at sunrise. Hygienically bundled, perfect for nutrient-dense smoothies, dals, and restaurant-style palak paneer.",
    inStock: true,
    maxStock: 45,
    origin: "Devenahalli Organic Clusters",
    shelfLife: "2-3 days",
    storage: "Wrap in a damp cloth and refrigerate",
  },
  {
    id: 10,
    name: "Fresh Lettuce",
    category: "Leafy Greens",
    price: 35,
    originalPrice: 45,
    unit: "bunch",
    image: "photo-1622206151226-18ca2c9ab4a1",
    rating: 4.7,
    reviewsCount: 140,
    description: "Crisp, broad green lettuce heads grown in climate-controlled polyhouses. Mild, sweet flavor with an unbeatable refreshing crunch for wraps and gourmet salads.",
    inStock: true,
    maxStock: 30,
    origin: "Nilgiris Polyhouses",
    shelfLife: "3-5 days",
    storage: "Refrigerate in an airtight container",
  },
  {
    id: 11,
    name: "Fresh Coriander",
    category: "Leafy Greens",
    price: 15,
    originalPrice: 20,
    unit: "bunch",
    image: "photo-1615485290382-441e4d049cb5",
    rating: 4.8,
    reviewsCount: 360,
    description: "Fragrant, leafy green coriander bunches with tender aromatic stalks. Handpicked daily to elevate home-cooked curries, spicy chutneys, and savory garnishes.",
    inStock: true,
    maxStock: 60,
    origin: "Malur Greens Cooperative",
    shelfLife: "3-4 days",
    storage: "Trim ends and store in a glass of water or paper towel",
  },
  {
    id: 12,
    name: "Fresh Pineapple",
    category: "Exotic & Seasonal",
    price: 90,
    originalPrice: 115,
    unit: "piece",
    image: "photo-1550258987-190a2d41a8ba",
    rating: 4.8,
    reviewsCount: 195,
    description: "Juicy, golden queen pineapple with balanced sweetness and natural acidity. Abundant in vitamin C and digestive bromelain enzymes.",
    inStock: true,
    maxStock: 25,
    origin: "Vazhakulam Farms, Kerala",
    shelfLife: "4-6 days",
    storage: "Store whole at room temperature",
  },
  {
    id: 13,
    name: "Dragon Fruit",
    category: "Exotic & Seasonal",
    price: 140,
    originalPrice: 170,
    unit: "piece",
    image: "photo-1527325678964-54921661f888",
    badge: "Exotic",
    rating: 4.9,
    reviewsCount: 175,
    description: "Vibrant exotic dragon fruit with magenta skin and speckled sweet flesh. Supercharged with dietary antioxidants, magnesium, and prebiotic fiber.",
    inStock: true,
    maxStock: 20,
    origin: "Gujarat Orchards",
    shelfLife: "5-7 days",
    storage: "Keep in a cool fruit bowl",
  },
  {
    id: 14,
    name: "Organic Tomatoes",
    category: "Organics",
    price: 50,
    originalPrice: 65,
    unit: "kg",
    image: "photo-1546094096-0df4bcaaa337",
    badge: "Organic",
    rating: 4.9,
    reviewsCount: 230,
    description: "Certified pesticide-free organic tomatoes cultivated using natural cow-dung manure. Rich authentic aroma with deep heirloom tomato flavor.",
    inStock: true,
    maxStock: 40,
    origin: "Certified Organic Farms, Mandya",
    shelfLife: "5-6 days",
    storage: "Keep ventilated at room temperature",
  },
  {
    id: 15,
    name: "Organic Spinach",
    category: "Organics",
    price: 30,
    originalPrice: 40,
    unit: "bunch",
    image: "photo-1576045057995-568f588f82fb",
    badge: "Organic",
    rating: 4.9,
    reviewsCount: 195,
    description: "100% natural organic palak harvested without chemical fertilizers or systemic pesticides. Clean, crisp leaves full of bioavailable iron and calcium.",
    inStock: true,
    maxStock: 30,
    origin: "Vedic Organic Clusters",
    shelfLife: "2-3 days",
    storage: "Wrap in cotton cloth and refrigerate",
  },
  {
    id: 16,
    name: "Organic Apples",
    category: "Organics",
    price: 150,
    originalPrice: 185,
    unit: "kg",
    image: "photo-1560806887-1e4cd0b6cbd6",
    badge: "Organic",
    rating: 4.9,
    reviewsCount: 310,
    description: "Mountain-grown organic apples completely free from wax or chemical sprays. Wholesome sweet crunch with unadulterated orchard freshness.",
    inStock: true,
    maxStock: 35,
    origin: "Kinnaur High Altitude Orchards",
    shelfLife: "8-12 days",
    storage: "Refrigerate for lasting crispness",
  },
  {
    id: 17,
    name: "Organic Carrots",
    category: "Organics",
    price: 55,
    originalPrice: 70,
    unit: "kg",
    image: "photo-1445282768818-728615cc910a",
    badge: "Organic",
    rating: 4.8,
    reviewsCount: 160,
    description: "Organic country carrots grown in rich organic compost. Naturally sweet and nutrient-rich, ideal for nutritious baby food and raw salads.",
    inStock: true,
    maxStock: 40,
    origin: "Nilgiris Organic Bio-reserve",
    shelfLife: "7-9 days",
    storage: "Refrigerate in vegetable crisper",
  },
  {
    id: 18,
    name: "Fresh Cow Milk",
    category: "Dairy Products",
    price: 32,
    originalPrice: 38,
    unit: "500 ml",
    image: "photo-1563636619-e9143da7973b",
    badge: "Daily Fresh",
    rating: 4.9,
    reviewsCount: 650,
    description: "Pure pasteurized farm-fresh cow milk delivered chilled each morning. Rich source of calcium and high-grade protein for whole-family health.",
    inStock: true,
    maxStock: 120,
    origin: "RRV Dairy Farms, Doddaballapura",
    shelfLife: "2 days",
    storage: "Refrigerate below 4°C",
  },
  {
    id: 19,
    name: "Fresh Paneer",
    category: "Dairy Products",
    price: 90,
    originalPrice: 110,
    unit: "200 g",
    image: "photo-1631452180519-c014fe946bc7",
    badge: "High Protein",
    rating: 4.9,
    reviewsCount: 440,
    description: "Soft, melt-in-mouth cottage cheese crafted from 100% whole cow milk without starch or preservatives. 18g protein per serving.",
    inStock: true,
    maxStock: 50,
    origin: "RRV Artisan Creamery",
    shelfLife: "4-5 days",
    storage: "Keep submerged in water inside refrigerator",
  },
  {
    id: 20,
    name: "Farm Butter",
    category: "Dairy Products",
    price: 55,
    originalPrice: 68,
    unit: "100 g",
    image: "photo-1589985270826-4b7bb135bc9d",
    rating: 4.8,
    reviewsCount: 220,
    description: "Traditional slow-churned white butter made from cultured dairy cream. Pure, natural taste that enhances hot parathas and morning rotis.",
    inStock: true,
    maxStock: 40,
    origin: "Traditional Creameries, Hassan",
    shelfLife: "10-14 days",
    storage: "Keep refrigerated",
  },
  {
    id: 21,
    name: "Roasted Peanuts",
    category: "Snacks & Foods",
    price: 45,
    originalPrice: 55,
    unit: "200 g",
    image: "photo-1567892737950-30c4db37cd89",
    rating: 4.7,
    reviewsCount: 155,
    description: "Crunchy, slow-roasted peanuts lightly seasoned with Himalayan rock salt. Rich in plant protein, healthy fats, and savory crunch.",
    inStock: true,
    maxStock: 60,
    origin: "Saurashtra Peanut Roasters",
    shelfLife: "60 days",
    storage: "Keep in an airtight jar",
  },
  {
    id: 22,
    name: "Potato Chips",
    category: "Snacks & Foods",
    price: 30,
    originalPrice: 38,
    unit: "pack",
    image: "photo-1566478989037-eec170784d0b",
    rating: 4.6,
    reviewsCount: 290,
    description: "Thinly sliced, golden potato wafers crisp-fried in cold-pressed groundnut oil and dusted with sea salt. The ultimate teatime crunch.",
    inStock: true,
    maxStock: 75,
    origin: "RRV Snack Kitchens",
    shelfLife: "45 days",
    storage: "Store in a dry pantry",
  },
  {
    id: 23,
    name: "Mixed Nuts",
    category: "Snacks & Foods",
    price: 120,
    originalPrice: 150,
    unit: "200 g",
    image: "photo-1599599810694-b5b37304c9d4",
    badge: "Superfood",
    rating: 4.9,
    reviewsCount: 380,
    description: "Hand-graded premium blend of whole California almonds, cashew kernels, walnut halves, and Afghan raisins. Vital omega-3 brain fuel.",
    inStock: true,
    maxStock: 45,
    origin: "Direct Gourmet Imports",
    shelfLife: "90 days",
    storage: "Refrigerate for peak freshness and crunch",
  },
  {
    id: 24,
    name: "Orange Juice",
    category: "Beverages",
    price: 60,
    originalPrice: 75,
    unit: "bottle",
    image: "photo-1600271886742-f049cd451bba",
    badge: "Cold-Pressed",
    rating: 4.8,
    reviewsCount: 215,
    description: "Freshly squeezed Nagpur orange juice with natural pulp. 100% pure fruit juice without added sugar, artificial colors, or concentrates.",
    inStock: true,
    maxStock: 35,
    origin: "Nagpur Citrus Orchards",
    shelfLife: "3 days",
    storage: "Keep chilled below 4°C",
  },
  {
    id: 25,
    name: "Coconut Water",
    category: "Beverages",
    price: 40,
    originalPrice: 50,
    unit: "bottle",
    image: "photo-1525385133512-2f3bdd039054",
    badge: "Electrolytes",
    rating: 4.9,
    reviewsCount: 480,
    description: "Pure tender coconut water harvested fresh from Pollachi palms. Naturally rich in potassium and magnesium for instantaneous cellular rehydration.",
    inStock: true,
    maxStock: 80,
    origin: "Pollachi Coconut Groves",
    shelfLife: "2 days",
    storage: "Keep chilled for best refreshing taste",
  },
  {
    id: 26,
    name: "Green Tea",
    category: "Beverages",
    price: 110,
    originalPrice: 135,
    unit: "pack",
    image: "photo-1556679343-c7306c1976bc",
    rating: 4.8,
    reviewsCount: 190,
    description: "Whole-leaf organic green tea leaves harvested from misty Darjeeling slopes. High in natural EGCG catechins to boost daily metabolism.",
    inStock: true,
    maxStock: 50,
    origin: "Darjeeling Tea Estates",
    shelfLife: "180 days",
    storage: "Store in a light-proof airtight tin",
  },
  {
    id: 27,
    name: "Dishwashing Liquid",
    category: "Household Items",
    price: 85,
    originalPrice: 105,
    unit: "bottle",
    image: "photo-1563453392212-326f5e854473",
    rating: 4.7,
    reviewsCount: 160,
    description: "Eco-friendly, grease-cutting dishwashing gel infused with real lemon extracts. Tough on dried stains while keeping hands soft and moisturized.",
    inStock: true,
    maxStock: 40,
    origin: "EcoClean Manufacturing",
    shelfLife: "365 days",
    storage: "Store in a cool dry area",
  },
  {
    id: 28,
    name: "Laundry Detergent",
    category: "Household Items",
    price: 120,
    originalPrice: 150,
    unit: "pack",
    image: "photo-1585421514738-01798e348b17",
    rating: 4.8,
    reviewsCount: 220,
    description: "Bio-enzyme liquid laundry detergent with botanical freshness. Removes stubborn grass, curry, and oil stains while protecting fabric color integrity.",
    inStock: true,
    maxStock: 35,
    origin: "EcoClean Manufacturing",
    shelfLife: "365 days",
    storage: "Keep cap tightly closed",
  },
  {
    id: 29,
    name: "Paper Towels",
    category: "Household Items",
    price: 65,
    originalPrice: 80,
    unit: "pack",
    image: "photo-1583947215259-38e31be8751f",
    rating: 4.7,
    reviewsCount: 180,
    description: "Thick 2-ply embossed kitchen paper towels made from 100% chlorine-free recycled cellulose. Exceptional absorbency for cooking and cleaning.",
    inStock: true,
    maxStock: 50,
    origin: "GreenFiber Products",
    shelfLife: "Unlimited",
    storage: "Store away from moisture",
  },
];

// Helper to resolve image URLs cleanly
function resolveImageUrl(img?: string): string {
  if (!img) return "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85";
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/")) {
    return img;
  }
  return `https://images.unsplash.com/${img}?auto=format&fit=crop&w=900&q=85`;
}

function ProductDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id ? String(params.id) : "1";

  // State management
  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Synchronize cart count from localStorage
  const updateCartCount = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("rrv-cart") || "{}");
      const total = Object.values(saved).reduce((sum: number, q) => sum + (Number(q) || 0), 0);
      setCartCount(Number(total) || 0);
    } catch {
      setCartCount(0);
    }
  };

  // Find product by ID: checks storefront list, master products catalog, or fallback
  useEffect(() => {
    setMounted(true);
    updateCartCount();

    // 1. Check in Storefront Products
    const foundStorefront = STOREFRONT_PRODUCTS.find(
      (item) => String(item.id) === rawId
    );

    if (foundStorefront) {
      setProduct(foundStorefront);
      setQuantity(1);
      return;
    }

    // 2. Check in Master Products Catalog
    const foundMaster = MASTER_PRODUCTS_DATA.find(
      (item) => String(item.id) === rawId || String(item.erpCode) === rawId
    );

    if (foundMaster) {
      const converted: StorefrontProduct = {
        id: foundMaster.id,
        name: foundMaster.name,
        category: typeof foundMaster.category === "string" ? foundMaster.category : "Vegetables",
        price: foundMaster.price || 50,
        originalPrice: foundMaster.originalPrice || Math.round((foundMaster.price || 50) * 1.18),
        unit: foundMaster.unit || "kg",
        image: foundMaster.imageUrl || "photo-1546094096-0df4bcaaa337",
        badge: foundMaster.featured ? "Featured" : undefined,
        rating: 4.8,
        reviewsCount: 142,
        description: foundMaster.description || "Farm-fresh produce sourced daily for peak quality and balanced nutrition.",
        inStock: foundMaster.status !== "Out of Stock",
        maxStock: foundMaster.stock || 40,
        origin: "SRM Farm Clusters",
        shelfLife: "4-6 days",
        storage: "Keep in a cool and dry space",
      };
      setProduct(converted);
      setQuantity(1);
      return;
    }

    // 3. Fallback: Check from backend API if publicId
    adminProductService
      .getProductById(rawId)
      .then(async (data) => {
        if (data) {
          let isProductInStock = data.available !== false;
          try {
            // Check live customer stock availability from Inventory Service
            const stockCheck = await inventoryService.getProductAvailability(data.publicId, 1);
            if (stockCheck && typeof stockCheck.inStock === "boolean") {
              isProductInStock = stockCheck.inStock;
            }
          } catch {
            // Graceful fallback to product admin availability flag
          }

          const apiProd: StorefrontProduct = {
            id: data.publicId,
            name: data.name,
            category: typeof data.category === "object" ? data.category.name : "Vegetables",
            price: data.pricePerKg || 40,
            originalPrice: Math.round((data.pricePerKg || 40) * 1.15),
            unit: data.quantityUnit || "kg",
            image: data.imageUrl || "photo-1546094096-0df4bcaaa337",
            badge: data.isFeatured ? "Featured" : undefined,
            rating: 4.8,
            reviewsCount: 96,
            description: data.description || data.shortDescription || "Fresh garden produce direct to your home.",
            inStock: isProductInStock,
            maxStock: 50,
            origin: "RRV Green Farms",
            shelfLife: "5 days",
          };
          setProduct(apiProd);
        }
      })
      .catch(() => {
        // Fallback default
        setProduct(STOREFRONT_PRODUCTS[0]);
      });
  }, [rawId]);

  // Wishlist state check on load
  useEffect(() => {
    if (!product) return;
    try {
      const stored = getStoredWishlist();
      const exists = stored.some((item) => String(item.id) === String(product.id));
      setIsWishlisted(exists);
    } catch {
      setIsWishlisted(false);
    }
  }, [product]);

  // Toast feedback trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Toggle Wishlist
  const handleToggleWishlist = () => {
    if (!product) return;
    try {
      const stored = getStoredWishlist();
      const exists = stored.some((item) => String(item.id) === String(product.id));

      if (exists) {
        const updated = stored.filter((item) => String(item.id) !== String(product.id));
        saveStoredWishlist(updated);
        setIsWishlisted(false);
        showToast(`Removed "${product.name}" from Wishlist`);
      } else {
        const newItem: CustomerWishlistItem = {
          id: typeof product.id === "number" ? product.id : Math.floor(Math.random() * 1000) + 100,
          name: product.name,
          category: product.category,
          price: product.price,
          unit: product.unit,
          image: resolveImageUrl(product.image),
          inStock: product.inStock,
          badge: product.badge,
        };
        saveStoredWishlist([newItem, ...stored]);
        setIsWishlisted(true);
        showToast(`Added "${product.name}" to your Wishlist ❤️`);
      }
    } catch {
      showToast("Could not update wishlist");
    }
  };

  // Add current product to cart
  const handleAddToCart = () => {
    if (!product) return;
    setIsAdding(true);

    try {
      const saved = JSON.parse(localStorage.getItem("rrv-cart") || "{}");
      saved[product.id] = (Number(saved[product.id]) || 0) + quantity;
      localStorage.setItem("rrv-cart", JSON.stringify(saved));
      window.dispatchEvent(new Event("storage"));
      updateCartCount();

      showToast(`Added ${quantity} × ${product.name} to cart!`);
    } catch {
      showToast("Unable to update cart. Please try again.");
    } finally {
      setTimeout(() => setIsAdding(false), 300);
    }
  };

  // Quick add recommended product
  const handleQuickAddRecommended = (e: React.MouseEvent, rec: StorefrontProduct) => {
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem("rrv-cart") || "{}");
      saved[rec.id] = (Number(saved[rec.id]) || 0) + 1;
      localStorage.setItem("rrv-cart", JSON.stringify(saved));
      window.dispatchEvent(new Event("storage"));
      updateCartCount();
      showToast(`Added 1 × ${rec.name} to cart!`);
    } catch {
      showToast("Could not add to cart");
    }
  };

  // Share functionality: Web Share API with clipboard fallback
  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: `${product.name} | RRV Green Basket`,
      text: `Buy fresh ${product.name} at ₹${product.price}/${product.unit} on RRV Green Basket!`,
      url: window.location.href,
    };

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          copyLinkFallback();
        }
      }
    } else {
      copyLinkFallback();
    }
  };

  const copyLinkFallback = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Product link copied to clipboard! 📋");
    }
  };

  // Filter recommendations: priority to same category, excluding current product
  const recommendations = useMemo(() => {
    if (!product) return STOREFRONT_PRODUCTS.slice(0, 8);
    const sameCategory = STOREFRONT_PRODUCTS.filter(
      (p) => String(p.id) !== String(product.id) && p.category === product.category
    );
    const others = STOREFRONT_PRODUCTS.filter(
      (p) => String(p.id) !== String(product.id) && p.category !== product.category
    );
    return [...sameCategory, ...others].slice(0, 8);
  }, [product]);

  // Savings calculation
  const unitDiscount = product ? Math.max(0, product.originalPrice - product.price) : 0;
  const totalSavings = unitDiscount * quantity;
  const totalPrice = product ? product.price * quantity : 0;

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f8faf7] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#00875a] flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Product Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          The requested produce item could not be found or has moved in our catalog.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-2xl bg-[#00875a] hover:bg-[#00734d] px-6 py-3 font-bold text-white shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
        >
          Return to Store
        </button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden relative">
      {/* =========================================================================
          1. TOP NAVIGATION (Mobile & Desktop)
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100/80 transition-all">
        {/* Desktop Navbar Banner */}
        <div className="hidden lg:flex items-center justify-between max-w-6xl mx-auto px-6 py-3.5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-2xl bg-[#00875a] text-white flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight block leading-tight">
                RRV Green Basket
              </span>
              <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase block">
                Farm Fresh Vegetables &amp; Groceries
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-[#00875a] transition-colors"
            >
              Browse Catalog
            </Link>
            <Link
              href="/cart"
              className="relative px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#00875a] font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-[#00875a]" />
              <span>Cart</span>
              {mounted && cartCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#00875a] text-white text-[10px] font-black">
                  {cartCount}
                </span>
              )}
            </Link>
            <CustomerNavAuth />
          </div>
        </div>

        {/* Top App Bar (Mobile exact match to reference screenshot) */}
        <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="w-10 h-10 rounded-full bg-slate-100/90 hover:bg-slate-200/90 active:scale-95 flex items-center justify-center text-slate-700 transition-all cursor-pointer shadow-3xs"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Centered Page Title */}
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight text-center">
            Product Details
          </h1>

          {/* Share Button */}
          <button
            onClick={handleShare}
            aria-label="Share product"
            className="w-10 h-10 rounded-full bg-slate-100/90 hover:bg-slate-200/90 active:scale-95 flex items-center justify-center text-slate-700 transition-all cursor-pointer shadow-3xs"
          >
            <Share2 className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>
        </div>
      </header>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-0 sm:px-6 lg:px-8 pb-32 sm:pb-36 lg:pb-24">
        {/* Responsive Grid: Two columns on desktop, single flow on mobile */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start lg:pt-8">
          
          {/* =========================================================================
              2. PRODUCT IMAGE SECTION
             ========================================================================= */}
          <div className="w-full">
            <div className="relative w-full rounded-b-[32px] sm:rounded-b-[40px] lg:rounded-3xl bg-gradient-to-b from-[#f3f9f1] via-[#ebf7eb] to-[#e4f3e3] p-8 sm:p-12 lg:p-14 flex items-center justify-center min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] overflow-hidden shadow-xs">
              
              {/* Optional Product Badge */}
              {product.badge && (
                <span className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3 py-1 rounded-full bg-[#00875a] text-white text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{product.badge}</span>
                </span>
              )}

              {/* Main Product Image */}
              <div className="relative w-full h-56 sm:h-72 lg:h-80 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImageUrl(product.image)}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105 select-none"
                />
              </div>
            </div>

            {/* Desktop Highlights Badges */}
            <div className="hidden lg:grid grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-2xl bg-[#f8faf7] border border-emerald-100 flex items-center gap-2.5">
                <Leaf className="w-5 h-5 text-[#00875a] flex-shrink-0" />
                <div className="leading-tight">
                  <span className="text-xs font-bold text-slate-800 block">100% Fresh</span>
                  <span className="text-[10px] text-slate-400">Direct from farm</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#f8faf7] border border-emerald-100 flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-[#00875a] flex-shrink-0" />
                <div className="leading-tight">
                  <span className="text-xs font-bold text-slate-800 block">Fast Delivery</span>
                  <span className="text-[10px] text-slate-400">Within 2 hours</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#f8faf7] border border-emerald-100 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#00875a] flex-shrink-0" />
                <div className="leading-tight">
                  <span className="text-xs font-bold text-slate-800 block">Quality Check</span>
                  <span className="text-[10px] text-slate-400">100% sorted</span>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              3. PRODUCT INFORMATION & CONTROLS SECTION
             ========================================================================= */}
          <div className="px-5 sm:px-6 lg:px-0 pt-5 sm:pt-6 lg:pt-2 space-y-6">
            
            {/* Title & Wishlist Row */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#00875a] bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
                    {product.category}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {product.name}
                  </h1>
                </div>

                {/* Wishlist Heart Icon Button */}
                <button
                  onClick={handleToggleWishlist}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-3xs flex-shrink-0 ${
                    isWishlisted
                      ? "bg-rose-50 border-rose-200 text-rose-500 scale-105"
                      : "bg-slate-50 border-slate-200/90 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 transition-transform active:scale-125 ${
                      isWishlisted ? "fill-rose-500 text-rose-500" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Rating and Reviews Row */}
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-black text-slate-800">
                    {product.rating.toFixed(1)}
                  </span>
                </div>

                <span className="text-xs font-medium text-slate-400">
                  ({product.reviewsCount} reviews)
                </span>

                <span className="w-1 h-1 rounded-full bg-slate-300" />

                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Price & Quantity Selector Row (Exact match to reference design) */}
            <div className="flex items-center justify-between gap-4 pt-1">
              {/* Price & Unit */}
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#00875a] tracking-tight">
                    ₹{product.price}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500">
                    / {product.unit}
                  </span>
                </div>

                {product.originalPrice > product.price && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-md">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity Selector: minus, quantity, plus */}
              <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-2xs select-none">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="w-9 h-9 rounded-xl bg-white text-slate-700 hover:bg-slate-50 active:scale-90 disabled:opacity-40 flex items-center justify-center font-bold text-base shadow-2xs transition-all cursor-pointer"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>

                <span className="min-w-[2.5rem] text-center font-black text-slate-900 text-sm sm:text-base">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.maxStock, q + 1))}
                  disabled={quantity >= product.maxStock}
                  aria-label="Increase quantity"
                  className="w-9 h-9 rounded-xl bg-[#00875a] text-white hover:bg-[#00734d] active:scale-90 disabled:opacity-40 flex items-center justify-center font-bold text-base shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Desktop Inline Add-to-Cart Action */}
            <div className="hidden lg:block pt-3">
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                    Total Amount
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{totalPrice}
                    </span>
                    {totalSavings > 0 && (
                      <span className="text-xs font-bold text-emerald-700">
                        (You save ₹{totalSavings})
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || !product.inStock}
                  className="px-8 py-3.5 rounded-2xl bg-[#00875a] hover:bg-[#00734d] active:scale-98 text-white font-extrabold text-sm shadow-lg shadow-emerald-700/25 flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{isAdding ? "Adding..." : "Add to Cart"}</span>
                </button>
              </div>
            </div>

            {/* =========================================================================
                4. DESCRIPTION SECTION
               ========================================================================= */}
            <div className="pt-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight mb-2">
                Description
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {product.description}
              </p>

              {/* Product Specifications Table / Highlights */}
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                {product.origin && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Origin</span>
                    <span className="font-bold text-slate-800">{product.origin}</span>
                  </div>
                )}
                {product.shelfLife && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Shelf Life</span>
                    <span className="font-bold text-slate-800">{product.shelfLife}</span>
                  </div>
                )}
              </div>

              {/* Thin Divider below description */}
              <div className="border-b border-slate-100 mt-6" />
            </div>

            {/* =========================================================================
                5. RECOMMENDED PRODUCTS SECTION ("Recommendation")
               ========================================================================= */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Recommendation
                </h3>
                <button
                  onClick={() => router.push("/")}
                  className="text-xs font-bold text-[#00875a] hover:text-[#00734d] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>See all</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Horizontal Scrolling Produce Cards */}
              <div className="flex gap-3.5 overflow-x-auto pb-4 scrollbar-none snap-x -mx-5 px-5 sm:mx-0 sm:px-0">
                {recommendations.map((rec) => {
                  const recDiscount = rec.originalPrice > rec.price
                    ? Math.round(((rec.originalPrice - rec.price) / rec.originalPrice) * 100)
                    : null;

                  return (
                    <div
                      key={rec.id}
                      onClick={() => router.push(`/products/${rec.id}`)}
                      className="w-[145px] sm:w-[165px] flex-shrink-0 snap-start bg-white rounded-2xl border border-slate-100 p-2.5 shadow-2xs hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between cursor-pointer group select-none"
                    >
                      <div>
                        {/* Image Frame */}
                        <div className="relative w-full aspect-square rounded-xl bg-[#f3f8f2] flex items-center justify-center overflow-hidden mb-2">
                          {recDiscount && (
                            <span className="absolute top-1.5 left-1.5 bg-[#00875a] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-2xs">
                              {recDiscount}% OFF
                            </span>
                          )}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveImageUrl(rec.image)}
                            alt={rec.name}
                            className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform"
                          />
                        </div>

                        {/* Title & Unit */}
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#00875a] transition-colors">
                          {rec.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {rec.unit}
                        </p>
                      </div>

                      {/* Price & Quick Add Button */}
                      <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100/80">
                        <span className="text-xs font-black text-slate-900">
                          ₹{rec.price}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleQuickAddRecommended(e, rec)}
                          aria-label={`Add ${rec.name} to cart`}
                          className="w-7 h-7 rounded-xl bg-[#00875a] hover:bg-[#00734d] active:scale-90 text-white flex items-center justify-center shadow-2xs transition-transform cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* =========================================================================
          6. STICKY BOTTOM PURCHASE BAR (Mobile & Tablet)
         ========================================================================= */}
      <aside aria-label="Purchase controls" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 sm:px-6 sm:py-3.5 shadow-2xl lg:hidden">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          {/* Price Total & Dynamic Calculation */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Price Total
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ₹{totalPrice}
              </span>
              {totalSavings > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  Save ₹{totalSavings}
                </span>
              )}
            </div>
          </div>

          {/* Prominent Rounded Green Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !product.inStock}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-[#00875a] hover:bg-[#00734d] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            <span>{isAdding ? "Adding..." : "Add to Cart"}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#00875a] animate-spin" />
        </div>
      }
    >
      <ProductDetailsContent />
    </Suspense>
  );
}
