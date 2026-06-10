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
