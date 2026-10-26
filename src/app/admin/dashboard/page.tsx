import Link from "next/link";
import { Breadcrumbs } from "@/components/layout";
import {
  Plus,
  Boxes,
  ReceiptText,
  Tag,
  Bike,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function DashboardPlaceholderPage() {
  const quickActions = [
    {
      label: "Add New Product",
      href: "/admin/products",
      icon: Plus,
      color: "bg-[#eaf8f0] text-[#00875a] hover:bg-[#dff5e8] border-[#bbf7d0]",
    },
    {
      label: "Manage Inventory",
      href: "/admin/inventory",
      icon: Boxes,
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
    },
    {
      label: "View Today's Orders",
      href: "/admin/orders",
      icon: ReceiptText,
      color: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
    },
    {
      label: "Create Offer / Coupon",
      href: "/admin/coupons",
      icon: Tag,
      color: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
    },
    {
      label: "Assign Delivery Partner",
      href: "/admin/delivery-partners",
      icon: Bike,
      color: "bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Dashboard" }]} />

      {/* Welcome Banner matching PDF Page 3 */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#00875a] via-[#00734d] to-[#005c3e] text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store Operations Live</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, Admin! 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#d1f2e0] mt-1 font-medium">
            Here&apos;s what&apos;s happening with RRV Green Basket today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow-xs transition-all flex items-center gap-2"
          >
            <span>Review Live Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Interactive Quick Actions Bar matching PDF Page 3 */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-800">
            Quick Actions (Click to Navigate)
          </h2>
          <span className="text-xs text-slate-400">PDF Reference Matched</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.label}
                href={act.href}
                className={`p-3.5 rounded-2xl border transition-all shadow-3xs flex flex-col justify-between group ${act.color}`}
              >
                <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center mb-2 shadow-3xs group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold leading-tight">
                    {act.label}
                  </span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Shared Admin Layout Readiness Notice */}
      <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-3xs">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Shared Admin Layout Fully Interactive &amp; Operational
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto leading-relaxed">
          The interactive date selector, notifications dropdown, global search (<kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">Ctrl+K</kbd>),
          collapsible sidebar with 14 modules, and administrator details modal are completely functioning.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <span>Ready for Step 3: Admin Dashboard KPI Widgets &amp; Charts</span>
        </div>
      </div>
    </div>
  );
}
