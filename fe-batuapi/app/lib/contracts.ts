/**
 * Alamat & ABI kontrak Batu Api — Celo mainnet (chain id 42220).
 * Sumber: C:\batu-api\sc-batuapi (Foundry), terverifikasi di Blockscout.
 */

export const CELO_CHAIN_ID = 42220;

export const BATU_API_ADDRESS =
  "0x618Cd4F7a020a9814B17B68fD9b2Dc5F3b5D06b6" as const;

export const API_COIN_ADDRESS =
  "0xe109fCa2C3AcB099e51F583346680DD3DfE06d26" as const;

export const EXPLORER_URL = "https://celo.blockscout.com";

/** Element enum on-chain: Batu=0, Api=1, Air=2, Daun=3 */
export const batuApiAbi = [
  {
    type: "function",
    name: "deposit",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [{ name: "apiAmount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "commitBattle",
    stateMutability: "nonpayable",
    inputs: [
      { name: "bet", type: "uint256" },
      { name: "commitHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "revealBattle",
    stateMutability: "nonpayable",
    inputs: [
      { name: "element", type: "uint8" },
      { name: "secret", type: "bytes32" },
    ],
    outputs: [
      { name: "outcome", type: "uint8" },
      { name: "systemElement", type: "uint8" },
    ],
  },
  {
    type: "function",
    name: "forfeitExpired",
    stateMutability: "nonpayable",
    inputs: [{ name: "player", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "fundPool",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "minBet",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "poolBalance",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "availablePool",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "reservedPayout",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "apiCoin",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "RATE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "REVEAL_WINDOW",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "pendingBattle",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [
      { name: "bet", type: "uint256" },
      { name: "commitBlock", type: "uint64" },
      { name: "active", type: "bool" },
      { name: "commitHash", type: "bytes32" },
    ],
  },
  {
    type: "function",
    name: "hashCommit",
    stateMutability: "pure",
    inputs: [
      { name: "player", type: "address" },
      { name: "element", type: "uint8" },
      { name: "secret", type: "bytes32" },
    ],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "function",
    name: "previewOutcome",
    stateMutability: "pure",
    inputs: [
      { name: "player", type: "uint8" },
      { name: "system", type: "uint8" },
    ],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "event",
    name: "Deposited",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "celoIn", type: "uint256", indexed: false },
      { name: "apiOut", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "apiIn", type: "uint256", indexed: false },
      { name: "celoOut", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PoolFunded",
    inputs: [
      { name: "funder", type: "address", indexed: true },
      { name: "celoIn", type: "uint256", indexed: false },
      { name: "apiMinted", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BattleCommitted",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "bet", type: "uint256", indexed: false },
      { name: "commitBlock", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BattleRevealed",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "bet", type: "uint256", indexed: false },
      { name: "playerElement", type: "uint8", indexed: false },
      { name: "systemElement", type: "uint8", indexed: false },
      { name: "outcome", type: "uint8", indexed: false },
      { name: "payout", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BattleForfeited",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "bet", type: "uint256", indexed: false },
    ],
  },
  { type: "error", name: "ZeroAmount", inputs: [] },
  {
    type: "error",
    name: "BetBelowMinimum",
    inputs: [
      { name: "bet", type: "uint256" },
      { name: "minBet", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "InsufficientPool",
    inputs: [
      { name: "required", type: "uint256" },
      { name: "available", type: "uint256" },
    ],
  },
  { type: "error", name: "CeloTransferFailed", inputs: [] },
  { type: "error", name: "NothingToWithdraw", inputs: [] },
  { type: "error", name: "ActiveBattleExists", inputs: [] },
  { type: "error", name: "NoActiveBattle", inputs: [] },
  { type: "error", name: "InvalidReveal", inputs: [] },
  {
    type: "error",
    name: "RevealTooEarly",
    inputs: [
      { name: "currentBlock", type: "uint256" },
      { name: "targetBlock", type: "uint256" },
    ],
  },
  { type: "error", name: "RevealExpired", inputs: [] },
  { type: "error", name: "NotYetExpired", inputs: [] },
  { type: "error", name: "NoExcessCelo", inputs: [] },
  { type: "error", name: "InvalidMinBet", inputs: [] },
] as const;

export const apiCoinAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;
