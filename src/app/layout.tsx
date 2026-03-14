import type { Metadata } from "next";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "TihinTV v3",
  description: "Kho phim online của riêng bạn",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-neutral-950 text-white antialiased">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}