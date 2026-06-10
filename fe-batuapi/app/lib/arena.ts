import { byKey, type ElementKey } from "./elements";

/* === Konstanta ekonomi game (sesuai README) === */
export const RATE = 1000; // 1 CELO = 1000 API Coin
export const MIN_DEPOSIT = 0.001; // CELO
export const MIN_BET = 10; // API
/** Opsi 1 — Fixed Reward: bet 100 → menang terima 180 (profit 0.8x bet) */
export const WIN_PROFIT = 0.8;
/** Element Streak Bonus: tiap 3 kemenangan beruntun dengan elemen yang sama */
export const STREAK_EVERY = 3;
export const STREAK_BONUS = 0.5; // x bet

export const DEMO_ADDRESS = "0x71C4…9A4F";

export type Outcome = "win" | "lose" | "draw";

export type BattleRecord = {
  id: number;
  player: ElementKey;
  system: ElementKey;
  bet: number;
  outcome: Outcome;
  /** Perubahan saldo API milik pemain (termasuk bonus) */
  delta: number;
  bonus: number;
};

export type FightResult = Omit<BattleRecord, "id">;

export type ArenaState = {
  connected: boolean;
  celo: number;
  api: number;
  pool: number;
  history: BattleRecord[];
  streakEl: ElementKey | null;
  streakN: number;
};

export const INITIAL_STATE: ArenaState = {
  connected: false,
  celo: 10,
  api: 0,
  pool: 25_000,
  history: [],
  streakEl: null,
  streakN: 0,
};

export const STORAGE_KEY = "batu-api-demo-v1";

export const EMOJI: Record<ElementKey, string> = {
  batu: "🪨",
  api: "🔥",
  air: "💧",
  daun: "🌿",
};

export function decideOutcome(player: ElementKey, system: ElementKey): Outcome {
  if (player === system) return "draw";
  if (byKey[player].beats === system) return "win";
  if (byKey[system].beats === player) return "lose";
  /* Pasangan netral (Api vs Batu, Air vs Daun) tidak saling mengalahkan */
  return "draw";
}

export function isElementKey(value: string | null): value is ElementKey {
  return value !== null && value in byKey;
}

export function fmt(n: number, maxFraction = 3): string {
  return n.toLocaleString("id-ID", { maximumFractionDigits: maxFraction });
}
