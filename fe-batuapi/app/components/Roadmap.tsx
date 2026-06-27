import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const PHASES = [
  {
    n: 1,
    icon: "⚙️",
    title: "Smart Contract & Token Logic",
    desc: "API Coin contract, deposit, and CELO conversion on-chain.",
    active: true,
  },
  {
    n: 2,
    icon: "🎮",
    title: "Frontend Battle UI",
    desc: "Visual arena where elements battle each other.",
    active: true,
  },
  {
    n: 3,
    icon: "🎲",
    title: "Random Battle System",
    desc: "A fair and transparent random opponent system.",
    active: false,
  },
  {
    n: 4,
    icon: "💰",
    title: "Reward Pool & Withdraw",
    desc: "Active reward pool plus full CELO withdrawals.",
    active: false,
  },
  {
    n: 5,
    icon: "⚔️",
    title: "PvP Battle Mode",
    desc: "Player vs player — the real arena begins.",
    active: false,
  },
];

export default function Roadmap() {
  return (
    <section
      id="roadmap"
      className="relative scroll-mt-20 overflow-hidden py-24"
    >
      <span
        className="pointer-events-none absolute left-[4%] top-20 rotate-12 text-5xl opacity-20 blur-[1px]"
        aria-hidden="true"
      >
        🌿
      </span>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="ROADMAP"
            title="Batu Api Journey"
            subtitle="From the first smart contract to a full PvP arena."
          />
        </Reveal>

        <div className="relative mt-16">
          <div
            className="absolute left-[10%] right-[10%] top-7 hidden border-t-2 border-dashed border-ember-500/15 md:block"
            aria-hidden="true"
          />
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5 md:gap-4">
            {PHASES.map((phase, i) => (
              <Reveal key={phase.n} delay={i * 100}>
                <div className="relative flex flex-col items-center text-center">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full border-2 bg-abyss-800 text-xl ${
                      phase.active
                        ? "border-ember-500 shadow-[0_0_24px_-4px_rgba(255,138,30,0.6)]"
                        : "border-abyss-600"
                    }`}
                  >
                    {phase.icon}
                  </div>
                  <p className="font-display mt-4 text-sm tracking-widest text-ember-400">
                    PHASE {phase.n}
                  </p>
                  <h3 className="font-display mt-1 text-base tracking-wide text-cream">
                    {phase.title}
                  </h3>
                  <p className="mt-1.5 max-w-[200px] text-xs text-abyss-300">
                    {phase.desc}
                  </p>
                  <span
                    className={`mt-3 rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest ${
                      phase.active
                        ? "border-ember-500/30 bg-ember-500/15 text-ember-300"
                        : "border-white/10 bg-white/5 text-abyss-300"
                    }`}
                  >
                    {phase.active ? "Active" : "Coming Soon"}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
