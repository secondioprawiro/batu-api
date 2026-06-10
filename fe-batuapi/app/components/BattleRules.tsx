import { ELEMENTS, byKey } from "@/app/lib/elements";
import ElementMascot from "./ElementMascot";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/* Urutan siklus: Air memadamkan Api, Api membakar Daun, Daun menyelimuti Batu, Batu membendung Air */
const CYCLE = ["air", "api", "daun", "batu"] as const;

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0 text-ember-400 drop-shadow-[0_0_8px_rgba(255,138,30,0.6)] sm:h-8 sm:w-8"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 11h12.17l-3.58-3.59L14 6l6 6-6 6-1.41-1.41L16.17 13H4z" />
    </svg>
  );
}

export default function BattleRules() {
  return (
    <section
      id="battle"
      className="relative scroll-mt-20 overflow-hidden bg-abyss-950 py-24"
    >
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-blood-900/40 blur-3xl"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute right-[5%] top-16 -rotate-12 text-5xl opacity-20 blur-[1px]"
        aria-hidden="true"
      >
        🍂
      </span>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="BATTLE RULES"
            title="Papan Aturan Battle"
            subtitle="Empat elemen saling mengunci dalam satu siklus. Hafalkan sebelum pasang bet."
          />
        </Reveal>

        {/* Siklus elemen */}
        <Reveal delay={120}>
          <div className="stitched mt-14 rounded-[32px] bg-abyss-900/60 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              {CYCLE.map((key, i) => (
                <div key={key} className="flex items-center gap-2 sm:gap-4">
                  <div
                    className="flex w-16 flex-col items-center sm:w-20"
                    style={{ "--el": byKey[key].color } as React.CSSProperties}
                  >
                    <ElementMascot
                      element={key}
                      idPrefix={`cycle-${key}`}
                      className="w-full drop-shadow-[0_8px_14px_rgba(0,0,0,0.4)]"
                    />
                    <span className="el-text font-display mt-1 text-sm tracking-wide">
                      {byKey[key].name}
                    </span>
                  </div>
                  <ArrowIcon />
                  {i === CYCLE.length - 1 && (
                    <div className="flex w-16 flex-col items-center opacity-50 sm:w-20">
                      <ElementMascot
                        element="air"
                        idPrefix="cycle-air-loop"
                        className="w-full"
