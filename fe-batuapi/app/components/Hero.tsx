import Link from "next/link";
import { ELEMENTS } from "@/app/lib/elements";
import ElementMascot from "./ElementMascot";

/* Konfigurasi partikel ember — deterministik agar SSR & client identik */
const PARTICLES = [
  { left: "6%", size: 5, delay: 0, dur: 11, color: "#ffaa3c" },
  { left: "14%", size: 3, delay: 2.5, dur: 13, color: "#ff8a1e" },
  { left: "22%", size: 4, delay: 5, dur: 10, color: "#7fb3a6" },
  { left: "31%", size: 3, delay: 1.2, dur: 14, color: "#ffc56e" },
  { left: "39%", size: 5, delay: 6.4, dur: 12, color: "#ff8a1e" },
  { left: "47%", size: 3, delay: 3.6, dur: 15, color: "#ffaa3c" },
  { left: "55%", size: 4, delay: 8, dur: 11, color: "#7fb3a6" },
  { left: "63%", size: 3, delay: 0.8, dur: 13, color: "#ffc56e" },
  { left: "71%", size: 5, delay: 4.4, dur: 12, color: "#ff8a1e" },
  { left: "79%", size: 3, delay: 7.2, dur: 14, color: "#ffaa3c" },
  { left: "87%", size: 4, delay: 2, dur: 10, color: "#ffc56e" },
  { left: "94%", size: 3, delay: 5.8, dur: 13, color: "#7fb3a6" },
];

const MASCOT_STAGE = [
  { key: "batu", width: "w-20 sm:w-32 md:w-40", delay: "0s", tilt: "-rotate-3" },
  { key: "api", width: "w-24 sm:w-40 md:w-48", delay: "0.6s", tilt: "rotate-0" },
  { key: "air", width: "w-20 sm:w-32 md:w-40", delay: "1.2s", tilt: "rotate-2" },
  { key: "daun", width: "w-16 sm:w-28 md:w-36", delay: "1.8s", tilt: "rotate-6" },
] as const;

export default function Hero() {
  return (
    <section
      id="home"
      className="hero-bg relative overflow-hidden pb-36 pt-24 sm:pt-28"
    >
      {/* === Dekorasi atmosfer === */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Bulan purnama */}
        <div className="moon absolute left-[5%] top-[7%] h-24 w-24 rounded-full opacity-90 sm:h-40 sm:w-40" />

