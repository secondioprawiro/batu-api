# sc-batuapi — Batu Api Smart Contracts

Solidity contracts for **Batu Api**, the element-battle mini game on **Celo Mainnet**. Built with **Foundry**.

## ✅ Deployed — Celo Mainnet (chain `42220`)

| Contract | Address | Explorer |
|---|---|---|
| **BatuApi** (game) | `0x618Cd4F7a020a9814B17B68fD9b2Dc5F3b5D06b6` | [verified](https://celo.blockscout.com/address/0x618Cd4F7a020a9814B17B68fD9b2Dc5F3b5D06b6) |
| **APICoin** (ERC20) | `0xe109fCa2C3AcB099e51F583346680DD3DfE06d26` | [verified](https://celo.blockscout.com/address/0xe109fCa2C3AcB099e51F583346680DD3DfE06d26) |

- RPC: `https://forno.celo.org` · Chain ID `42220` · Native gas token: **CELO**.
- Live config: `minBet = 10 API` · `RATE = 1000` · payout `1.95×` (`WIN_NUM/WIN_DEN = 195/100`) ·
  `REVEAL_WINDOW = 256` blocks. **Adminless** (no owner).
- `APICoin` is a standard ERC20 (18 decimals); read its address from `BatuApi.apiCoin()`.

> **Frontend devs:** jump to [Frontend integration guide](#frontend-integration-guide).

## Contracts

| Contract | Purpose |
|---|---|
| `APICoin.sol` | ERC20 game token (API Coin). Mint/burn restricted to its owner — the game contract. |
| `BatuApi.sol` | Deposit CELO → mint API, battle the system, withdraw API → CELO. Holds the reward pool. |

## Economic model

```text
1 CELO = 1000 API        (RATE = 1000)
```

- **Deposit** CELO → mint `CELO × 1000` API to the player.
- **Withdraw** API → burn `API` and return `API / 1000` CELO.
- **Battle** (two steps, commit–reveal): bet API against the system.
  1. `commitBattle(bet, hash(player, element, secret))` — locks the bet; BOTH the
     element and the secret stay hidden until reveal.
  2. `revealBattle(element, secret)` — resolves using `blockhash(commitBlock+1)`
     mixed with the secret. (`hashCommit(player, element, secret)` builds the hash.)

  Reveal within `REVEAL_WINDOW` (256) blocks of the target block. Missing the window →
  anyone can `forfeitExpired(player)` to settle it as a loss (prevents selective reveal).

### Element rules (fair)

Counter cycle `Air > Api > Daun > Batu > Air`. The two **cross pairs**
(`Air ↔ Daun`, `Api ↔ Batu`) are **draws**, and same-element is a draw. So every
element **wins 1, loses 1, draws 2** of the four possible system picks — symmetric and
fair: **25% win / 25% lose / 50% draw** vs a uniform-random system
(verified by `test_Resolve_FairSymmetry`).

### Reward Pool scheme (adminless, self-sustaining)

- **Win** → player receives `1.95 × bet` from the pool (`WIN_NUM/WIN_DEN = 195/100`).
- **Lose** → bet stays in the pool.
- **Draw** → bet returned.

The `<2×` payout is a **~2.5% house edge**: with the fair rules above, the pool has a
slight positive drift, so it self-sustains after the initial seed.

**No admin.** The contract is not `Ownable`. The pool is permissionless:
- `fundPool()` — *anyone* may add backed CELO liquidity (the deployer seeds once via the
  payable constructor; the community can top up any time).
- `syncExcessCelo()` — *anyone* may fold CELO force-sent to the contract into the pool.
- Pool funds are **never withdrawable** — they only flow back out to winners. `minBet` is
  immutable. There is no owner key to lose, go offline, or rug.

Battles never mint/burn API, only move it between player and pool. The pool must hold
enough free liquidity (`availablePool()`) to back a bet's potential win, else
`commitBattle` reverts `InsufficientPool` until losses refill it.

### Backing invariant

```text
totalSupply(API) == address(BatuApi).balance × 1000
```

API is only ever minted against deposited/funded CELO and burned on withdrawal, so
every API is always redeemable. Tested in `test_BackingInvariant_*` and asserted after
every battle test.

## Security notes

- **Randomness — commit–reveal + future blockhash.** The system element is bound to
  `blockhash(commitBlock+1)` mixed with a player-supplied `secret` revealed in a later
  transaction. The player cannot predict a future blockhash at commit time, and a
  validator does not know the secret, so neither side can steer the outcome. This
  replaces the earlier predictable single-tx `prevrandao` pick.
  - The chosen **element is also hidden** in the commit hash (`keccak256(player,
    element, secret)`) and only revealed at step 2 — so even if a secret were leaked,
    a validator still cannot target the outcome.
  - **Use a fresh, random `secret` for every battle.** A reused secret is public once
    its battle is revealed; the on-chain hiding above keeps the attack infeasible, but
    fresh secrets remove the risk entirely.
  - Residual risk: a validator producing the target block has a 1-block grind (include
    vs. skip) but, lacking both the secret and element, cannot target a specific result.
    Strong enough for small-stakes play. For high-value stakes, swap in **Chainlink VRF**
    (note: no first-party VRF coordinator on Celo today) or a two-party commit–reveal.
- **Solvency reserve.** `reservedPayout` reserves each pending battle's full potential
  payout, so the pool can always pay every pending win (enforced at commit; the invariant
  `poolBalance ≥ reservedPayout` is proven to hold across reveal/forfeit).
- **Adminless.** No owner, no privileged withdrawal, immutable `minBet` — no key to
  compromise. Pool funds only ever leave to winners.
- `withdraw` sends native CELO and is `nonReentrant` with checks-effects-interactions.
- API Coin mint/burn is owner-gated; its owner is the BatuApi game contract (not a human).

## Frontend integration guide

Everything a frontend needs to integrate the deployed contracts. Examples use
[viem](https://viem.sh) (works with wagmi). Chain: Celo Mainnet (`42220`).

### Addresses & enums

```ts
const BATU_API = "0x618Cd4F7a020a9814B17B68fD9b2Dc5F3b5D06b6";
const API_COIN = "0xe109fCa2C3AcB099e51F583346680DD3DfE06d26";

// Element enum — order matters, encode as uint8
enum Element { Batu = 0, Api = 1, Air = 2, Daun = 3 }
// Outcome enum (from BattleRevealed event / revealBattle return)
enum Outcome { Lose = 0, Win = 1, Draw = 2 }
```

Element rules: cycle `Air > Api > Daun > Batu > Air`; cross pairs (`Air↔Daun`, `Api↔Batu`)
and same-element are **draws**. Net odds vs the system: 25% win / 25% lose / 50% draw.

### Contract interface (the calls you need)

```solidity
// --- BatuApi ---
function deposit() external payable;                       // send CELO, get CELO*1000 API
function withdraw(uint256 apiAmount) external;             // burn API, get apiAmount/1000 CELO
function commitBattle(uint256 bet, bytes32 commitHash) external;        // step 1
function revealBattle(uint8 element, bytes32 secret) external returns (uint8 outcome, uint8 systemElement); // step 2
function forfeitExpired(address player) external;          // settle a missed-reveal as loss
function fundPool() external payable;                      // anyone can add pool liquidity

// views
function minBet() external view returns (uint256);
function poolBalance() external view returns (uint256);    // total API in contract
function availablePool() external view returns (uint256);  // free API able to back a new bet
function reservedPayout() external view returns (uint256);
function apiCoin() external view returns (address);
function previewOutcome(uint8 player, uint8 system) external view returns (uint8);
function hashCommit(address player, uint8 element, bytes32 secret) external view returns (bytes32);
function pendingBattle(address) external view returns (uint256 bet, uint64 commitBlock, bool active, bytes32 commitHash);
function RATE() external view returns (uint256);           // 1000
function REVEAL_WINDOW() external view returns (uint256);  // 256

// --- APICoin (standard ERC20) ---
function balanceOf(address) external view returns (uint256);
function approve(address spender, uint256 amount) external returns (bool);
function allowance(address owner, address spender) external view returns (uint256);
```

### Events

```solidity
event Deposited(address indexed user, uint256 celoIn, uint256 apiOut);
event Withdrawn(address indexed user, uint256 apiIn, uint256 celoOut);
event BattleCommitted(address indexed player, uint256 bet, uint256 commitBlock);
event BattleRevealed(address indexed player, uint256 bet, uint8 playerElement, uint8 systemElement, uint8 outcome, uint256 payout);
event BattleForfeited(address indexed player, uint256 bet);
event PoolFunded(address indexed funder, uint256 celoIn, uint256 apiMinted);
```

### Flows

**Deposit** (CELO → API): call `deposit()` with `value = celoWei`. Player receives `celoWei * 1000` API.

**Withdraw** (API → CELO): call `withdraw(apiAmount)`. Player receives `apiAmount / 1000` CELO
(send a multiple of `1000` base-units; dust below `RATE` reverts `NothingToWithdraw`).

**Battle** is a 2-step commit–reveal. Before the first battle, `approve` the game to spend API.

```ts
import { keccak256, encodeAbiParameters, parseAbiParameters } from "viem";

// 0) one-time: approve API spend
await write(API_COIN, "approve", [BATU_API, maxUint256]);

// 1) generate a FRESH random secret per battle and PERSIST it (e.g. localStorage),
//    keyed by player address — you need it to reveal later.
const secret = crypto.getRandomValues(new Uint8Array(32)); // 32 bytes
const secretHex = ("0x" + Buffer.from(secret).toString("hex")) as `0x${string}`;
const element = Element.Air; // player's choice

// 2) build the commit hash OFF-CHAIN (never call hashCommit() as a tx — it would leak the secret)
const commitHash = keccak256(
  encodeAbiParameters(
    parseAbiParameters("address, uint8, bytes32"),
    [playerAddress, element, secretHex],
  ),
);
// (or just read it: publicClient.readContract(hashCommit, [player, element, secret]) via eth_call)

// 3) commit (bet must be >= minBet and <= availablePool's backing capacity)
await write(BATU_API, "commitBattle", [bet, commitHash]);

// 4) WAIT until the chain is at least 2 blocks past the commit block
//    (reveal needs block.number > commitBlock + 1). On Celo (~5s blocks) wait ~10–15s.

// 5) reveal — must be within REVEAL_WINDOW (256) blocks of commitBlock+1
const { result } = await simulate(BATU_API, "revealBattle", [element, secretHex]);
// result = [outcome, systemElement]; or read the BattleRevealed event for payout
await write(BATU_API, "revealBattle", [element, secretHex]);
```

### Integration gotchas (read these)

- **Approve once** before committing — `commitBattle` pulls the bet via `transferFrom`.
- **Persist the secret** locally the moment you commit. If the user loses it (or closes the
  tab) they cannot reveal; after 256 blocks anyone may `forfeitExpired(player)` and the bet is
  **lost**. Show a clear "reveal now" prompt and recover the secret on reload.
- **Fresh secret every battle** — never reuse (security).
- **One active battle per player** — `commitBattle` reverts `ActiveBattleExists` until the
  current one is revealed/forfeited. Check `pendingBattle(player).active` on load and resume.
- **Reveal timing** — too early reverts `RevealTooEarly`; past the 256-block window reverts
  `RevealExpired`. Reveal promptly after the commit block is mined.
- **Pool capacity** — `commitBattle` reverts `InsufficientPool` if the free pool can't back the
  win. Read `availablePool()` and cap the bet (`maxBackableBet ≈ availablePool * WIN_DEN /
  (WIN_NUM - WIN_DEN)`), or surface a "pool low" message.
- **Decimals** — API and CELO are both 18 decimals; `1 API = 1e18`, `1 CELO = 1e18 wei`.
- **Outcome amounts** — win pays `bet * 1.95`; draw refunds `bet`; lose pays `0`.
- Build the ABI from `out/BatuApi.sol/BatuApi.json` (run `forge build`) or generate from the
  verified source on Blockscout.

## Usage

Dependencies in `lib/` are git-ignored — install them first (one-time):

```bash
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts

forge build          # compile
forge test -vv       # run tests (29 passing)
forge fmt            # format
```

### Deploy (Celo Alfajores testnet)

```bash
cp .env.example .env   # fill PRIVATE_KEY, optional MIN_BET / POOL_SEED_CELO
source .env

# Deploy + seed the pool in one tx — no explorer/API key needed.
# POOL_SEED_CELO (wei) is sent to the payable constructor as the initial pool.
MIN_BET=1000000000000000000 POOL_SEED_CELO=100000000000000000 \
forge script script/Deploy.s.sol:Deploy \
  --rpc-url celo_alfajores --broadcast
```

Use `--rpc-url celo` for mainnet. RPC endpoints are configured in `foundry.toml`.
The deployer's seed is donated to the pool (non-withdrawable); size it for the bets you expect.

### ⚠️ Deploy checklist (immutable — no second chances)

The contract is **adminless**: no owner, no pause, no upgrade. Once deployed, nothing
below can be changed. Verify before broadcasting to mainnet:

- [ ] `MIN_BET` is correct (immutable; too high blocks play, too low allows dust bets).
- [ ] `POOL_SEED_CELO` covers the expected concurrent bets — each pending bet reserves
      `bet * WIN_NUM/WIN_DEN` of pool liquidity; wins are blocked when free pool runs low.
- [ ] `WIN_NUM/WIN_DEN`, `RATE`, `REVEAL_WINDOW` constants are the intended values.
- [ ] Full test suite passes (`forge test`) and you have reviewed `_resolve`'s rules.
- [ ] Frontend builds `commitHash` **off-chain** (never sends `hashCommit` as a tx).

There is no recourse after deploy — treat the testnet deployment as a dress rehearsal.

### Verify (optional — pick one, all work)

Verification only publishes the source on an explorer; the contract runs fine without it.

```bash
# A) Blockscout — Celo's native explorer, NO API key
forge verify-contract <DEPLOYED_ADDR> src/BatuApi.sol:BatuApi \
  --verifier blockscout \
  --verifier-url https://celo-alfajores.blockscout.com/api   # mainnet: https://celo.blockscout.com/api

# B) Sourcify — decentralized, NO API key
forge verify-contract <DEPLOYED_ADDR> src/BatuApi.sol:BatuApi --verifier sourcify

# C) Celoscan — needs CELOSCAN_API_KEY, then append `--verify` to the deploy command
```

> The constructor takes a `uint256 minBet` arg — add
> `--constructor-args $(cast abi-encode "constructor(uint256)" <MIN_BET>)` when verifying.
> (`APICoin` verifies with `constructor(address)` = the BatuApi address.)

## Layout

```
src/
  APICoin.sol       ERC20 token
  BatuApi.sol       game logic
test/
  BatuApi.t.sol     unit tests
script/
  Deploy.s.sol      deployment
```
