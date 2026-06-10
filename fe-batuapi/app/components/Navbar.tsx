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
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Utama">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-abyss-200 transition-colors hover:text-ember-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setConnected((c) => !c)}
            className="hidden items-center gap-2 rounded-full border border-ember-500/40 px-4 py-2 text-sm text-cream transition-colors hover:bg-ember-500/10 sm:inline-flex"
          >
            {connected ? (
              <>
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                0x71C…9A4F
              </>
            ) : (
              "Connect Wallet"
            )}
          </button>
          <Link
            href="/play"
            className="btn-ember font-display hidden rounded-full px-5 py-2 text-sm tracking-wider transition-transform hover:-translate-y-0.5 sm:inline-block"
          >
            PLAY NOW
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-cream lg:hidden"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="glass border-b border-white/5 px-4 pb-5 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Utama (mobile)">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm text-abyss-200 transition-colors hover:bg-white/5 hover:text-ember-300"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => setConnected((c) => !c)}
              className="flex-1 rounded-full border border-ember-500/40 px-4 py-2.5 text-sm text-cream"
            >
              {connected ? "0x71C…9A4F" : "Connect Wallet"}
            </button>
            <Link
              href="/play"
              onClick={() => setMenuOpen(false)}
              className="btn-ember font-display flex-1 rounded-full px-4 py-2.5 text-center text-sm tracking-wider"
            >
              PLAY NOW
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
