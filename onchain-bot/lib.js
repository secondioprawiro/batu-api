import { readFileSync, mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { RPC_URL, WALLETS_PATH, LOG_DIR } from "./config.js";

export const publicClient = createPublicClient({
  chain: celo,
  transport: http(RPC_URL),
});

/** Muat wallets.json (array {index, address, privateKey}). */
export function loadWallets() {
  let raw;
  try {
    raw = readFileSync(WALLETS_PATH, "utf8");
  } catch {
    throw new Error(
      `wallets.json tidak ditemukan. Jalankan dulu: npm run generate`,
    );
  }
  const data = JSON.parse(raw);
  if (!Array.isArray(data.wallets) || data.wallets.length === 0) {
    throw new Error("wallets.json kosong atau rusak.");
  }
  return data.wallets;
}

/** Promise-pool: jalankan `worker(item, i)` dengan paralelisme terbatas. */
export async function runPool(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function lane() {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        results[i] = { ok: true, value: await worker(items[i], i) };
      } catch (err) {
        results[i] = { ok: false, error: err };
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, lane),
  );
  return results;
}

/** Tulis baris log ber-timestamp ke logs/<name>.log dan stdout. */
export function logLine(name, message) {
  mkdirSync(LOG_DIR, { recursive: true });
  const stamp = new Date().toISOString();
  const line = `${stamp} ${message}`;
  appendFileSync(join(LOG_DIR, `${name}.log`), line + "\n");
  console.log(line);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Format wei → string CELO ringkas untuk log. */
export function celoStr(wei) {
  return (Number(wei) / 1e18).toFixed(4);
}
