import { AdminLayout } from "@/components/layout";
import { AuthGuard } from "@/components/auth";

export const metadata = {
  title: "Admin Portal - RRV Green Basket",
  description: "Management dashboard for RRV Green Basket operations",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AuthGuard>
  );
}
