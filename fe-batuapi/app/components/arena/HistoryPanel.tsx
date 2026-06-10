import { EMOJI, fmt, type BattleRecord } from "@/app/lib/arena";

const OUTCOME_LABEL = {
  win: { text: "MENANG", className: "text-emerald-300" },
  lose: { text: "KALAH", className: "text-red-300" },
  draw: { text: "SERI", className: "text-abyss-300" },
} as const;

export default function HistoryPanel({
  history,
}: {
  history: BattleRecord[];
}) {
  return (
    <section className="rounded-[28px] border border-white/5 bg-abyss-900/70 p-6">
      <h2 className="font-display text-lg tracking-wider text-cream">
        RIWAYAT BATTLE
      </h2>
      {history.length === 0 ? (
        <p className="mt-4 text-sm text-abyss-300">
          Belum ada battle. Ayo turun ke arena! ⚔️
