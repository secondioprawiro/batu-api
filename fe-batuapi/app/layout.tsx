import type { Metadata } from "next";
import { Geist, Luckiest_Guy } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const displayFont = Luckiest_Guy({
  weight: "400",
  variable: "--font-display-g",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Batu Api",
  description:
    "Pilih elemenmu — Batu, Api, Air, atau Daun. Pasang API Coin dan menangkan reward CELO di arena battle on-chain Batu Api.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
