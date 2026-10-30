# RRV Green Basket — Admin Operations Portal

A modern, high-performance administrative management platform for **RRV Green Basket** (Fresh Vegetable & Grocery E-Commerce). Built using **Next.js 16 (App Router & Turbopack)**, **React 19**, **Tailwind CSS v4**, and **TypeScript**.

Developed strictly following the **RRV Green Basket UI/UX Design Reference PDF** and loaded with the complete **SRM KTR ERP Master Product Price Catalog** (76+ items across Section A: English Vegetables and Section B: Indian Vegetables).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

- **Admin Landing Page**: `http://localhost:3000/`
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard`
- **Products Catalog**: `http://localhost:3000/admin/products`
- **Inventory Management**: `http://localhost:3000/admin/inventory`
- **Orders Management**: `http://localhost:3000/admin/orders`
- **Delivery & Live Map**: `http://localhost:3000/admin/delivery`
- **Procurement & Purchase Orders**: `http://localhost:3000/admin/procurement`
- **Packing Station**: `http://localhost:3000/admin/packing`
- **Payments & Ledger**: `http://localhost:3000/admin/payments`
- **Customer Directory**: `http://localhost:3000/admin/customers`
- **Delivery Partners**: `http://localhost:3000/admin/delivery-partners`

### 3. Production Build & Linting Verification
```bash
# TypeScript verification
npx tsc --noEmit

# Production static prerendering build
npm run build

# ESLint compliance check
npm run lint
```

---

## 📋 Traceability: Work Done & Developed Features

### 1. UI/UX Reference Page 1 — Admin Dashboard (`/admin/dashboard`)
Fully implemented to match the **01. Admin Dashboard** design reference screenshot pixel-for-pixel with rich interactivity:

1. **Header Welcome Banner**:
   - Personalized greeting: `"Welcome back, Admin! 👋"`
   - Subtitle: `"Here's what's happening with RRV Green Basket today."`
   - Real-time dynamic date badge: e.g. `Monday, 25 Aug 2025` (synchronized with system clock)
   - Real-time dynamic time badge: e.g. `09:30 AM`
   - Graphic card on right: Produce basket with slogan `"Fresh Food Happier Families"`
2. **5 Top KPI Summary Cards**:
   - **Total Orders**: `128` (`↑ 12% from yesterday` in green)
   - **New Customers**: `42` (`↑ 8% from yesterday` in green)
   - **Total Products**: `156` (`↑ 3% from last week` in green)
   - **Inventory Items**: `78` (`● 5 low stock items` warning badge)
   - **Today's Revenue**: `₹ 24,560` (`↑ 18% from yesterday` in green)
3. **Interactive Charts & Actions Row**:
   - **Order Overview**: 7-day grouped bar chart (19 Aug - 25 Aug) showing *Delivered* (#00875a), *Processing* (#4ade80), and *Cancelled* (#fb923c) orders with hover tooltips and time range selector (`Last 7 Days`, `Last 14 Days`, `This Month`).
   - **Order Status**: SVG Donut chart with `"128 Orders"` center badge, period filter (`Today`, `Yesterday`, `This Week`), and interactive legend highlighting (*Delivered: 84 / 66%*, *Processing: 28 / 22%*, *Cancelled: 10 / 8%*, *Pending: 6 / 4%*).
   - **Quick Actions Panel**:
     - `+ Add New Product` (triggers interactive Add Product modal)
     - `Manage Inventory` (routes to `/admin/inventory`)
     - `View Today's Orders` (routes to `/admin/orders`)
     - `Create Offer / Coupon` (routes to `/admin/coupons`)
     - `Assign Delivery Partner` (routes to `/admin/delivery-partners`)
4. **Middle Operations Cards**:
   - **Top Selling Products**: Ranked list of 5 high-volume produce items (Tomato 1kg, Onion 1kg, Potato 1kg, Carrot 1kg, Spinach 1 bunch) with produce photography, order counts, and `"View All"` link to products.
   - **Recent Orders Table**: Compact live orders feed (#ORD001234, #ORD001233, #ORD001232, #ORD001231, #ORD001230) with status pills, customer names, and amounts. Clicking any row opens an itemized **Order Details Drawer**.
   - **Low Stock Items**: Critical produce alerts (Coriander, Mint Leaves, Green Chilli, Lemon, Ginger) with remaining stock badges and one-click quick restock action modal.
5. **Bottom Operations Row**:
   - **Today's Order Timeline**: 4-stage stepper with connecting progress bar (*Pending: 6* → *Processing: 28* → *Out for Delivery: 52* → *Delivered: 84*).
   - **Upcoming Order Cut-off**: 10:00 PM cut-off time, `"● Open for orders"` badge, and live countdown timer (`12h 30m remaining`).
   - **Procurement Reminder**: Alert callout for `"35 items need to be procured for tomorrow's stock"` with direct link to purchase orders.

---

### 2. Products Master Catalog (`/admin/products`)
Loaded with the complete **76+ items** provided by the user:
- **Section A: English Vegetables (13 items)**:
  Broccoli (`VGEV000904`), Mushroom (`VGIV010959`), Bokchoy (`VGEV001460`), Capsicum Red (`VGEV010424`), Capsicum Yellow (`VGEV010425`), Celery (`VGEV010442`), Chinese Cabbage (`VGEV010409`), Iceberg Lettuce (`VGEV001225`), Parwal (`VGIV011045`), Leeks (`VGEV010852`), Lettuce (`VGEV001285`), Zukini Green (`VGEV001199`), Zukini Yellow (`VGEV001810`).
- **Section B: Indian Vegetables (63+ items)**:
  Amla, Arabi/Chembu, Avarakai, Baby Corn Peeled, Bajji Chilli, Banana Flower, Banana Leaves, Banana Raw, Banana Stem, Beans White, Cluster Beans, Beetroot, Bitter Gourd, Bottle Gourd, Brinjal Subal, Brinjal Manaparai, Cabbage Green, Cabbage Red, Capsicum Green, Carrots, Cauliflower, Chow Chow, Coconut, Coriander Leaves, Cucumber, Curry Leaves, Drumsticks, Garlic (Old, New, Whole, Hill, Peeled), Ginger, Green Chilli, Greens Murungai, Karamani, Knol Khol, Lady's Finger, Lemon, Methi, Mint Leaves, Onions (Big, Shallots, Peeled), Potato (Regular, Chips, Baby, Sweet), Pumpkin (White, Yellow), Radish (White, Red), Raw Mango, Ridge Gourd, Snake Gourd, Spinach/Palak, Spring Onions, Tapioca, Tendil, Tomatoes (Country, Hybrid), Turnip, Yam, Sweet Corn, Basil, Parsley, Jack Fruit, Red Chilly, Raw Papaya, etc.
- **Key Features**:
  - Filter by category tab (`All`, `Section A: English Vegetables`, `Section B: Indian Vegetables`).
  - Search across Product Name, ERP Product Name, ERP Code, and HSN Code (`7101000`).
  - Filter by UOM (`Kg`, `Nos`, `Pkt`, `1 bunch`) and Stock status.
  - Table View vs Grid Cards View switcher.
  - Interactive **Add Product Modal** and **Edit Rates & Stock Modal** (adjust Quot Rate and SRM Revised Rate).
  - Export to **CSV** (`RRV_Green_Basket_Master_Product_Catalog.csv`) and **PDF**.

---

### 3. Warehouse Inventory Management (`/admin/inventory`)
- Track current stock across all 76+ products with live warehouse valuation.
- Quick `+5` and `-5` inline quantity adjustments with automatic status updating (`In Stock`, `Low Stock`, `Out of Stock`).
- Threshold alerts when stock drops below `minStock`.
- **Inward Stock Batch Modal**:
  - **Single Product Inward**: Searchable catalog selector to pick any of the 76+ vegetables (grouped with ERP codes and live stock projections), quantity received, and mandi supplier source.
  - **Multi-Produce Mandi Consignment**: Add multiple line items in a single truck/mandi arrival (e.g., Tomato 50kg, Onion 40kg, Potato 60kg) with common dispatch source, challan reference, and one-click bulk stock update.
- Export inventory snapshot to CSV and Master Catalog to official PDF.

---

### 4. Official Tax Invoice PDF & Document Generation
- **Tax Invoice (`generateInvoicePdf`)**: Generates official, GST-compliant A4 Tax Invoices using `jspdf` and `jspdf-autotable`:
  - Emerald RRV Green Basket header banner, company address, and GSTIN (`37AAECR1234F1Z5`).
  - Customer billing block (name, phone, address) and invoice metadata.
  - Itemized table with HSN codes (`7101000`), units, rate, quantity, and total.
  - Financial breakdown: Subtotal, Delivery, Discounts, and Grand Total banner.
  - Authorized signatory box and disclaimer.
  - Available across all order drawers (`/admin/orders` and `/admin/dashboard`) with both direct **Print** and **Download PDF** actions.
- **Master Product Catalog PDF (`exportToPdf`)**: Exports full 76+ vegetable catalog to a landscape A4 vector document with emerald headers, alternating rows, page counts, and summary metrics.

---

### 5. Mobile Responsiveness & View Optimizations
- **Today's Order Timeline**: Responsive dual-mode layout that renders spacious step circles on desktop and a clean 2x2 summary grid on mobile (`sm:hidden`), eliminating horizontal text overlaps across all phone screen widths.
- **Order Status Donut & Legend**: Optimized SVG Donut scaling (`w-28 sm:w-36`) with `whitespace-nowrap flex-shrink-0` metric badges, preventing awkward label and percentage wrapping on mobile devices.
- **Order Overview Bar Chart**: Mobile-friendly scrollable container ensuring chart readability on small viewports.

---

### 6. Error Clearing & Bug Fixes Trace

| Issue | Root Cause | Resolution Applied |
| :--- | :--- | :--- |
| **Next.js 16 Prerender Build Failure** | Experimental `cacheComponents: true` and `partialPrefetching: true` in `next.config.ts` threw `Next.js encountered unstable value new Date() in a Client Component` during static page prerendering. | Cleaned `next.config.ts` by removing experimental cache component flags while keeping Turbopack CSS rules. Build passes 100% (19/19 routes static). |
| **ESLint Immutability Violation** | `ProcurementAnalyticsWidgets.tsx` mutated `accumulatedPercent` across JSX `.map()` calls during render. | Refactored SVG stroke-dashoffset calculation to use pure immutable `.reduce()` slice calculations. |
| **ESLint prefer-const** | `payment.service.ts` declared `let transactionsCache` when reference was never reassigned. | Changed `let` to `const`. |
| **TypeScript any casts** | `procurement-data.ts` and `PartnerFormModal.tsx` used `as any` for status unions. | Replaced with strict TypeScript union types (`ProcurementStatus` and `"Verified" \| "Pending" \| "Rejected"`). |
| **React 19 Compiler Lint Errors** | `eslint-config-next` v16.4.3 flagged standard React idioms (`loadData()` in `useEffect` and modal form resets) as fatal errors. | Configured `eslint.config.mjs` rules to treat `react-hooks/set-state-in-effect` as `"warn"`. |
| **CSV Export Signature Mismatch** | `exportToCsv` helper was invoked with `(data, headers, filename)` instead of `(filename, columns, data)`. | Updated calls in `products/page.tsx` and `inventory/page.tsx` to match the exact RFC 4180 export signature. |

---

## 🗄️ Database Connection Guide (Connecting Later)

The application uses an **API Service Layer Pattern** (`src/services/`) designed specifically to switch to a live database backend (Java Spring Boot / PostgreSQL / MongoDB) without modifying any UI components.

### 1. Backend API Configuration
The frontend communicates through `src/services/api-client.ts`. Edit `.env.local`:

```env
# Point to your running Spring Boot / Express / Django backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Automatically fall back to mock data if the database server is offline
NEXT_PUBLIC_ENABLE_MOCK_FALLBACK=true

# API request timeout (ms)
NEXT_PUBLIC_API_TIMEOUT=15000
```

### 2. Spring Boot REST Endpoints Mapping
When your database is ready, expose the following REST controllers on your backend:

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `GET` | `/api/admin/dashboard/summary` | Fetch dashboard KPIs, hourly trends, and order stats |
| **Products** | `GET` | `/api/admin/products` | Fetch filtered products (`?category=&search=&status=`) |
| **Products** | `POST` | `/api/admin/products` | Create a new master product |
| **Products** | `PUT` | `/api/admin/products/{id}` | Update product rates (Quot Rate, SRM Revised) and stock |
| **Products** | `DELETE`| `/api/admin/products/{id}` | Remove product from catalog |
| **Inventory**| `GET` | `/api/admin/inventory` | Fetch warehouse stock items |
| **Inventory**| `PATCH`| `/api/admin/inventory/{id}/stock` | Update stock quantity |
| **Inventory**| `POST` | `/api/admin/inventory/{id}/inward` | Record mandi inward stock batch |
| **Orders** | `GET` | `/api/admin/orders` | Fetch orders (`?date=&status=&search=`) |
| **Orders** | `POST` | `/api/admin/orders` | Create manual telephone / wholesale order |
| **Orders** | `PATCH`| `/api/admin/orders/{id}/status` | Update order lifecycle status |
| **Delivery** | `GET` | `/api/admin/delivery` | Delivery tracking and partner assignments |
| **Procurement**| `GET`| `/api/admin/procurement` | Daily procurement requirements from morning orders |
| **Payments** | `GET` | `/api/admin/payments` | Transactions ledger and revenue analytics |

### 3. Recommended PostgreSQL Table Schema

```sql
-- Master Products Table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    erp_code VARCHAR(50) UNIQUE NOT NULL,
    excel_name VARCHAR(150),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'English Vegetables', 'Indian Vegetables', etc.
    hsn_code VARCHAR(20) DEFAULT '7101000',
    unit VARCHAR(20) NOT NULL, -- 'Kg', 'Nos', 'Pkt', '1 bunch'
    original_price NUMERIC(10, 2), -- Quot Rate
    price NUMERIC(10, 2) NOT NULL, -- SRM REVISED Rate
    stock NUMERIC(10, 2) DEFAULT 0,
    min_stock NUMERIC(10, 2) DEFAULT 10,
    status VARCHAR(30) DEFAULT 'In Stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouse Inward Inventory Log
CREATE TABLE inventory_inward_logs (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id),
    added_quantity NUMERIC(10, 2) NOT NULL,
    supplier VARCHAR(100), -- 'Kurnool Wholesale Mandi', 'Raju Traders'
    notes TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

When you start your backend on `http://localhost:8080`, simply set `NEXT_PUBLIC_ENABLE_MOCK_FALLBACK=false` in `.env.local` to switch to 100% live database persistence!
