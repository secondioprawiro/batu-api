"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "Battle", href: "#battle" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Elements", href: "#elements" },
  { label: "Rewards", href: "#rewards" },
  { label: "Roadmap", href: "#roadmap" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [connected, setConnected] = useState(false);

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#home" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Logo Batu Api"
            width={40}
            height={40}
            priority
            className="h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(255,138,30,0.35)]"
          />
          <span className="font-display text-xl tracking-wider text-cream">
            BATU <span className="text-ember-400">API</span>
