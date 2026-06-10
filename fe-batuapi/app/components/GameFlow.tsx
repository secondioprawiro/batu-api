import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const STEPS = [
  {
    n: "01",
    title: "Connect Wallet",
    desc: "Hubungkan wallet Celo-mu dan masuk ke arena.",
  },
  {
    n: "02",
    title: "Deposit CELO",
    desc: "Mulai dari 0.001 CELO — langsung dikonversi jadi API Coin.",
  },
  {
    n: "03",
    title: "Choose Element",
    desc: "Pilih Batu, Api, Air, atau Daun, lalu pasang bet API-mu.",
  },
  {
    n: "04",
    title: "Win API Reward",
    desc: "Kalahkan lawan dan bawa pulang reward dari battle pool.",
  },
];

export default function GameFlow() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 overflow-hidden bg-abyss-950 py-24"
    >
      <div
        className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-abyss-600/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="font-display text-center text-lg tracking-wide text-ember-300/90">
            Batu, Api, Air, dan Daun saling bertarung dalam arena on-chain ~ ♪
          </p>
          <div className="mt-6">
            <SectionHeading
              eyebrow="GAME FLOW"
              title="Cara Masuk Arena"
              subtitle="Empat langkah sederhana dari wallet sampai kemenangan pertamamu."
            />
          </div>
        </Reveal>

        <div className="relative mt-20 rounded-[36px] border border-white/5 bg-abyss-900/80 px-6 pb-10 shadow-[inset_0_2px_18px_rgba(0,0,0,0.45)] sm:px-10">
          <div
