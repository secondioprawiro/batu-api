// balances.js — ringkasan saldo: funding wallet + 100 wallet (CELO & total API).
import { formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { BATU_API_ADDRESS } from "./config.js";
import { publicClient, loadWallets, runPool, celoStr } from "./lib.js";

const apiCoinAbi = [
  {
    type: "function",
    name: "apiCoin",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "a", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
];

async function main() {
  const wallets = loadWallets();

  const apiCoin = await publicClient.readContract({
    address: BATU_API_ADDRESS,
    abi: apiCoinAbi,
    functionName: "apiCoin",
  });

  const fundingKey = process.env.FUNDING_PRIVATE_KEY;
  if (fundingKey && /^0x[0-9a-fA-F]{64}$/.test(fundingKey)) {
    const f = privateKeyToAccount(fundingKey);
    const bal = await publicClient.getBalance({ address: f.address });
    console.log(`Funding ${f.address}: ${celoStr(bal)} CELO`);
  }

  const celoBals = await runPool(wallets, 8, (w) =>
    publicClient.getBalance({ address: w.address }),
  );
  const apiBals = await runPool(wallets, 8, (w) =>
    publicClient.readContract({
      address: apiCoin,
      abi: apiCoinAbi,
      functionName: "balanceOf",
      args: [w.address],
    }),
  );

  let totalCelo = 0n,
    totalApi = 0n,
    funded = 0;
  for (let i = 0; i < wallets.length; i++) {
    const c = celoBals[i].ok ? celoBals[i].value : 0n;
    const a = apiBals[i].ok ? apiBals[i].value : 0n;
    totalCelo += c;
    totalApi += a;
    if (c > 0n) funded++;
  }

  console.log(`Wallet didanai: ${funded}/${wallets.length}`);
  console.log(`Total CELO di 100 wallet: ${formatEther(totalCelo)}`);
  console.log(`Total API Coin (hasil deposit): ${formatEther(totalApi)}`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
