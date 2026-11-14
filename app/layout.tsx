import type { Metadata } from "next";
import "./globals.css";
import {
  AuthProvider,
  CustomerAuthProvider,
  WishlistProvider,
  StoreSettingsProvider,
  CartProvider,
} from "@/context";

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
        <StoreSettingsProvider>
          <AuthProvider>
            <CustomerAuthProvider>
              <WishlistProvider>
                <CartProvider>{children}</CartProvider>
              </WishlistProvider>
            </CustomerAuthProvider>
          </AuthProvider>
        </StoreSettingsProvider>
      </body>
    </html>
  );
}
