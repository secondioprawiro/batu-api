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
