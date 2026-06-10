// deposit-run.js — TARGET CRONJOB. Tiap wallet deposit 0.001 CELO ke game.
// Sekali jalan = 1 tx per wallet (100 wallet -> 100 tx). 4×/hari -> 400 tx/hari.
// Tahan banting: kegagalan satu wallet tidak menghentikan yang lain.
import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import {
  RPC_URL,
  BATU_API_ADDRESS,
  DEPOSIT_AMOUNT,
  CONCURRENCY,
  batuApiAbi,
} from "./config.js";
import { publicClient, loadWallets, runPool, logLine } from "./lib.js";

const value = parseEther(DEPOSIT_AMOUNT);
// Cadangan gas kasar (Celo murah). Skip wallet di bawah ini agar tak buang
// percobaan yang pasti gagal "insufficient funds".
const MIN_BALANCE = value + parseEther("0.002");

async function depositFrom(w) {
  const balance = await publicClient.getBalance({ address: w.address });
  if (balance < MIN_BALANCE) {
    return { status: "skip", reason: "saldo tipis", address: w.address };
  }

  const account = privateKeyToAccount(w.privateKey);
  const wallet = createWalletClient({
    account,
    chain: celo,
    transport: http(RPC_URL),
  });

  // Simulasi dulu supaya revert ketahuan sebelum kirim gas.
  const { request } = await publicClient.simulateContract({
    account,
    address: BATU_API_ADDRESS,
    abi: batuApiAbi,
    functionName: "deposit",
    value,
  });
  const hash = await wallet.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
  return { status: "ok", address: w.address, hash };
}

async function main() {
  const wallets = loadWallets();
  logLine(
    "deposit",
    `Mulai run: ${wallets.length} wallet × deposit ${DEPOSIT_AMOUNT} CELO -> ${BATU_API_ADDRESS}`,
  );

  const results = await runPool(wallets, CONCURRENCY, depositFrom);

  let ok = 0,
    skip = 0,
    fail = 0;
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.ok && r.value.status === "ok") {
      ok++;
      logLine("deposit", `OK   ${r.value.address}  tx=${r.value.hash}`);
    } else if (r.ok && r.value.status === "skip") {
      skip++;
      logLine("deposit", `SKIP ${r.value.address}  (${r.value.reason})`);
    } else {
      fail++;
      const w = wallets[i];
      const err = r.error;
      logLine(
        "deposit",
        `FAIL ${w.address}: ${err.shortMessage || err.message}`,
      );
    }
  }

  logLine("deposit", `Selesai run: OK=${ok} SKIP=${skip} FAIL=${fail}`);
}

main().catch((err) => {
  logLine("deposit", `FATAL: ${err.message}`);
  process.exit(1);
});
