"use client";

import Link from "next/link";
import { useState } from "react";
import { ELEMENTS, byKey, type ElementKey } from "@/app/lib/elements";
import ElementMascot from "./ElementMascot";
import SectionHeading from "./SectionHeading";

export default function ElementCards() {
  const [selected, setSelected] = useState<ElementKey>("api");
  const chosen = byKey[selected];

  return (
    <section
      id="elements"
      className="relative scroll-mt-20 overflow-hidden py-24"
    >
      <div
        className="pointer-events-none absolute -right-40 top-24 h-96 w-96 rounded-full bg-ember-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="ELEMENT SELECTION"
          title="Pilih Kekuatanmu"
          subtitle="Empat elemen, satu arena. Setiap pilihan punya lawan alaminya sendiri."
        />

        <p className="mt-5 text-center text-sm text-abyss-200">
          Elemen pilihanmu:{" "}
          <span
            className="font-display el-text text-xl tracking-wider"
            style={{ "--el": chosen.color } as React.CSSProperties}
          >
            {chosen.name.toUpperCase()}
          </span>
        </p>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {ELEMENTS.map((el, i) => {
            const isSelected = el.key === selected;
            return (
              <button
                key={el.key}
                type="button"
                onClick={() => setSelected(el.key)}
                aria-pressed={isSelected}
                style={{ "--el": el.color } as React.CSSProperties}
                className={`group relative flex flex-col items-center rounded-3xl border bg-gradient-to-b from-abyss-800/80 to-abyss-950/90 p-5 pb-7 transition-all duration-300 hover:-translate-y-2 sm:p-6 ${
                  isSelected
                    ? "el-card-selected border-white/10"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <div
                  className={`el-glow-bg absolute top-4 h-28 w-28 blur-2xl transition-opacity duration-300 ${
                    isSelected
                      ? "opacity-45"
                      : "opacity-0 group-hover:opacity-30"
                  }`}
                  aria-hidden="true"
                />

                <div
                  className="animate-float relative w-24 sm:w-28"
                  style={{ animationDelay: `${i * 0.5}s` }}
                >
                  <ElementMascot
                    element={el.key}
                    idPrefix={`card-${el.key}`}
                    className="w-full drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]"
                  />
                </div>
                <div
                  className="mt-2 h-2.5 w-16 rounded-[100%] bg-black/50 blur-[5px]"
                  aria-hidden="true"
                />

                <h3
                  className={`font-display mt-4 text-xl tracking-wide ${
                    isSelected ? "el-text" : "text-cream"
                  }`}
                >
                  {el.name}
                </h3>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-abyss-300">
                  {el.trait}
                </p>
                <p className="mt-3 min-h-10 text-sm text-abyss-200">
                  {el.desc}
                </p>

                <div className="mt-4 flex w-full flex-col gap-1.5 text-xs">
                  <span className="el-chip rounded-full px-3 py-1.5 text-cream">
                    ⚔️ Mengalahkan {byKey[el.beats].name}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-abyss-300">
                    🛡️ Lemah vs {byKey[el.beatenBy].name}
                  </span>
                </div>

                <span
                  className="mt-5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
                  style={{
                    borderColor: isSelected
                      ? el.color
                      : "rgba(255,255,255,0.25)",
                  }}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: el.color }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={`/play?element=${selected}`}
            className="btn-ember font-display inline-block rounded-full px-10 py-4 text-lg tracking-wider transition-transform hover:-translate-y-1"
          >
            MASUK ARENA DENGAN {chosen.name.toUpperCase()}
          </Link>
          <p className="mt-4 text-xs text-abyss-400">
            Battle on-chain live di Celo mainnet — commit–reveal yang adil
            dan terverifikasi.
          </p>
        </div>
      </div>
    </section>
  );
}
