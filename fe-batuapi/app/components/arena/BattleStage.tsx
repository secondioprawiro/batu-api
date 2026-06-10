"use client";

import { ELEMENTS, byKey, type ElementKey } from "@/app/lib/elements";
import { MIN_BET, STREAK_EVERY, fmt, type FightResult } from "@/app/lib/arena";
import ElementMascot from "../ElementMascot";

const QUICK_BETS = [10, 50, 100, 500];

type Phase = "idle" | "fighting" | "result";

type BattleStageProps = {
  phase: Phase;
  result: FightResult | null;
  selected: ElementKey;
  onSelect: (el: ElementKey) => void;
  bet: string;
  onBetChange: (value: string) => void;
  apiBalance: number;
  /** Elemen yang sedang ditampilkan roda sistem selama fase fighting */
  spinElement: ElementKey | null;
  onFight: () => void;
  onStop: () => void;
  onAgain: () => void;
};

const RESULT_STYLE = {
  win: {
    box: "border-emerald-400/40 bg-emerald-500/10",
    title: "text-emerald-300",
    heading: "MENANG! 🎉",
  },
  lose: {
    box: "border-red-400/40 bg-red-500/10",
    title: "text-red-300",
    heading: "KALAH 💀",
  },
  draw: {
    box: "border-abyss-300/30 bg-abyss-800/40",
    title: "text-abyss-200",
    heading: "SERI 🤝",
  },
} as const;

export default function BattleStage({
  phase,
  result,
  selected,
  onSelect,
  bet,
  onBetChange,
