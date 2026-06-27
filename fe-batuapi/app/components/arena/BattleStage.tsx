"use client";

import { ELEMENTS, byKey, type ElementKey } from "@/app/lib/elements";
import { MIN_BET, WIN_MULTIPLIER, fmt, type FightResult } from "@/app/lib/arena";
import { EXPLORER_URL } from "@/app/lib/contracts";
import ElementMascot from "../ElementMascot";

const QUICK_BETS = [10, 50, 100, 500];

export type Phase =
  | "idle"
  | "approving"
  | "committing"
  | "waiting"
  | "revealing"
  | "result";

const PHASE_STATUS: Record<Exclude<Phase, "idle" | "result">, string> = {
  approving: "Approving API Coin in wallet…",
  committing: "Sending battle commitment to Celo…",
  waiting: "Waiting for block hash (source of randomness)…",
  revealing: "Revealing element — determining result…",
};

type BattleStageProps = {
  phase: Phase;
  result: FightResult | null;
  selected: ElementKey;
  onSelect: (el: ElementKey) => void;
  bet: string;
  onBetChange: (value: string) => void;
  apiBalance: number;
  /** Bet maksimum yang bisa ditanggung reward pool saat ini */
  poolMaxBet: number;
  /** Elemen yang sedang ditampilkan roda sistem selama battle berjalan */
  spinElement: ElementKey | null;
  onFight: () => void;
  onAgain: () => void;
  /** Battle pending belum selesai — arena terkunci */
  disabled: boolean;
};

const RESULT_STYLE = {
  win: {
    box: "border-emerald-400/40 bg-emerald-500/10",
    title: "text-emerald-300",
    heading: "WIN! 🎉",
  },
  lose: {
    box: "border-red-400/40 bg-red-500/10",
    title: "text-red-300",
    heading: "LOSE 💀",
  },
  draw: {
    box: "border-abyss-300/30 bg-abyss-800/40",
    title: "text-abyss-200",
    heading: "DRAW 🤝",
  },
} as const;

export default function BattleStage({
  phase,
  result,
  selected,
  onSelect,
  bet,
  onBetChange,
  apiBalance,
  poolMaxBet,
  spinElement,
  onFight,
  onAgain,
  disabled,
}: BattleStageProps) {
  const chosen = byKey[selected];
  const betN = Math.floor(Number(bet));
  const betValid = Number.isFinite(betN) && betN >= MIN_BET;
  const betAffordable = betValid && betN <= apiBalance;
  const betBackable = betValid && betN <= poolMaxBet;
  const fighting =
    phase === "approving" ||
    phase === "committing" ||
    phase === "waiting" ||
    phase === "revealing";

  return (
    <section className="rounded-[32px] border border-white/5 bg-abyss-900/70 p-5 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-glow-soft text-2xl tracking-wide text-cream sm:text-3xl">
            BATU API ARENA
          </h1>
          <p className="mt-1 text-sm text-abyss-300">
            Choose element, place bet, beat the system.
          </p>
        </div>
        <span className="rounded-full border border-ember-500/30 bg-ember-500/10 px-3 py-1 text-[10px] font-semibold tracking-widest text-ember-300">
          PLAYER VS SYSTEM
        </span>
      </div>

      {/* Panggung battle */}
      <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-blood-950/60 to-night/80 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-20 max-w-md rounded-[100%] bg-ember-500/10 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex items-center justify-center gap-4 sm:gap-12">
          {/* Pemain */}
          <div className="flex w-28 flex-col items-center sm:w-40">
            <span className="text-[10px] font-semibold tracking-[0.3em] text-abyss-300">
              YOU
            </span>
            <div
              className="relative mt-2 w-full"
              style={{ "--el": chosen.color } as React.CSSProperties}
            >
              <div
                className="el-glow-bg absolute -inset-4 opacity-40 blur-2xl"
                aria-hidden="true"
              />
              <ElementMascot
                element={selected}
                idPrefix={`stage-${selected}`}
                className={`relative w-full drop-shadow-[0_12px_22px_rgba(0,0,0,0.5)] ${
                  fighting ? "animate-shake" : "animate-float"
                }`}
              />
            </div>
            <span
              className="el-text font-display mt-2 tracking-wide"
              style={{ "--el": chosen.color } as React.CSSProperties}
            >
              {chosen.name}
            </span>
          </div>

          <span className="font-display text-glow-ember text-3xl text-ember-400 sm:text-5xl">
            VS
          </span>

          {/* Sistem */}
          <div className="flex w-28 flex-col items-center sm:w-40">
            <span className="text-[10px] font-semibold tracking-[0.3em] text-abyss-300">
              SYSTEM
            </span>
            {phase === "result" && result ? (
              <>
                <div
                  className="animate-pop relative mt-2 w-full"
                  style={
                    { "--el": byKey[result.system].color } as React.CSSProperties
                  }
                >
                  <div
                    className="el-glow-bg absolute -inset-4 opacity-40 blur-2xl"
                    aria-hidden="true"
                  />
                  <ElementMascot
                    element={result.system}
                    idPrefix={`stage-sys-${result.system}`}
                    className="relative w-full drop-shadow-[0_12px_22px_rgba(0,0,0,0.5)]"
                  />
                </div>
                <span
                  className="el-text font-display mt-2 tracking-wide"
                  style={
                    { "--el": byKey[result.system].color } as React.CSSProperties
                  }
                >
                  {byKey[result.system].name}
                </span>
              </>
            ) : fighting && spinElement ? (
              <>
                {/* Roda elemen — berputar sampai hasil reveal on-chain keluar */}
                <div
                  className="mt-2 flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-ember-400/50 bg-abyss-800/60"
                  style={
                    { "--el": byKey[spinElement].color } as React.CSSProperties
                  }
                >
                  <ElementMascot
                    element={spinElement}
                    idPrefix={`spin-${spinElement}`}
                    className="w-3/4"
                  />
                </div>
                <span className="font-display mt-2 animate-pulse tracking-wide text-ember-300">
                  Choosing…
                </span>
              </>
            ) : (
              <>
                <div className="mt-2 flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-abyss-300/30 bg-abyss-800/60">
                  <span className="font-display text-4xl text-abyss-300 sm:text-6xl">
                    ?
                  </span>
                </div>
                <span className="font-display mt-2 tracking-wide text-abyss-300">
                  Mystery
                </span>
              </>
            )}
          </div>
        </div>

        {/* Banner hasil */}
        {phase === "result" && result && (
          <div
            className={`animate-pop relative mt-6 rounded-2xl border p-4 text-center ${RESULT_STYLE[result.outcome].box}`}
          >
            <p
              className={`font-display text-2xl tracking-wide ${RESULT_STYLE[result.outcome].title}`}
            >
              {RESULT_STYLE[result.outcome].heading}
            </p>
            <p className="mt-1 text-sm text-abyss-200">
              {result.outcome === "win" && (
                <>
                  {byKey[result.player].name} {byKey[result.player].verb}{" "}
                  {byKey[result.system].name}! Profit{" "}
                  <strong className="text-emerald-300">
                    +{fmt(result.delta, 2)} API
                  </strong>{" "}
                  ({WIN_MULTIPLIER}× bet paid from reward pool).
                </>
              )}
              {result.outcome === "lose" && (
                <>
                  {byKey[result.system].name} {byKey[result.system].verb}{" "}
                  {byKey[result.player].name}.{" "}
                  <strong className="text-red-300">
                    -{fmt(result.bet, 0)} API
                  </strong>{" "}
                  goes into the reward pool.
                </>
              )}
              {result.outcome === "draw" &&
                (result.player === result.system ? (
                  <>Same element — bet returned, no balance change.</>
                ) : (
                  <>
                    {byKey[result.player].name} and {byKey[result.system].name}{" "}
                    don&apos;t beat each other — draw, bet returned.
                  </>
                ))}
            </p>
            <a
              href={`${EXPLORER_URL}/tx/${result.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-abyss-300 underline-offset-2 hover:text-ember-300 hover:underline"
            >
              View transaction on Blockscout ↗
            </a>
            <div>
              <button
                type="button"
                onClick={onAgain}
                className="btn-ember font-display mt-4 rounded-full px-7 py-2.5 tracking-wider transition-transform hover:-translate-y-0.5"
              >
                ⚔️ BATTLE AGAIN
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pemilih elemen */}
      <p className="mt-6 text-xs font-semibold tracking-[0.3em] text-abyss-300">
        CHOOSE ELEMENT
      </p>
      <div className="mt-2 grid grid-cols-4 gap-2 sm:gap-3">
        {ELEMENTS.map((el) => {
          const isSelected = el.key === selected;
          return (
            <button
              key={el.key}
              type="button"
              disabled={fighting || disabled}
              onClick={() => onSelect(el.key)}
              aria-pressed={isSelected}
              style={{ "--el": el.color } as React.CSSProperties}
              className={`flex flex-col items-center gap-1 rounded-2xl border bg-abyss-800/60 p-2 transition-all duration-200 disabled:opacity-60 sm:p-3 ${
                isSelected
                  ? "el-card-selected border-white/10"
                  : "border-white/10 hover:-translate-y-1 hover:border-white/25"
              }`}
            >
              <ElementMascot
                element={el.key}
                idPrefix={`pick-${el.key}`}
                className="w-10 sm:w-14"
              />
              <span
                className={`font-display text-xs tracking-wide sm:text-sm ${
                  isSelected ? "el-text" : "text-cream"
                }`}
              >
                {el.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bet */}
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <div className="min-w-40 flex-1">
          <label
            htmlFor="bet-input"
            className="text-xs font-semibold tracking-[0.3em] text-abyss-300"
          >
            BET (API)
          </label>
          <input
            id="bet-input"
            type="number"
            min={MIN_BET}
            step={1}
            value={bet}
            disabled={fighting || disabled}
            onChange={(e) => onBetChange(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-night/70 p-3 text-lg font-semibold text-cream outline-none transition-colors focus:border-ember-400/60 disabled:opacity-60"
          />
        </div>
        <div className="flex gap-2">
          {QUICK_BETS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={fighting || disabled}
              onClick={() => onBetChange(String(q))}
              className={`rounded-full border px-3.5 py-2.5 text-xs transition-colors disabled:opacity-60 ${
                bet === String(q)
                  ? "border-ember-400/70 bg-ember-500/15 text-ember-300"
                  : "border-white/10 text-abyss-200 hover:border-ember-400/50 hover:text-ember-300"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {!betValid && (
        <p className="mt-2 text-xs text-red-300">
          ⚠️ Minimum bet {MIN_BET} API.
        </p>
      )}
      {betValid && !betAffordable && (
        <p className="mt-2 text-xs text-red-300">
          ⚠️ Insufficient API balance — deposit CELO first in the Arena Bank panel.
        </p>
      )}
      {betValid && betAffordable && !betBackable && (
        <p className="mt-2 text-xs text-red-300">
          ⚠️ Reward pool is low — max bet {fmt(poolMaxBet, 0)} API.
        </p>
      )}

      <button
        type="button"
        onClick={onFight}
        disabled={fighting || disabled || !betAffordable || !betBackable}
        className={`btn-ember font-display mt-5 w-full rounded-2xl py-4 text-xl tracking-wider transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${
          fighting ? "animate-pulse" : ""
        }`}
      >
        {fighting ? "⚔️ FIGHTING…" : "⚔️ FIGHT!"}
      </button>
      <p className="mt-3 text-center text-[11px] text-abyss-300">
        {fighting
          ? PHASE_STATUS[phase as Exclude<Phase, "idle" | "result">]
          : `Win = ${WIN_MULTIPLIER}× bet from reward pool · Lose = bet goes to pool · Draw = bet returned. Battle = 2 transactions (commit + reveal).`}
      </p>
    </section>
  );
}
