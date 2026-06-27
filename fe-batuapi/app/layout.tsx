import type { Metadata } from "next";
import { Geist, Luckiest_Guy } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

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
    "Choose your element — Batu, Api, Air, or Daun. Stake API Coin and win CELO rewards in the Batu Api on-chain battle arena.",
  // Verifikasi kepemilikan proyek TalentApp (tertanam di <head>).
  other: {
    "talentapp:project_verification":
      "cccf17401a14d7ce01fea09e6de5e84bd8a0fe48118f1e0b3c2f9d7a9d418f6912a4bef55e04c886640f5a38eb6e53b87eebd54db921954c3d3cf3ebdfda0bae",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
