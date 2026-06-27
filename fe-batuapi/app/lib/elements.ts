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
    trait: "Strong, defensive, stable",
    desc: "The unshakeable fortress of the arena.",
    verb: "blocks",
    beats: "air",
    beatenBy: "daun",
  },
  {
    key: "api",
    name: "Api",
    color: "#ff8a1e",
    trait: "Aggressive, fast, attacking",
    desc: "A swift strike that burns the opponent to nothing.",
    verb: "burns",
    beats: "daun",
    beatenBy: "air",
  },
  {
    key: "air",
    name: "Air",
    color: "#4cc3ff",
    trait: "Flexible, calming",
    desc: "Flows calmly, extinguishing the rage of fire.",
    verb: "extinguishes",
    beats: "api",
    beatenBy: "batu",
  },
  {
    key: "daun",
    name: "Daun",
    color: "#71d873",
    trait: "Natural, ever-growing",
    desc: "Creeps slowly, enveloping the opponent's defense.",
    verb: "envelops",
    beats: "batu",
    beatenBy: "api",
  },
];

export const byKey = Object.fromEntries(
  ELEMENTS.map((el) => [el.key, el]),
) as Record<ElementKey, GameElement>;
