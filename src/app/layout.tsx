import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RRV Green Basket - Admin Portal",
  description: "Vegetable E-Commerce Admin Management Portal for RRV Green Basket",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
