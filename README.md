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
- **Admin Login & 2FA**: `http://localhost:3000/login`
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard`
- **Products Catalog**: `http://localhost:3000/admin/products`
- **Inventory Management**: `http://localhost:3000/admin/inventory`
- **Orders Management**: `http://localhost:3000/admin/orders`
- **Delivery & Live Map**: `http://localhost:3000/admin/delivery`
- **Delivery Partners**: `http://localhost:3000/admin/delivery-partners`
- **Procurement & Purchase Orders**: `http://localhost:3000/admin/procurement`
- **Packing Station**: `http://localhost:3000/admin/packing`
- **Payments & Ledger**: `http://localhost:3000/admin/payments`
- **Customer Directory**: `http://localhost:3000/admin/customers`
- **Coupons & Discount Offers**: `http://localhost:3000/admin/coupons`
- **Category Sectors**: `http://localhost:3000/admin/sectors`
- **Reports & Analytics**: `http://localhost:3000/admin/reports`
- **Store Settings**: `http://localhost:3000/admin/settings`

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
   - **Order Overview**: 7-day grouped bar chart showing *Delivered* (#00875a), *Processing* (#4ade80), and *Cancelled* (#fb923c) orders with hover tooltips and time range selector (`Last 7 Days`, `Last 14 Days`, `This Month`).
   - **Order Status**: SVG Donut chart with `"128 Orders"` center badge, period filter (`Today`, `Yesterday`, `This Week`), and interactive legend highlighting (*Delivered: 84 / 66%*, *Processing: 28 / 22%*, *Cancelled: 10 / 8%*, *Pending: 6 / 4%*).
   - **Quick Actions Panel**: One-click actions to Add Product, Manage Inventory, View Orders, Create Offer, or Assign Partner.
4. **Middle Operations Cards**:
   - **Top Selling Products**: Ranked list of 5 high-volume produce items with produce photography, order counts, and `"View All"` link.
   - **Recent Orders Table**: Compact live orders feed with status pills, customer names, and amounts. Clicking any row opens an itemized **Order Details Drawer**.
   - **Low Stock Items**: Critical produce alerts with remaining stock badges and one-click quick restock action modal.
5. **Bottom Operations Row**:
   - **Today's Order Timeline**: 4-stage stepper (*Pending* → *Processing* → *Out for Delivery* → *Delivered*).
   - **Upcoming Order Cut-off**: 10:00 PM cut-off time, `"● Open for orders"` badge, and live countdown timer (`12h 30m remaining`).
   - **Procurement Reminder**: Alert callout for tomorrow's mandi procurement stock with direct link to purchase orders.

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
  - Table View vs Grid Cards View switcher with green selection indicator.
  - Clicking any table row or grid card opens the **Product Details Drawer** (pricing history, stock levels, SRM revised quotes).
  - Interactive **Add Product Modal** and **Edit Rates & Stock Modal** (adjust Quot Rate and SRM Revised Rate).
  - Export to **CSV** and **PDF**.

---

### 3. Warehouse Inventory Management (`/admin/inventory`)
- Track current stock across all 76+ products with live warehouse valuation.
- Quick `+5` and `-5` inline quantity adjustments with automatic status updating (`In Stock`, `Low Stock`, `Out of Stock`).
- Threshold alerts when stock drops below `minStock`.
- Clicking any row opens the **Inventory Details Drawer** with reorder recommendations and valuation.
- **Inward Stock Batch Modal**:
  - **Single Product Inward**: Searchable catalog selector to pick any of the 76+ vegetables (grouped with ERP codes and live stock projections), quantity received, and mandi supplier source.
  - **Multi-Produce Mandi Consignment**: Add multiple line items in a single truck/mandi arrival (e.g., Tomato 50kg, Onion 40kg, Potato 60kg) with common dispatch source, challan reference, and one-click bulk stock update.
- Export inventory snapshot to CSV and Master Catalog to official PDF.

---

### 4. Orders Management (`/admin/orders`)
- **Complete Order Lifecycle**: Manage orders across tabs: *All Orders*, *Pending*, *Processing*, *Out for Delivery*, *Delivered*, and *Cancelled*.
- **Interactive Row Selection**: Rows feature an emerald-green active indicator (`border-l-4 border-[#00875a]`).
- **Order Details Drawer**: Slide-out drawer with customer delivery address, items breakdown, payment status, and order timeline.
- **Create Manual Order Modal**: Telephone and wholesale order creation with dynamic customer address, produce items lookup, and delivery slot picker.
- **Official GST Tax Invoice**: One-click printable and downloadable A4 GST Tax Invoices via `jspdf-autotable`.
- **Bulk Export**: Export selected or filtered orders to CSV and PDF.

---

### 5. Delivery & Live Route Map (`/admin/delivery`)
- **Interactive Live Map**: Leaflet-based live map showing active driver locations, delivery destinations, and drop-off points.
- **Table Row Highlight**: Clicking any delivery row highlights the route on the map and opens the **Delivery Details Drawer** with customer phone, delivery time window, and driver details.
- **Assign Delivery Partner Modal**: One-click assignment of unassigned orders to nearby active riders with instant re-clustering.
- **Delivery Exceptions & Issues**: Dedicated modal to resolve failed or delayed delivery attempts with rescheduling workflows.

---

### 6. Delivery Partners Management (`/admin/delivery-partners`)
- **Partner Fleet Directory**: Track active riders, vehicles (Bike, Scooter, Van), assigned zones, and operational status (*Active*, *On Delivery*, *Idle*, *Inactive*).
- **Partner Details Drawer**: Slide-out drawer showing complete KYC documentation:
  - Driving License & RC registration numbers with verification status badges.
  - Aadhaar card and verified Bank account information.
  - Performance rating stars, on-time delivery percentage, and cash collected.
- **Add / Edit Partner Modal**: Multi-tab form for personal info, vehicle specs, emergency contacts, and document upload.
- **Status Toggle**: Instant Activate/Deactivate toggle for fleet availability.

---

### 7. Procurement & Mandi Purchase Orders (`/admin/procurement`)
- **Automated Morning Demand Aggregation**: System analyzes orders received before 10:00 PM cut-off and calculates exact procurement targets per vegetable.
- **Procurement Details Drawer**: Displays mandi source breakdown, quoted mandi rate vs target budget, and variance calculation.
- **Purchase Order (PO) Creation**: Generate official Mandi Purchase Orders grouped by vendor (e.g. *Kurnool Wholesale Mandi*, *Anantapur Farmers Market*).
- **Consignment Receipt**: Convert purchase orders directly into warehouse inventory inward batches.

---

### 8. Packing Station (`/admin/packing`)
- **Basket Packing Checklist**: Dedicated warehouse workstation interface for packers to assemble produce crates.
- **Packing Details Drawer**: Slide-over drawer with visual vegetable checklist, required weights/quantities, and quality inspection badges.
- **Packing Status Workflow**: Move orders from *To Pack* → *Packing in Progress* → *Packed & Sealed* with assigned crate numbers.

---

### 9. Payments & Financial Ledger (`/admin/payments`)
- **Omnichannel Transaction Ledger**: Real-time payment feed across UPI, Cash on Delivery (COD), Net Banking, and Debit/Credit Cards.
- **Green Indicator & Row Click**: Clicking any payment row opens the **Transaction Details Drawer** with payment gateway transaction ID, reference hash, timestamp, and customer details.
- **Quick Copy**: One-click clipboard copy for gateway transaction IDs.
- **Refund Processing**: Direct refund modal supporting full or partial refunds with audited cancellation reasons.
- **Daily Collections Summary**: Analytics on payment method share (UPI vs COD), revenue trend charts, and ledger export.

---

### 10. Customer Directory (`/admin/customers`)
- **Customer Profiles**: Searchable customer phone directory with total orders placed, lifetime value (LTV), and favorite categories.
- **Customer Details Drawer**: Slide-out drawer showing customer address book, order history feed, and repeat purchase patterns.
- **Customer Status & Tiering**: High-value customer badges and blocked/active status management.

---

### 11. Coupons & Discount Offers (`/admin/coupons`)
- **Digital Voucher Creator**: Create percentage discount (`% OFF`) or flat amount discount (`₹ OFF`) vouchers with minimum order criteria.
- **Coupon Details Drawer**: Live visual digital coupon voucher card with copyable code, redemptions usage progress bar, total money saved, and validity window.
- **One-Click Status Toggle**: Enable or pause promotions instantly.

---

### 12. Category Sectors Management (`/admin/sectors`)
- **Sector Hierarchy**: Organize store catalog into structured sectors (English Vegetables, Indian Vegetables, Organic Produce, Dairy, etc.).
- **Sector Details Drawer**: View total products linked, customer orders generated, total revenue, and display priority rank.
- **Featured Sector Toggle**: Promote priority sectors directly to the customer-facing storefront homepage.

---

### 13. Reports & Analytics (`/admin/reports`)
- **Sales & Revenue Visualizations**: 7-day, 14-day, and monthly revenue performance with comparative period growth percentages.
- **Category Revenue Share**: Interactive SVG donut chart illustrating vegetable category sales contribution.
- **Volume Leaders**: Top-selling produce leaderboard ranking items by quantity sold (Kg/Dozen) and revenue generated.
- **Export Capabilities**: Direct CSV analytics data export and print-friendly PDF reporting.

---

### 14. Store Settings & Regional Configuration (`/admin/settings`)
- **Dynamic Store Logo**: Uploading a new store logo immediately updates the application sidebar, header, and invoice headers across all pages via reactive store synchronization.
- **Editable Business Hours**: Complete Monday through Sunday operational hours management with inline **Edit** and **Delete** actions.
- **Currency & Regional Settings**:
  - Configurable store currency (`INR (₹)`, `USD ($)`, `EUR (€)`, `AED`), date format, and timezone.
  - Centralized currency formatter (`formatCurrency`) that instantly updates prices across Products, Inventory, Orders, and Payments.
- **Delivery & Cut-Off Controls**: Configurable 10:00 PM order cut-off time, free delivery threshold, and low-stock alert limits.

---

### 15. Authentication & Two-Factor (2FA) Security (`/login`)
- **Admin JWT Session**: Secure authentication with session storage and token revocation upon Sign Out.
- **Google Authenticator (TOTP RFC 6238)**: Built-in 2FA support with interactive QR code pairing and live 6-digit authenticator verification.
- **Email OTP Fallback**: Integration with Nodemailer for email-delivered one-time passwords.
- **Route Guard Protection**: Automatic redirection for unauthenticated visitors trying to access `/admin/*` routes.

---

### 16. Official Tax Invoice PDF & Document Generation
- **Tax Invoice (`generateInvoicePdf`)**: Generates official, GST-compliant A4 Tax Invoices using `jspdf` and `jspdf-autotable`:
  - Emerald RRV Green Basket header banner, company address, and GSTIN (`37AAECR1234F1Z5`).
  - Customer billing block (name, phone, address) and invoice metadata.
  - Itemized table with HSN codes (`7101000`), units, rate, quantity, and total.
  - Financial breakdown: Subtotal, Delivery, Discounts, and Grand Total banner.
  - Authorized signatory box and disclaimer.
  - Available across all order drawers (`/admin/orders` and `/admin/dashboard`) with direct **Print** and **Download PDF** actions.
- **Master Product Catalog PDF (`exportToPdf`)**: Exports full 76+ vegetable catalog to a landscape A4 vector document with emerald headers, alternating rows, page counts, and summary metrics.

---

### 17. Consistent Row-Click & Details Drawers (Across All Modules)
Every data table across the admin portal provides a unified, modern experience:
- **Emerald Left Border Indicator**: Rows display `border-l-4 border-[#00875a]` and `bg-[#eefcf2]` on hover and active selection.
- **Click-to-Inspect**: Clicking any table row opens a tailored slide-out Details Drawer (Orders, Products, Inventory, Delivery, Delivery Partners, Customers, Procurement, Packing, Payments, Coupons, Sectors).
- **Event Propagation Protection**: All interactive buttons (Checkboxes, Toggles, Edit/Delete, Actions) contain `e.stopPropagation()` so action clicks never trigger unwanted drawer opening.

---

### 18. Error Clearing & Bug Fixes Trace

| Issue | Root Cause | Resolution Applied |
| :--- | :--- | :--- |
| **Next.js 16 Prerender Build Failure** | Experimental `cacheComponents: true` in `next.config.ts` threw `Next.js encountered unstable value new Date()` in Client Components during static prerendering. | Cleaned `next.config.ts` by removing experimental cache component flags. Build passes 100% (23/23 routes static). |
| **ESLint Immutability Violation** | `ProcurementAnalyticsWidgets.tsx` mutated `accumulatedPercent` across JSX `.map()` calls during render. | Refactored SVG stroke-dashoffset calculation to use pure immutable `.reduce()` slice calculations. |
| **Missing Nodemailer / QR Code in Auth** | Upstream 2FA features required `nodemailer` and `qrcode` libraries. | Installed `nodemailer`, `qrcode`, and their respective TypeScript type definitions. |
| **Sign Out Inactivity** | Sign out button in profile dropdown did not clear stored JWT auth tokens. | Updated `ProfileDropdown.tsx` to clear auth tokens and route cleanly to `/login`. |
| **Store Logo Not Updating** | Uploaded store logo did not propagate to header or sidebar without hard reload. | Connected `RRVLogo.tsx` to reactive `shared-store.ts` event bus for instant global reflection. |

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
| **Partners** | `GET` | `/api/admin/delivery-partners` | Fleet directory, KYC documents, and status |
| **Procurement**| `GET`| `/api/admin/procurement` | Daily procurement requirements from morning orders |
| **Payments** | `GET` | `/api/admin/payments` | Transactions ledger and revenue analytics |
| **Coupons** | `GET` | `/api/admin/coupons` | Voucher campaigns and redemptions |
| **Sectors** | `GET` | `/api/admin/sectors` | Category sectors and priority ordering |
| **Settings** | `GET` | `/api/admin/settings` | Store configuration, business hours, and regional setup |

### 3. Recommended PostgreSQL Table Schema

```sql
-- Master Products Table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    erp_code VARCHAR(50) UNIQUE NOT NULL,
    excel_name VARCHAR(150),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    hsn_code VARCHAR(20) DEFAULT '7101000',
    unit VARCHAR(20) NOT NULL,
    original_price NUMERIC(10, 2),
    price NUMERIC(10, 2) NOT NULL,
    stock NUMERIC(10, 2) DEFAULT 0,
    min_stock NUMERIC(10, 2) DEFAULT 10,
    status VARCHAR(30) DEFAULT 'In Stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    delivery_address TEXT NOT NULL,
    items_count INT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- 'UPI', 'COD', etc.
    payment_status VARCHAR(30) NOT NULL, -- 'Paid', 'Pending'
    order_status VARCHAR(40) NOT NULL, -- 'Pending', 'Processing', 'Delivered'
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Fleet Table
CREATE TABLE delivery_partners (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    vehicle_number VARCHAR(50),
    driving_license_number VARCHAR(50),
    aadhaar_number VARCHAR(50),
    status VARCHAR(30) DEFAULT 'Active',
    rating NUMERIC(3, 2) DEFAULT 4.8
);

-- Warehouse Inward Inventory Log
CREATE TABLE inventory_inward_logs (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id),
    added_quantity NUMERIC(10, 2) NOT NULL,
    supplier VARCHAR(100),
    notes TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

When you start your backend on `http://localhost:8080`, simply set `NEXT_PUBLIC_ENABLE_MOCK_FALLBACK=false` in `.env.local` to switch to 100% live database persistence!
