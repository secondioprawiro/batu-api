import { connectorsForWallets, getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { celo } from "wagmi/chains";

/**
 * WalletConnect Cloud project id — buat gratis di https://cloud.walletconnect.com
 * lalu isi NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID di .env.local.
 *
 * Dengan id: daftar wallet lengkap + QR WalletConnect (wallet HP).
 * Tanpa id: hanya wallet browser (MetaMask, Rabby, dll. — terdeteksi otomatis)
 * dan Coinbase Wallet, supaya console bersih dari error relay WalletConnect.
 */
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const wagmiConfig = projectId
  ? getDefaultConfig({
      appName: "Batu Api",
      projectId,
      chains: [celo],
      ssr: true,
    })
  : createConfig({
      chains: [celo],
      connectors: connectorsForWallets(
        [
          {
            groupName: "Wallet",
            wallets: [injectedWallet, coinbaseWallet],
          },
        ],
        { appName: "Batu Api", projectId: "-" },
      ),
      transports: { [celo.id]: http() },
      ssr: true,
    });
