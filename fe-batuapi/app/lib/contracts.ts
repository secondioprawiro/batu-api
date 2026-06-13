/**
 * Alamat & ABI kontrak Batu Api — Celo mainnet (chain id 42220).
 * Alamat, chain id, & ABI bersumber dari paket npm `batuapi-sdk` (single
 * source of truth, di-generate dari artifact Foundry sc-batuapi).
 */
import {
  ADDRESSES,
  CELO_MAINNET_CHAIN_ID,
  batuapiAbi,
  apicoinAbi,
} from "batuapi-sdk";

export const CELO_CHAIN_ID = CELO_MAINNET_CHAIN_ID;

export const BATU_API_ADDRESS = ADDRESSES.BatuApi;

export const API_COIN_ADDRESS = ADDRESSES.APICoin;

export const EXPLORER_URL = "https://celo.blockscout.com";

/** ABI lengkap kontrak game BatuApi (Element on-chain: Batu=0, Api=1, Air=2, Daun=3). */
export const batuApiAbi = batuapiAbi;

/** ABI APICoin (ERC20). */
export const apiCoinAbi = apicoinAbi;
