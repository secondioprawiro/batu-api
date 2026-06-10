"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ELEMENTS, type ElementKey } from "@/app/lib/elements";
import {
  DEMO_ADDRESS,
  INITIAL_STATE,
  MIN_BET,
  MIN_DEPOSIT,
  RATE,
  STORAGE_KEY,
  STREAK_BONUS,
  STREAK_EVERY,
  WIN_PROFIT,
  decideOutcome,
  fmt,
  isElementKey,
  type ArenaState,
  type FightResult,
} from "@/app/lib/arena";
import BankPanel from "./BankPanel";
import BattleStage from "./BattleStage";
import HistoryPanel from "./HistoryPanel";

type Phase = "idle" | "fighting" | "result";

function loadInitialState(): ArenaState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...INITIAL_STATE, ...(JSON.parse(raw) as Partial<ArenaState>) };
  } catch {
    /* state tersimpan korup — mulai dari awal */
  }
  return INITIAL_STATE;
}

export default function Arena() {
  const params = useSearchParams();
  const fromQuery = params.get("element");

  const [state, setState] = useState<ArenaState>(loadInitialState);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<FightResult | null>(null);
  const [selected, setSelected] = useState<ElementKey>(
    isElementKey(fromQuery) ? fromQuery : "api",
  );
  const [bet, setBet] = useState("100");
  /* Roda elemen sistem — berputar cepat selama fase fighting */
  const [spinIndex, setSpinIndex] = useState(0);
  const spinRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  /* Persist demo state ke localStorage */
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null)
        window.clearInterval(intervalRef.current);
    };
  }, []);

  const stopSpinning = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const connect = () => setState((s) => ({ ...s, connected: true }));

  const resetDemo = () => {
    stopSpinning();
    setPhase("idle");
    setResult(null);
    setState({ ...INITIAL_STATE, connected: true });
  };

  const deposit = (amount: number): string | null => {
    if (!Number.isFinite(amount) || amount <= 0)
      return "Masukkan jumlah yang valid.";
    if (amount < MIN_DEPOSIT) return `Minimal deposit ${MIN_DEPOSIT} CELO.`;
    if (amount > state.celo) return "Saldo CELO tidak cukup.";
    setState((s) => ({
      ...s,
      celo: s.celo - amount,
      api: s.api + amount * RATE,
    }));
    return null;
  };

  const withdraw = (amount: number): string | null => {
    if (!Number.isFinite(amount) || amount <= 0)
      return "Masukkan jumlah yang valid.";
    if (amount > state.api) return "Saldo API tidak cukup.";
    setState((s) => ({
      ...s,
      api: s.api - amount,
      celo: s.celo + amount / RATE,
    }));
    return null;
  };

  /* Mulai battle: roda elemen sistem berputar sampai pemain menekan STOP */
  const fight = () => {
    const betN = Math.floor(Number(bet));
    if (phase === "fighting") return;
    if (!Number.isFinite(betN) || betN < MIN_BET || betN > state.api) return;

    setResult(null);
    spinRef.current = Math.floor(Math.random() * ELEMENTS.length);
    setSpinIndex(spinRef.current);
    setPhase("fighting");
    intervalRef.current = window.setInterval(() => {
      spinRef.current = (spinRef.current + 1) % ELEMENTS.length;
      setSpinIndex(spinRef.current);
    }, 90);
  };

  /* STOP: elemen sistem terkunci di posisi roda saat ini, hasil dihitung */
  const stopFight = () => {
    if (phase !== "fighting") return;
    stopSpinning();

    const betN = Math.floor(Number(bet));
    const system = ELEMENTS[spinRef.current].key;
    const outcome = decideOutcome(selected, system);

    let delta = 0;
    let bonus = 0;
    let { streakEl, streakN } = state;
    if (outcome === "win") {
