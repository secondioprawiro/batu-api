import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const PHASES = [
  {
    n: 1,
    icon: "⚙️",
    title: "Smart Contract & Token Logic",
    desc: "Kontrak API Coin, deposit, dan konversi CELO on-chain.",
    active: true,
  },
  {
    n: 2,
    icon: "🎮",
    title: "Frontend Battle UI",
    desc: "Arena visual tempat para elemen saling bertarung.",
    active: true,
  },
  {
    n: 3,
    icon: "🎲",
    title: "Random Battle System",
    desc: "Sistem lawan acak yang adil dan transparan.",
    active: false,
  },
  {
    n: 4,
    icon: "💰",
    title: "Reward Pool & Withdraw",
    desc: "Pool reward aktif plus penarikan CELO penuh.",
    active: false,
  },
  {
    n: 5,
    icon: "⚔️",
    title: "PvP Battle Mode",
    desc: "Pemain vs pemain — arena sesungguhnya dimulai.",
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
            title="Perjalanan Batu Api"
            subtitle="Dari smart contract pertama sampai arena PvP penuh."
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
