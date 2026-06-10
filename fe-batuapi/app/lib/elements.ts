export type ElementKey = "batu" | "api" | "air" | "daun";

export type GameElement = {
  key: ElementKey;
  name: string;
  /** Warna utama elemen (dipakai sebagai CSS var --el) */
  color: string;
  /** Karakter elemen, sesuai README */
  trait: string;
  /** Deskripsi singkat bergaya game */
  desc: string;
  /** Kata kerja saat mengalahkan lawannya */
  verb: string;
  beats: ElementKey;
  beatenBy: ElementKey;
};

export const ELEMENTS: GameElement[] = [
  {
    key: "batu",
    name: "Batu",
    color: "#aab6bd",
    trait: "Kuat, defensif, stabil",
    desc: "Benteng arena yang tak tergoyahkan.",
    verb: "membendung",
    beats: "air",
    beatenBy: "daun",
  },
  {
    key: "api",
    name: "Api",
    color: "#ff8a1e",
    trait: "Agresif, cepat, menyerang",
    desc: "Serangan cepat yang membakar habis lawan.",
    verb: "membakar",
    beats: "daun",
    beatenBy: "air",
  },
  {
    key: "air",
    name: "Air",
    color: "#4cc3ff",
    trait: "Fleksibel, menenangkan",
