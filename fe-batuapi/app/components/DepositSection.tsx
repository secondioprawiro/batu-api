"use client";

import { useState } from "react";
import SectionHeading from "./SectionHeading";

const RATE = 1000;
const MIN_DEPOSIT = 0.001;
const QUICK_AMOUNTS = ["0.001", "0.1", "0.5", "1", "5"];

const BENEFITS = [
  {
    icon: "🪙",
    text: "1 CELO = 1000 API Coin — rasio tetap, tanpa biaya tersembunyi.",
  },
  {
    icon: "⚡",
    text: "Deposit minimal 0.001 CELO (= 1 API Coin).",
  },
  {
    icon: "⚔️",
    text: "API Coin adalah tiket bet untuk setiap battle elemen.",
  },
  {
    icon: "💎",
    text: "Withdraw kapan saja — API di-burn, CELO dikirim ke wallet sesuai mekanisme smart contract.",
  },
];

export default function DepositSection() {
  const [amount, setAmount] = useState("1");

  const celo = parseFloat(amount);
  const valid = Number.isFinite(celo) && celo > 0;
  const belowMin = valid && celo < MIN_DEPOSIT;
  const api = valid ? celo * RATE : 0;
  const formattedApi = api.toLocaleString("id-ID", {
    maximumFractionDigits: 3,
  });

  return (
    <section
      id="deposit"
      className="relative scroll-mt-20 overflow-hidden py-24"
    >
      <div
        className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-ember-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHeading
            align="left"
            eyebrow="DEPOSIT & API COIN"
            title="Tukar CELO, Dapatkan API Coin"
          />
          <p className="mt-5 text-abyss-200">
            API Coin adalah bahan bakar arena. Deposit CELO-mu, terima API
            Coin, dan mulai pasang bet — semuanya tercatat on-chain di Celo.
          </p>
          <ul className="mt-7 space-y-3.5">
            {BENEFITS.map((b) => (
              <li key={b.icon} className="flex items-start gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-ember-500/25 bg-ember-500/10 text-base">
                  {b.icon}
                </span>
                <span className="pt-1.5 text-sm text-abyss-200">{b.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Kalkulator deposit */}
        <div className="relative rounded-[28px] border border-ember-500/25 bg-gradient-to-b from-abyss-800 to-abyss-950 p-6 shadow-[0_30px_80px_-30px_rgba(255,138,30,0.25)] sm:p-8">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg tracking-wider text-cream">
              KALKULATOR DEPOSIT
            </h3>
            <span className="rounded-full border border-ember-500/30 bg-ember-500/10 px-3 py-1 text-[10px] font-semibold tracking-widest text-ember-300">
              DEMO
            </span>
          </div>

          <label
