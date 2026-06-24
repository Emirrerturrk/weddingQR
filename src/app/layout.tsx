import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "L'Amour QR – Düğün Fotoğraf ve Video Paylaşım Platformu",
  description: "Düğün ve özel etkinliklerinizde misafirlerinizin çektikleri tüm fotoğraf ve videoları QR kod ile tek albümde toplayın.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FAF9F5] text-slate-800 selection:bg-amber-100">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
