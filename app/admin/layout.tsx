import { Suspense } from "react";
import { AdminLayoutWrapper } from "@/components/layout";

export const metadata = {
  title: "Admin Portal - RRV Green Basket",
  description: "Management dashboard for RRV Green Basket operations",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </Suspense>
  );
}
