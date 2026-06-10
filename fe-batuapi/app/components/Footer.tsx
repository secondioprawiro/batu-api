import Image from "next/image";

const FOOTER_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Battle", href: "#battle" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Elements", href: "#elements" },
  { label: "Rewards", href: "#rewards" },
  { label: "Roadmap", href: "#roadmap" },
];

const SOCIALS = [
  { label: "X (Twitter)", short: "𝕏" },
  { label: "Discord", short: "DC" },
  { label: "Telegram", short: "TG" },
  { label: "GitHub", short: "GH" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-night">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember-500/40 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <a href="#home" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Logo Batu Api"
              width={40}
              height={40}
