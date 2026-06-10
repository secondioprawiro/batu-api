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
