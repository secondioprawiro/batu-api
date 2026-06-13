# batuapi-sdk

On-chain constants and ABIs for [**Batu Api**](https://github.com/secondioprawiro/batu-api) — an adminless element-battle game on **Celo Mainnet**.

Deposit CELO to mint API Coin, battle the system with elements (commit–reveal), win/lose API against a reward pool, then redeem API back to CELO.

## Install

```bash
npm install batuapi-sdk viem
```

`viem` is a peer you bring yourself; this package ships only addresses, ABIs, and game constants (zero runtime deps).

## Usage

```ts
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { ADDRESSES, batuapiAbi, Element } from "batuapi-sdk";

const client = createPublicClient({ chain: celo, transport: http() });

// Read the free reward pool.
const pool = await client.readContract({
  address: ADDRESSES.BatuApi,
  abi: batuapiAbi,
  functionName: "availablePool",
});

// Preview an element matchup (pure view): Air beats Api.
const outcome = await client.readContract({
  address: ADDRESSES.BatuApi,
  abi: batuapiAbi,
  functionName: "previewOutcome",
  args: [Element.Air, Element.Api],
});
```

## Exports

| Export | Description |
| --- | --- |
| `ADDRESSES` | `{ BatuApi, APICoin }` — Celo Mainnet addresses |
| `CELO_MAINNET_CHAIN_ID` | `42220` |
| `batuapiAbi` | BatuApi game contract ABI (`as const`, viem/wagmi-typed) |
| `apicoinAbi` | APICoin ERC20 ABI (`as const`) |
| `Element` | `{ Batu, Api, Air, Daun }` → on-chain enum ints |
| `Outcome` | `{ Lose, Win, Draw }` → on-chain enum ints |
| `RATE`, `WIN_NUM`, `WIN_DEN`, `REVEAL_WINDOW` | game constants |

## Battle flow (commit–reveal)

1. Approve API spend, then `commitBattle(bet, commitHash)` where
   `commitHash = keccak256(abi.encode(player, element, secret))` — built **off-chain** with a fresh random 32-byte `secret`.
2. After the next block (within `REVEAL_WINDOW`), `revealBattle(element, secret)` resolves the battle against the target blockhash.

Never send `hashCommit` as a transaction — it would leak `element`/`secret`. Compute the hash locally or via `eth_call`.

## License

MIT
