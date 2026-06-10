import Link from "next/link";
import { ELEMENTS } from "@/app/lib/elements";
import ElementMascot from "./ElementMascot";

/* Konfigurasi partikel ember — deterministik agar SSR & client identik */
const PARTICLES = [
  { left: "6%", size: 5, delay: 0, dur: 11, color: "#ffaa3c" },
  { left: "14%", size: 3, delay: 2.5, dur: 13, color: "#ff8a1e" },
  { left: "22%", size: 4, delay: 5, dur: 10, color: "#7fb3a6" },
  { left: "31%", size: 3, delay: 1.2, dur: 14, color: "#ffc56e" },
  { left: "39%", size: 5, delay: 6.4, dur: 12, color: "#ff8a1e" },
  { left: "47%", size: 3, delay: 3.6, dur: 15, color: "#ffaa3c" },
  { left: "55%", size: 4, delay: 8, dur: 11, color: "#7fb3a6" },
  { left: "63%", size: 3, delay: 0.8, dur: 13, color: "#ffc56e" },
  { left: "71%", size: 5, delay: 4.4, dur: 12, color: "#ff8a1e" },
  { left: "79%", size: 3, delay: 7.2, dur: 14, color: "#ffaa3c" },
  { left: "87%", size: 4, delay: 2, dur: 10, color: "#ffc56e" },
  { left: "94%", size: 3, delay: 5.8, dur: 13, color: "#7fb3a6" },
];

const MASCOT_STAGE = [
  { key: "batu", width: "w-20 sm:w-32 md:w-40", delay: "0s", tilt: "-rotate-3" },
  { key: "api", width: "w-24 sm:w-40 md:w-48", delay: "0.6s", tilt: "rotate-0" },
  { key: "air", width: "w-20 sm:w-32 md:w-40", delay: "1.2s", tilt: "rotate-2" },
  { key: "daun", width: "w-16 sm:w-28 md:w-36", delay: "1.8s", tilt: "rotate-6" },
] as const;

export default function Hero() {
  return (
    <section
      id="home"
      className="hero-bg relative overflow-hidden pb-36 pt-24 sm:pt-28"
    >
      {/* === Dekorasi atmosfer === */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Bulan purnama */}
        <div className="moon absolute left-[5%] top-[7%] h-24 w-24 rounded-full opacity-90 sm:h-40 sm:w-40" />

        {/* Kabut */}
        <div className="animate-drift absolute -left-32 bottom-0 h-80 w-[42rem] rounded-full bg-abyss-600/15 blur-3xl" />
        <div
          className="animate-drift absolute -right-40 bottom-16 h-72 w-[38rem] rounded-full bg-abyss-400/10 blur-3xl"
          style={{ animationDelay: "-11s" }}
        />
        <div className="absolute right-[10%] top-[12%] h-64 w-64 rounded-full bg-blood-800/40 blur-3xl" />

        {/* Daun & sulur dekoratif */}
        <span className="animate-float-slow absolute right-[4%] top-24 rotate-45 text-5xl opacity-30 blur-[1px] sm:text-6xl">
          🍃
        </span>
        <span
          className="animate-float-slow absolute left-[3%] top-[44%] -rotate-12 text-4xl opacity-25 blur-[1px] sm:text-5xl"
          style={{ animationDelay: "1.4s" }}
        >
          🌿
        </span>
        <span
          className="animate-float-slow absolute bottom-40 right-[8%] rotate-12 text-4xl opacity-25 blur-[1px]"
          style={{ animationDelay: "2.8s" }}
        >
          🍂
        </span>

        {/* Partikel ember naik */}
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="animate-rise absolute bottom-[-10px] rounded-full"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 2.5}px ${p.color}`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}
      </div>

      {/* === Konten utama === */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 text-center">
        <span className="rounded-full border border-ember-400/40 bg-ember-500/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.35em] text-ember-300 sm:text-xs">
          WEB3 ELEMENT BATTLE GAME
        </span>

        <h1 className="font-display title-hero mt-7 text-6xl leading-none tracking-wide sm:text-8xl lg:text-9xl">
          BATU API
        </h1>
        <p className="font-display mt-3 text-xl tracking-[0.2em] text-abyss-200 sm:text-2xl md:text-3xl">
          ~ BATTLE OF ELEMENTS ~
        </p>

        <p className="mt-6 max-w-2xl text-base text-abyss-200/90 md:text-lg">
          Pilih elemenmu, pasang API Coin, dan menangkan reward CELO di arena
          Batu Api.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/play"
            className="btn-ember font-display rounded-full px-8 py-4 text-lg tracking-wider transition-transform hover:-translate-y-1"
          >
            ⚔️ START BATTLE
          </Link>
          <a
            href="#battle"
            className="glass font-display rounded-full border border-abyss-300/40 px-8 py-4 text-lg tracking-wider text-abyss-200 transition-colors hover:border-ember-400/60 hover:text-ember-300"
          >
            READ RULES
          </a>
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3 text-xs text-abyss-200">
          {["🪙 1 CELO = 1000 API", "⚡ Min deposit 0.001 CELO", "🌕 Built on Celo"].map(
            (chip) => (
              <span
                key={chip}
                className="glass rounded-full border border-white/10 px-4 py-2"
              >
                {chip}
              </span>
            ),
          )}
        </div>

        {/* === Panggung maskot elemen === */}
        <div className="relative mt-16 w-full">
          <div
            className="absolute inset-x-0 bottom-0 mx-auto h-24 max-w-3xl rounded-[100%] bg-ember-500/10 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative flex items-end justify-center gap-3 sm:gap-8">
            {MASCOT_STAGE.map((stage) => {
              const el = ELEMENTS.find((e) => e.key === stage.key)!;
              return (
                <div
                  key={el.key}
                  className={`flex flex-col items-center ${stage.width}`}
                >
                  <div
                    className="animate-float relative w-full"
                    style={
                      {
                        animationDelay: stage.delay,
                        "--el": el.color,
                      } as React.CSSProperties
                    }
                  >
                    <div
                      className="el-glow-bg animate-glow-pulse absolute -inset-5 opacity-40 blur-2xl"
                      aria-hidden="true"
                    />
                    <ElementMascot
                      element={el.key}
                      idPrefix={`hero-${el.key}`}
                      className={`relative w-full drop-shadow-[0_12px_22px_rgba(0,0,0,0.45)] ${stage.tilt}`}
                    />
                  </div>
                  <div
                    className="mt-4 h-3 w-4/5 rounded-[100%] bg-black/55 blur-[6px]"
                    aria-hidden="true"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Curve divider menuju section berikutnya */}
      <svg
        className="absolute bottom-[-1px] left-0 w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 80 C360 130 720 10 1080 40 C1260 55 1380 70 1440 60 L1440 120 L0 120 Z"
          fill="#061b1a"
        />
      </svg>
    </section>
  );
}
