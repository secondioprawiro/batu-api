/**
 * batuapi-sdk — on-chain constants + ABIs for the Batu Api game on Celo.
 *
 * Batu Api is an adminless element-battle game: deposit CELO to mint API Coin,
 * battle the system (commit–reveal) to win/lose API, redeem API back to CELO.
 *
 * @packageDocumentation
 */

export { batuapiAbi } from "./abi/BatuApi.js";
export { apicoinAbi } from "./abi/APICoin.js";

/** Celo Mainnet chain id. */
export const CELO_MAINNET_CHAIN_ID = 42220 as const;

/**
 * Deployed contract addresses on Celo Mainnet (chain {@link CELO_MAINNET_CHAIN_ID}).
 * Deployed 2026-06-10, verified on Blockscout.
 */
export const ADDRESSES = {
  /** BatuApi game contract (deposit / battle / withdraw / pool). */
  BatuApi: "0x618Cd4F7a020a9814B17B68fD9b2Dc5F3b5D06b6",
  /** APICoin ERC20 — the in-game token (1 CELO = 1000 API). */
  APICoin: "0xe109fCa2C3AcB099e51F583346680DD3DfE06d26",
} as const;

/** Conversion rate: 1 CELO = 1000 API (base units scale by 1e18 on both sides). */
export const RATE = 1000 as const;

/** Win payout multiplier = WIN_NUM / WIN_DEN = 1.95x the bet. */
export const WIN_NUM = 195 as const;
export const WIN_DEN = 100 as const;

/** Blocks after the target block during which its blockhash stays available. */
export const REVEAL_WINDOW = 256 as const;

/**
 * The four playable elements. Values match the on-chain `Element` enum, so these
 * integers can be passed straight to `commitBattle` / `revealBattle`.
 */
export const Element = {
  Batu: 0, // Rock
  Api: 1, // Fire
  Air: 2, // Water
  Daun: 3, // Leaf
} as const;
export type ElementName = keyof typeof Element;
export type ElementValue = (typeof Element)[ElementName];

/** Battle outcome from the player's perspective. Matches the on-chain enum. */
export const Outcome = {
  Lose: 0,
  Win: 1,
  Draw: 2,
} as const;
export type OutcomeName = keyof typeof Outcome;
export type OutcomeValue = (typeof Outcome)[OutcomeName];
