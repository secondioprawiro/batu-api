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
    setValue(next === "deposit" ? "1" : "100");
    setMsg(null);
  };

  const submit = () => {
    const err = tab === "deposit" ? onDeposit(amount) : onWithdraw(amount);
    if (err) {
      setMsg({ ok: false, text: err });
    } else {
      setMsg({
        ok: true,
        text:
          tab === "deposit"
            ? `Deposit berhasil — +${fmt(amount * RATE, 0)} API ✓`
            : `Withdraw berhasil — +${fmt(amount / RATE, 6)} CELO ✓`,
      });
    }
  };

  return (
    <section className="rounded-[28px] border border-ember-500/20 bg-gradient-to-b from-abyss-800 to-abyss-950 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg tracking-wider text-cream">
          BANK ARENA
        </h2>
        <span className="rounded-full border border-ember-500/30 bg-ember-500/10 px-3 py-1 text-[10px] font-semibold tracking-widest text-ember-300">
          DEMO
        </span>
      </div>

      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-abyss-300">Saldo CELO</dt>
          <dd className="font-semibold text-cream">🟡 {fmt(celo)}</dd>
        </div>
