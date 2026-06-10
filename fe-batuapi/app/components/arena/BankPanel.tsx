"use client";

import { useState } from "react";
import { MIN_DEPOSIT, RATE, fmt } from "@/app/lib/arena";

type Tab = "deposit" | "withdraw";

type BankPanelProps = {
  celo: number;
  api: number;
  busy: boolean;
  onDeposit: (amount: number) => string | null;
  onWithdraw: (amount: number) => string | null;
};

export default function BankPanel({
  celo,
  api,
  busy,
  onDeposit,
  onWithdraw,
}: BankPanelProps) {
  const [tab, setTab] = useState<Tab>("deposit");
  const [value, setValue] = useState("1");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const amount = Number(value);
  const validAmount = Number.isFinite(amount) && amount > 0;
  const preview = !validAmount
    ? "0"
    : tab === "deposit"
      ? `${fmt(amount * RATE, 0)} API`
      : `${fmt(amount / RATE, 6)} CELO`;

  const switchTab = (next: Tab) => {
    setTab(next);
