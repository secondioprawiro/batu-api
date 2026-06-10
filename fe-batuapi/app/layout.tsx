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
