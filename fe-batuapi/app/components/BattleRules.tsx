import { ELEMENTS, byKey } from "@/app/lib/elements";
import ElementMascot from "./ElementMascot";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/* Urutan siklus: Air memadamkan Api, Api membakar Daun, Daun menyelimuti Batu, Batu membendung Air */
const CYCLE = ["air", "api", "daun", "batu"] as const;

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0 text-ember-400 drop-shadow-[0_0_8px_rgba(255,138,30,0.6)] sm:h-8 sm:w-8"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 11h12.17l-3.58-3.59L14 6l6 6-6 6-1.41-1.41L16.17 13H4z" />
    </svg>
  );
}

export default function BattleRules() {
  return (
    <section
      id="battle"
      className="relative scroll-mt-20 overflow-hidden bg-abyss-950 py-24"
    >
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-blood-900/40 blur-3xl"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute right-[5%] top-16 -rotate-12 text-5xl opacity-20 blur-[1px]"
        aria-hidden="true"
      >
        🍂
      </span>
