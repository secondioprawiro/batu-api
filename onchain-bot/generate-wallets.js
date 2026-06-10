// generate-wallets.js — buat N wallet baru, simpan ke wallets.json (GITIGNORED).
// Aman dijalankan ulang: menolak menimpa file yang sudah ada kecuali --force.
import { writeFileSync, existsSync } from "node:fs";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { WALLETS_PATH, WALLET_COUNT } from "./config.js";

const force = process.argv.includes("--force");

if (existsSync(WALLETS_PATH) && !force) {
  console.error(
    `wallets.json sudah ada. Menimpa = KEHILANGAN private key lama (dana bisa hangus).\n` +
      `Kalau memang mau regenerate, jalankan: node generate-wallets.js --force`,
  );
  process.exit(1);
}

const wallets = [];
for (let i = 0; i < WALLET_COUNT; i++) {
  const privateKey = generatePrivateKey();
  const { address } = privateKeyToAccount(privateKey);
  wallets.push({ index: i, address, privateKey });
}

writeFileSync(
  WALLETS_PATH,
  JSON.stringify(
    { createdAt: new Date().toISOString(), count: wallets.length, wallets },
    null,
    2,
  ),
);

console.log(`OK — ${wallets.length} wallet dibuat dan disimpan ke wallets.json`);
console.log(`Contoh address [0]: ${wallets[0].address}`);
console.log(
  `PENTING: file ini berisi private key. Backup aman, JANGAN commit / share.`,
);
