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
