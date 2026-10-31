import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context";

export const metadata: Metadata = {
  title: "RRV Green Basket - Admin Portal",
  description: "Vegetable E-Commerce Admin Management Portal for RRV Green Basket",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#00875a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
