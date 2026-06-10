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
              className="h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(255,138,30,0.35)]"
            />
            <span className="font-display text-xl tracking-wider text-cream">
              BATU <span className="text-ember-400">API</span>
            </span>
          </a>
          <p className="mt-4 max-w-xs text-sm text-abyss-300">
            Web3 Element Battle Game. Pilih elemenmu dan taklukkan arena
            on-chain.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#fcff52]/30 bg-[#fcff52]/10 px-3.5 py-1.5 text-xs text-[#fcff52]">
            <span className="h-2 w-2 rounded-full bg-[#fcff52]" />
            Built on Celo
          </span>
        </div>

        <div>
          <h4 className="font-display text-sm tracking-[0.25em] text-abyss-200">
            MENU
          </h4>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-abyss-300 sm:grid-cols-1">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="transition-colors hover:text-ember-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm tracking-[0.25em] text-abyss-200">
            KOMUNITAS
          </h4>
          <div className="mt-4 flex gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="glass flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xs font-bold text-abyss-200 transition-colors hover:border-ember-400/50 hover:text-ember-300"
              >
                {s.short}
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs text-abyss-300">
            Kanal komunitas segera hadir.
          </p>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-abyss-300 sm:flex-row sm:px-6">
          <p>© 2026 Batu Api. All rights reserved.</p>
          <p>🪨🔥💧🌿 · 1 CELO = 1000 API Coin</p>
        </div>
      </div>
    </footer>
  );
}
