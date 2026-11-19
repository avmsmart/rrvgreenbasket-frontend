"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function MobileAuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirectTarget = searchParams.get("redirect");
    const targetUrl = redirectTarget
      ? `/login?redirect=${encodeURIComponent(redirectTarget)}`
      : "/login";
    router.replace(targetUrl);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-3 border-green-700 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-green-800">
          Redirecting to Customer Sign In...
        </p>
      </div>
    </div>
  );
}

export default function MobileAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-green-50">
          <div className="h-8 w-8 rounded-full border-3 border-green-700 border-t-transparent animate-spin" />
        </div>
      }
    >
      <MobileAuthRedirect />
    </Suspense>
  );
}
