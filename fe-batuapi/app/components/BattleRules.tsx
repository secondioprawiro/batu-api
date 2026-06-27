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
            title="Battle Rules Board"
            subtitle="Four elements lock in a cycle. Memorize before placing your bet."
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
                      />
                      <span className="font-display mt-1 text-sm tracking-wide text-abyss-300">
                        Air
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-sm text-abyss-300">
              Arrow means <span className="text-ember-300">defeats</span>{" "}
              — the cycle loops forever.
            </p>
          </div>
        </Reveal>

        {/* Kartu matchup */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {CYCLE.map((key, i) => {
            const winner = byKey[key];
            const loser = byKey[winner.beats];
            return (
              <Reveal key={key} delay={i * 100}>
                <div
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-abyss-900/70 p-5 transition-colors hover:border-ember-500/30"
                  style={{ "--el": winner.color } as React.CSSProperties}
                >
                  <div className="relative w-14 shrink-0 sm:w-16">
                    <div
                      className="el-glow-bg absolute -inset-2 opacity-40 blur-xl"
                      aria-hidden="true"
                    />
                    <ElementMascot
                      element={winner.key}
                      idPrefix={`rule-${winner.key}`}
                      className="relative w-full"
                    />
                  </div>
                  <div>
                    <p className="font-display text-lg tracking-wider">
                      <span className="el-text">{winner.name.toUpperCase()}</span>{" "}
                      <span className="text-ember-400">&gt;</span>{" "}
                      <span className="text-cream">
                        {loser.name.toUpperCase()}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-abyss-300">
                      {winner.name} {winner.verb} {loser.name} — wins decisively
                      in the arena.
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <div className="mt-6 rounded-2xl border border-dashed border-abyss-300/25 bg-abyss-800/40 p-4 text-center text-sm text-abyss-200">
            🤝 Same element or neutral pair (Api–Batu, Air–Daun) ={" "}
            <span className="text-ember-300">Draw</span> — bet returned
            or battle replayed.
          </div>
        </Reveal>

        <p className="sr-only">
          Full rules: {ELEMENTS.map((e) => `${e.name} beats ${byKey[e.beats].name}`).join(", ")}.
        </p>
      </div>
    </section>
  );
}
