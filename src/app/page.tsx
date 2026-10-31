import Link from "next/link";
import { ArrowRight, LayoutDashboard, ShoppingBag, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 sm:p-10 text-center">
        {/* Logo Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-200 mb-6">
          <svg
            viewBox="0 0 24 24"
            className="w-9 h-9 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 10h16l-1.5 9.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 10z" fillOpacity="0.9" />
            <path
              d="M8 10V7a4 4 0 0 1 8 0v3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M12 4c2-2 5-1 5 1s-3 3-5 3c-1 0-2-1-2-2s1-2 2-2z"
              fill="#86efac"
            />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          RRV Green Basket
        </h1>
        <p className="text-sm font-semibold text-emerald-700 mt-1 uppercase tracking-wide">
          Freshness Delivered Daily • Admin Portal
        </p>

        <p className="text-xs text-slate-500 mt-3 max-w-sm mx-auto leading-relaxed">
          Vegetable E-Commerce administrative management system built strictly following the
          UI/UX design reference PDF.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all hover:gap-3"
          >
            <span>Admin Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-slate-500" />
            <span>Go to Dashboard</span>
          </Link>
        </div>

        {/* Feature summary pills */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 text-left">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <ShoppingBag className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="font-semibold text-slate-700 block">14 Modules</span>
              <span className="text-slate-400">Complete Admin Suite</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="font-semibold text-slate-700 block">UI/UX Reference</span>
              <span className="text-slate-400">Verified &amp; Matched</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
