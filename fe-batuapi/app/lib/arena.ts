import { encodeAbiParameters, keccak256, type Address, type Hex } from "viem";
import { byKey, ELEMENTS, type ElementKey } from "./elements";

/* === Konstanta ekonomi on-chain (BatuApi.sol, immutable) === */
export const RATE = 1000; // 1 CELO = 1000 API Coin
export const MIN_BET = 10; // API (minBet di mainnet: 10e18 base units)
/** Menang dibayar 1.95x bet dari reward pool (WIN_NUM/WIN_DEN = 195/100) */
export const WIN_MULTIPLIER = 1.95;
/** Reveal harus terjadi dalam 256 block setelah block target (commit + 1) */
export const REVEAL_WINDOW = 256n;
/** Withdraw dibulatkan ke bawah ke kelipatan RATE (1000 API = 1 CELO) */
export const MIN_WITHDRAW = RATE;

export type Outcome = "win" | "lose" | "draw";

/** Urutan ELEMENTS sama dengan enum on-chain: Batu=0, Api=1, Air=2, Daun=3 */
export const ELEMENT_INDEX: Record<ElementKey, number> = {
  batu: 0,
  api: 1,
  air: 2,
  daun: 3,
};

export function elementFromIndex(index: number): ElementKey {
  return ELEMENTS[index].key;
}

/** Enum Outcome on-chain: Lose=0, Win=1, Draw=2 */
export function outcomeFromIndex(index: number): Outcome {
  return (["lose", "win", "draw"] as const)[index];
}

export type BattleRecord = {
  id: number;
  player: ElementKey;
  system: ElementKey;
  /** Bet dalam API utuh (sudah dibagi 1e18) */
  bet: number;
  outcome: Outcome;
  /** Perubahan saldo API pemain (payout - bet) */
  delta: number;
  /** Hash transaksi reveal di Celo */
  txHash: string;
};

export type FightResult = Omit<BattleRecord, "id">;

export const EMOJI: Record<ElementKey, string> = {
  batu: "🪨",
  api: "🔥",
  air: "💧",
  daun: "🌿",
};

/**
 * Hitung commitment hash persis seperti kontrak:
 * keccak256(abi.encode(player, element, secret)).
 * Dihitung lokal — JANGAN pernah kirim element/secret ke chain sebelum reveal.
 */
export function hashCommit(
  player: Address,
  elementIndex: number,
  secret: Hex,
): Hex {
  return keccak256(
    encodeAbiParameters(
      [{ type: "address" }, { type: "uint8" }, { type: "bytes32" }],
      [player, elementIndex, secret],
    ),
  );
}

/* === Penyimpanan commit yang belum di-reveal (per wallet) ===
 * Secret HARUS bertahan dari refresh — tanpa secret, battle yang
 * sudah di-commit hanya bisa diselesaikan lewat forfeit (kalah). */

export type StoredCommit = {
  secret: Hex;
  elementIndex: number;
  bet: string; // base units, string (BigInt tidak bisa di-JSON)
  commitHash: Hex;
};

const commitKey = (address: Address) =>
  `batu-api-commit-42220-${address.toLowerCase()}`;

export function saveCommit(address: Address, commit: StoredCommit) {
  window.localStorage.setItem(commitKey(address), JSON.stringify(commit));
}

export function loadCommit(address: Address): StoredCommit | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(commitKey(address));
    return raw ? (JSON.parse(raw) as StoredCommit) : null;
  } catch {
    return null;
  }
}

export function clearCommit(address: Address) {
  window.localStorage.removeItem(commitKey(address));
}

/* === Riwayat battle lokal (hasil asli on-chain, disimpan per wallet) === */

const historyKey = (address: Address) =>
  `batu-api-history-42220-${address.toLowerCase()}`;

export function loadHistory(address: Address): BattleRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(historyKey(address));
    return raw ? (JSON.parse(raw) as BattleRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(address: Address, history: BattleRecord[]) {
  window.localStorage.setItem(
    historyKey(address),
    JSON.stringify(history.slice(0, 8)),
  );
}

/** Resolver elemen — sama persis dengan _resolve di kontrak (untuk teks UI). */
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
