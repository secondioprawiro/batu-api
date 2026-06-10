import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const REWARDS = [
  {
    icon: "🪙",
    name: "API Coin Reward",
    desc: "Menang battle, API Coin langsung masuk saldo.",
    glow: "#ffaa3c",
  },
  {
    icon: "💎",
    name: "CELO Withdrawal",
    desc: "Tukar API kembali menjadi CELO kapan saja.",
    glow: "#fcff52",
  },
  {
    icon: "🧪",
    name: "Battle Pool",
    desc: "Token dari battle yang kalah mengisi pool reward.",
    glow: "#71d873",
  },
  {
    icon: "🏆",
    name: "Winner Bonus",
    desc: "Bonus spesial untuk sang juara arena.",
    glow: "#ffc56e",
  },
  {
    icon: "⚡",
    name: "Element Streak Bonus",
    desc: "Menang beruntun dengan satu elemen? Bonus ekstra.",
    glow: "#4cc3ff",
  },
];

export default function Rewards() {
  return (
    <section
      id="rewards"
      className="relative scroll-mt-20 overflow-hidden bg-abyss-950 py-28"
    >
      {/* Watermark raksasa khas event page */}
      <p
        className="font-display pointer-events-none absolute inset-x-0 top-6 select-none text-center text-[clamp(80px,16vw,220px)] leading-none tracking-widest text-white/4"
        aria-hidden="true"
      >
        REWARD
      </p>
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-ember-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="REWARDS"
            title="Pundi-Pundi Arena"
            subtitle="Menang battle, kumpulkan reward, dan tarik kapan saja ke wallet-mu."
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          {REWARDS.map((r, i) => (
            <Reveal key={r.name} delay={i * 100}>
              <div className="group flex flex-col items-center text-center">
                <div className="relative">
                  <div
                    className="absolute -inset-4 rounded-full opacity-50 blur-xl transition-opacity duration-300 group-hover:opacity-90"
                    style={{
                      background: `radial-gradient(circle, ${r.glow}55, transparent 70%)`,
                    }}
                    aria-hidden="true"
                  />
                  <div
                    className="animate-float relative text-6xl drop-shadow-[0_10px_18px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110"
                    style={{ animationDelay: `${i * 0.7}s` }}
                  >
                    {r.icon}
                  </div>
                </div>
                {/* Pedestal */}
                <div
                  className="mt-3 h-5 w-24 rounded-[100%] border border-white/10 bg-gradient-to-b from-abyss-700 to-abyss-900 shadow-[0_12px_24px_-6px_rgba(0,0,0,0.7)]"
                  aria-hidden="true"
                />
                <h3 className="font-display mt-5 text-sm tracking-wide text-cream sm:text-base">
                  {r.name}
                </h3>
                <p className="mt-1.5 max-w-[190px] text-xs text-abyss-300">
                  {r.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
