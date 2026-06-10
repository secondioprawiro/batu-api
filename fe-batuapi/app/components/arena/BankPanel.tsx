"use client";

import { useState } from "react";
import { MIN_WITHDRAW, RATE, fmt } from "@/app/lib/arena";

type Tab = "deposit" | "withdraw";

type BankPanelProps = {
  celo: number;
  api: number;
  busy: boolean;
  onDeposit: (amount: number) => Promise<string | null>;
  onWithdraw: (amount: number) => Promise<string | null>;
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
  const [sending, setSending] = useState(false);

  const amount = Number(value);
  const validAmount = Number.isFinite(amount) && amount > 0;
  const preview = !validAmount
    ? "0"
    : tab === "deposit"
      ? `${fmt(amount * RATE, 0)} API`
      : `${fmt(Math.floor(amount / RATE), 6)} CELO`;

  const switchTab = (next: Tab) => {
    setTab(next);
    setValue(next === "deposit" ? "1" : "1000");
    setMsg(null);
  };

  const submit = async () => {
    if (sending) return;
    setSending(true);
    setMsg(null);
    try {
      const err =
        tab === "deposit" ? await onDeposit(amount) : await onWithdraw(amount);
      if (err) {
        setMsg({ ok: false, text: err });
      } else {
        setMsg({
          ok: true,
          text:
            tab === "deposit"
              ? `Deposit terkonfirmasi — +${fmt(amount * RATE, 0)} API ✓`
              : `Withdraw terkonfirmasi — +${fmt(Math.floor(amount / RATE), 6)} CELO ✓`,
        });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-ember-500/20 bg-gradient-to-b from-abyss-800 to-abyss-950 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg tracking-wider text-cream">
          BANK ARENA
        </h2>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold tracking-widest text-emerald-300">
          ON-CHAIN
        </span>
      </div>

      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-abyss-300">Saldo CELO</dt>
          <dd className="font-semibold text-cream">🟡 {fmt(celo)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-abyss-300">Saldo API Coin</dt>
          <dd className="font-semibold text-ember-300">🔥 {fmt(api, 0)}</dd>
        </div>
      </dl>

      <div className="mt-5 grid grid-cols-2 gap-1.5 rounded-xl bg-night/60 p-1.5">
        {(["deposit", "withdraw"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            className={`font-display rounded-lg py-2 text-sm tracking-wider transition-colors ${
              tab === t ? "btn-ember" : "text-abyss-300 hover:text-cream"
            }`}
          >
            {t === "deposit" ? "DEPOSIT" : "WITHDRAW"}
          </button>
        ))}
      </div>

      <label
        htmlFor="bank-amount"
        className="mt-5 block text-xs uppercase tracking-widest text-abyss-300"
      >
        {tab === "deposit" ? "Jumlah CELO" : "Jumlah API"}
      </label>
      <input
        id="bank-amount"
        type="number"
        min={tab === "deposit" ? 0.001 : MIN_WITHDRAW}
        step={tab === "deposit" ? 0.001 : RATE}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setMsg(null);
        }}
        className="mt-2 w-full rounded-xl border border-white/10 bg-night/70 p-3 text-lg font-semibold text-cream outline-none transition-colors focus:border-ember-400/60"
      />

      <p className="mt-3 flex items-center justify-between text-sm">
        <span className="text-abyss-300">Kamu menerima</span>
        <strong className="text-ember-300">{preview}</strong>
      </p>

      <button
        type="button"
        onClick={submit}
        disabled={busy || sending || !validAmount}
        className="btn-ember font-display mt-4 w-full rounded-2xl py-3.5 tracking-wider transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {sending
          ? "MENUNGGU KONFIRMASI…"
          : tab === "deposit"
            ? "DEPOSIT SEKARANG"
            : "WITHDRAW SEKARANG"}
      </button>

      {msg && (
        <p
          className={`mt-3 text-xs ${msg.ok ? "text-emerald-300" : "text-red-300"}`}
        >
          {msg.ok ? "✅" : "⚠️"} {msg.text}
        </p>
      )}

      <p className="mt-3 text-center text-[11px] text-abyss-300">
        Rasio tetap 1 CELO = {fmt(RATE, 0)} API · withdraw kelipatan{" "}
        {fmt(MIN_WITHDRAW, 0)} API.
      </p>
    </section>
  );
}
