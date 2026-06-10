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
