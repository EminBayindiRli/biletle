import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "biletle — Etkinlik Bilet Platformu",
  description: "Etkinliğini oluştur, linki paylaş, bilet sat. QR kod girişi dahil.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ background: '#07071a', color: 'white', fontFamily: 'Inter, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
