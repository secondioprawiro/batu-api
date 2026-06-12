"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* Soundtrack arena Batu Api — diputar berulang (loop) selama pemain
 * berada di arena. Disajikan sebagai aset statis dari /public. */
const TRACK_SRC = "/battle-theme.mp3";
const VOLUME = 0.5;
const MUTE_KEY = "batuapi:music-muted";

type ArenaAudioValue = {
  /** Musik sedang disenyapkan. */
  muted: boolean;
  /** Bergantian senyap / nyala. */
  toggleMuted: () => void;
};

const ArenaAudioContext = createContext<ArenaAudioValue | null>(null);

export function useArenaAudio(): ArenaAudioValue {
  const value = useContext(ArenaAudioContext);
  if (!value) {
    throw new Error("useArenaAudio harus dipakai di dalam <ArenaAudioProvider>.");
  }
  return value;
}

export function ArenaAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  /* Pulihkan preferensi senyap dari kunjungan sebelumnya. Arena di-render
   * client-only (useSearchParams + Suspense fallback={null}), jadi inisialisasi
   * lazy dari localStorage aman dari hydration mismatch. */
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(MUTE_KEY) === "1";
  });

  const toggleMuted = useCallback(() => setMuted((m) => !m), []);

  /* Terapkan status senyap ke elemen audio + simpan preferensinya. */
  useEffect(() => {
    const el = audioRef.current;
    if (el) el.muted = muted;
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  }, [muted]);

  /* Browser memblokir autoplay sampai ada interaksi pengguna. Coba putar saat
   * mount; jika ditolak, mulai pada gesture pertama (klik / tombol), lalu
   * lepas listener-nya. */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = VOLUME;

    const unlock = () => {
      window.removeEventListener("pointerdown", tryPlay);
      window.removeEventListener("keydown", tryPlay);
    };
    const tryPlay = () => el.play().then(unlock).catch(() => {});

    tryPlay();
    window.addEventListener("pointerdown", tryPlay);
    window.addEventListener("keydown", tryPlay);
    return unlock;
  }, []);

  /* Hentikan musik saat tab disembunyikan (hemat resource) dan lanjutkan saat
   * pemain kembali ke arena. */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onVisibility = () => {
      if (document.hidden) el.pause();
      else el.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <ArenaAudioContext.Provider value={{ muted, toggleMuted }}>
      <audio
        ref={audioRef}
        src={TRACK_SRC}
        loop
        preload="auto"
        aria-hidden="true"
      />
      {children}
    </ArenaAudioContext.Provider>
  );
}
