import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Каталог продукции",
  description: "Веб-каталог пищевой продукции",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased bg-gray-50 min-h-screen">
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            {children}
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
