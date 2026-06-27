import type { Metadata } from "next";
import { Suspense } from "react";
import Arena from "../components/arena/Arena";

export const metadata: Metadata = {
  description:
    "Enter the Batu Api arena: choose your element, stake API Coin, and beat the system. On-chain battle on Celo mainnet with commit–reveal.",
};

export default function PlayPage() {
  return (
    <Suspense fallback={null}>
      <Arena />
    </Suspense>
  );
}
