import { EMOJI, fmt, type BattleRecord } from "@/app/lib/arena";
import { EXPLORER_URL } from "@/app/lib/contracts";

const OUTCOME_LABEL = {
  win: { text: "WIN", className: "text-emerald-300" },
  lose: { text: "LOSE", className: "text-red-300" },
  draw: { text: "DRAW", className: "text-abyss-300" },
} as const;

export default function HistoryPanel({
  history,
}: {
  history: BattleRecord[];
}) {
  return (
    <section className="rounded-[28px] border border-white/5 bg-abyss-900/70 p-6">
      <h2 className="font-display text-lg tracking-wider text-cream">
        BATTLE HISTORY
      </h2>
      {history.length === 0 ? (
        <p className="mt-4 text-sm text-abyss-300">
          No battles yet. Step into the arena! ⚔️
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {history.map((record) => {
            const outcome = OUTCOME_LABEL[record.outcome];
            return (
              <li key={record.id}>
                <a
                  href={`${EXPLORER_URL}/tx/${record.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View transaction on Blockscout"
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-night/50 px-3 py-2.5 text-sm transition-colors hover:border-ember-400/40"
                >
                  <span className="text-base">
                    {EMOJI[record.player]}{" "}
                    <span className="text-xs text-abyss-300">vs</span>{" "}
                    {EMOJI[record.system]}
                  </span>
                  <span
                    className={`font-display text-xs tracking-wider ${outcome.className}`}
                  >
                    {outcome.text}
                  </span>
                  <span
                    className={`font-semibold ${
                      record.delta > 0
                        ? "text-emerald-300"
                        : record.delta < 0
                          ? "text-red-300"
                          : "text-abyss-300"
                    }`}
                  >
                    {record.delta > 0 ? "+" : ""}
                    {fmt(record.delta, 2)} API
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
