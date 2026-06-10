import type { Metadata } from "next";
import { Suspense } from "react";
import Arena from "../components/arena/Arena";

export const metadata: Metadata = {
  description:
    "Masuk ke arena Batu Api: pilih elemenmu, pasang API Coin, dan kalahkan sistem. Mode demo — saldo disimulasikan di browser.",
};

export default function PlayPage() {
  return (
    <Suspense fallback={null}>
      <Arena />
    </Suspense>
  );
}
