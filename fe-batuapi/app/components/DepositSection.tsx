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
