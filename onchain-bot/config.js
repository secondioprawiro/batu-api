import "dotenv/config";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Kontrak game BatuApi di Celo mainnet (deposit/withdraw/battle). */
export const BATU_API_ADDRESS =
  "0x618Cd4F7a020a9814B17B68fD9b2Dc5F3b5D06b6";

/** RPC Celo. Forno gratis; ganti via .env kalau perlu (mis. RPC berbayar). */
export const RPC_URL = process.env.RPC_URL || "https://forno.celo.org";

/** CELO yang dikirim ke tiap wallet saat distribusi. Default 0.99 — lihat README:
 *  100 CELO TIDAK cukup untuk 100 × 1 CELO + gas, jadi sisakan ruang gas. */
export const AMOUNT_PER_WALLET = process.env.AMOUNT_PER_WALLET || "0.99";

/** Nominal deposit per tx ke game (sesuai permintaan: 0.001 CELO). */
export const DEPOSIT_AMOUNT = process.env.DEPOSIT_AMOUNT || "0.001";

/** Berapa banyak wallet di-generate / dipakai. */
export const WALLET_COUNT = Number(process.env.WALLET_COUNT || 100);

/** Tx paralel maksimum (hindari rate-limit RPC). */
export const CONCURRENCY = Number(process.env.CONCURRENCY || 8);

export const WALLETS_PATH = join(__dirname, "wallets.json");
export const LOG_DIR = join(__dirname, "logs");

/** ABI minimal — hanya deposit() yang dipakai bot. */
export const batuApiAbi = [
  {
    type: "function",
    name: "deposit",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
];
