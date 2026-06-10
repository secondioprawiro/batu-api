// distribute.js — kirim CELO dari funding wallet ke 100 wallet hasil generate.
// Idempoten: wallet yang saldonya sudah >= target dilewati, jadi aman di-rerun
// kalau sebelumnya putus di tengah.
import { createWalletClient, http, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import {
  RPC_URL,
  AMOUNT_PER_WALLET,
  CONCURRENCY,
} from "./config.js";
import { publicClient, loadWallets, runPool, logLine, celoStr } from "./lib.js";

const fundingKey = process.env.FUNDING_PRIVATE_KEY;
if (!fundingKey || !/^0x[0-9a-fA-F]{64}$/.test(fundingKey)) {
  console.error(
    "FUNDING_PRIVATE_KEY belum diisi / format salah di .env (harus 0x + 64 hex).",
  );
  process.exit(1);
}

const funding = privateKeyToAccount(fundingKey);
const fundingWallet = createWalletClient({
  account: funding,
  chain: celo,
  transport: http(RPC_URL),
});

const target = parseEther(AMOUNT_PER_WALLET);
const wallets = loadWallets();

async function main() {
  const balance = await publicClient.getBalance({ address: funding.address });
  const needed = target * BigInt(wallets.length);

  logLine("distribute", `Funding wallet: ${funding.address}`);
  logLine("distribute", `Saldo funding: ${celoStr(balance)} CELO`);
  logLine(
    "distribute",
    `Rencana: ${wallets.length} × ${AMOUNT_PER_WALLET} = ${formatEther(needed)} CELO (+ gas)`,
  );

  if (balance < needed) {
    logLine(
      "distribute",
      `PERINGATAN: saldo (${celoStr(balance)}) < kebutuhan (${formatEther(needed)}). ` +
        `Sebagian wallet bisa gagal terdanai. Turunkan AMOUNT_PER_WALLET atau top-up.`,
    );
  }

  // Cek saldo tiap target dulu (paralel) → tentukan siapa yang perlu dikirim.
  const balances = await runPool(wallets, CONCURRENCY, (w) =>
    publicClient.getBalance({ address: w.address }),
  );
  const todo = wallets.filter((w, i) => {
    const bal = balances[i].ok ? balances[i].value : 0n;
    return bal < target;
  });
  logLine(
    "distribute",
    `Perlu didanai: ${todo.length} dari ${wallets.length} (sisanya sudah cukup).`,
  );

  // Kirim BERURUTAN dari satu funding wallet — nonce harus naik teratur.
  let sent = 0;
  let failed = 0;
  for (const w of todo) {
    try {
      const hash = await fundingWallet.sendTransaction({
        to: w.address,
        value: target,
      });
      await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
      sent++;
      logLine(
        "distribute",
        `[${sent}/${todo.length}] -> ${w.address} ${AMOUNT_PER_WALLET} CELO  tx=${hash}`,
      );
    } catch (err) {
      failed++;
      logLine(
        "distribute",
        `GAGAL -> ${w.address}: ${err.shortMessage || err.message}`,
      );
    }
  }

  logLine("distribute", `Selesai. Terkirim: ${sent}, gagal: ${failed}.`);
}

main().catch((err) => {
  logLine("distribute", `FATAL: ${err.message}`);
  process.exit(1);
});
