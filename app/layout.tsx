import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider, CustomerAuthProvider } from "@/context";

export const metadata: Metadata = {
  title: "RRV Green Basket - Freshness Delivered Daily",
  description: "Online Vegetable Selling Platform and Admin Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans antialiased">
        <AuthProvider>
          <CustomerAuthProvider>{children}</CustomerAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
